<template>
  <div class="log-table">
    <app-tabs
      :model-value="category"
      :items="categoryTabs"
      class="log-table-tabs"
      @update:model-value="handleCategory"
    />

    <ProSearch :fields="fields" :model-value="filter" @update:model-value="syncFilter" @search="emitSearch" @reset="emitSearch" />

    <p v-if="category === 'mail'" class="log-table-tip">{{ t("logCenter.filter.mailModuleFixed") }}</p>

    <ProTable
      :columns="columns"
      :data="list"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :column-visibility="columnVisibility"
      :density="density"
      row-key="id"
      show-toolbar
      @page-change="(value: number) => emit('page-change', value)"
      @size-change="(value: number) => emit('size-change', value)"
      @update:column-visibility="setColumnVisibility"
      @update:density="setDensity"
    >
      <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt, "YYYY-MM-DD HH:mm:ss") }}</template>

      <template #cell-username="{ row }">{{ row.username || "-" }}</template>

      <template #cell-module="{ row }">{{ logModuleLabel(t, row.module, te) }}</template>

      <template #cell-actionName="{ row }">{{ logActionLabel(t, row.action, te) }}</template>

      <template #cell-result="{ row }">
        <app-tag size="small" :type="resultTagType(row.result)" effect="plain">
          {{ t(resultLabelKey(row.result)) }}
        </app-tag>
      </template>

      <template #cell-reason="{ row }">
        <span :class="row.reason ? 'log-table-reason' : 'log-table-muted'">{{ row.reason || "-" }}</span>
      </template>

      <template #cell-requestId="{ row }">
        <span class="log-table-muted">{{ row.requestId || "-" }}</span>
      </template>

      <template #cell-target="{ row }">{{ row.target || "-" }}</template>

      <template #cell-description="{ row }">{{ row.description || "-" }}</template>

      <template #cell-toEmail="{ row }">{{ row.toEmail || "-" }}</template>

      <template #cell-subject="{ row }">{{ row.subject || "-" }}</template>

      <template #cell-template="{ row }">{{ row.template || "-" }}</template>

      <template #cell-detail="{ row }">
        <app-button variant="ghost" tone="primary" size="sm" @click="openDetail(row)">
          {{ t("logCenter.detail.title") }}
        </app-button>
      </template>
    </ProTable>

    <LogDetailDialog v-model="detailVisible" :log="current" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "LogTable" });

import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import ProSearch from "@/components/common/search/pro-search/index.vue";
import type { ProFormField } from "@/components/common/form/pro-form/types";
import ProTable from "@/components/common/table/pro-table/index.vue";
import type { ProTableColumn } from "@/components/common/table/pro-table/types";
import LogDetailDialog from "@/components/log-center/log-detail-dialog/index.vue";
import { formatDate, logActionLabel, logModuleLabel } from "@/utils";
import {
  LOG_ACTIONS,
  LOG_CATEGORIES,
  LOG_MODULES,
  LOG_RESULT_META,
  LOG_RESULTS
} from "@/constants";
import type { LogCategory, LogDto, LogListParams, LogResult } from "@/types";
import { useTablePreferences } from "@/composables";

type TagType = "primary" | "success" | "info" | "warning" | "danger";
type LogQuery = Omit<LogListParams, "page" | "pageSize" | "category">;

/** 表单层：dateRange 为 el-date-picker 的两元素数组 */
interface LogFilterForm extends LogQuery {
  dateRange?: [Date, Date] | null;
}

const props = defineProps<{
  list: LogDto[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  category: LogCategory;
  query: LogQuery;
}>();

const emit = defineEmits<{
  "update:category": [value: LogCategory];
  search: [value: LogQuery];
  "page-change": [page: number];
  "size-change": [size: number];
}>();

const { t, te } = useI18n();
const detailVisible = ref<boolean>(false);
const current = ref<LogDto | null>(null);

const categoryTabs = computed<{ value: LogCategory; label: string }[]>(() =>
  LOG_CATEGORIES.map((value) => ({ value, label: t(`logCenter.category.${value}`) }))
);


const filter = reactive<LogFilterForm>({ ...props.query });

/** 查询区回写：合并到本地筛选对象 */
const syncFilter = (value: Record<string, unknown>): void => {
  Object.assign(filter, value);
};

/** 页签切换：父组件重置筛选后重新查询 */
const handleCategory = (value: string | number): void => {
  const next = value as LogCategory;
  if (next === props.category) return;
  filter.module = undefined;
  filter.action = undefined;
  filter.username = undefined;
  filter.keyword = undefined;
  filter.result = undefined;
  filter.dateRange = null;
  emit("update:category", next);
};

const moduleOptions = computed(() =>
  LOG_MODULES.map((value) => ({ value, label: t(`logCenter.module.${value}`) }))
);

const actionOptions = computed(() => LOG_ACTIONS.map((value) => ({ value, label: t(`logCenter.action.${value}`) })));

const resultOptions = computed(() =>
  LOG_RESULTS.map((value) => ({ value, label: t(`logCenter.result.${value}`) }))
);

/** 邮件日志的模块/动作/用户名固定，筛选字段随之收窄 */
const fields = computed<ProFormField[]>(() => {
  const dateField: ProFormField = {
    prop: "dateRange",
    type: "daterange",
    startPlaceholder: t("logCenter.filter.dateStart"),
    endPlaceholder: t("logCenter.filter.dateEnd"),
    width: 260
  };
  const resultField: ProFormField = {
    prop: "result",
    type: "select",
    placeholder: t("logCenter.filter.allResult"),
    options: resultOptions.value,
    width: 140
  };
  const keywordField: ProFormField = {
    prop: "keyword",
    type: "input",
    placeholder: t("logCenter.filter.keyword"),
    width: 260
  };
  if (props.category === "mail") return [resultField, keywordField, dateField];
  if (props.category === "login") {
    return [
      resultField,
      {
        prop: "username",
        type: "input",
        placeholder: t("logCenter.filter.username"),
        width: 160
      },
      keywordField,
      dateField
    ];
  }
  return [
    { prop: "module", type: "select", placeholder: t("logCenter.filter.allModule"), options: moduleOptions.value, width: 140 },
    { prop: "action", type: "select", placeholder: t("logCenter.filter.allAction"), options: actionOptions.value, width: 140 },
    resultField,
    { prop: "username", type: "input", placeholder: t("logCenter.filter.username"), width: 160 },
    keywordField,
    dateField
  ];
});

/** 提交查询：日期区间按本地整日折算成 ISO，避免后端按 UTC 日界切分 */
const emitSearch = (): void => {
  const range = filter.dateRange;
  const from = range?.[0] ? dayjs(range[0]).startOf("day").toISOString() : undefined;
  const to = range?.[1] ? dayjs(range[1]).endOf("day").toISOString() : undefined;
  emit("search", {
    module: filter.module || undefined,
    action: filter.action || undefined,
    result: filter.result || undefined,
    username: filter.username || undefined,
    keyword: filter.keyword || undefined,
    from,
    to
  });
};

/** 外部条件变化（如页签由父组件联动）时同步回表单 */
watch(
  () => props.query,
  (value) => {
    filter.module = value.module;
    filter.action = value.action;
    filter.username = value.username;
    filter.keyword = value.keyword;
    filter.result = value.result;
    filter.dateRange =
      value.from && value.to ? [dayjs(value.from).toDate(), dayjs(value.to).toDate()] : null;
  },
  { deep: true }
);

const resultLabelKey = (value: LogResult): string => LOG_RESULT_META[value]?.labelKey ?? "logCenter.result.success";

const resultTagType = (value: LogResult): TagType =>
  (LOG_RESULT_META[value]?.tagType ?? "info") as TagType;

const openDetail = (row: LogDto): void => {
  current.value = row;
  detailVisible.value = true;
};

const columns = computed<ProTableColumn[]>(() => {
  const detailColumn: ProTableColumn = { prop: "detail", label: "", width: 80, fixed: "right" };
  if (props.category === "login") {
    return [
      { prop: "createdAt", label: t("logCenter.columns.createdAt"), width: 170, fixed: "left" },
      { prop: "username", label: t("logCenter.columns.username"), width: 120 },
      { prop: "result", label: t("logCenter.columns.result"), width: 90 },
      { prop: "reason", label: t("logCenter.columns.reason"), width: 160 },
      { prop: "requestId", label: t("logCenter.columns.requestId"), width: 170 },
      { prop: "ip", label: t("logCenter.columns.ip"), width: 140 },
      { prop: "userAgent", label: t("logCenter.columns.userAgent"), minWidth: 240, align: "left" },
      detailColumn
    ];
  }
  if (props.category === "mail") {
    return [
      { prop: "createdAt", label: t("logCenter.columns.createdAt"), width: 170, fixed: "left" },
      { prop: "toEmail", label: t("logCenter.columns.toEmail"), width: 190 },
      { prop: "subject", label: t("logCenter.columns.subject"), minWidth: 240, align: "left" },
      { prop: "template", label: t("logCenter.columns.template"), width: 150 },
      { prop: "result", label: t("logCenter.columns.result"), width: 90 },
      { prop: "reason", label: t("logCenter.columns.reason"), width: 160 },
      { prop: "requestId", label: t("logCenter.columns.requestId"), width: 170 },
      detailColumn
    ];
  }
  return [
    { prop: "createdAt", label: t("logCenter.columns.createdAt"), width: 170, fixed: "left" },
    { prop: "username", label: t("logCenter.columns.username"), width: 120 },
    { prop: "module", label: t("logCenter.columns.module"), width: 110 },
    { prop: "actionName", label: t("logCenter.columns.action"), width: 110 },
    { prop: "result", label: t("logCenter.columns.result"), width: 90 },
    { prop: "target", label: t("logCenter.columns.target"), width: 140 },
    { prop: "description", label: t("logCenter.columns.description"), minWidth: 220, align: "left" },
    { prop: "reason", label: t("logCenter.columns.reason"), width: 150 },
    { prop: "requestId", label: t("logCenter.columns.requestId"), width: 170 },
    detailColumn
  ];
});

// 列显隐与行密度由表格偏好记忆；登录与邮件共用一份，按列名合并，切分类时互不覆盖
const { columnVisibility, density, setColumnVisibility, setDensity } = useTablePreferences(
  "log-center/log-table",
  () => columns.value
);
</script>

<style scoped lang="less">
.log-table {
  display: flex;
  flex-direction: column;
  gap: @space-2;
}

.log-table-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: @space-2;
  }
}

.log-table-tip {
  margin: 0;
  font-size: 12px;
  color: @color-text-secondary;
}

.log-table-reason {
  color: @color-danger;
}

.log-table-muted {
  color: @color-text-placeholder;
}
</style>
