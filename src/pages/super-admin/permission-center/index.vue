<template>
  <div class="page-wrap-permission-center">
    <BasicPage :title="t('permission.title')" :description="t('permission.titleDescription')">
      <template #content>
        <div class="permission-layout">
          <PermissionRolePanel v-model:selected-role-id="selectedRoleId" :roles="roleList" />

          <PermissionTreePanel
            ref="treePanelRef"
            :menu-tree="menuTree"
            :role-name="currentRoleName"
            :selected-count="selectedCount"
            :saving="saving"
            @check="handleCheck"
            @select-all="handleSelectAll"
            @clear="handleClear"
            @save="handleSave"
            @reset="handleReset"
          />
        </div>
      </template>
    </BasicPage>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "PermissionCenter" });

import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "@/utils/element-plus";
import BasicPage from "@/components/page/basic/index.vue";
import PermissionRolePanel from "@/components/permission-center/role-panel/index.vue";
import PermissionTreePanel from "@/components/permission-center/tree-panel/index.vue";
import { fetchMenuList, fetchRoleList, saveRolePermissions } from "@/api";
import type { Menu, MenuItems, RoleInfo } from "@/types";

const { t } = useI18n();

// 角色列表 + 当前选中角色
const roleList = ref<RoleInfo[]>([]);
const selectedRoleId = ref<number>();

// 权限树数据 + 树实例 + 勾选统计
const menuTree = ref<MenuItems>([]);
const treePanelRef = ref<InstanceType<typeof PermissionTreePanel> | null>(null);
const selectedCount = ref(0);

// 保存中状态
const saving = ref(false);

// 当前角色名（树标题展示）
const currentRoleName = computed(() => {
  const role = roleList.value.find((r) => r.id === selectedRoleId.value);
  return role ? t(role.name) : "";
});

// 权限码 → 节点 id 映射（回显勾选用）
const permissionIdMap = computed(() => {
  const map = new Map<string, number>();
  const walk = (nodes: Menu[]): void => {
    nodes.forEach((node) => {
      if (node.permission) map.set(node.permission, node.id);
      if (node.children?.length) walk(node.children);
    });
  };
  walk(menuTree.value);
  return map;
});

// 所有节点 id（全选用）
const allNodeIds = computed(() => {
  const ids: number[] = [];
  const walk = (nodes: Menu[]): void => {
    nodes.forEach((node) => {
      ids.push(node.id);
      if (node.children?.length) walk(node.children);
    });
  };
  walk(menuTree.value);
  return ids;
});

// 勾选结果 → 权限码数组（含半选父级，保证菜单码不丢）
const collectPermissionCodes = (): string[] => {
  const tree = treePanelRef.value;
  if (!tree) return [];
  const ids = [...tree.getCheckedKeys(), ...tree.getHalfCheckedKeys()];
  const idCodeMap = new Map<number, string>();
  const walk = (nodes: Menu[]): void => {
    nodes.forEach((node) => {
      if (node.permission) idCodeMap.set(node.id, node.permission);
      if (node.children?.length) walk(node.children);
    });
  };
  walk(menuTree.value);
  return ids.map((id) => idCodeMap.get(id)).filter((code): code is string => Boolean(code));
};

// 按角色权限码回显树勾选
const applyPermissionCheck = (roleId: number): void => {
  const role = roleList.value.find((r) => r.id === roleId);
  if (!role) return;
  const tree = treePanelRef.value;
  if (!tree) return;
  // 超级权限（*:*:*）→ 全选；否则按权限码逐个勾选（deep=false 不联动子级）
  const ids = role.permissions.includes("*:*:*")
    ? allNodeIds.value
    : role.permissions
        .map((permission) => permissionIdMap.value.get(permission))
        .filter((id): id is number => Boolean(id));
  nextTick(() => {
    tree.setCheckedKeys([]);
    ids.forEach((id) => tree.setChecked(id, true, false));
    refreshCount();
  });
};

// 勾选变化 → 刷新统计
const handleCheck = (): void => {
  nextTick(refreshCount);
};

const refreshCount = (): void => {
  const tree = treePanelRef.value;
  if (!tree) return;
  selectedCount.value = tree.getCheckedKeys().length + tree.getHalfCheckedKeys().length;
};

// 全选 / 清空
const handleSelectAll = (): void => {
  treePanelRef.value?.setCheckedKeys(allNodeIds.value);
  refreshCount();
};

const handleClear = (): void => {
  treePanelRef.value?.setCheckedKeys([]);
  refreshCount();
};

// 重置：恢复回显状态
const handleReset = (): void => {
  if (selectedRoleId.value) applyPermissionCheck(selectedRoleId.value);
};

// 保存权限
const handleSave = async (): Promise<void> => {
  if (!selectedRoleId.value) return;
  saving.value = true;
  try {
    await saveRolePermissions(selectedRoleId.value, { permissionCodes: collectPermissionCodes() });
    ElMessage.success(t("permission.saveSuccess"));
  } finally {
    saving.value = false;
  }
};

// 加载角色列表，默认选中第一个
const loadRoles = async (): Promise<void> => {
  roleList.value = await fetchRoleList();
  if (roleList.value.length) selectedRoleId.value = roleList.value[0].id;
};

// 加载权限树
const loadMenuTree = async (): Promise<void> => {
  menuTree.value = await fetchMenuList();
};

// 切换角色 → 重新回显（树未加载完成时跳过，由 onMounted 兜底）
watch(selectedRoleId, (id) => {
  if (id && menuTree.value.length) applyPermissionCheck(id);
});

// 初始化：并行加载菜单树与角色列表，就绪后回显首个角色
onMounted(async () => {
  await Promise.all([loadMenuTree(), loadRoles()]);
  if (selectedRoleId.value) applyPermissionCheck(selectedRoleId.value);
});
</script>

<style scoped lang="less">
.permission-layout {
  display: flex;
  gap: @space-4;
  align-items: flex-start;
}

@media (max-width: @mobile-max) {
  .permission-layout {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
