<template>
  <div class="menu-recycle-panel">
    <p class="menu-center-recycle-tip">
      {{ t("menuCenter.recycle.description") }}
    </p>

    <el-table
      v-if="deleted.length"
      v-loading="loading"
      :data="deleted"
      :scrollbar-always-on="isMobile"
      border
      class="menu-center-table"
    >
      <el-table-column
        prop="name"
        :label="t('menuCenter.column.name')"
        min-width="176"
        class-name="menu-center-name-cell"
      >
        <template #default="{ row }">
          <div class="menu-center-name">
            <span class="menu-center-name-text">{{ menuNameOf(row.name) }}</span>
            <span class="menu-center-key">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('menuCenter.column.type')" width="76">
        <template #default="{ row }">
          <app-tag size="small" effect="plain" :type="MENU_TYPE_META[row.type as MenuType].tag">
            {{ t(MENU_TYPE_META[row.type as MenuType].labelKey) }}
          </app-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('menuCenter.recycle.parent')" min-width="140">
        <template #default="{ row }">
          {{ row.parentName ? menuNameOf(row.parentName) : t("menuCenter.recycle.topLevel") }}
        </template>
      </el-table-column>
      <el-table-column prop="path" :label="t('menuCenter.column.path')" min-width="132" show-overflow-tooltip>
        <template #default="{ row }">
          <span :class="{ 'menu-center-muted': !row.path }">{{ row.path || "—" }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('menuCenter.recycle.deletedAt')" width="150">
        <template #default="{ row }">
          {{ formatDate(row.deletedAt, "YYYY-MM-DD HH:mm") }}
        </template>
      </el-table-column>
      <el-table-column
        :label="t('menuCenter.column.action')"
        width="176"
        :fixed="isMobile ? false : 'right'"
      >
        <template #default="{ row }">
          <span v-if="isParentMissing(tree, row.parentId)" class="menu-center-recycle-block">
            {{ t("menuCenter.recycle.parentDeletedShort") }}
          </span>
          <app-button
            v-else
            v-permission="'superAdmin:menu:restore'"
            variant="link"
            tone="primary"
            @click="emit('restore', row)"
          >
            {{ t("menuCenter.action.restore") }}
          </app-button>
        </template>
      </el-table-column>
    </el-table>

    <app-empty v-else :description="t('menuCenter.recycle.empty')" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MenuRecyclePanel" });

import { useI18n } from "vue-i18n";
import type { DeletedMenuDto, MenuTreeNode, MenuType } from "@/types";
import { useBreakpoint } from "@/composables";
import { formatDate } from "@/utils";
import { MENU_TYPE_META, isParentMissing, menuNameOf } from "@/pages/super-admin/menu-center/status";

defineProps<{
  deleted: DeletedMenuDto[];
  loading: boolean;
  tree: MenuTreeNode[];
}>();

const emit = defineEmits<{
  (e: "restore", row: DeletedMenuDto): void;
}>();

const { t } = useI18n();
const { isMobile } = useBreakpoint();
</script>

<style scoped lang="less">
.menu-center-recycle-tip {
  color: @color-text-secondary;
  font-size: 0.8rem;
  margin-bottom: @space-3;
}

.menu-center-table {
  width: 100%;
}

/* 名称列两行文本块按 flex 居中，行高与其它列齐平 */
:deep(.menu-center-name-cell .cell) {
  display: flex;
  align-items: center;
  min-width: 0;
}

:deep(.menu-center-name-cell .menu-center-name) {
  min-width: 0;
}

.menu-center-name {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: @space-0-5;
  max-width: 100%;
  vertical-align: middle;
  line-height: 1.35;
}

.menu-center-name-text {
  color: @color-text-primary;
  font-size: 13px;
  font-weight: 400;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-center-key {
  color: @color-text-secondary;
  font-size: 0.75rem;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-center-muted {
  color: @color-text-placeholder;
}

.menu-center-recycle-block {
  color: @color-text-placeholder;
  font-size: 0.78rem;
}
</style>
