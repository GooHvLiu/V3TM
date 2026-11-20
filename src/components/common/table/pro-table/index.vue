<template>
  <div class="page-wrap-pro-table">
    <!-- 请求错误：由 useTable 的 error 透传，页面不需要再各自弹层 -->
    <app-alert
      v-if="errorMessage"
      class="pro-table-error"
      :title="errorMessage"
      tone="danger"
    />

    <!-- 表格工具栏：密度与列显隐；页面可用 #toolbar 追加自己的操作 -->
    <div v-if="showToolbar" class="pro-table-toolbar">
      <div class="pro-table-toolbar-start">
        <slot name="toolbar" />
      </div>
      <div class="pro-table-toolbar-end">
        <span class="pro-table-toolbar-label">{{ t("common.table.density") }}</span>
        <el-radio-group
          class="pro-table-density"
          :model-value="currentDensity"
          size="small"
          :aria-label="t('common.table.density')"
          @update:model-value="changeDensity"
        >
          <el-radio-button value="default">
            {{ t("common.table.densityDefault") }}
          </el-radio-button>
          <el-radio-button value="compact">
            {{ t("common.table.densityCompact") }}
          </el-radio-button>
        </el-radio-group>
        <el-popover v-if="showColumnSettings" placement="bottom-end" :width="220" trigger="click">
          <template #reference>
            <app-button variant="ghost" size="sm">
              {{ t("common.table.columnSettings") }}
            </app-button>
          </template>
          <ColumnSettings :items="columnSettingItems" @toggle="setColumnVisible" @reset="resetColumnVisibility" />
        </el-popover>
      </div>
    </div>

    <!-- 内置骨架屏：loading 时替代 v-loading 遮罩，列宽跟随 columns -->
    <ProTableSkeleton
      v-if="skeleton && loading"
      :columns="visibleColumns"
      :rows="skeletonRows"
      :show-selection="showSelection"
    />
    <el-table
      v-else
      ref="tableRef"
      v-loading="loading"
      :size="tableSize"
      :data="data"
      :row-key="rowKey"
      :default-sort="sort ?? undefined"
      :scrollbar-always-on="isMobile"
      @selection-change="onSelectionChange"
      @sort-change="onSortChange"
    >
      <!-- 批量选择列（可选） -->
      <el-table-column v-if="showSelection" type="selection" width="48" :fixed="isMobile ? false : 'left'" />
      <!-- 列配置驱动渲染 -->
      <el-table-column
        v-for="col in visibleColumns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align"
        :fixed="isMobile ? false : col.fixed"
        :sortable="col.sortable ? 'custom' : false"
        :show-overflow-tooltip="col.showOverflowTooltip"
      >
        <template #default="{ row, $index }">
          <!-- 列自定义插槽：页面用 #cell-{prop} 覆盖；无插槽则按 formatter 或字段值显示 -->
          <slot :name="`cell-${col.prop}`" :row="row" :index="$index">
            {{ formatCell(row, col, $index) }}
          </slot>
        </template>
      </el-table-column>

      <template #empty>
        <slot name="empty">
          <app-empty :description="emptyText || t('common.table.empty')" :image-size="72" />
        </slot>
      </template>
    </el-table>
    <!-- 分页器：数据/事件全部来自 useTable -->
    <div ref="paginationWrap" class="pro-table-pagination">
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        :pager-count="pagerCount"
        :size="isMobile ? 'small' : 'default'"
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
// 引入 vue 组合式 API 与表格实例类型
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { TableInstance } from "element-plus";
import { ElLoading, useLocale } from "element-plus";
import AppEmpty from "@/components/common/base/app-empty/index.vue";
import AppAlert from "@/components/common/base/app-alert/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";
import { useBreakpoint } from "@/composables/use-breakpoint";

// 引入列配置与排序类型
import type { ProTableColumn, ProTableSort, ProTableSortChange, ProTableSortOrder } from "./types";

// 列状态与单元格取值
import {
  buildColumnSettings,
  filterVisibleColumns,
  formatColumnCell,
  resolveColumnVisibility,
  toSortOrder,
  type ColumnVisibility
} from "./helpers";

// 内置骨架屏（loading 时替代 v-loading 遮罩）
import ProTableSkeleton from "./skeleton/index.vue";

// 列设置面板：只负责展示与上抛
import ColumnSettings from "./column-settings/index.vue";

/** 显式绑定 v-loading，避免构建期从 vue 解析未注册的指令 */
const vLoading = ElLoading.directive;

// 定义组件名字
defineOptions({ name: "ProTable" });

const { t } = useI18n();
/** Element Plus 自己的分页文案走 ConfigProvider，不混进项目语言包 */
const { t: tElement } = useLocale();

// 窄屏分页只留下翻页按钮，页码数量收窄
const { isMobile } = useBreakpoint();
const paginationLayout = computed(() =>
  isMobile.value ? "prev, pager, next" : "total, sizes, prev, pager, next, jumper"
);
const pagerCount = computed(() => (isMobile.value ? 5 : 7));

/** 分页器容器：EP 对每页条数下拉没有 label 出口（jumper、翻页、页码都自带），只能挂载后补 */
const paginationWrap = ref<HTMLDivElement | null>(null);
let paginationObserver: MutationObserver | null = null;

const syncPaginationA11y = (): void => {
  const input = paginationWrap.value?.querySelector<HTMLInputElement>(".el-pagination__sizes .el-select__input");
  input?.setAttribute("aria-label", tElement("el.pagination.pagesize"));
};

onMounted(() => {
  void nextTick(syncPaginationA11y);
  if (!paginationWrap.value) return;
  paginationObserver = new MutationObserver(syncPaginationA11y);
  paginationObserver.observe(paginationWrap.value, { childList: true, subtree: true });
});

onBeforeUnmount(() => {
  paginationObserver?.disconnect();
  paginationObserver = null;
});

interface Props {
  columns: ProTableColumn[];
  data: T[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  showSelection?: boolean;
  rowKey?: string;
  pageSizes?: number[];
  skeleton?: boolean;
  skeletonRows?: number;
  showToolbar?: boolean;
  showColumnSettings?: boolean;
  density?: "default" | "compact";
  /** 列显隐表；传入即受控，用于把列配置落到本地存储或后端 */
  columnVisibility?: ColumnVisibility;
  emptyText?: string;
  error?: Error | string | null;
  sort?: ProTableSort | null;
}

const props = withDefaults(defineProps<Props>(), {
  showSelection: false,
  rowKey: "id",
  pageSizes: () => [10, 20, 50],
  skeleton: true,
  skeletonRows: 5,
  showToolbar: false,
  showColumnSettings: true,
  density: "default",
  emptyText: "",
  error: null,
  sort: null
});

const emit = defineEmits<{
  (e: "page-change", page: number): void;
  (e: "size-change", size: number): void;
  (e: "selection-change", rows: T[]): void;
  (e: "sort-change", value: ProTableSortChange): void;
  (e: "update:density", value: "default" | "compact"): void;
  (e: "update:columnVisibility", value: ColumnVisibility): void;
}>();

// 表格实例：页面批量操作完成后清空勾选框
// useTable 的 clearSelection 只清列表变量，勾选态在 el-table 内部
const tableRef = ref<TableInstance>();

const clearSelection = (): void => {
  tableRef.value?.clearSelection();
};

/** 密度同时支持受控与内部切换，未传 v-model:density 时也能直接点 */
const currentDensity = ref<"default" | "compact">(props.density);
watch(
  () => props.density,
  (value) => {
    currentDensity.value = value;
  }
);

const tableSize = computed<"default" | "small">(() => (currentDensity.value === "compact" ? "small" : "default"));

const changeDensity = (value: string | number | boolean): void => {
  const next = value === "compact" ? "compact" : "default";
  currentDensity.value = next;
  emit("update:density", next);
};

/** 列显隐：外部传入时以外部为准，可交给页面持久化；未传时在组件内维护。列增删自动补齐 */
const innerVisibility = ref<ColumnVisibility>({});

const columnVisibility = computed<ColumnVisibility>(() =>
  resolveColumnVisibility(props.columns, props.columnVisibility ?? innerVisibility.value)
);

const visibleColumns = computed<ProTableColumn[]>(() => filterVisibleColumns(props.columns, columnVisibility.value));

/** 面板需要的是一行行可勾选项，规则全在 helpers 里 */
const columnSettingItems = computed(() => buildColumnSettings(props.columns, columnVisibility.value));

const commitVisibility = (next: ColumnVisibility): void => {
  innerVisibility.value = next;
  emit("update:columnVisibility", next);
};

const setColumnVisible = (prop: string, value: boolean): void => {
  commitVisibility({ ...columnVisibility.value, [prop]: value });
};

const resetColumnVisibility = (): void => {
  commitVisibility(resolveColumnVisibility(props.columns));
};

/** 无插槽时的单元格文本：formatter 优先，其次直接取字段值 */
const formatCell = (row: T, column: ProTableColumn, index: number): string =>
  formatColumnCell(row, column, index);

const errorMessage = computed<string>(() => {
  if (!props.error) return "";
  return props.error instanceof Error ? props.error.message : props.error;
});

const onSortChange = (payload: { prop: string; order: string | null; column?: unknown }): void => {
  const order: ProTableSortOrder | null = toSortOrder(payload.order);
  emit("sort-change", { prop: payload.prop, order });
};

// 事件：全部转发给 useTable（翻页/改尺寸/选择）
const onPageChange = (page: number) => emit("page-change", page);
const onSizeChange = (size: number) => emit("size-change", size);
const onSelectionChange = (rows: T[]) => emit("selection-change", rows);

// 供页面调用：批量/清理成功后清空勾选
defineExpose({ clearSelection });
</script>

<style scoped lang="less">
.page-wrap-pro-table {
  .pro-table-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: @space-3;
    margin-bottom: @space-3;
  }

  .pro-table-toolbar-start {
    display: flex;
    flex-wrap: wrap;
    gap: @space-2;
    min-width: 0;
  }

  .pro-table-toolbar-end {
    display: flex;
    align-items: center;
    gap: @space-2;
    margin-left: auto;
  }

  .pro-table-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: @space-4;
    overflow-x: auto;
  }

  @media (max-width: @mobile-max) {
    .pro-table-toolbar {
      gap: @space-2;
    }
    .pro-table-toolbar-label,
    .pro-table-density {
      display: none;
    }
    .pro-table-toolbar-end {
      margin-left: 0;
    }
    .pro-table-pagination {
      justify-content: center;
    }
  }

  .pro-table-toolbar-label {
    font-size: @font-size-xs;
    color: @color-text-secondary;
  }

  .pro-table-error {
    margin-bottom: @space-3;
  }
}
</style>
