<template>
  <div class="tree-panel">
    <div class="tree-header">
      <div class="tree-title">
        {{ t("permission.menuTree") }}
        <span class="tree-role-name">{{ roleName }}</span>
      </div>
      <div class="tree-actions">
        <span class="selected-count">{{ t("permission.selectedCount", { count: selectedCount }) }}</span>
        <span
          class="text-link"
          role="button"
          tabindex="0"
          @click="emit('select-all')"
          @keydown.enter.prevent="emit('select-all')"
          @keydown.space.prevent="emit('select-all')"
          >{{ t("permission.selectAll") }}</span>
        <span
          class="text-link is-muted"
          role="button"
          tabindex="0"
          @click="emit('clear')"
          @keydown.enter.prevent="emit('clear')"
          @keydown.space.prevent="emit('clear')"
          >{{ t("permission.clear") }}</span>
      </div>
    </div>
    <el-tree
      ref="treeRef"
      :data="menuTree"
      show-checkbox
      accordion
      node-key="id"
      :props="{ label: 'name', children: 'children' }"
      @check="emit('check')"
    >
      <template #default="{ data }">
        <span class="tree-node">
          <el-icon v-if="data.type === 'DIR'" class="node-icon"><Folder /></el-icon>
          <el-icon v-else-if="data.type === 'MENU'" class="node-icon"><Document /></el-icon>
          <span v-if="data.type === 'BUTTON'" class="button-tag">{{ t(data.name) }}</span>
          <span v-else class="node-name">{{ t(data.name) }}</span>
          <span v-if="data.permission" class="node-code">{{ data.permission }}</span>
        </span>
      </template>
    </el-tree>
    <div class="tree-footer">
      <app-button v-permission="'superAdmin:role:assign'" tone="primary" :loading="saving" @click="emit('save')">
        {{ t("permission.save") }}
      </app-button>
      <app-button variant="outline" @click="emit('reset')">
        {{ t("permission.reset") }}
      </app-button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "PermissionTreePanel" });

import { ref } from "vue";
import { useI18n } from "vue-i18n";
import type { ElTree } from "element-plus";
import { Folder, Document } from "@element-plus/icons-vue";
import type { MenuItems } from "@/types";

defineProps<{
  menuTree: MenuItems;
  roleName: string;
  selectedCount: number;
  saving: boolean;
}>();

const emit = defineEmits<{
  (e: "check"): void;
  (e: "select-all"): void;
  (e: "clear"): void;
  (e: "save"): void;
  (e: "reset"): void;
}>();

const { t } = useI18n();
const treeRef = ref<InstanceType<typeof ElTree>>();

const setCheckedKeys = (keys: number[]): void => {
  treeRef.value?.setCheckedKeys(keys);
};

const setChecked = (id: number, checked: boolean, deep: boolean): void => {
  treeRef.value?.setChecked(id, checked, deep);
};

const getCheckedKeys = (): number[] => (treeRef.value?.getCheckedKeys() ?? []) as number[];

const getHalfCheckedKeys = (): number[] => (treeRef.value?.getHalfCheckedKeys() ?? []) as number[];

defineExpose({
  setCheckedKeys,
  setChecked,
  getCheckedKeys,
  getHalfCheckedKeys
});
</script>

<style scoped lang="less">
.tree-panel {
  flex: 1;
  min-width: 0;
  padding: @space-4;
  border: 1px solid @color-border;
  border-radius: @radius-lg;
  box-sizing: border-box;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: @space-3;
  margin-bottom: @space-3;
  border-bottom: 1px solid @color-border-light;
}

.tree-title {
  font-size: 14px;
  font-weight: 600;
  color: @color-text-primary;
}

.tree-role-name {
  margin-left: @space-2;
  font-size: 12px;
  font-weight: 400;
  color: @color-text-secondary;
}

.tree-actions {
  display: flex;
  gap: @space-3;
  align-items: center;
}

.selected-count {
  font-size: 12px;
  color: @color-text-secondary;
}

.text-link {
  font-size: 12px;
  color: @color-primary;
  cursor: pointer;

  &.is-muted {
    color: @color-text-secondary;
  }

  &:hover {
    opacity: 0.8;
  }
}

.tree-node {
  display: flex;
  align-items: center;
  gap: @space-1-5;
}

.node-icon {
  color: @color-text-secondary;
  font-size: 14px;
}

.node-name {
  font-size: 13px;
  color: @color-text-primary;
}

.button-tag {
  padding: 0 @space-2;
  border-radius: @radius-sm;
  font-size: 12px;
  line-height: 18px;
  color: var(--color-primary);
  background-color: var(--el-color-primary-light-9);
}

.node-code {
  font-size: 12px;
  color: @color-text-placeholder;
}

.tree-footer {
  display: flex;
  gap: @space-2-5;
  padding-top: @space-3;
  margin-top: @space-3;
  border-top: 1px solid @color-border-light;
}

:deep(.el-tree-node__content) {
  height: 34px;
}
</style>
