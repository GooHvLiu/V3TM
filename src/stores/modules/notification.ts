/**
 * ==========================================
 * Notification | 通知未读计数
 * ------------------------------------------
 * 顶栏红点与通知中心页面共用同一份计数：
 * 只在 store 里起一个 60s 轮询，页面进入时复用，不再各自拉接口。
 * 单条已读 / 全部已读后就地扣减，避免为一枚红点整页重拉列表。
 * ==========================================
 */
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getNotificationUnreadCount } from "@/api";
import { NOTIFICATION_POLL_INTERVAL, NOTIFICATION_UNREAD_CAP } from "@/constants";
import { useUserStore } from "./user";

export const useNotificationStore = defineStore("NotificationStore", () => {
  /** 未读条数（真实值，不做截断） */
  const unread = ref<number>(0);
  const loading = ref<boolean>(false);
  /** 轮询句柄：普通变量，不参与响应式追踪 */
  let timer: ReturnType<typeof setInterval> | null = null;

  /** 红点文案：超过上限显示 99+，为零时为空串 */
  const badge = computed<string>(() => {
    if (unread.value <= 0) return "";
    return unread.value > NOTIFICATION_UNREAD_CAP ? `${NOTIFICATION_UNREAD_CAP}+` : String(unread.value);
  });

  /** 拉取未读数（静默失败，不打扰用户） */
  const fetchUnread = async (): Promise<void> => {
    const userStore = useUserStore();
    if (!userStore.isLoggedIn) {
      unread.value = 0;
      return;
    }
    loading.value = true;
    try {
      const result = await getNotificationUnreadCount();
      unread.value = Math.max(0, Number(result?.count ?? 0));
    } catch {
      // 未读数失败不影响主流程，保留上一次值
    } finally {
      loading.value = false;
    }
  };

  /** 启动轮询：重复调用不会再起第二个定时器 */
  const startPolling = (): void => {
    if (timer) return;
    void fetchUnread();
    timer = setInterval(() => void fetchUnread(), NOTIFICATION_POLL_INTERVAL);
  };

  /** 停止轮询：顶栏卸载时调用 */
  const stopPolling = (): void => {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  };

  /** 单条已读后本地扣减 */
  const decrease = (count = 1): void => {
    unread.value = Math.max(0, unread.value - count);
  };

  /** 全部已读后清零 */
  const clear = (): void => {
    unread.value = 0;
  };

  return {
    unread,
    loading,
    badge,
    fetchUnread,
    startPolling,
    stopPolling,
    decrease,
    clear
  };
});
