/**
 * 我的通知 · 列表状态
 * 分页追加、点开即标记已读、全部已读；未读数读写统一走 notification store
 * 顶栏与页面共用同一份未读计数，本组合式不自行起轮询
 */
import { computed, ref, watch, type Ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import { getNotificationList, markAllNotificationsRead, markNotificationRead } from "@/api";
import { useNotificationStore } from "@/stores";
import type { NotificationDto, NotificationListParams } from "@/types";

export type NoticeMineQuery = Omit<NotificationListParams, "page" | "pageSize">;

export function useNoticeMine(initialPageSize = 10) {
  const { t } = useI18n();
  const notificationStore = useNotificationStore();

  const query = ref<NoticeMineQuery>({});
  const list = ref<NotificationDto[]>([]) as Ref<NotificationDto[]>;
  const total = ref<number>(0);
  const page = ref<number>(1);
  const loading = ref<boolean>(false);
  const loadingMore = ref<boolean>(false);
  const failed = ref<boolean>(false);

  const unread = computed<number>(() => notificationStore.unread);
  const hasMore = computed<boolean>(() => list.value.length < total.value);

  /** 拉取一页：reset 覆盖列表，否则追加 */
  const fetchPage = async (reset: boolean): Promise<void> => {
    if (!reset && loadingMore.value) return;
    if (reset) {
      page.value = 1;
      loading.value = true;
    } else {
      page.value += 1;
      loadingMore.value = true;
    }
    try {
      const result = await getNotificationList({
        ...query.value,
        page: page.value,
        pageSize: initialPageSize
      });
      list.value = reset ? result.list : [...list.value, ...result.list];
      total.value = result.total;
      failed.value = false;
    } catch {
      // 失败回退页码，避免"加载更多"连续跳页
      if (!reset) page.value -= 1;
      if (reset) list.value = [];
      failed.value = true;
    } finally {
      loading.value = false;
      loadingMore.value = false;
    }
  };

  const load = (): Promise<void> => fetchPage(true);
  const loadMore = (): Promise<void> => fetchPage(false);

  /** 单条已读：本地改状态并扣减未读，不整页重拉 */
  const markRead = async (id: number): Promise<void> => {
    const target = list.value.find((item) => item.id === id);
    if (!target || target.isRead === 1) return;
    try {
      await markNotificationRead(id);
    } catch {
      return;
    }
    target.isRead = 1;
    target.readAt = new Date().toISOString();
    notificationStore.decrease(1);
    // 只看未读时，标记后应从当前列表移除，总数同步减一
    if (query.value.isRead === 0) {
      list.value = list.value.filter((item) => item.id !== id);
      total.value = Math.max(total.value - 1, 0);
    }
  };

  /** 全部已读：提示文案用调用前的未读数 */
  const markAll = async (): Promise<void> => {
    const count = unread.value;
    if (!count) return;
    try {
      await ElMessageBox.confirm(t("notification.mine.markAllConfirm", { n: count }), t("notification.mine.markAll"), {
        type: "warning"
      });
    } catch {
      return;
    }
    try {
      await markAllNotificationsRead();
    } catch {
      return;
    }
    list.value.forEach((item) => {
      item.isRead = 1;
    });
    notificationStore.clear();
    ElMessage.success(t("notification.mine.markAllDone", { n: count }));
    if (query.value.isRead === 0) {
      list.value = [];
      total.value = 0;
    }
  };

  // 条件变化即回第一页重取
  watch(query, () => void load(), { deep: true });

  return {
    query,
    list,
    total,
    page,
    loading,
    loadingMore,
    failed,
    unread,
    hasMore,
    load,
    loadMore,
    markRead,
    markAll
  };
}
