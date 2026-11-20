<template>
  <div class="records-pane">
    <ProSearch
      :fields="fields"
      :model-value="filter"
      @update:model-value="syncFilter"
      @search="applyFilters"
      @reset="applyFilters"
    />

    <p class="records-tip">{{ t("dataSearch.logTip") }}</p>

    <ProTable
      :columns="columns"
      :data="list"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :error="error"
      :empty-text="t('dataSearch.empty.log')"
      :column-visibility="columnVisibility"
      :density="density"
      row-key="id"
      show-toolbar
      @page-change="changePage"
      @size-change="changePageSize"
      @update:column-visibility="setColumnVisibility"
      @update:density="setDensity"
    >
      <template #cell-createdAt="{ row }">
        {{ formatDate(row.createdAt, "YYYY-MM-DD HH:mm:ss") }}
      </template>

      <template #cell-actionName="{ row }">{{ logActionLabel(t, row.action, te) }}</template>

      <template #cell-module="{ row }">{{ logModuleLabel(t, row.module, te) }}</template>

      <template #cell-result="{ row }">
        <app-tag size="small" :type="resultTagType(row.result)" effect="plain">
          {{ t(resultLabelKey(row.result)) }}
        </app-tag>
      </template>

      <template #cell-target="{ row }">{{ row.target || "-" }}</template>

      <template #cell-description="{ row }">{{ row.description || "-" }}</template>

      <template #cell-reason="{ row }">
        <span :class="row.reason ? 'record-reason' : 'record-muted'">{{ row.reason || "-" }}</span>
      </template>

      <template #cell-ip="{ row }">{{ row.ip || "-" }}</template>

      <template #cell-userAgent="{ row }">
        <span class="record-muted">{{ row.userAgent || "-" }}</span>
      </template>

      <template #cell-detail="{ row }">
        <app-button variant="ghost" tone="primary" size="sm" @click="openDetail(row)">
          {{ t("dataSearch.table.detail") }}
        </app-button>
      </template>
    </ProTable>

    <LogDetailDialog v-model="detailVisible" :log="currentLog" />
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "DataSearchLogPane" });

import { useI18n } from "vue-i18n";
const { t, te } = useI18n();

import { computed, onMounted, reactive, ref, watch } from "vue";
import dayjs from "dayjs";

// 引入查询区与表格、详情弹窗
import ProSearch from "@/components/common/search/pro-search/index.vue";
import ProTable from "@/components/common/table/pro-table/index.vue";
import type { ProTableColumn } from "@/components/common/table/pro-table/types";
import type { ProFormField, ProFormModel } from "@/components/common/form/pro-form/types";
import LogDetailDialog from "@/components/log-center/log-detail-dialog/index.vue";

// 引入列表状态机与表格偏好
import { useTable, useTablePreferences } from "@/composables";

// 引入 api、常量与工具
import { getMyLogList, type MyLogListParams } from "@/api";
import { LOG_RESULTS, LOG_RESULT_META } from "@/constants";
import { formatDate, logActionLabel, logModuleLabel } from "@/utils";

import type { LogCategory, LogDto, LogResult } from "@/types";

type LogPageQuery = MyLogListParams & { page: number; pageSize: number };
type TagType = "primary" | "success" | "info" | "warning" | "danger";

// Props：日志分类由页签决定，切换时重新取数
const props = defineProps<{ category: LogCategory }>();

const emit = defineEmits<{
  (e: "update:loading", value: boolean): void;
}>();

/** 筛选值：查询区与页面共用一份，字段名与接口参数对齐 */
interface RecordsFilter {
  keyword: string;
  result: LogResult | "" | undefined;
  dateRange: [Date, Date] | null;
}

const filter = reactive<RecordsFilter>({
  keyword: "",
  result: "",
  dateRange: null
});

/** 查询区回写：合并到本地筛选对象 */
const syncFilter = (value: ProFormModel): void => {
  Object.assign(filter, value);
};

/** 查询区字段：三列在同一份配置里，改文案或改宽度都只动这里 */
const fields = computed<ProFormField[]>(() => [
  {
    prop: "keyword",
    type: "input",
    ariaLabel: t("dataSearch.filter.keywordLabel"),
    placeholder: t("dataSearch.filter.keyword"),
    width: 240
  },
  {
    prop: "result",
    type: "select",
    ariaLabel: t("dataSearch.filter.result"),
    placeholder: t("dataSearch.filter.allResult"),
    options: LOG_RESULTS.map((value) => ({ value, label: t(`logCenter.result.${value}`) })),
    width: 140
  },
  {
    prop: "dateRange",
    type: "daterange",
    ariaLabel: t("dataSearch.filter.dateRange"),
    startPlaceholder: t("dataSearch.filter.dateStart"),
    endPlaceholder: t("dataSearch.filter.dateEnd"),
    width: 260
  }
]);

/** 日期区间按本地整日折算为 ISO，保持与日志中心一致的日界口径 */
const buildFilters = (): Pick<MyLogListParams, "result" | "keyword" | "from" | "to"> => {
  const value = filter.dateRange;
  return {
    result: filter.result || undefined,
    keyword: filter.keyword.trim() || undefined,
    from: value?.[0] ? dayjs(value[0]).startOf("day").toISOString() : undefined,
    to: value?.[1] ? dayjs(value[1]).endOf("day").toISOString() : undefined
  };
};

/** 个人日志接口按当前账号隔离，分类决定返回的字段集合 */
const source = useTable<LogPageQuery, LogDto>({
  initialPageSize: 10,
  fetcher: (params) =>
    getMyLogList({
      ...params,
      ...buildFilters(),
      category: props.category
    })
});

const { list, total, page, pageSize, loading, error, fetchData, search, refresh, changePage, changePageSize } = source;

watch(
  loading,
  (value) => emit("update:loading", value),
  { immediate: true }
);

onMounted(() => {
  void fetchData();
});

// 页签在日志分类之间切换时，同一面板复用，需要按新分类回到第一页
watch(
  () => props.category,
  () => {
    void search();
  }
);

const applyFilters = (): void => {
  void search();
};

const resultLabelKey = (value: LogResult): string => LOG_RESULT_META[value]?.labelKey ?? "logCenter.result.success";

const resultTagType = (value: LogResult): TagType => (LOG_RESULT_META[value]?.tagType ?? "info") as TagType;

/** 列集合随分类切换：邮件看收发字段，登录看来源与原因，其余看模块动作 */
const columns = computed<ProTableColumn[]>(() => {
  const detailColumn: ProTableColumn = {
    prop: "detail",
    label: t("dataSearch.table.detail"),
    width: 80,
    fixed: "right",
    hideable: false
  };

  if (props.category === "mail") {
    return [
      { prop: "createdAt", label: t("dataSearch.table.createdAt"), width: 170, fixed: "left" },
      { prop: "subject", label: t("dataSearch.table.subject"), minWidth: 260, showOverflowTooltip: true },
      { prop: "toEmail", label: t("dataSearch.table.toEmail"), width: 200 },
      { prop: "template", label: t("dataSearch.table.template"), width: 160 },
      { prop: "result", label: t("dataSearch.table.result"), width: 90 },
      { prop: "messageId", label: t("dataSearch.table.messageId"), minWidth: 220, showOverflowTooltip: true },
      detailColumn
    ];
  }

  if (props.category === "login") {
    return [
      { prop: "createdAt", label: t("dataSearch.table.createdAt"), width: 170, fixed: "left" },
      { prop: "result", label: t("dataSearch.table.result"), width: 90 },
      { prop: "reason", label: t("dataSearch.table.reason"), width: 180, showOverflowTooltip: true },
      { prop: "ip", label: t("dataSearch.table.ip"), width: 140 },
      { prop: "userAgent", label: t("dataSearch.table.userAgent"), minWidth: 240, showOverflowTooltip: true },
      detailColumn
    ];
  }

  return [
    { prop: "createdAt", label: t("dataSearch.table.createdAt"), width: 170, fixed: "left" },
    { prop: "module", label: t("dataSearch.table.module"), width: 110 },
    { prop: "actionName", label: t("dataSearch.table.action"), width: 110 },
    { prop: "result", label: t("dataSearch.table.result"), width: 90 },
    { prop: "target", label: t("dataSearch.table.target"), width: 150, showOverflowTooltip: true },
    { prop: "description", label: t("dataSearch.table.description"), minWidth: 260, showOverflowTooltip: true },
    detailColumn
  ];
});

// 列显隐与行密度由表格偏好记忆；三个分类共用一份，按列名合并，切分类时互不覆盖
const { columnVisibility, density, setColumnVisibility, setDensity } = useTablePreferences(
  "data-search/log-pane",
  () => columns.value
);

const detailVisible = ref<boolean>(false);
const currentLog = ref<LogDto | null>(null);

const openDetail = (row: LogDto): void => {
  currentLog.value = row;
  detailVisible.value = true;
};

// 顶部刷新按钮按当前面板转调，保持当前页码与筛选条件
defineExpose({ refresh });
</script>

<style scoped lang="less">
.records-pane {
  display: flex;
  flex-direction: column;
  gap: @space-3;
  min-width: 0;
}

.records-tip {
  margin: 0;
  font-size: @font-size-xs;
  line-height: 1.5;
  color: @color-text-placeholder;
}

.record-reason {
  color: @color-danger;
}

.record-muted {
  color: @color-text-placeholder;
}
</style>
