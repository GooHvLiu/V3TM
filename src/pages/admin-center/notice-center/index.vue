<template>
  <BasicPage :title="t(String(route.meta.title))" :description="t('notification.description')">
    <template #actions>
      <app-button :loading="refreshing" variant="outline" @click="handleRefresh">{{ t("notification.refresh") }}</app-button>
    </template>

    <template #content>
      <div class="notice-center-page">
        <app-tabs v-model="activeTab" :items="tabItems" class="notice-center-tabs">
          <template #content="{ item }">
            <template v-if="item.value === 'mine'">
              <app-alert
                v-if="mineError"
                class="notice-center-alert"
                :title="t('notification.mine.loadFailed')"
                tone="warning"
              />

              <NoticeList
                v-model:query="mineQuery"
                :list="mineList"
                :loading="mineLoading"
                :loading-more="mineLoadingMore"
                :has-more="hasMore"
                :unread="unread"
                @read="handleRead"
                @open="handleOpen"
                @load-more="loadMoreMine"
                @mark-all="handleMarkAll"
              />
            </template>

            <NoticeForm
              v-else-if="item.value === 'send'"
              v-model="draft"
              :submitting="submitting"
              :mail-notify-enabled="mailNotifyEnabled"
              @submit="handleSend"
              @reset="resetDraft"
            />

            <template v-else>
              <app-alert
                v-if="recordError"
                class="notice-center-alert"
                :title="t('notification.record.loadFailed')"
                tone="warning"
              />

              <BatchTable
                :list="recordList"
                :total="recordTotal"
                :loading="recordLoading"
                :page="recordPage"
                :page-size="recordPageSize"
                :query="recordQuery"
                @search="handleRecordSearch"
                @page-change="recordChangePage"
                @size-change="recordChangePageSize"
                @detail="handleDetail"
                @retry="handleRetry"
              />
            </template>
          </template>
        </app-tabs>

        <BatchDetailDrawer
          v-if="canManage"
          ref="detailRef"
          v-model="detailVisible"
          :batch-id="detailBatchId"
          :retrying="retrying"
          @retry="handleRetry"
        />
      </div>
    </template>
  </BasicPage>
</template>

<script setup lang="ts">
defineOptions({ name: "NoticeCenter" });

import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import BasicPage from "@/components/page/basic/index.vue";
import NoticeList from "@/components/notice-center/notice-list/index.vue";
import NoticeForm from "@/components/notice-center/notice-form/index.vue";
import BatchTable from "@/components/notice-center/batch-table/index.vue";
import BatchDetailDrawer from "@/components/notice-center/batch-detail-drawer/index.vue";
import {
  getNotificationBatches,
  retryNotificationEmails,
  sendNotification
} from "@/api";
import { useNoticeMine, useTable } from "@/composables";
import { NOTIFICATION_UNREAD_CAP } from "@/constants";
import { hasPermission } from "@/utils";
import { useNotificationStore, useConfigStore, useUserStore } from "@/stores";
import type {
  NotificationBatchItem,
  NotificationBatchQueryParams,
  NotificationDto,
  SendNotificationParams
} from "@/types";

type BatchQuery = Omit<NotificationBatchQueryParams, "page" | "pageSize">;
type BatchPageQuery = { page: number; pageSize: number } & NotificationBatchQueryParams;

/** 我的通知：每页 10 条，加载更多按页追加 */
const MINE_PAGE_SIZE = 10;

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const userStore = useUserStore();
const notificationStore = useNotificationStore();
const configStore = useConfigStore();

const activeTab = ref<string>("mine");
const refreshing = ref<boolean>(false);

const canSend = computed<boolean>(() => hasPermission(userStore.permissions, "adminCenter:notice:send"));
const canManage = computed<boolean>(() => hasPermission(userStore.permissions, "adminCenter:notice:manage"));

// ============ 我的通知 ============
const {
  query: mineQuery,
  list: mineList,
  loading: mineLoading,
  loadingMore: mineLoadingMore,
  failed: mineError,
  unread,
  hasMore,
  load: loadMine,
  loadMore: loadMoreMine,
  markRead: handleRead,
  markAll: handleMarkAll
} = useNoticeMine(MINE_PAGE_SIZE);

/** 未读角标：超过上限显示 99+，与红点口径一致 */
const unreadBadge = computed<number | string | undefined>(() => {
  if (unread.value <= 0) return undefined;
  return unread.value > NOTIFICATION_UNREAD_CAP ? `${NOTIFICATION_UNREAD_CAP}+` : unread.value;
});

/** 无权限的页签不渲染，避免只读账号看到发不出去的表单 */
const tabItems = computed<{ value: string; label: string; badge?: number | string; tone?: "danger" }[]>(() => {
  const items: { value: string; label: string; badge?: number | string; tone?: "danger" }[] = [
    { value: "mine", label: t("notification.tab.mine"), badge: unreadBadge.value, tone: "danger" }
  ];
  if (canSend.value) items.push({ value: "send", label: t("notification.tab.send") });
  if (canManage.value) items.push({ value: "record", label: t("notification.tab.record") });
  return items;
});

/** 站外链接新开页，站内路径直接跳转 */
const handleOpen = (item: NotificationDto): void => {
  const link = item.link;
  if (!link) return;
  if (/^https?:\/\//.test(link)) {
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }
  void router.push(link);
};

// ============ 发送通知 ============
const submitting = ref<boolean>(false);

/** 邮件总开关：unknown 表示未取到（不提示，避免误判） */
const mailSwitch = ref<"unknown" | "on" | "off">("unknown");
const mailNotifyEnabled = computed<boolean>(() => mailSwitch.value !== "off");

const emptyDraft = (): SendNotificationParams => ({
  title: "",
  content: "",
  category: "system",
  type: "info",
  audience: { type: "all", roleCodes: [], userIds: [] },
  link: "",
  sendEmail: false
});

const draft = ref<SendNotificationParams>(emptyDraft());

const resetDraft = (): void => {
  draft.value = emptyDraft();
};

/** 提交前裁剪：全部用户不带角色/用户列表，空链接不传 */
const buildPayload = (): SendNotificationParams => {
  const audience = draft.value.audience;
  return {
    title: draft.value.title.trim(),
    content: draft.value.content.trim(),
    category: draft.value.category ?? "system",
    type: draft.value.type ?? "info",
    audience:
      audience.type === "all"
        ? { type: "all" }
        : { type: audience.type, roleCodes: audience.roleCodes ?? [], userIds: audience.userIds ?? [] },
    link: draft.value.link?.trim() || undefined,
    sendEmail: draft.value.sendEmail ?? false
  };
};

const handleSend = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm(t("notification.send.confirm"), t("notification.form.submit"), { type: "warning" });
  } catch {
    return;
  }
  submitting.value = true;
  try {
    const result = await sendNotification(buildPayload());
    ElMessage.success(
      result.emailQueued > 0
        ? t("notification.send.done", {
            n: result.recipientCount,
            queued: result.emailQueued,
            skipped: result.emailSkipped
          })
        : t("notification.send.doneNoEmail", { n: result.recipientCount })
    );
    resetDraft();
    if (canManage.value) {
      activeTab.value = "record";
      recordLoaded.value = true;
      recordSearch();
    }
  } catch {
    // 拦截器已按错误码提示：91002 / 91003 走 backend 语言包
  } finally {
    submitting.value = false;
  }
};

// ============ 发送记录 ============
const recordQuery = ref<BatchQuery>({});
const recordError = ref<boolean>(false);
const recordLoaded = ref<boolean>(false);

const {
  list: recordList,
  total: recordTotal,
  loading: recordLoading,
  page: recordPage,
  pageSize: recordPageSize,
  refresh: recordRefresh,
  search: recordSearch,
  changePage: recordChangePage,
  changePageSize: recordChangePageSize
} = useTable<BatchPageQuery, NotificationBatchItem>({
  fetcher: async (params) => {
    try {
      const result = await getNotificationBatches(params);
      recordError.value = false;
      return { list: result.list, total: result.total };
    } catch {
      recordError.value = true;
      return { list: [], total: 0 };
    }
  },
  query: () => recordQuery.value,
  initialPageSize: 10
});

const handleRecordSearch = (value: BatchQuery): void => {
  recordQuery.value = value;
  // query 变化由 useTable 内部监听触发，这里只负责同步条件
};

/** 首次进入记录页签才取数，避免只浏览通知的用户多一次请求 */
watch(activeTab, (value) => {
  if (value === "record" && !recordLoaded.value) {
    recordLoaded.value = true;
    recordSearch();
  }
});

const detailVisible = ref<boolean>(false);
const detailBatchId = ref<string>("");
const retrying = ref<boolean>(false);
const detailRef = ref<{ refresh: () => Promise<void> }>();

const handleDetail = (item: NotificationBatchItem): void => {
  detailBatchId.value = item.batchId;
  detailVisible.value = true;
};

const handleRetry = async (item: NotificationBatchItem): Promise<void> => {
  if (!item?.batchId) return;
  retrying.value = true;
  try {
    const result = await retryNotificationEmails(item.batchId);
    ElMessage.success(
      t("notification.record.retryDone", { retried: result.retried, sent: result.sent, failed: result.failed })
    );
    recordRefresh();
    if (detailVisible.value) await detailRef.value?.refresh();
  } catch {
    // 91001 由 backend 文案兜底：该批次没有可重试的失败邮件
  } finally {
    retrying.value = false;
  }
};

// ============ 页头操作 ============
const handleRefresh = async (): Promise<void> => {
  refreshing.value = true;
  try {
    if (activeTab.value === "mine") await loadMine();
    if (activeTab.value === "record" && recordLoaded.value) recordRefresh();
    await notificationStore.fetchUnread();
  } finally {
    refreshing.value = false;
  }
};

/** 权限被回收后仍停在无权限页签时，拉回"我的通知" */
watch(
  () => [canSend.value, canManage.value] as const,
  ([send, manage]) => {
    if (activeTab.value === "send" && !send) activeTab.value = "mine";
    if (activeTab.value === "record" && !manage) activeTab.value = "mine";
  }
);

onMounted(async () => {
  void loadMine();
  void notificationStore.fetchUnread();
  // 顶栏所有实例共用同一个定时器，页面再启动一次不会重复拉取
  notificationStore.startPolling();
  // 超级设置只有超管能读，普通管理员直接跳过，避免进页面就弹权限不足
  if (hasPermission(userStore.permissions, "superAdmin:settings:list")) {
    try {
      await configStore.fetchSuperConfig();
      const raw = configStore.getSuperValue("mail_notify_enabled");
      if (raw === "true" || raw === "1") mailSwitch.value = "on";
      else if (raw === "false" || raw === "0") mailSwitch.value = "off";
    } catch {
      mailSwitch.value = "unknown";
    }
  }
});
</script>

<style scoped lang="less">
.notice-center-page {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.notice-center-tabs {
  :deep(.el-tabs__content) {
    padding-top: @space-1;
  }
}

.notice-center-alert {
  margin-bottom: @space-3;
}
</style>
