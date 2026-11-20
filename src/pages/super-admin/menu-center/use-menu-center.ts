import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import type { TableColumnCtx } from "element-plus";
import type MenuTreePanel from "@/components/menu-center/menu-tree-panel/index.vue";
import { useMenuStore } from "@/stores";
import { fetchMenuList, fetchDeletedMenus, updateMenu, deleteMenu, restoreMenu } from "@/api";
import type { DeletedMenuDto, MenuTreeNode, MenuType } from "@/types";
import { collectParentIds, filterMenuTree, findMenuNode, menuNameOf, walkMenu } from "./status";

/**
 * 菜单中心的页面级状态与操作。
 * 模板只负责结构，加载、筛选、展开、增删改与侧边栏同步都在这里收口。
 */
export function useMenuCenter() {
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();
  const menuStore = useMenuStore();

  const activeTab = ref<"tree" | "recycle">("tree");
  const treeData = ref<MenuTreeNode[]>([]);
  const treeLoading = ref(false);
  const deletedList = ref<DeletedMenuDto[]>([]);
  const deletedLoading = ref(false);

  /** 三个筛选都在本地做：数据源是一次性全量树，无分页 */
  const keyword = ref("");
  const typeFilter = ref<"all" | MenuType>("all");
  const statusFilter = ref<"all" | 0 | 1>("all");

  /**
   * 展开键必须是字符串：el-table 内部用对象键（Object.keys）比对，
   * 传数字 id 时 includes 恒为 false，「全部展开」会变成「全部收起」
   */
  const expandedKeys = ref<string[]>([]);
  const syncing = ref(false);

  /**
   * 树表限高：限高后表头与横向滚动条都落在表格框内，
   * 纵向长列表只在表内滚动，横向溢出时滚动条始终可见
   */
  const tableMaxHeight = ref(0);
  const treePanelRef = ref<InstanceType<typeof MenuTreePanel> | null>(null);

  /** 模板动态 ref 只接受函数或字符串，这里统一把实例写回 ref */
  const setTreePanelRef = (el: unknown): void => {
    treePanelRef.value = el as InstanceType<typeof MenuTreePanel> | null;
  };

  const measureTable = (): void => {
    const host = treePanelRef.value?.tableHostRef;
    if (!host) return;
    const top = host.getBoundingClientRect().top;
    // 切到回收站时树表所在面板是隐藏的，量不到位置就保留上一次的高度
    if (top <= 0) return;
    tableMaxHeight.value = Math.max(320, Math.floor(window.innerHeight - top - 24));
  };

  const drawerVisible = ref(false);
  const drawerMode = ref<"create" | "edit">("create");
  const drawerMenu = ref<MenuTreeNode | null>(null);
  const drawerParentId = ref(0);

  const visibleRows = computed<MenuTreeNode[]>(() => {
    let rows = treeData.value;
    const query = keyword.value.trim().toLowerCase();
    if (query) {
      rows = filterMenuTree(
        rows,
        (node) =>
          menuNameOf(node.name).toLowerCase().includes(query) ||
          (node.permission ?? "").toLowerCase().includes(query) ||
          (node.path ?? "").toLowerCase().includes(query)
      );
    }
    if (typeFilter.value !== "all") {
      rows = filterMenuTree(rows, (node) => node.type === typeFilter.value);
    }
    if (statusFilter.value !== "all") {
      rows = filterMenuTree(rows, (node) => node.status === statusFilter.value);
    }
    return rows;
  });

  const visibleCount = computed<number>(() => {
    let count = 0;
    walkMenu(visibleRows.value, () => {
      count += 1;
    });
    return count;
  });

  const hasFilter = computed<boolean>(
    () => keyword.value.trim() !== "" || typeFilter.value !== "all" || statusFilter.value !== "all"
  );

  const countText = computed<string>(() =>
    hasFilter.value
      ? t("menuCenter.countFiltered", { matched: visibleCount.value, total: treeData.value.length })
      : t("menuCenter.countTotal", { n: treeData.value.length })
  );

  // 展开/收起是同一个开关，按当前是否已有展开行决定动作与文案
  const expandActionLabel = computed<string>(() =>
    expandedKeys.value.length ? t("menuCenter.collapseAll") : t("menuCenter.expandAll")
  );

  const loadTree = async (): Promise<void> => {
    treeLoading.value = true;
    try {
      treeData.value = await fetchMenuList();
      // 重建后剔除已不存在的展开项，避免 el-table 记忆错行
      expandedKeys.value = expandedKeys.value.filter((key) => findMenuNode(treeData.value, Number(key)) !== null);
    } catch {
      ElMessage.error(t("menuCenter.loadFailed"));
    } finally {
      treeLoading.value = false;
      void nextTick(measureTable);
    }
  };

  const loadDeleted = async (): Promise<void> => {
    deletedLoading.value = true;
    try {
      deletedList.value = await fetchDeletedMenus();
    } catch {
      ElMessage.error(t("menuCenter.loadFailed"));
    } finally {
      deletedLoading.value = false;
    }
  };

  const refreshAll = async (): Promise<void> => {
    await Promise.all([loadTree(), loadDeleted()]);
  };

  const expandAll = (): void => {
    expandedKeys.value = collectParentIds(visibleRows.value).map(String);
  };

  const collapseAll = (): void => {
    expandedKeys.value = [];
  };

  const toggleExpandAll = (): void => {
    if (expandedKeys.value.length) collapseAll();
    else expandAll();
  };

  // 更多按钮命令
  const handleMoreCommand = (command: string): void => {
    const actions: Record<string, () => void> = {
      expand: toggleExpandAll,
      refresh: refreshAll,
      sync: syncSidebar
    };
    actions[command]?.();
  };

  const handleExpandChange = (row: MenuTreeNode, expanded: boolean | MenuTreeNode[]): void => {
    // 树表给布尔值；展开列给已展开行数组，两种都按「本行是否展开」归一
    const key = String(row.id);
    const open = Array.isArray(expanded) ? expanded.some((item) => String(item.id) === key) : expanded;
    if (open) {
      if (!expandedKeys.value.includes(key)) expandedKeys.value = [...expandedKeys.value, key];
    } else {
      expandedKeys.value = expandedKeys.value.filter((item) => item !== key);
    }
  };

  /**
   * 点名称单元格整格展开/折叠：直接翻转 expandRowKeys，
   * 树表内的 deep watch 会按新数组重算每行展开态
   */
  const handleCellClick = (
    row: MenuTreeNode,
    column: TableColumnCtx<MenuTreeNode>,
    _cell: HTMLTableCellElement,
    event: PointerEvent
  ): void => {
    // 叶子行没有子级，点了也没意义，避免手型光标骗人
    if (!(row.children ?? []).length) return;
    // 只认名称列；排序列的 el-input-number、操作列按钮都不该触发
    if (column.property !== "name") return;
    // 箭头自己已经由 el-table 处理过一次，再翻会抵消成"点了没反应"
    if ((event.target as HTMLElement | null)?.closest(".el-table__expand-icon")) return;

    const key = String(row.id);
    expandedKeys.value = expandedKeys.value.includes(key)
      ? expandedKeys.value.filter((item) => item !== key)
      : [...expandedKeys.value, key];
  };

  /** 筛选后自动展开命中路径，避免"搜到了但看不见" */
  watch([keyword, typeFilter, statusFilter], () => {
    expandedKeys.value = collectParentIds(visibleRows.value).map(String);
  });

  const handleTabChange = (name: string | number): void => {
    if (name === "recycle" && !deletedList.value.length) void loadDeleted();
    void nextTick(measureTable);
  };

  const openCreate = (parentId: number): void => {
    drawerMode.value = "create";
    drawerMenu.value = null;
    drawerParentId.value = parentId;
    drawerVisible.value = true;
  };

  const openEdit = (row: MenuTreeNode): void => {
    drawerMode.value = "edit";
    drawerMenu.value = row;
    drawerParentId.value = row.parentId;
    drawerVisible.value = true;
  };

  const handleFormSuccess = async (): Promise<void> => {
    await refreshAll();
    // 新增的菜单在绑定角色前不进侧边栏，先提示再让用户去权限中心分配
    if (drawerMode.value === "create") {
      ElMessage.info(t("menuCenter.form.bindHint"));
    }
  };

  /** 行内改 sort：只发 { sort }，成功后重取列表按 sort 重排 */
  const commitSort = async (row: MenuTreeNode, value: number | undefined): Promise<void> => {
    if (value === undefined || value === null) return;
    try {
      await updateMenu(row.id, { sort: value });
      await loadTree();
      ElMessage.success(t("menuCenter.sortDone"));
    } catch {
      await loadTree();
    }
  };

  const handleDelete = async (row: MenuTreeNode): Promise<void> => {
    if ((row.children ?? []).length > 0) {
      ElMessage.warning(t("menuCenter.delete.blocked"));
      return;
    }
    try {
      await ElMessageBox.confirm(
        t("menuCenter.delete.text", { name: menuNameOf(row.name) }),
        t("menuCenter.delete.title"),
        { type: "warning", confirmButtonText: t("menuCenter.delete.confirm"), cancelButtonText: t("common.cancel") }
      );
    } catch {
      return;
    }
    try {
      await deleteMenu(row.id);
      await refreshAll();
      ElMessage.success(t("menuCenter.delete.done"));
    } catch (error) {
      const message = (error as Error).message;
      if (message === "MENU_HAS_CHILDREN") ElMessage.warning(t("menuCenter.delete.blocked"));
      else if (message === "MENU_NOT_FOUND") ElMessage.warning(t("error.MENU_NOT_FOUND"));
      else if (message === "PERMISSION_DENIED") ElMessage.warning(t("error.PERMISSION_DENIED"));
      else ElMessage.error(t("menuCenter.delete.failed"));
      await refreshAll();
    }
  };

  const handleRestore = async (row: DeletedMenuDto): Promise<void> => {
    try {
      await ElMessageBox.confirm(
        t("menuCenter.recycle.confirmText", { name: menuNameOf(row.name) }),
        t("menuCenter.recycle.confirmTitle"),
        { type: "warning", confirmButtonText: t("menuCenter.action.restore"), cancelButtonText: t("common.cancel") }
      );
    } catch {
      return;
    }
    try {
      await restoreMenu(row.id);
      await refreshAll();
      ElMessage.success(t("menuCenter.recycle.restored"));
    } catch (error) {
      const message = (error as Error).message;
      if (message === "MENU_PARENT_DELETED") ElMessage.warning(t("menuCenter.recycle.parentDeleted"));
      else if (message === "MENU_PATH_EXIST") ElMessage.warning(t("menuCenter.recycle.pathTaken"));
      else if (message === "MENU_NOT_DELETED") {
        ElMessage.info(t("menuCenter.recycle.notDeleted"));
        await loadDeleted();
      } else if (message === "PERMISSION_DENIED") ElMessage.warning(t("error.PERMISSION_DENIED"));
      else ElMessage.error(t("menuCenter.recycle.restoreFailed"));
    }
  };

  /**
   * 同步侧边栏：重取 profile → 重建动态路由 → 回到当前路径
   * 不能保存后自动做：registerDynamicRoutes 第一句就是 resetDynamicRoutes，
   * 会把正站着的本页一起移除，白屏时很难定位是保存失败还是路由被拆
   */
  const syncSidebar = async (): Promise<void> => {
    syncing.value = true;
    try {
      const warns = await menuStore.reloadMenus();
      // 本页菜单已不在 profile 里时，replace 会经兜底跳到错误页，这里主动回首页
      const target = { path: route.path, query: route.query };
      await router.replace(target);
      if (router.currentRoute.value.path !== target.path) await router.replace("/");
      if (warns.length) ElMessage.warning(t("menuCenter.syncWarn", { n: warns.length }));
      else ElMessage.success(t("menuCenter.syncDone"));
    } catch {
      ElMessage.error(t("menuCenter.syncFailed"));
    } finally {
      syncing.value = false;
    }
  };

  onMounted(() => {
    void refreshAll();
    window.addEventListener("resize", measureTable);
    void nextTick(measureTable);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", measureTable);
  });

  return {
    t,
    activeTab,
    treeData,
    treeLoading,
    deletedList,
    deletedLoading,
    keyword,
    typeFilter,
    statusFilter,
    expandedKeys,
    syncing,
    tableMaxHeight,
    treePanelRef,
    setTreePanelRef,
    drawerVisible,
    drawerMode,
    drawerMenu,
    drawerParentId,
    visibleRows,
    countText,
    expandActionLabel,
    handleMoreCommand,
    handleTabChange,
    handleExpandChange,
    handleCellClick,
    openCreate,
    openEdit,
    handleFormSuccess,
    commitSort,
    handleDelete,
    handleRestore
  };
}
