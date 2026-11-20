<template>
  <div class="batch-table">
    <ProSearch
      :fields="fields"
      :model-value="filter"
      @update:model-value="syncFilter"
      @search="emitSearch"
      @reset="emitSearch"
    />

    <ProTable
      :columns="columns"
      :data="list"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      row-key="batchId"
      @page-change="(value: number) => emit('page-change', value)"
      @size-change="(value: number) => emit('size-change', value)"
    >
      <template #cell-title="{ row }">
        <div class="batch-table-title">
          <app-tag size="small" :type="categoryTagType(row.category)" effect="plain">
            {{ t(categoryLabelKey(row.category)) }}
          </app-tag>
          <span class="batch-table-title-text">{{ row.title }}</span>
        </div>
      </template>

      <template #cell-recipientCount="{ row }">
        <span class="batch-table-strong">{{ row.recipientCount }}</span>
      </template>

      <template #cell-readCount="{ row }">
        <span :class="row.readCount === row.recipientCount ? 'batch-table-read-all' : ''">
          {{ row.readCount }}/{{ row.recipientCount }}
        </span>
      </template>

      <template #cell-email="{ row }">
        <span v-if="row.emailPending + row.emailSent + row.emailFailed + row.emailSkipped === 0" class="batch-table-muted">
          {{ t("notification.email.none") }}
        </span>
        <app-tooltip v-else :content="emailSummary(row)">
          <span class="batch-table-email" :class="{ 'has-failed': row.emailFailed > 0 }">
            {{ t("notification.email.sent") }} {{ row.emailSent }} · {{ t("notification.email.failed") }}
            {{ row.emailFailed }}
          </span>
        </app-tooltip>
      </template>

      <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt, "YYYY-MM-DD HH:mm") }}</template>

      <template #cell-action="{ row }">
        <div class="batch-table-actions">
          <app-button variant="ghost" tone="primary" size="sm" @click="emit('detail', row)">
            {{ t("notification.record.detail") }}
          </app-button>
          <app-button
            v-if="row.emailFailed > 0"
            v-permission="'adminCenter:notice:manage'"
            variant="ghost"
            tone="warning"
            size="sm"
            @click="emit('retry', row)"
          >
            {{ t("notification.record.retry") }}
          </app-button>
        </div>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "BatchTable" });

import { computed, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import ProSearch from "@/components/common/search/pro-search/index.vue";
import ProTable from "@/components/common/table/pro-table/index.vue";
import type { ProFormField, ProFormModel } from "@/components/common/form/pro-form/types";
import type { ProTableColumn } from "@/components/common/table/pro-table/types";
import { formatDate } from "@/utils";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_META,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_META
} from "@/constants";
import type {
  NotificationBatchItem,
  NotificationBatchQueryParams,
  NotificationCategory,
  NotificationType
} from "@/types";

type TagType = "primary" | "success" | "info" | "warning" | "danger";
type BatchQuery = Omit<NotificationBatchQueryParams, "page" | "pageSize">;

const props = defineProps<{
  list: NotificationBatchItem[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  query: BatchQuery;
}>();

const emit = defineEmits<{
  search: [value: BatchQuery];
  "page-change": [page: number];
  "size-change": [size: number];
  detail: [item: NotificationBatchItem];
  retry: [item: NotificationBatchItem];
}>();

const { t } = useI18n();

const categoryOptions = computed(() =>
  NOTIFICATION_CATEGORIES.map((value) => ({
    value,
    label: t(NOTIFICATION_CATEGORY_META[value].labelKey)
  }))
);

const typeOptions = computed(() =>
  NOTIFICATION_TYPES.map((value) => ({
    value,
    label: t(NOTIFICATION_TYPE_META[value].labelKey)
  }))
);

/** 筛选值：分类与类型留空即不限，来源与标题都是文本条件 */
interface BatchFilter {
  category: NotificationCategory | "" | undefined;
  type: NotificationType | "" | undefined;
  source: string;
  keyword: string;
}

const filter = reactive<BatchFilter>({
  category: "",
  type: "",
  source: "",
  keyword: ""
});

/** 查询区回写：合并到本地筛选对象 */
const syncFilter = (value: ProFormModel): void => {
  Object.assign(filter, value);
};

/** 查询区字段：两个下拉两项文本，宽度按内容给 */
const fields = computed<ProFormField[]>(() => [
  {
    prop: "category",
    type: "select",
    ariaLabel: t("notification.record.filter.category"),
    placeholder: t("notification.record.allCategory"),
    options: [{ value: "", label: t("notification.record.allCategory") }, ...categoryOptions.value],
    width: 140
  },
  {
    prop: "type",
    type: "select",
    ariaLabel: t("notification.record.filter.type"),
    placeholder: t("notification.record.allType"),
    options: [{ value: "", label: t("notification.record.allType") }, ...typeOptions.value],
    width: 140
  },
  {
    prop: "source",
    type: "input",
    ariaLabel: t("notification.record.filter.source"),
    placeholder: t("notification.record.columns.source"),
    width: 140
  },
  {
    prop: "keyword",
    type: "input",
    ariaLabel: t("notification.record.filter.keyword"),
    placeholder: t("notification.record.keyword"),
    width: 220
  }
]);

const emitSearch = (): void =>
  emit("search", {
    category: filter.category || undefined,
    type: filter.type || undefined,
    source: filter.source || undefined,
    keyword: filter.keyword || undefined
  });

/** 外部条件重置时回灌，父组件与表格只保留一份查询状态 */
watch(
  () => props.query,
  (value) => {
    filter.category = value.category ?? "";
    filter.type = value.type ?? "";
    filter.source = value.source ?? "";
    filter.keyword = value.keyword ?? "";
  },
  { deep: true }
);

/** 列定义随语言切换重算，表头不至于停在旧语种 */
const columns = computed<ProTableColumn[]>(() => [
  { prop: "title", label: t("notification.record.columns.title"), minWidth: 200, align: "left", fixed: "left" },
  { prop: "recipientCount", label: t("notification.record.columns.recipientCount"), width: 76 },
  { prop: "readCount", label: t("notification.record.columns.readCount"), width: 88 },
  { prop: "email", label: t("notification.record.columns.email"), minWidth: 156 },
  { prop: "source", label: t("notification.record.columns.source"), width: 88 },
  { prop: "createdAt", label: t("notification.record.columns.createdAt"), width: 150 },
  { prop: "action", label: t("notification.record.columns.action"), width: 170, fixed: "right" }
]);

const categoryLabelKey = (category: NotificationCategory): string =>
  NOTIFICATION_CATEGORY_META[category]?.labelKey ?? "notification.category.system";

const categoryTagType = (category: NotificationCategory): TagType =>
  (NOTIFICATION_CATEGORY_META[category]?.tagType ?? "info") as TagType;

const emailSummary = (row: NotificationBatchItem): string =>
  t("notification.record.emailSummary", {
    pending: row.emailPending,
    sent: row.emailSent,
    failed: row.emailFailed,
    skipped: row.emailSkipped
  });
</script>

<style scoped lang="less">
.batch-table {
  display: flex;
  flex-direction: column;
  gap: @space-3;
}

.batch-table-title {
  display: flex;
  align-items: center;
  gap: @space-2;
  min-width: 0;
}

.batch-table-title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.batch-table-strong {
  font-weight: 600;
  color: @color-text-primary;
}

.batch-table-read-all {
  color: @color-success;
}

.batch-table-muted {
  color: @color-text-placeholder;
}

.batch-table-email {
  font-size: 12px;
  color: @color-text-secondary;

  &.has-failed {
    color: @color-danger;
  }
}

.batch-table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: @space-1;

  :deep(.el-button) {
    padding: 0 @space-1;
  }
}
</style>
