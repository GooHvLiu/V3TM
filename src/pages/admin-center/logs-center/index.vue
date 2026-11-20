<template>
  <BasicPage :title="t(String(route.meta.title))" :description="t('logCenter.description')">
    <template #actions>
      <app-button v-permission="'adminCenter:log:cleanup'" tone="danger" variant="outline" @click="cleanupVisible = true">
        {{ t("logCenter.cleanup.title") }}
      </app-button>
      <app-button :loading="refreshing" variant="outline" @click="handleRefresh">{{ t("logCenter.refresh") }}</app-button>
    </template>

    <template #content>
      <div class="page-wrap-logs-center">
        <LogSummary
          :summary="summary"
          :loading="summaryLoading"
          :range="range"
          :filtered="!canCleanup"
          @update:range="handleRange"
        />

        <app-alert
          v-if="logError"
          class="logs-center-alert"
          :title="t('logCenter.loadFailed')"
          tone="warning"
        />

        <LogTable
          :list="list"
          :total="total"
          :loading="loading"
          :page="page"
          :page-size="pageSize"
          :category="category"
          :query="query"
          @update:category="handleCategory"
          @search="handleSearch"
          @page-change="changePage"
          @size-change="changePageSize"
        />

        <p class="logs-center-footnote">{{ t("logCenter.filter.noExport") }}</p>

        <CleanupDialog
          v-model="cleanupVisible"
          :default-days="cleanupDays"
          :submitting="cleaning"
          @submit="handleCleanup"
        />
      </div>
    </template>
  </BasicPage>
</template>

<script setup lang="ts">
defineOptions({ name: "LogsCenter" });

import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "@/utils/element-plus";
import BasicPage from "@/components/page/basic/index.vue";
import LogSummary from "@/components/log-center/summary/index.vue";
import LogTable from "@/components/log-center/log-table/index.vue";
import CleanupDialog from "@/components/log-center/cleanup-dialog/index.vue";
import { cleanupLogs, getLogList, getLogSummary } from "@/api";
import { useTable } from "@/composables";
import { LOG_CLEANUP_CONFIRM_TEXT, LOG_CLEANUP_DEFAULT_DAYS } from "@/constants";
import { hasPermission } from "@/utils";
import { useConfigStore, useUserStore } from "@/stores";
import type { LogCategory, LogDto, LogListParams, LogSummary as LogSummaryData, LogSummaryRange } from "@/types";

type LogQuery = Omit<LogListParams, "page" | "pageSize" | "category">;
type LogPageQuery = { page: number; pageSize: number } & LogListParams;

const route = useRoute();
const { t } = useI18n();
const userStore = useUserStore();
const configStore = useConfigStore();

/** 清理入口只有超管可见：同一权限码同时决定概览的"已过滤"提示 */
const canCleanup = computed<boolean>(() => hasPermission(userStore.permissions, "adminCenter:log:cleanup"));

const range = ref<LogSummaryRange>("24h");
const summary = ref<LogSummaryData | null>(null);
const summaryLoading = ref<boolean>(false);
const refreshing = ref<boolean>(false);

const category = ref<LogCategory>("operation");
const query = ref<LogQuery>({});
const logError = ref<boolean>(false);

const loadSummary = async (): Promise<void> => {
  summaryLoading.value = true;
  try {
    summary.value = await getLogSummary({ range: range.value });
  } catch {
    // 概览失败保留上一次结果，列表错误另有提示
  } finally {
    summaryLoading.value = false;
  }
};

const handleRange = (value: LogSummaryRange): void => {
  range.value = value;
  void loadSummary();
};

const {
  list,
  total,
  loading,
  page,
  pageSize,
  search,
  refresh,
  changePage,
  changePageSize
} = useTable<LogPageQuery, LogDto>({
  fetcher: async (params) => {
    try {
      const result = await getLogList({ ...params, category: category.value });
      logError.value = false;
      return { list: result.list, total: result.total };
    } catch {
      logError.value = true;
      return { list: [], total: 0 };
    }
  },
  query: () => query.value,
  initialPageSize: 20
});

const handleSearch = (value: LogQuery): void => {
  query.value = value;
  // 条件由 useTable 的 query 监听触发，此处只同步查询对象
};

const handleCategory = (value: LogCategory): void => {
  category.value = value;
  // 清空条件后由 useTable 的条件监听回到第一页重取，页面不再手动触发
  query.value = {};
};

const handleRefresh = async (): Promise<void> => {
  refreshing.value = true;
  try {
    refresh();
    await loadSummary();
  } finally {
    refreshing.value = false;
  }
};

// ============ 清理 ============
const cleanupVisible = ref<boolean>(false);
const cleaning = ref<boolean>(false);
/** 默认保留天数取自系统配置，非超管读不到超级设置时用常量兜底 */
const cleanupDays = ref<number>(LOG_CLEANUP_DEFAULT_DAYS);

const handleCleanup = async (params: { beforeDays: number }): Promise<void> => {
  cleaning.value = true;
  try {
    const result = await cleanupLogs({ beforeDays: params.beforeDays, confirm: LOG_CLEANUP_CONFIRM_TEXT });
    const deleted = result.operationDeleted + result.mailDeleted;
    ElMessage.success(
      deleted > 0
        ? t("logCenter.cleanup.done", {
            operation: result.operationDeleted,
            mail: result.mailDeleted,
            days: result.beforeDays
          })
        : t("logCenter.cleanup.none")
    );
    cleanupVisible.value = false;
    search();
    void loadSummary();
  } catch {
    // 92001 / 10003 由拦截器按错误码提示
  } finally {
    cleaning.value = false;
  }
};

onMounted(async () => {
  search();
  void loadSummary();
  try {
    await configStore.fetchSuperConfig();
    const raw = configStore.getSuperValue("log_retention_days");
    const days = Number(raw);
    if (Number.isInteger(days) && days >= 1 && days <= 3650) cleanupDays.value = days;
  } catch {
    // 非超管账号读不到超级设置：沿用常量默认值
  }
});
</script>

<style scoped lang="less">
.page-wrap-logs-center {
  display: flex;
  flex-direction: column;
  gap: @space-3;
}

.logs-center-alert {
  margin: 0;
}

.logs-center-footnote {
  margin: 0;
  font-size: @font-size-xs;
  color: @color-text-placeholder;
}
</style>
