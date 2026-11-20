<template>
  <div class="home-page-dashboard">
    <BasicPage :title="t('route.dashBoard')" :description="t('dashboard.description')">
      <template #actions>
        <app-button :loading="refreshing" variant="outline" @click="refreshAll">
          <el-icon><Refresh /></el-icon>
          <span>{{ t("dashboard.action.refresh") }}</span>
        </app-button>
      </template>

      <template #content>
        <div class="dashboard-body">
          <section class="stat-grid" :aria-label="t('dashboard.section.stats')">
            <article
              v-for="item in statCards"
              :key="item.key"
              class="stat-card"
              :class="`is-${item.key}`"
            >
              <div class="stat-icon" :class="`is-${item.key}`">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <div class="stat-content">
                <span class="stat-label">{{ item.label }}</span>
                <strong class="stat-value">{{ item.value }}</strong>
                <span class="stat-hint">{{ item.hint }}</span>
              </div>
            </article>
          </section>

          <section class="dashboard-panel trend-panel">
            <header class="panel-header">
              <div class="panel-heading">
                <h4>{{ t("dashboard.trend.title") }}</h4>
                <p>{{ t("dashboard.trend.subtitle") }}</p>
              </div>
              <el-segmented
                v-model="trendView"
                :options="trendViewOptions"
                :aria-label="t('dashboard.trend.viewLabel')"
              />
            </header>

            <app-skeleton v-if="trendLoading" variant="chart" :rows="7" />

            <app-error-state
              v-else-if="trendFailed"
              compact
              :title="t('dashboard.trend.failed')"
              @retry="loadTrend"
            />

            <base-chart
              v-else
              :option="trendOption"
              :empty="trendEmpty"
              height="240px"
              :label="t('dashboard.trend.title')"
            />
          </section>

          <div class="dashboard-columns">
            <section class="dashboard-panel notice-panel">
              <header class="panel-header">
                <div class="panel-heading">
                  <h4>{{ t("dashboard.notice.title") }}</h4>
                  <p>{{ t("dashboard.notice.subtitle") }}</p>
                </div>
                <div class="panel-actions">
                  <app-button
                    v-if="unread > 0"
                    variant="ghost"
                    tone="primary"
                    :loading="markingAll"
                    @click="markAll"
                  >
                    {{ t("notification.mine.markAll") }}
                  </app-button>
                  <app-button variant="ghost" @click="goNoticeCenter">{{ t("dashboard.notice.viewAll") }}</app-button>
                </div>
              </header>

              <app-alert
                v-if="noticeFailed && recent.length"
                class="notice-alert"
                :title="t('dashboard.notice.failed')"
                tone="warning"
              />

              <ul v-if="recent.length" class="notice-list">
                <li v-for="item in recent" :key="item.id">
                  <button type="button" class="notice-item" @click="openNotice(item)">
                    <span class="notice-dot" :class="`is-${item.type}`" aria-hidden="true" />
                    <span class="notice-main">
                      <span class="notice-title-row">
                        <span class="notice-title">{{ notificationText(item, "title") }}</span>
                        <app-tag v-if="item.isRead === 0" size="small" effect="plain">
                          {{ t("notification.mine.unreadTag") }}
                        </app-tag>
                        <span class="notice-time">{{ formatDate(item.createdAt, "MM-DD HH:mm") }}</span>
                      </span>
                      <span class="notice-content">{{ notificationText(item, "content") }}</span>
                    </span>
                    <el-icon class="notice-arrow"><ArrowRight /></el-icon>
                  </button>
                </li>
              </ul>

              <app-skeleton v-else-if="noticeLoading" class="notice-skeleton" variant="list" :rows="4" />

              <app-error-state
                v-else-if="noticeFailed"
                class="notice-error"
                compact
                :title="t('dashboard.notice.failed')"
                @retry="loadRecent"
              />

              <div v-else class="notice-empty">
                <span class="notice-empty-icon" aria-hidden="true">
                  <el-icon><Bell /></el-icon>
                </span>
                <p class="notice-empty-title">{{ t("dashboard.notice.empty") }}</p>
                <p class="notice-empty-hint">{{ t("dashboard.notice.emptyHint") }}</p>
              </div>
            </section>

            <section class="dashboard-panel security-panel">
              <header class="panel-header">
                <div class="panel-heading">
                  <h4>{{ t("dashboard.security.title") }}</h4>
                  <p>{{ t("dashboard.security.subtitle") }}</p>
                </div>
              </header>

              <dl class="security-list">
                <div v-for="item in securityItems" :key="item.key" class="security-item">
                  <dt>{{ item.label }}</dt>
                  <dd>
                    <app-tag
                      v-if="item.key === 'status'"
                      size="small"
                      :type="statusTagType"
                      effect="light"
                    >
                      {{ item.value }}
                    </app-tag>
                    <app-tag v-else-if="item.key === 'role'" size="small" effect="plain">
                      {{ item.value }}
                    </app-tag>
                    <span v-else>{{ item.value }}</span>
                  </dd>
                </div>
              </dl>

              <p class="security-tip">{{ t("dashboard.security.tip") }}</p>
            </section>
          </div>

          <section class="dashboard-panel quick-panel">
            <header class="panel-heading quick-heading">
              <h4>{{ t("dashboard.quick.title") }}</h4>
              <p>{{ t("dashboard.quick.subtitle") }}</p>
            </header>

            <div class="quick-grid">
              <button
                v-for="item in quickLinks"
                :key="item.key"
                type="button"
                class="quick-item"
                @click="go(item.path)"
              >
                <span class="quick-icon" aria-hidden="true">
                  <el-icon><component :is="item.icon" /></el-icon>
                </span>
                <span class="quick-label">{{ item.label }}</span>
              </button>
            </div>
          </section>
        </div>
      </template>
    </BasicPage>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "DashBoard" });

import { computed, markRaw, onMounted, ref, watch, type Component } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import {
  ArrowRight,
  Bell,
  ChatDotRound,
  DataLine,
  Document,
  QuestionFilled,
  Refresh,
  User,
  Warning
} from "@element-plus/icons-vue";
import BasicPage from "@/components/page/basic/index.vue";
import BaseChart from "@/components/common/chart/base-chart/index.vue";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import { formatDate, storage } from "@/utils";
import { notificationText } from "@/utils/notification-text";
import {
  fetchDashboardTrend,
  getNotificationList,
  markAllNotificationsRead,
  markNotificationRead
} from "@/api";
import { NOTIFICATION_CATEGORIES } from "@/constants";
import { useNotificationStore, useUserStore } from "@/stores";
import type { EChartsOption } from "@/components/common/chart/echarts";
import type { DashboardTrendPoint, NotificationCategory, NotificationDto } from "@/types";

type StatKey = "unread" | "security" | "business" | "announcement";
type TagType = "success" | "warning" | "danger";
type TrendView = "line" | "bar";

interface StatCard {
  key: StatKey;
  label: string;
  value: number;
  hint: string;
  icon: Component;
}

interface QuickLink {
  key: string;
  label: string;
  path: string;
  icon: Component;
}

const router = useRouter();
const { t } = useI18n();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

/** 当前账号资料：页面里的角色、状态与最后登录都只认这一份 */
const profile = computed(() => userStore.userProfile);

const roleLabel = computed(() => {
  const role = profile.value?.roles?.[0]?.name;
  return role ? t(role) : profile.value?.role || "-";
});

const statusText = computed(() => {
  const status = profile.value?.status;
  if (status === 0) return t("profile.status.disabled");
  if (status === 2) return t("profile.status.pending");
  return t("profile.status.enabled");
});

const statusTagType = computed<TagType>(() => {
  const status = profile.value?.status;
  if (status === 0) return "danger";
  if (status === 2) return "warning";
  return "success";
});

const lastLoginText = computed(
  () => formatDate(profile.value?.lastLoginAt ?? undefined, "YYYY-MM-DD HH:mm") || t("profile.neverLoggedIn")
);

/** 分类未读数：通知接口只有单分类 total，四类各取一次分页 total 即可 */
const categoryCounts = ref<Record<NotificationCategory, number>>({
  system: 0,
  security: 0,
  business: 0,
  announcement: 0
});

const unread = computed(() => notificationStore.unread);

const statCards = computed<StatCard[]>(() => [
  {
    key: "unread",
    label: t("dashboard.stats.unread"),
    value: unread.value,
    hint: t("dashboard.stats.unreadHint"),
    icon: markRaw(Bell)
  },
  {
    key: "security",
    label: t("dashboard.stats.security"),
    value: categoryCounts.value.security,
    hint: t("dashboard.stats.categoryHint"),
    icon: markRaw(Warning)
  },
  {
    key: "business",
    label: t("dashboard.stats.business"),
    value: categoryCounts.value.business,
    hint: t("dashboard.stats.categoryHint"),
    icon: markRaw(ChatDotRound)
  },
  {
    key: "announcement",
    label: t("dashboard.stats.announcement"),
    value: categoryCounts.value.announcement,
    hint: t("dashboard.stats.categoryHint"),
    icon: markRaw(Document)
  }
]);

const securityItems = computed(() => [
  { key: "status", label: t("dashboard.security.status"), value: statusText.value },
  { key: "role", label: t("dashboard.security.role"), value: roleLabel.value },
  { key: "email", label: t("dashboard.security.email"), value: profile.value?.email || "-" },
  { key: "lastLogin", label: t("dashboard.security.lastLogin"), value: lastLoginText.value }
]);

const quickLinks = computed<QuickLink[]>(() => [
  {
    key: "notice",
    label: t("dashboard.quick.notice"),
    path: "/admin-center/notice-center",
    icon: markRaw(Bell)
  },
  {
    key: "records",
    label: t("dashboard.quick.records"),
    path: "/data-search",
    icon: markRaw(DataLine)
  },
  {
    key: "profile",
    label: t("dashboard.quick.profile"),
    path: "/profile",
    icon: markRaw(User)
  },
  {
    key: "help",
    label: t("dashboard.quick.help"),
    path: "/about/help",
    icon: markRaw(QuestionFilled)
  }
]);

const recent = ref<NotificationDto[]>([]);
const noticeLoading = ref<boolean>(false);
const noticeFailed = ref<boolean>(false);
const refreshing = ref<boolean>(false);
const markingAll = ref<boolean>(false);

const trendPoints = ref<DashboardTrendPoint[]>([]);
const trendLoading = ref<boolean>(false);
const trendFailed = ref<boolean>(false);

/** 趋势图的两种读法：折线看走位，柱状比单日高低 */
const TREND_VIEW_KEY = "dashboard_trend_view";

/** 只认这两个值，其余（含读取失败）一律回落到折线 */
const readTrendView = (): TrendView => (storage.get<TrendView>(TREND_VIEW_KEY) === "bar" ? "bar" : "line");

const trendView = ref<TrendView>(readTrendView());

// 读法跟人走：换页、刷新都保持上一次的选择
watch(trendView, (value) => storage.set(TREND_VIEW_KEY, value));
const trendViewOptions = computed(() => [
  { label: t("dashboard.trend.view.line"), value: "line" as const },
  { label: t("dashboard.trend.view.bar"), value: "bar" as const }
]);

const trendEmpty = computed<boolean>(() => trendPoints.value.length === 0);

const trendDates = computed<string[]>(() => trendPoints.value.map((point) => point.date.slice(5)));
const trendCounts = computed<number[]>(() => trendPoints.value.map((point) => point.count));

/** 单序列趋势：横轴只留 MM-DD，窄屏也不至于挤成一团 */
const trendOption = computed<EChartsOption>(() => {
  const asBar = trendView.value === "bar";
  return {
    // 6.x 用 outerBounds 接管轴标签避让，containLabel 已废弃
    grid: { top: 12, right: 12, bottom: 4, left: 12 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      // 柱状要让柱子落在档位中间，折线则贴着刻度走
      boundaryGap: asBar,
      data: trendDates.value
    },
    yAxis: { type: "value", minInterval: 1 },
    series: [
      asBar
        ? {
            type: "bar",
            name: t("dashboard.trend.series"),
            data: trendCounts.value,
            barMaxWidth: 28,
            itemStyle: { borderRadius: [2, 2, 0, 0] }
          }
        : {
            type: "line",
            name: t("dashboard.trend.series"),
            data: trendCounts.value,
            areaStyle: { opacity: 0.08 }
          }
    ]
  };
});

/** 趋势失败只影响本面板，通知区照常展示 */
const loadTrend = async (): Promise<void> => {
  trendLoading.value = true;
  try {
    const result = await fetchDashboardTrend();
    trendPoints.value = result.points;
    trendFailed.value = false;
  } catch {
    trendPoints.value = [];
    trendFailed.value = true;
  } finally {
    trendLoading.value = false;
  }
};

/** 最近通知：包含已读与未读，按服务端时间倒序 */
const loadRecent = async (): Promise<void> => {
  noticeLoading.value = true;
  try {
    const result = await getNotificationList({ page: 1, pageSize: 6 });
    recent.value = result.list;
    noticeFailed.value = false;
  } catch {
    noticeFailed.value = true;
  } finally {
    noticeLoading.value = false;
  }
};

const loadCategoryCounts = async (): Promise<void> => {
  const values = await Promise.all(
    NOTIFICATION_CATEGORIES.map(async (category) => {
      try {
        const result = await getNotificationList({ page: 1, pageSize: 1, isRead: 0, category });
        return result.total;
      } catch {
        return 0;
      }
    })
  );
  NOTIFICATION_CATEGORIES.forEach((category, index) => {
    categoryCounts.value[category] = values[index] ?? 0;
  });
};

const refreshAll = async (): Promise<void> => {
  refreshing.value = true;
  try {
    await Promise.all([notificationStore.fetchUnread(), loadRecent(), loadCategoryCounts(), loadTrend()]);
  } finally {
    refreshing.value = false;
  }
};

const openLink = (link: string): void => {
  if (/^https?:\/\//.test(link)) {
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }
  void router.push(link);
};

/** 点通知先补已读，再按 link 跳转；没有 link 时保留在当前页 */
const openNotice = async (item: NotificationDto): Promise<void> => {
  if (item.isRead === 0) {
    try {
      await markNotificationRead(item.id);
      item.isRead = 1;
      notificationStore.decrease(1);
      categoryCounts.value[item.category] = Math.max(0, categoryCounts.value[item.category] - 1);
    } catch {
      return;
    }
  }
  if (item.link) openLink(item.link);
};

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

  markingAll.value = true;
  try {
    await markAllNotificationsRead();
    recent.value.forEach((item) => {
      item.isRead = 1;
    });
    NOTIFICATION_CATEGORIES.forEach((category) => {
      categoryCounts.value[category] = 0;
    });
    notificationStore.clear();
    ElMessage.success(t("notification.mine.markAllDone", { n: count }));
  } catch {
    // 失败由请求层提示，保留当前列表与未读数
  } finally {
    markingAll.value = false;
  }
};

const goNoticeCenter = (): void => {
  void router.push("/admin-center/notice-center");
};

const go = (path: string): void => {
  void router.push(path);
};

onMounted(() => {
  void refreshAll();
});
</script>

<style scoped lang="less">
.home-page-dashboard {
  height: 100%;
}

.dashboard-body {
  display: flex;
  flex-direction: column;
  gap: @space-4;
  min-width: 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: @space-3;
}

.stat-card {
  display: flex;
  align-items: flex-start;
  gap: @space-3;
  min-width: 0;
  padding: @space-4 @space-4 @space-4;
  border: 1px solid @color-border-lighter;
  border-radius: @radius-lg;
  background: @color-bg-container;
}

.stat-card.is-unread {
  border-color: @color-primary-lighter;
}

.stat-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: @color-bg-hover;
  border-radius: 12px;
  color: @color-primary-text;
}

.stat-icon.is-security {
  color: @color-warning-text;
}

.stat-icon.is-business {
  color: @color-success-text;
}

.stat-icon.is-announcement {
  color: @color-info-text;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: @space-0-5;
  min-width: 0;
  padding-top: @space-0-5;
}

.stat-label {
  font-size: 0.8rem;
  line-height: 1.2;
  color: @color-text-secondary;
}

.stat-value {
  font-size: 1.8rem;
  line-height: 1.1;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: @color-text-primary;
}

.stat-hint {
  font-size: 0.72rem;
  color: @color-text-placeholder;
}

.dashboard-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr);
  gap: @space-4;
  align-items: start;
}

.dashboard-panel {
  min-width: 0;
  padding: @space-4 @space-4;
  border: 1px solid @color-border-lighter;
  border-radius: @radius-lg;
  background: @color-bg-container;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: @space-3;
  flex-wrap: wrap;
  margin-bottom: @space-2-5;
}

.panel-heading {
  min-width: 0;
}

.panel-heading h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: @color-text-primary;
}

.panel-heading p {
  margin: @space-1 0 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: @color-text-secondary;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: @space-0-5;
  flex-wrap: wrap;
}

.notice-panel {
  min-height: 288px;
}

.notice-alert {
  margin-bottom: @space-2-5;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: @space-0-5;
  margin: 0;
  padding: 0;
  list-style: none;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: @space-2-5;
  width: 100%;
  padding: @space-2-5 @space-2-5;
  border: 0;
  border-radius: @radius-base;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

.notice-item:hover {
  background: @color-bg-hover;
}

.notice-item:focus-visible {
  outline: 2px solid @color-primary;
  outline-offset: 2px;
}

.notice-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  margin-top: @space-1-5;
  border-radius: 50%;
  background: @color-info;
}

.notice-dot.is-success {
  background: @color-success;
}

.notice-dot.is-warning {
  background: @color-warning;
}

.notice-dot.is-error {
  background: @color-danger;
}

.notice-main {
  display: flex;
  flex-direction: column;
  gap: @space-1;
  min-width: 0;
  flex: 1;
}

.notice-title-row {
  display: flex;
  align-items: center;
  gap: @space-2;
  flex-wrap: wrap;
  min-width: 0;
}

.notice-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: @color-text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.notice-time {
  margin-left: auto;
  font-size: 0.72rem;
  color: @color-text-placeholder;
  white-space: nowrap;
}

.notice-content {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 0.8rem;
  line-height: 1.5;
  color: @color-text-secondary;
}

.notice-arrow {
  margin-top: @space-0-5;
  color: @color-text-placeholder;
}

.notice-item:hover .notice-arrow {
  color: @color-primary-text;
}

.notice-skeleton {
  padding: @space-2 0;
}

/* 失败态与空态保持同一高度，切换时不抖面板 */
.notice-error {
  min-height: 196px;
}

.notice-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: @space-0-5;
  min-height: 196px;
  padding: @space-5 0 @space-4;
  text-align: center;
}

.notice-empty-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: @space-1-5;
  border-radius: 50%;
  background: @color-bg-hover;
  color: @color-text-placeholder;
  font-size: 20px;
}

.notice-empty-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: @color-text-regular;
}

.notice-empty-hint {
  margin: 0;
  font-size: 0.78rem;
  color: @color-text-placeholder;
}

.security-panel {
  min-height: 288px;
}

.security-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  padding: 0;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-4;
  min-height: 40px;
  padding: @space-2 0;
  border-bottom: 1px solid @color-border-lighter;
}

.security-item:last-child {
  border-bottom: 0;
}

.security-item dt {
  flex-shrink: 0;
  font-size: 0.8rem;
  color: @color-text-secondary;
}

.security-item dd {
  margin: 0;
  min-width: 0;
  text-align: right;
  font-size: 0.84rem;
  color: @color-text-primary;
  overflow-wrap: anywhere;
}

.security-tip {
  margin: @space-3 0 0;
  font-size: 0.75rem;
  line-height: 1.5;
  color: @color-text-placeholder;
}

.quick-panel {
  display: flex;
  align-items: center;
  gap: @space-5;
  padding: @space-3 @space-4;
}

.quick-heading {
  flex: 0 0 170px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: @space-2-5;
  flex: 1;
  min-width: 0;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: @space-2-5;
  min-height: 46px;
  min-width: 0;
  padding: @space-2 @space-2-5;
  border: 1px solid @color-border-lighter;
  border-radius: @radius-base;
  background: @color-bg-page;
  color: @color-text-regular;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.quick-item:hover {
  background: @color-bg-hover;
  border-color: @color-border;
  color: @color-primary-text;
}

.quick-item:focus-visible {
  outline: 2px solid @color-primary;
  outline-offset: 2px;
}

.quick-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: @color-bg-container;
  color: @color-primary-text;
  font-size: 16px;
}

.quick-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.84rem;
}

@media (max-width: @screen-xl) {
  .dashboard-columns {
    grid-template-columns: minmax(0, 1fr);
  }

  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-panel {
    flex-direction: column;
    align-items: stretch;
    gap: @space-3;
  }

  .quick-heading {
    flex: none;
  }

  .quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: @mobile-max) {
  .dashboard-body {
    gap: @space-3;
  }

  .stat-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .dashboard-panel {
    padding: @space-3;
  }

  .notice-panel,
  .security-panel {
    min-height: 0;
  }

  .notice-item {
    padding: @space-2-5 @space-1-5;
  }

  .notice-title-row {
    align-items: flex-start;
  }

  .notice-time {
    width: 100%;
    margin-left: 0;
  }

  .security-item {
    align-items: flex-start;
    flex-direction: column;
    gap: @space-0-5;
  }

  .security-item dd {
    text-align: left;
  }

  .quick-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
