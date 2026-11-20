import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { z } from "zod";
import type { FormInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import { fetchLocales, fetchSlots, initLocale, removeLocale, reindex, updateLocale } from "@/api/help/admin";
import { hasPermission, zodToRules } from "@/utils";
import { useUserStore } from "@/stores";
import type {
  AdminChapterNode,
  AdminDocNode,
  AdminLocaleItem,
  AdminSectionNode,
  AdminSlotListResult
} from "@/types/help/admin";

interface ContextEntry {
  key: string;
  labelKey: string;
  disabled?: boolean;
  handler?: () => void;
}

/**
 * 知识中心的页面级状态与操作。
 * 语言加载、文档位树、搜索过滤、右键菜单与语言维护都收在这里，模板只保留结构。
 */
export function useKnowledgeCenter() {
  const userStore = useUserStore();
  const { t } = useI18n();

  const locales = ref<AdminLocaleItem[]>([]);
  const activeLocale = ref("");
  const slots = ref<AdminSlotListResult | null>(null);
  const loading = ref(false);
  const localeLoading = ref(false);
  const reindexing = ref(false);
  const keyword = ref("");

  /** 语言栏右键菜单：locale 为空表示在空白区触发 */
  const menu = reactive({ visible: false, x: 0, y: 0, locale: "" });
  const canManage = computed(() => hasPermission(userStore.permissions, "superAdmin:help:slot:manage"));
  const canReindex = computed(() => hasPermission(userStore.permissions, "superAdmin:help:reindex"));

  const openMenu = (event: MouseEvent, locale: string) => {
    menu.visible = true;
    menu.locale = locale;
    menu.x = Math.min(event.clientX, window.innerWidth - 200);
    menu.y = Math.min(event.clientY, window.innerHeight - 280);
  };

  const closeMenu = () => {
    menu.visible = false;
  };

  const drawerVisible = ref(false);
  const activeDocKey = ref("");
  const createVisible = ref(false);

  const initVisible = ref(false);
  const initLoading = ref(false);
  const initForm = ref({ locale: "", title: "" });

  /** 语言列表；manifest 缺失或非法也照常列出 */
  const loadLocales = async () => {
    localeLoading.value = true;
    try {
      const list = await fetchLocales();
      locales.value = list;
      if (!list.some((item) => item.locale === activeLocale.value)) {
        activeLocale.value = list[0]?.locale ?? "";
      }
    } catch {
      // 业务错误已由响应拦截器统一提示，这里保留上一次的列表
    } finally {
      localeLoading.value = false;
    }
  };

  /** 当前语言的文档位树、统计与索引概况 */
  const loadSlots = async () => {
    if (!activeLocale.value) {
      slots.value = null;
      return;
    }
    loading.value = true;
    try {
      slots.value = await fetchSlots(activeLocale.value);
    } catch {
      // 同上：提示交给拦截器，避免 reject 冒泡成未处理异常
    } finally {
      loading.value = false;
    }
  };

  const handleRefresh = async () => {
    await loadLocales();
    await loadSlots();
  };

  /** 换语言后旧文档位不属于新语言，先把抽屉收起，避免拿旧 key 去新语言取详情 */
  const closeDoc = () => {
    drawerVisible.value = false;
    activeDocKey.value = "";
  };

  const switchLocale = (locale: string) => {
    if (locale === activeLocale.value) return;
    closeDoc();
    activeLocale.value = locale;
  };

  watch(activeLocale, () => {
    void loadSlots();
  });

  onMounted(() => {
    void loadLocales();
    document.addEventListener("click", closeMenu);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("click", closeMenu);
  });

  const matchDoc = (doc: AdminDocNode, word: string): boolean =>
    doc.title.toLowerCase().includes(word) ||
    doc.path.toLowerCase().includes(word) ||
    doc.file.toLowerCase().includes(word);

  /** 搜索只保留命中的文档，父级按命中情况保留 */
  const filterTree = (nodes: AdminSectionNode[], word: string): AdminSectionNode[] => {
    if (!word) return nodes;
    const result: AdminSectionNode[] = [];
    nodes.forEach((section) => {
      const chapters: AdminChapterNode[] = [];
      const docs: AdminDocNode[] = [];
      section.children.forEach((item) => {
        if (item.type === "chapter") {
          const children = item.children.filter((doc) => matchDoc(doc, word));
          if (children.length) chapters.push({ ...item, children });
        } else if (matchDoc(item, word)) {
          docs.push(item);
        }
      });
      if (section.title.toLowerCase().includes(word)) {
        result.push(section);
        return;
      }
      if (chapters.length || docs.length) {
        result.push({ ...section, children: [...chapters, ...docs] });
      }
    });
    return result;
  };

  const treeData = computed(() => filterTree(slots.value?.tree ?? [], keyword.value.trim().toLowerCase()));

  const handleKeyword = (value: string) => {
    keyword.value = value;
  };

  const handleNodeClick = (data: Record<string, unknown>) => {
    if (data.type !== "doc") return;
    activeDocKey.value = String(data.key);
    drawerVisible.value = true;
  };

  const openInit = () => {
    initForm.value = { locale: "", title: "" };
    initVisible.value = true;
  };

  /** 语言目录代码：允许两位语言 + 可选地区段，大小写与下划线在提交时归一 */
  const LOCALE_CODE = /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/;
  const localeCode = z
    .string()
    .trim()
    .transform((value) => value.toLowerCase().replace(/_/g, "-"))
    .refine((value) => LOCALE_CODE.test(value), { message: "knowledgeCenter.locale.invalidLocale" });

  const initFormRef = ref<FormInstance>();

  /** 模板动态 ref 只接受函数或字符串，这里统一把实例写回 ref */
  const setInitFormRef = (el: unknown): void => {
    initFormRef.value = el as FormInstance | undefined;
  };
  const initRules = computed(() => zodToRules(z.object({ locale: localeCode }), t));

  const submitInit = async () => {
    try {
      await initFormRef.value?.validate();
    } catch {
      return;
    }
    const code = initForm.value.locale.trim().toLowerCase().replace(/_/g, "-");
    initLoading.value = true;
    try {
      const result = await initLocale(code, initForm.value.title.trim() || undefined);
      ElMessage.success(t(result.created ? "knowledgeCenter.locale.initSuccess" : "knowledgeCenter.locale.initExists"));
      initVisible.value = false;
      activeLocale.value = code;
      await handleRefresh();
    } finally {
      initLoading.value = false;
    }
  };

  const handleReindex = async () => {
    reindexing.value = true;
    try {
      const result = await reindex();
      ElMessage.success(`${t("knowledgeCenter.reindex.success")}：${result.count}`);
      await handleRefresh();
    } finally {
      reindexing.value = false;
    }
  };

  const renameVisible = ref(false);
  const renameLoading = ref(false);
  const renameForm = ref({ locale: "", newLocale: "", title: "" });
  const renameFormRef = ref<FormInstance>();
  const setRenameFormRef = (el: unknown): void => {
    renameFormRef.value = el as FormInstance | undefined;
  };
  const renameRules = computed(() =>
    zodToRules(
      z.object({
        newLocale: z
          .string()
          .trim()
          .transform((value) => value.toLowerCase().replace(/_/g, "-"))
          .refine((value) => !value || LOCALE_CODE.test(value), { message: "knowledgeCenter.locale.invalidLocale" })
      }),
      t
    )
  );

  const openRename = (locale: string) => {
    const item = locales.value.find((entry) => entry.locale === locale);
    renameForm.value = { locale, newLocale: locale, title: item?.title ?? "" };
    renameVisible.value = true;
  };

  const submitRename = async () => {
    try {
      await renameFormRef.value?.validate();
    } catch {
      return;
    }
    const current = renameForm.value.locale;
    if (!current) return;
    const next = renameForm.value.newLocale.trim().toLowerCase().replace(/_/g, "-");
    renameLoading.value = true;
    try {
      const result = await updateLocale(current, {
        newLocale: next && next !== current ? next : undefined,
        title: renameForm.value.title.trim()
      });
      ElMessage.success(t("knowledgeCenter.locale.renameSuccess"));
      renameVisible.value = false;
      closeDoc();
      activeLocale.value = result.locale.locale;
      await handleRefresh();
    } catch {
      // 30010 / 30014 / 30019 已由响应拦截器统一提示，这里只结束本次操作
      return;
    } finally {
      renameLoading.value = false;
    }
  };

  const handleRemoveLocale = async (locale: string) => {
    try {
      await ElMessageBox.confirm(`${locale}：${t("knowledgeCenter.locale.deleteConfirm")}`, t("knowledgeCenter.locale.deleteTitle"), {
        type: "warning",
        confirmButtonText: t("knowledgeCenter.action.remove"),
        cancelButtonText: t("common.cancel")
      });
    } catch {
      return;
    }
    try {
      await removeLocale(locale);
    } catch {
      // 30010 / 30018 已由响应拦截器统一提示
      return;
    }
    ElMessage.success(t("knowledgeCenter.locale.deleteSuccess"));
    // 删掉的正是当前语言：树与详情一并清空，避免停留在已不存在的目录
    if (activeLocale.value === locale) {
      slots.value = null;
      activeLocale.value = "";
    }
    await loadLocales();
  };

  const menuEntries = computed<ContextEntry[]>(() => {
    const refresh: ContextEntry = {
      key: "refresh",
      labelKey: "knowledgeCenter.context.refresh",
      handler: handleRefresh
    };
    const reindexEntry: ContextEntry = {
      key: "reindex",
      labelKey: "knowledgeCenter.context.reindex",
      disabled: !canReindex.value || reindexing.value,
      handler: handleReindex
    };

    if (!menu.locale) {
      return [
        { key: "create", labelKey: "knowledgeCenter.context.create", disabled: !canManage.value, handler: openInit },
        refresh,
        reindexEntry,
        { key: "import", labelKey: "knowledgeCenter.context.import", disabled: true },
        { key: "cleanup", labelKey: "knowledgeCenter.context.cleanup", disabled: true }
      ];
    }

    return [
      {
        key: "rename",
        labelKey: "knowledgeCenter.context.rename",
        disabled: !canManage.value,
        handler: () => openRename(menu.locale)
      },
      {
        key: "remove",
        labelKey: "knowledgeCenter.context.remove",
        disabled: !canManage.value,
        handler: () => void handleRemoveLocale(menu.locale)
      },
      refresh,
      reindexEntry,
      { key: "copy", labelKey: "knowledgeCenter.context.copy", disabled: true },
      { key: "export", labelKey: "knowledgeCenter.context.export", disabled: true },
      { key: "default", labelKey: "knowledgeCenter.context.defaultLocale", disabled: true }
    ];
  });

  const runMenu = (entry: ContextEntry) => {
    closeMenu();
    if (entry.disabled || !entry.handler) return;
    entry.handler();
  };

  return {
    t,
    locales,
    activeLocale,
    slots,
    loading,
    localeLoading,
    reindexing,
    keyword,
    menu,
    drawerVisible,
    activeDocKey,
    createVisible,
    initVisible,
    initLoading,
    initForm,
    initFormRef,
    setInitFormRef,
    initRules,
    renameVisible,
    renameLoading,
    renameForm,
    renameFormRef,
    setRenameFormRef,
    renameRules,
    treeData,
    menuEntries,
    handleRefresh,
    switchLocale,
    openMenu,
    handleKeyword,
    handleNodeClick,
    openInit,
    submitInit,
    handleReindex,
    openRename,
    submitRename,
    handleRemoveLocale,
    runMenu
  };
}
