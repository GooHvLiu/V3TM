<template>
  <div class="notice-list">
    <div class="notice-list-toolbar">
      <el-select
        :model-value="query.category ?? ''"
        class="notice-list-filter"
        :placeholder="t('notification.mine.allCategory')"
        :aria-label="t('notification.form.category')"
        @update:model-value="handleCategory"
      >
        <el-option :value="''" :label="t('notification.mine.allCategory')" />
        <el-option
          v-for="item in categoryOptions"
          :key="item.value"
          :value="item.value"
          :label="t(item.labelKey)"
        />
      </el-select>

      <el-select
        :model-value="query.type ?? ''"
        class="notice-list-filter"
        :placeholder="t('notification.mine.allType')"
        :aria-label="t('notification.form.type')"
        @update:model-value="handleType"
      >
        <el-option :value="''" :label="t('notification.mine.allType')" />
        <el-option v-for="item in typeOptions" :key="item.value" :value="item.value" :label="t(item.labelKey)" />
      </el-select>

      <el-select
        :model-value="readFilter"
        class="notice-list-filter"
        :placeholder="t('notification.mine.allStatus')"
        :aria-label="t('field.status')"
        @update:model-value="handleReadFilter"
      >
        <el-option :value="''" :label="t('notification.mine.allStatus')" />
        <el-option :value="0" :label="t('notification.mine.unread')" />
        <el-option :value="1" :label="t('notification.mine.read')" />
      </el-select>

      <span class="notice-list-grow" />

      <app-button variant="ghost" tone="primary" :disabled="unread === 0 || loading" @click="emit('mark-all')">
        {{ t("notification.mine.markAll") }}<template v-if="unread > 0">（{{ unread }}）</template>
      </app-button>
    </div>

    <p class="notice-list-tip">{{ t("notification.mine.unreadTip") }}</p>

    <ul v-if="list.length" class="notice-list-items">
      <li
        v-for="item in list"
        :key="item.id"
        class="notice-list-item"
        role="button"
        tabindex="0"
        :class="{ 'is-unread': item.isRead === 0 }"
        @click="toggle(item)"
        @keydown.enter.prevent="toggle(item)"
        @keydown.space.prevent="toggle(item)"
      >
        <div class="notice-list-item-head">
          <span class="notice-list-dot" :class="`is-${item.type}`" />
          <span class="notice-list-title">{{ notificationText(item, "title") }}</span>
          <span v-if="item.isRead === 0" class="notice-list-unread">{{ t("notification.mine.unreadTag") }}</span>
          <span class="notice-list-time">{{ formatDate(item.createdAt, "MM-DD HH:mm") }}</span>
        </div>

        <p class="notice-list-content" :class="{ 'is-collapsed': !isExpanded(item.id) }">
          {{ notificationText(item, "content") }}
        </p>

        <div class="notice-list-item-foot">
          <app-tag size="small" :type="categoryTagType(item.category)" effect="plain">
            {{ t(categoryLabelKey(item.category)) }}
          </app-tag>
          <span class="notice-list-meta">{{ t(typeLabelKey(item.type)) }}</span>
          <span class="notice-list-grow" />
          <app-button
            v-if="item.link"
            variant="ghost"
            tone="primary"
            size="sm"
            @click.stop="openLink(item)"
          >
            {{ t("notification.mine.viewDetail") }}
          </app-button>
        </div>
      </li>
    </ul>

    <app-empty v-else :description="t('notification.mine.empty')" :image-size="72" />

    <div v-if="list.length" class="notice-list-footer">
      <app-button v-if="hasMore" variant="ghost" :loading="loadingMore" @click="emit('load-more')">
        {{ t("notification.mine.loadMore") }}
      </app-button>
      <span v-else class="notice-list-end">{{ t("notification.mine.noMore") }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "NoticeList" });

import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { formatDate } from "@/utils";
import { notificationText } from "@/utils/notification-text";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_META,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_META
} from "@/constants";
import type { NotificationCategory, NotificationDto, NotificationListParams, NotificationType } from "@/types";

type TagType = "primary" | "success" | "info" | "warning" | "danger";
type MineQuery = Omit<NotificationListParams, "page" | "pageSize">;

const props = defineProps<{
  /** 当前页已有数据（跨页累积） */
  list: NotificationDto[];
  /** 筛选条件，受控 */
  query: MineQuery;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  /** 未读数：用于"全部已读"的禁用判断与角标 */
  unread: number;
}>();

const emit = defineEmits<{
  "update:query": [value: MineQuery];
  read: [id: number];
  open: [item: NotificationDto];
  "load-more": [];
  "mark-all": [];
}>();

const { t } = useI18n();

/** 展开过的条目 id：点一次展开全文，再点收起 */
const expandedIds = ref<number[]>([]);

const categoryOptions = NOTIFICATION_CATEGORIES.map((value) => ({
  value,
  labelKey: NOTIFICATION_CATEGORY_META[value].labelKey
}));

const typeOptions = NOTIFICATION_TYPES.map((value) => ({
  value,
  labelKey: NOTIFICATION_TYPE_META[value].labelKey
}));

/** 已读筛选：'' 全部 / 0 未读 / 1 已读 */
const readFilter = computed<string | number>(() => (props.query.isRead === undefined ? "" : props.query.isRead));

const patchQuery = (patch: Partial<MineQuery>): void => {
  emit("update:query", { ...props.query, ...patch });
};

const handleCategory = (value: string): void => {
  patchQuery({ category: (value || undefined) as NotificationCategory | undefined });
};

const handleType = (value: string): void => {
  patchQuery({ type: (value || undefined) as NotificationType | undefined });
};

const handleReadFilter = (value: string | number): void => {
  patchQuery({ isRead: value === "" || value === null ? undefined : (Number(value) as 0 | 1) });
};

const isExpanded = (id: number): boolean => expandedIds.value.includes(id);

/** 点条目：未读先上报已读，然后展开/收起全文 */
const toggle = (item: NotificationDto): void => {
  if (item.isRead === 0) emit("read", item.id);
  if (isExpanded(item.id)) {
    expandedIds.value = expandedIds.value.filter((id) => id !== item.id);
  } else {
    expandedIds.value = [...expandedIds.value, item.id];
  }
};

/** 跳转前先补一次已读，避免点完仍是未读态 */
const openLink = (item: NotificationDto): void => {
  if (item.isRead === 0) emit("read", item.id);
  emit("open", item);
};

const categoryLabelKey = (category: NotificationCategory): string =>
  NOTIFICATION_CATEGORY_META[category]?.labelKey ?? "notification.category.system";

const typeLabelKey = (type: NotificationType): string => NOTIFICATION_TYPE_META[type]?.labelKey ?? "notification.type.info";

const categoryTagType = (category: NotificationCategory): TagType =>
  (NOTIFICATION_CATEGORY_META[category]?.tagType ?? "info") as TagType;
</script>

<style scoped lang="less">
.notice-list {
  display: flex;
  flex-direction: column;
  gap: @space-3;
  height: 100%;
  min-height: 0;
}

.notice-list-toolbar {
  display: flex;
  align-items: center;
  gap: @space-2-5;
  flex-wrap: wrap;
}

.notice-list-filter {
  width: 140px;
}

@media (max-width: @screen-sm) {
  .notice-list-filter {
    flex: 1 1 120px;
    width: auto;
    min-width: 0;
  }

  .notice-list-grow {
    display: none;
  }

  .notice-list-toolbar .el-button {
    margin-left: auto;
  }

  .notice-list-item-head {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .notice-list-title {
    flex: 1 1 auto;
    min-width: 0;
    white-space: normal;
    line-height: 1.5;
  }

  .notice-list-time {
    flex: 0 0 100%;
    margin-left: 0;
    text-align: right;
  }
}

.notice-list-grow {
  flex: 1;
}

.notice-list-tip {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: @color-text-secondary;
}

.notice-list-items {
  display: flex;
  flex-direction: column;
  gap: @space-2;
  margin: 0;
  padding: 0;
  list-style: none;
}

.notice-list-item {
  position: relative;
  padding: @space-3 @space-3 @space-3 @space-4;
  border: 1px solid @color-border-light;
  border-radius: @radius-lg;
  background: @color-bg-container;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: @color-bg-hover;
  }

  &.is-unread::before {
    content: "";
    position: absolute;
    top: 12px;
    bottom: 12px;
    left: 6px;
    width: 3px;
    border-radius: @radius-sm;
    background: @color-primary;
  }
}

.notice-list-item-head {
  display: flex;
  align-items: center;
  gap: @space-2;
}

.notice-list-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: @color-info;

  &.is-success {
    background: @color-success;
  }

  &.is-warning {
    background: @color-warning;
  }

  &.is-error {
    background: @color-danger;
  }
}

.notice-list-title {
  font-size: 14px;
  font-weight: 600;
  color: @color-text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-list-unread {
  flex-shrink: 0;
  padding: 0 @space-1-5;
  font-size: 12px;
  line-height: 18px;
  color: @color-primary;
  border: 1px solid @color-primary-light;
  border-radius: @radius-sm;
}

.notice-list-time {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 12px;
  color: @color-text-placeholder;
}

.notice-list-content {
  margin: @space-2 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: @color-text-regular;
  white-space: pre-wrap;
  word-break: break-word;

  &.is-collapsed {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.notice-list-item-foot {
  display: flex;
  align-items: center;
  gap: @space-2;
  margin-top: @space-2-5;
}

.notice-list-meta {
  font-size: 12px;
  color: @color-text-secondary;
}

.notice-list-footer {
  display: flex;
  justify-content: center;
  padding-bottom: @space-1;
}

.notice-list-end {
  font-size: 12px;
  color: @color-text-placeholder;
}
</style>
