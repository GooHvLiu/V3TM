<template>
  <app-drawer
    :model-value="modelValue"
    :title="t('notification.detail.title')"
    size="680px"
    class="batch-detail"
    @update:model-value="handleVisible"
  >
    <div v-if="batch" class="batch-detail-head">
      <div class="batch-detail-title-row">
        <app-tag size="small" :type="categoryTagType" effect="plain">{{ categoryLabel }}</app-tag>
        <h4 class="batch-detail-title">{{ batch.title }}</h4>
      </div>

      <div class="batch-detail-meta">
        <span>{{ t("notification.detail.batchId") }}：{{ batch.batchId }}</span>
        <span>{{ t("notification.detail.createdAt") }}：{{ formatDate(batch.createdAt, "YYYY-MM-DD HH:mm") }}</span>
        <span>{{ t("notification.detail.source") }}：{{ batch.source || "-" }}</span>
      </div>

      <div class="batch-detail-stats">
        <div class="batch-detail-stat">
          <span class="batch-detail-stat-label">{{ t("notification.detail.statRecipient") }}</span>
          <span class="batch-detail-stat-value">{{ batch.recipientCount }}</span>
        </div>
        <div class="batch-detail-stat">
          <span class="batch-detail-stat-label">{{ t("notification.detail.statRead") }}</span>
          <span class="batch-detail-stat-value is-success">{{ batch.readCount }}</span>
        </div>
        <div class="batch-detail-stat">
          <span class="batch-detail-stat-label">{{ t("notification.detail.statUnread") }}</span>
          <span class="batch-detail-stat-value is-warning">{{ unreadCount }}</span>
        </div>
        <div class="batch-detail-stat">
          <span class="batch-detail-stat-label">{{ t("notification.detail.statEmail") }}</span>
          <span class="batch-detail-stat-value">
            {{ batch.emailSent }}/{{ batch.emailSent + batch.emailFailed + batch.emailPending + batch.emailSkipped }}
          </span>
        </div>
      </div>

      <el-progress :percentage="readPercent" :stroke-width="6" class="batch-detail-progress" />
      <p class="batch-detail-tip">{{ t("notification.detail.recipientTip") }}</p>

      <div class="batch-detail-actions">
        <app-button
          v-if="batch.emailFailed > 0"
          v-permission="'adminCenter:notice:manage'"
          tone="warning"
          variant="outline"
          size="sm"
          :loading="retrying"
          @click="handleRetry"
        >
          {{ t("notification.record.retry") }}
        </app-button>
        <span class="batch-detail-email-summary">{{ emailSummary }}</span>
      </div>
    </div>

    <ProTable
      :columns="columns"
      :data="list"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      row-key="id"
      @page-change="changePage"
      @size-change="changePageSize"
    >
      <template #cell-userId="{ row }">#{{ row.userId }}</template>

      <template #cell-isRead="{ row }">
        <app-tag size="small" :type="row.isRead === 1 ? 'success' : 'info'" effect="plain">
          {{ row.isRead === 1 ? t("notification.mine.read") : t("notification.mine.unread") }}
        </app-tag>
      </template>

      <template #cell-emailStatus="{ row }">
        <app-tag size="small" :type="emailTagType(row.emailStatus)" effect="plain">
          {{ t(emailLabelKey(row.emailStatus)) }}
        </app-tag>
      </template>

      <template #cell-emailError="{ row }">
        <el-popover v-if="row.emailError" placement="top" width="360" trigger="click">
          <template #reference>
            <app-button variant="ghost" tone="danger" size="sm">{{ t("notification.detail.columns.emailError") }}</app-button>
          </template>
          <p class="batch-detail-error">{{ row.emailError }}</p>
        </el-popover>
        <span v-else class="batch-detail-muted">-</span>
      </template>

      <template #cell-readAt="{ row }">
        {{ row.readAt ? formatDate(row.readAt, "YYYY-MM-DD HH:mm") : "-" }}
      </template>
    </ProTable>

    <app-empty v-if="!loading && !total" :description="t('notification.detail.empty')" :image-size="72" />
  </app-drawer>
</template>

<script setup lang="ts">
defineOptions({ name: "BatchDetailDrawer" });

import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/common/table/pro-table/index.vue";
import type { ProTableColumn } from "@/components/common/table/pro-table/types";
import { useTable } from "@/composables";
import { getNotificationBatchDetail } from "@/api";
import { formatDate } from "@/utils";
import { NOTIFICATION_CATEGORY_META, NOTIFICATION_EMAIL_META } from "@/constants";
import type { NotificationBatchItem, NotificationDto, NotificationEmailStatus } from "@/types";

type TagType = "primary" | "success" | "info" | "warning" | "danger";

const props = defineProps<{
  /** 抽屉开关，v-model */
  modelValue: boolean;
  /** 当前批次编号；空串表示未选择 */
  batchId: string;
  /** 重试中：按钮转 loading */
  retrying: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  retry: [item: NotificationBatchItem];
}>();

const { t } = useI18n();
const batch = ref<NotificationBatchItem | null>(null);

const { list, total, loading, page, pageSize, fetchData, changePage, changePageSize, search } =
  useTable<{ page: number; pageSize: number }, NotificationDto>({
    fetcher: async (params) => {
      if (!props.batchId) return { list: [], total: 0 };
      const result = await getNotificationBatchDetail(props.batchId, params);
      batch.value = result.batch;
      return { list: result.list, total: result.total };
    },
    initialPageSize: 20
  });

const columns = computed<ProTableColumn[]>(() => [
  { prop: "userId", label: t("notification.detail.columns.userId"), width: 110, fixed: "left" },
  { prop: "isRead", label: t("notification.detail.columns.isRead"), width: 110 },
  { prop: "emailStatus", label: t("notification.detail.columns.emailStatus"), width: 120 },
  { prop: "emailError", label: t("notification.detail.columns.emailError"), minWidth: 120 },
  { prop: "readAt", label: t("notification.detail.columns.readAt"), width: 160 }
]);

const categoryLabel = computed<string>(() =>
  t(NOTIFICATION_CATEGORY_META[batch.value?.category ?? "system"]?.labelKey ?? "notification.category.system")
);

const categoryTagType = computed<TagType>(() =>
  (NOTIFICATION_CATEGORY_META[batch.value?.category ?? "system"]?.tagType ?? "info") as TagType
);

const unreadCount = computed<number>(() => {
  if (!batch.value) return 0;
  return Math.max(batch.value.recipientCount - batch.value.readCount, 0);
});

const readPercent = computed<number>(() => {
  if (!batch.value?.recipientCount) return 0;
  return Math.min(Math.round((batch.value.readCount / batch.value.recipientCount) * 100), 100);
});

const emailSummary = computed<string>(() => {
  const item = batch.value;
  if (!item) return "";
  return t("notification.record.emailSummary", {
    pending: item.emailPending,
    sent: item.emailSent,
    failed: item.emailFailed,
    skipped: item.emailSkipped
  });
});

const emailLabelKey = (status: NotificationEmailStatus): string =>
  NOTIFICATION_EMAIL_META[status]?.labelKey ?? "notification.email.none";

const emailTagType = (status: NotificationEmailStatus): TagType =>
  (NOTIFICATION_EMAIL_META[status]?.tagType ?? "info") as TagType;

/** 抽屉关闭：只上抛开关，父组件保留 batchId 便于下次打开 */
const handleVisible = (value: boolean): void => emit("update:modelValue", value);

/** 重试入口：把当前批次头抛给父组件，接口调用与提示留在页面 */
const handleRetry = (): void => {
  if (batch.value) emit("retry", batch.value);
};

/** 打开抽屉或换批次：回到第 1 页重新拉 */
watch(
  () => [props.modelValue, props.batchId] as const,
  ([visible, batchId]) => {
    if (!visible || !batchId) return;
    batch.value = null;
    search();
  }
);

/** 供父组件在重试成功后刷新聚合计数 */
defineExpose({ refresh: fetchData });
</script>

<style scoped lang="less">
.batch-detail-head {
  display: flex;
  flex-direction: column;
  gap: @space-2-5;
  margin-bottom: @space-4;
}

.batch-detail-title-row {
  display: flex;
  align-items: center;
  gap: @space-2;
}

.batch-detail-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: @color-text-primary;
}

.batch-detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: @space-2 @space-4;
  font-size: 12px;
  color: @color-text-secondary;
}

.batch-detail-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: @space-2-5;
}

.batch-detail-stat {
  display: flex;
  flex-direction: column;
  gap: @space-1;
  padding: @space-2-5 @space-3;
  border: 1px solid @color-border-light;
  border-radius: @radius-lg;
  background: @color-bg-hover;
}

.batch-detail-stat-label {
  font-size: 12px;
  color: @color-text-secondary;
}

.batch-detail-stat-value {
  font-size: 18px;
  font-weight: 600;
  color: @color-text-primary;

  &.is-success {
    color: @color-success;
  }

  &.is-warning {
    color: @color-warning;
  }
}

.batch-detail-progress {
  margin-top: @space-1;
}

.batch-detail-tip {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: @color-text-placeholder;
}

.batch-detail-actions {
  display: flex;
  align-items: center;
  gap: @space-3;
}

.batch-detail-email-summary {
  font-size: 12px;
  color: @color-text-secondary;
}

.batch-detail-error {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: @color-danger;
  word-break: break-all;
}

.batch-detail-muted {
  color: @color-text-placeholder;
}
</style>
