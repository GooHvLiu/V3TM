<template>
  <div v-if="canView" class="page-wrap-header-notice">
    <!-- 桌面：点击展开未读预览浮层 -->
    <el-popover
      v-if="!isMobile"
      ref="popoverRef"
      v-model:visible="popoverVisible"
      placement="bottom-end"
      :width="360"
      trigger="click"
      @show="handlePopoverShow"
      @hide="handlePopoverHide"
    >
      <template #reference>
        <span class="notice-trigger">
          <app-tooltip
            :content="t('layout.tooltip.notice')"
            placement="bottom"
            :show-after="300"
            :disabled="popoverVisible"
          >
            <button
              type="button"
              class="notice square-line"
              :aria-label="noticeLabel"
              :aria-expanded="popoverVisible ? 'true' : 'false'"
              @keydown.escape.prevent="closePopover"
            >
              <el-icon size="18">
                <i-carbon-notification-new />
              </el-icon>
              <span v-if="badge" class="notice-badge">{{ badge }}</span>
            </button>
          </app-tooltip>
        </span>
      </template>

      <div class="notice-panel">
        <div class="notice-panel-head">
          <span class="notice-panel-title">{{ t("notification.header.title") }}</span>
          <app-button variant="ghost" size="sm" :disabled="unread <= 0" @click="handleReadAll">
            {{ t("notification.header.markAll") }}
          </app-button>
        </div>

        <p v-if="previewError" class="notice-panel-error">{{ t("notification.header.loadFailed") }}</p>

        <ul v-if="preview.length" class="notice-panel-list">
          <li
            v-for="item in preview"
            :key="item.id"
            class="notice-panel-item"
            :class="{ 'is-unread': item.isRead === 0 }"
            role="button"
            tabindex="0"
            @click="handleItem(item)"
            @keydown.enter="handleItem(item)"
            @keydown.space.prevent="handleItem(item)"
          >
            <div class="notice-panel-item-head">
              <app-tag size="small" :type="categoryTagType(item.category)" effect="plain">
                {{ t(categoryLabelKey(item.category)) }}
              </app-tag>
              <span class="notice-panel-item-title">{{ notificationText(item, "title") }}</span>
            </div>
            <div class="notice-panel-item-meta">
              {{ formatDate(item.createdAt, "MM-DD HH:mm") }}
            </div>
          </li>
        </ul>

        <div v-else class="notice-panel-empty">{{ t("notification.header.empty") }}</div>

        <div class="notice-panel-foot">
          <span class="notice-panel-foot-tip">{{
            unread > 0 ? t("notification.header.unreadTip", { n: unread }) : ""
          }}</span>
          <app-button variant="ghost" tone="primary" size="sm" @click="goCenter">
            {{ t("notification.header.viewAll") }}
          </app-button>
        </div>
      </div>
    </el-popover>

    <!-- 手机端：抽屉内入口，点击直接进通知中心 -->
    <app-tooltip
      v-else
      :content="t('layout.tooltip.notice')"
      placement="bottom"
      :show-after="300"
    >
      <button
        type="button"
        class="notice square-line"
        :aria-label="noticeLabel"
        @click="goCenter"
      >
        <el-icon size="18">
          <i-carbon-notification-new />
        </el-icon>
        <span v-if="badge" class="notice-badge">{{ badge }}</span>
      </button>
    </app-tooltip>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "HeaderNotice" });

import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "@/utils/element-plus";
import { getNotificationList, markAllNotificationsRead, markNotificationRead } from "@/api";
import { useBreakpoint } from "@/composables";
import { NOTIFICATION_CATEGORY_META, NOTIFICATION_PREVIEW_SIZE } from "@/constants";
import { formatDate, hasPermission } from "@/utils";
import { notificationText } from "@/utils/notification-text";
import { useNotificationStore, useUserStore } from "@/stores";
import type { NotificationCategory, NotificationDto } from "@/types";

type TagType = "primary" | "success" | "info" | "warning" | "danger";

const emit = defineEmits<{
  navigate: [];
}>();

const { t } = useI18n();
const router = useRouter();
const { isMobile } = useBreakpoint();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

/** 通知中心路径：顶栏入口与浮层"查看全部"共用 */
const CENTER_PATH = "/admin-center/notice-center";

const canView = computed<boolean>(() => hasPermission(userStore.permissions, "adminCenter:noticeCenter:list"));
const unread = computed<number>(() => notificationStore.unread);
const badge = computed<string>(() => notificationStore.badge);

/** 可见的未读数字必须进入可读名称，避免屏幕阅读器名称与视觉内容不一致 */
const noticeLabel = computed<string>(() =>
  badge.value ? t("layout.tooltip.noticeWithUnread", { n: unread.value }) : t("layout.tooltip.notice")
);

const popoverVisible = ref<boolean>(false);
const popoverRef = ref<{ hide: () => void } | null>(null);
const preview = ref<NotificationDto[]>([]);
const previewError = ref<boolean>(false);

/** 浮层显隐以实际状态回写，保证 aria-expanded 与视觉一致 */
const handlePopoverShow = (): void => {
  popoverVisible.value = true;
  void loadPreview();
};

const handlePopoverHide = (): void => {
  popoverVisible.value = false;
};

/** Esc 关闭浮层，焦点留在触发按钮上 */
const closePopover = (): void => {
  popoverRef.value?.hide();
};

/** 浮层打开即拉最新未读，未读数仍以 store 轮询为准 */
const loadPreview = async (): Promise<void> => {
  try {
    const result = await getNotificationList({ page: 1, pageSize: NOTIFICATION_PREVIEW_SIZE, isRead: 0 });
    preview.value = result.list;
    previewError.value = false;
  } catch {
    preview.value = [];
    previewError.value = true;
  }
};

const goCenter = (): void => {
  popoverVisible.value = false;
  emit("navigate");
  void router.push(CENTER_PATH);
};

const handleItem = async (item: NotificationDto): Promise<void> => {
  if (item.isRead === 0) {
    try {
      await markNotificationRead(item.id);
    } catch {
      return;
    }
    item.isRead = 1;
    notificationStore.decrease(1);
  }
  const link = item.link;
  if (link && /^https?:\/\//.test(link)) {
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }
  if (link) {
    popoverVisible.value = false;
    emit("navigate");
    void router.push(link);
    return;
  }
  goCenter();
};

const handleReadAll = async (): Promise<void> => {
  const count = unread.value;
  if (!count) return;
  try {
    await markAllNotificationsRead();
  } catch {
    return;
  }
  preview.value = [];
  notificationStore.clear();
  ElMessage.success(t("notification.mine.markAllDone", { n: count }));
};

const categoryLabelKey = (category: NotificationCategory): string =>
  NOTIFICATION_CATEGORY_META[category]?.labelKey ?? "notification.category.system";

const categoryTagType = (category: NotificationCategory): TagType =>
  (NOTIFICATION_CATEGORY_META[category]?.tagType ?? "info") as TagType;

onMounted(() => {
  if (!canView.value) return;
  // 未读数走 store 单例轮询：页面与顶栏共用，不重复拉取
  notificationStore.startPolling();
});
</script>

<style scoped lang="less">
.page-wrap-header-notice {
  position: relative;
}

.notice-trigger {
  display: inline-flex;
  align-items: center;
}

.notice {
  position: relative;
  background: transparent;
  color: inherit;
  font: inherit;
}

.notice-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 @space-1;
  border-radius: 8px;
  background: @color-danger;
  color: #fff;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
}

.notice-panel {
  display: flex;
  flex-direction: column;
  gap: @space-2;
}

.notice-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notice-panel-title {
  font-size: 13px;
  font-weight: 600;
  color: @color-text-primary;
}

.notice-panel-error {
  margin: 0;
  font-size: 12px;
  color: @color-danger;
}

.notice-panel-list {
  display: flex;
  flex-direction: column;
  gap: @space-0-5;
  margin: 0;
  padding: 0;
  list-style: none;
}

.notice-panel-item {
  padding: @space-2 @space-2;
  border-radius: @radius-lg;
  cursor: pointer;

  &:hover {
    background: @color-bg-hover;
  }

  &.is-unread {
    box-shadow: inset 3px 0 0 @color-primary;
  }
}

.notice-panel-item-head {
  display: flex;
  align-items: center;
  gap: @space-1-5;
  min-width: 0;
}

.notice-panel-item-title {
  overflow: hidden;
  font-size: 13px;
  color: @color-text-primary;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-panel-item-meta {
  margin-top: @space-0-5;
  font-size: 12px;
  color: @color-text-placeholder;
}

.notice-panel-empty {
  padding: @space-4 0;
  font-size: 12px;
  color: @color-text-placeholder;
  text-align: center;
}

.notice-panel-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid @color-border-light;
  padding-top: @space-1-5;
}

.notice-panel-foot-tip {
  font-size: 12px;
  color: @color-text-secondary;
}
</style>
