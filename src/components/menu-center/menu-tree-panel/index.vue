<template>
  <div v-loading="loading" class="menu-center-panel">
    <div class="menu-center-toolbar">
      <el-input
        :model-value="keyword"
        class="menu-center-keyword"
        :placeholder="t('menuCenter.search')"
        clearable
        @update:model-value="handleKeyword"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select
        :model-value="typeFilter"
        class="menu-center-filter"
        :aria-label="t('menuCenter.column.type')"
        @update:model-value="handleTypeFilter"
      >
        <el-option :label="t('menuCenter.typeAll')" value="all" />
        <el-option
          v-for="option in MENU_TYPE_OPTIONS"
          :key="option.value"
          :label="t(option.labelKey)"
          :value="option.value"
        />
      </el-select>
      <el-select
        :model-value="statusFilter"
        class="menu-center-filter"
        :aria-label="t('menuCenter.column.status')"
        @update:model-value="handleStatusFilter"
      >
        <el-option :label="t('menuCenter.statusAll')" value="all" />
        <el-option :label="t('menuCenter.status.on')" :value="1" />
        <el-option :label="t('menuCenter.status.off')" :value="0" />
      </el-select>
      <span class="menu-center-count">{{ countText }}</span>
    </div>

    <div ref="tableHostRef" class="menu-center-table-host">
      <el-table
        v-if="visibleRows.length"
        :data="visibleRows"
        row-key="id"
        border
        :allow-drag-last-column="false"
        :tree-props="{ children: 'children' }"
        :expand-row-keys="expandedKeys"
        :indent="22"
        :row-class-name="rowClassName"
        :max-height="tableMaxHeight || undefined"
        :scrollbar-always-on="isMobile"
        class="menu-center-table"
        @expand-change="handleExpandChange"
        @cell-click="handleCellClick"
      >
        <el-table-column
          prop="name"
          :label="t('menuCenter.column.name')"
          min-width="176"
          class-name="menu-center-name-cell"
        >
          <template #default="{ row }">
            <div class="menu-center-name">
              <app-tooltip :content="menuNameOf(row.name)">
                <span class="menu-center-name-text">{{ menuNameOf(row.name) }}</span>
              </app-tooltip>
              <app-tooltip :content="row.name">
                <span class="menu-center-key">{{ row.name }}</span>
              </app-tooltip>
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

        <el-table-column prop="path" :label="t('menuCenter.column.path')" min-width="132" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="{ 'menu-center-muted': !row.path }">{{ row.path || "—" }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="permission"
          :label="t('menuCenter.column.permission')"
          min-width="156"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span :class="{ 'menu-center-muted': !row.permission }">{{ row.permission || "—" }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="t('menuCenter.column.sort')" width="128">
          <template #default="{ row }">
            <el-input-number
              :model-value="row.sort ?? 0"
              :min="0"
              :max="9999"
              :step="1"
              size="small"
              controls-position="right"
              class="menu-center-sort"
              :aria-label="sortLabel(row)"
              @change="(value: number | undefined) => handleSortChange(row, value)"
            />
          </template>
        </el-table-column>

        <el-table-column :label="t('menuCenter.column.status')" width="76">
          <template #default="{ row }">
            <span class="menu-center-state">
              <i class="menu-center-dot" :class="row.status === 1 ? 'is-on' : 'is-off'" />
              <span :class="{ 'menu-center-muted': row.status !== 1 }">
                {{ row.status === 1 ? t("menuCenter.status.on") : t("menuCenter.status.off") }}
              </span>
            </span>
          </template>
        </el-table-column>

        <el-table-column :label="t('menuCenter.column.visible')" width="76">
          <template #default="{ row }">
            <span class="menu-center-state">
              <i class="menu-center-dot" :class="row.visible === 1 ? 'is-on' : 'is-off'" />
              <span :class="{ 'menu-center-muted': row.visible !== 1 }">
                {{ row.visible === 1 ? t("menuCenter.visible.on") : t("menuCenter.visible.off") }}
              </span>
            </span>
          </template>
        </el-table-column>

        <el-table-column
          :label="t('menuCenter.column.action')"
          width="180"
          :fixed="isMobile ? false : 'right'"
        >
          <template #default="{ row }">
            <app-button
              v-if="row.type !== 'BUTTON'"
              v-permission="'superAdmin:menu:create'"
              variant="link"
              tone="primary"
              @click="emit('create', row.id)"
            >
              {{ t("menuCenter.action.addChild") }}
            </app-button>
            <app-button v-permission="'superAdmin:menu:update'" variant="link" tone="primary" @click="emit('edit', row)">
              {{ t("menuCenter.action.edit") }}
            </app-button>
            <app-button
              v-permission="'superAdmin:menu:delete'"
              variant="link"
              tone="danger"
              :disabled="(row.children ?? []).length > 0"
              @click="emit('remove', row)"
            >
              {{ t("menuCenter.action.remove") }}
            </app-button>
          </template>
        </el-table-column>
      </el-table>

      <app-empty v-else :description="tree.length ? t('menuCenter.emptyFiltered') : t('menuCenter.empty')" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MenuTreePanel" });

import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { TableColumnCtx } from "element-plus";
import type { MenuTreeNode, MenuType } from "@/types";
import { useBreakpoint } from "@/composables";
import { MENU_TYPE_META, MENU_TYPE_OPTIONS, menuNameOf } from "@/pages/super-admin/menu-center/status";

const props = defineProps<{
  visibleRows: MenuTreeNode[];
  tree: MenuTreeNode[];
  expandedKeys: string[];
  tableMaxHeight: number;
  keyword: string;
  typeFilter: "all" | MenuType;
  statusFilter: "all" | 0 | 1;
  countText: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:keyword", value: string): void;
  (e: "update:typeFilter", value: "all" | MenuType): void;
  (e: "update:statusFilter", value: "all" | 0 | 1): void;
  (e: "expand-change", row: MenuTreeNode, expanded: boolean | MenuTreeNode[]): void;
  (e: "cell-click", row: MenuTreeNode, column: TableColumnCtx<MenuTreeNode>, cell: HTMLTableCellElement, event: PointerEvent): void;
  (e: "create", parentId: number): void;
  (e: "edit", row: MenuTreeNode): void;
  (e: "remove", row: MenuTreeNode): void;
  (e: "sort", row: MenuTreeNode, value: number | undefined): void;
}>();

const { t } = useI18n();
const { isMobile } = useBreakpoint();
const tableHostRef = ref<HTMLElement | null>(null);

const depthMap = computed<Map<number, number>>(() => {
  const map = new Map<number, number>();
  const walk = (nodes: MenuTreeNode[], depth: number): void => {
    nodes.forEach((node) => {
      map.set(node.id, depth);
      if (node.children?.length) walk(node.children, depth + 1);
    });
  };
  walk(props.tree, 1);
  return map;
});

const rowClassName = ({ row }: { row: MenuTreeNode }): string => {
  const depth = depthMap.value.get(row.id) ?? 1;
  const levelClass = depth === 1 ? "menu-center-row is-top-level" : "menu-center-row is-child-level";
  return (row.children ?? []).length ? `${levelClass} is-expandable` : levelClass;
};

const handleKeyword = (value: string): void => emit("update:keyword", value);

const handleTypeFilter = (value: "all" | MenuType): void => emit("update:typeFilter", value);

const handleStatusFilter = (value: "all" | 0 | 1): void => emit("update:statusFilter", value);

const handleExpandChange = (row: MenuTreeNode, expanded: boolean | MenuTreeNode[]): void => {
  emit("expand-change", row, expanded);
};

const handleCellClick = (
  row: MenuTreeNode,
  column: TableColumnCtx<MenuTreeNode>,
  cell: HTMLTableCellElement,
  event: PointerEvent
): void => {
  emit("cell-click", row, column, cell, event);
};

const handleSortChange = (row: MenuTreeNode, value: number | undefined): void => {
  emit("sort", row, value);
};

/** 排序输入的可读名称：列名 + 菜单名，避免逐行输入框只读成“数字” */
const sortLabel = (row: MenuTreeNode): string => `${t("menuCenter.column.sort")} · ${menuNameOf(row.name)}`;

defineExpose({ tableHostRef });
</script>

<style scoped lang="less">
.menu-center-panel {
  min-height: 240px;
}

.menu-center-toolbar {
  display: flex;
  align-items: center;
  gap: @space-2;
  margin-bottom: @space-3;
  flex-wrap: wrap;
}

.menu-center-keyword {
  width: 260px;
}

.menu-center-filter {
  width: 132px;
}

.menu-center-count {
  margin-left: auto;
  color: @color-text-secondary;
  font-size: 0.8rem;
}

.menu-center-table {
  width: 100%;
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

:deep(.menu-center-table .el-table__expand-icon) {
  vertical-align: middle;
}

.menu-center-muted {
  color: @color-text-placeholder;
}

.menu-center-state {
  display: inline-flex;
  align-items: center;
  gap: @space-1-5;
}

.menu-center-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: @color-text-placeholder;
  flex-shrink: 0;

  &.is-on {
    background: @color-success;
  }
}

.menu-center-sort {
  width: 100%;
}

@media (max-width: @screen-sm) {
  .menu-center-keyword {
    width: 100%;
  }

  .menu-center-filter {
    flex: 1 1 120px;
    width: auto;
    min-width: 0;
  }

  .menu-center-count {
    width: 100%;
    margin-left: 0;
  }
}

/* 名称列：展开箭头、层级缩进与两行名称并排居中，行高与其它行齐平 */
:deep(.menu-center-name-cell .cell) {
  display: flex;
  align-items: center;
  gap: @space-1;
  min-width: 0;
}

:deep(.menu-center-name-cell .menu-center-name) {
  min-width: 0;
}

:deep(.menu-center-table .is-top-level) {
  .menu-center-name-text {
    font-weight: 600;
  }

  > td:first-child {
    position: relative;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 8px;
      bottom: 8px;
      width: 4px;
      border-radius: @radius-base;
      background: @color-success;
    }
  }
}

:deep(.menu-center-table .is-child-level) {
  .menu-center-name-text {
    color: @color-text-regular;
  }
}

:deep(.menu-center-table .is-expandable) {
  > td:first-child {
    cursor: pointer;
  }
}
</style>
