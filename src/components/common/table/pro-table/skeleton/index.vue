<template>
  <div class="pro-table-skeleton" role="status" :aria-label="t('common.loading')">
    <!-- 表头行 -->
    <div class="pro-table-skeleton-row is-head">
      <div v-if="showSelection" class="pro-table-skeleton-cell is-selection" />
      <div v-for="col in columns" :key="col.prop" class="pro-table-skeleton-cell" :style="cellStyle(col)">
        <el-skeleton-item variant="text" style="width: 60%" />
      </div>
    </div>
    <!-- 数据行 -->
    <div v-for="n in rows" :key="n" class="pro-table-skeleton-row">
      <div v-if="showSelection" class="pro-table-skeleton-cell is-selection" />
      <div v-for="col in columns" :key="col.prop" class="pro-table-skeleton-cell" :style="cellStyle(col)">
        <el-skeleton-item variant="rect" class="pro-table-skeleton-block" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "ProTableSkeleton" });

import type { ProTableColumn } from "../types";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

type SkeletonColumn = Pick<ProTableColumn, "prop" | "label" | "width" | "minWidth">;

interface Props {
  columns: SkeletonColumn[];
  rows?: number;
  showSelection?: boolean;
}

withDefaults(defineProps<Props>(), {
  rows: 5,
  showSelection: false
});

/** 列宽映射：width 固定宽 / minWidth 弹性 / 缺省均分，与 el-table 列渲染对齐 */
const cellStyle = (col: SkeletonColumn): Record<string, string> => {
  if (col.width) return { width: `${col.width}px` };
  if (col.minWidth) return { flex: `1 1 ${col.minWidth}px`, minWidth: `${col.minWidth}px` };
  return { flex: "1 1 0" };
};
</script>

<style scoped lang="less">
.pro-table-skeleton {
  border: 1px solid @color-border-lighter;
  border-radius: @radius-lg;
  overflow: hidden;

  .pro-table-skeleton-row {
    display: flex;
    align-items: center;
    height: 48px;
    padding: 0 @space-4;
    gap: @space-4;
    border-bottom: 1px solid @color-border-lighter;

    &.is-head {
      background: var(--el-fill-color-light);
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .pro-table-skeleton-cell {
    min-width: 0;

    &.is-selection {
      flex: 0 0 48px;
    }
  }

  .pro-table-skeleton-block {
    width: 100%;
    height: 18px;
    border-radius: @radius-control;
  }
}
</style>
