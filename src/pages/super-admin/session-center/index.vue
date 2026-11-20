<template>
  <BasicPage :title="t(String(route.meta.title))" :description="t('sessionCenter.description')">
    <template #actions>
      <app-button :loading="loading" variant="outline" @click="refresh">
        {{ t("sessionCenter.refresh") }}
      </app-button>
      <app-button v-permission="'superAdmin:session:cleanup'" tone="primary" @click="openCleanup">
        {{ t("sessionCenter.cleanup") }}
      </app-button>
    </template>

    <template #content>
      <div class="session-center-page">
        <app-alert v-if="errorMsg" :title="errorMsg" tone="danger" />

        <SessionOverviewPanel
          v-model:status="filter.status"
          v-model:keyword="keywordInput"
          :summary="summary"
          :status-options="statusOptions"
          @apply="applyKeyword"
          @reset="handleReset"
        />

        <SessionBatchBar
          v-if="selectedRows.length"
          :count="selectedRows.length"
          @revoke="handleBatchRevoke(false)"
          @force="handleBatchRevoke(true)"
          @cancel="clearAllSelection"
        />

        <SessionTable
          ref="sessionTableRef"
          :list="list"
          :loading="loading"
          :total="total"
          :page="page"
          :page-size="pageSize"
          @page-change="changePage"
          @size-change="changePageSize"
          @selection-change="setSelected"
          @revoke="handleRevoke"
          @force="handleForceRevoke"
        />
      </div>

      <SessionCleanupDialog
        v-model:visible="cleanupVisible"
        v-model:days="cleanupDays"
        :loading="cleaning"
        @confirm="handleCleanup"
      />
    </template>
  </BasicPage>
</template>

<script setup lang="ts">
defineOptions({ name: "SessionCenter" });

import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import BasicPage from "@/components/page/basic/index.vue";
import SessionOverviewPanel from "@/components/session-center/session-summary/index.vue";
import SessionBatchBar from "@/components/session-center/batch-bar/index.vue";
import SessionTable from "@/components/session-center/session-table/index.vue";
import SessionCleanupDialog from "@/components/session-center/session-cleanup/index.vue";
import { useTable } from "@/composables";
import { fetchSessionList, revokeSession, revokeSessions, cleanupSessions } from "@/api";
import type { SessionItem, SessionQueryParams, SessionStatus, SessionSummary } from "@/types";

const route = useRoute();
const { t } = useI18n();

/** 全量统计：随列表响应一起回填，不参与筛选 */
const summary = ref<SessionSummary | null>(null);
const errorMsg = ref("");

/** 筛选条件：status 用 "all" 作哨兵，避免下拉清空值类型漂移 */
const filter = reactive<{ status: "all" | SessionStatus; keyword: string }>({
  status: "all",
  keyword: ""
});
const keywordInput = ref("");

/** 失败时回退到上一次成功结果 */
const cache: { list: SessionItem[]; total: number } = { list: [], total: 0 };

const {
  page,
  pageSize,
  total,
  list,
  loading,
  selectedRows,
  changePage,
  changePageSize,
  setSelected,
  search,
  clearSelection,
  refresh
} = useTable<SessionQueryParams, SessionItem>({
  fetcher: async (params) => {
    try {
      const data = await fetchSessionList(params);
      summary.value = data.summary;
      errorMsg.value = "";
      cache.list = data.list;
      cache.total = data.total;
      return { list: data.list, total: data.total };
    } catch {
      errorMsg.value = t("sessionCenter.loadFailed");
      return { list: cache.list, total: cache.total };
    }
  },
  query: () => ({
    status: filter.status === "all" ? undefined : filter.status,
    keyword: filter.keyword || undefined
  }),
  initialPageSize: 10
});

// 表格实例：与 useTable 的 clearSelection 配合，两处都要清
const sessionTableRef = ref<{ clearSelection: () => void }>();

/** 清空勾选：页面变量 + 表格勾选框 */
const clearAllSelection = (): void => {
  clearSelection();
  sessionTableRef.value?.clearSelection();
};

const statusOptions = computed<Array<{ value: "all" | SessionStatus; label: string }>>(() => [
  { value: "all", label: t("sessionCenter.status.all") },
  { value: "active", label: t("sessionCenter.status.active") },
  { value: "expired", label: t("sessionCenter.status.expired") },
  { value: "revoked", label: t("sessionCenter.status.revoked") }
]);

onMounted(refresh);

/** 关键字不逐字触发：回车或清空时才写回筛选条件 */
const applyKeyword = (): void => {
  const value = keywordInput.value.trim();
  if (value === filter.keyword) {
    search();
    return;
  }
  filter.keyword = value;
};

const handleReset = (): void => {
  const changed = Boolean(filter.status !== "all" || filter.keyword || keywordInput.value);
  keywordInput.value = "";
  filter.status = "all";
  filter.keyword = "";
  if (!changed) search();
};

/** 二次确认：取消返回 false，不留未处理的 rejection */
const confirmAction = async (message: string, danger: boolean): Promise<boolean> => {
  try {
    await ElMessageBox.confirm(message, danger ? t("sessionCenter.force") : t("sessionCenter.revoke"), {
      type: danger ? "warning" : "info"
    });
    return true;
  } catch {
    return false;
  }
};

const usersOf = (rows: SessionItem[]): string => [...new Set(rows.map((row) => row.username))].join("、");

/** 单条吊销：只让该设备无法续期，不动 tokenVersion */
const handleRevoke = async (row: SessionItem): Promise<void> => {
  if (!(await confirmAction(t("sessionCenter.confirmRevoke", { username: row.username }), false))) return;
  try {
    await revokeSession(row.id);
    ElMessage.success(t("sessionCenter.revokeOneDone"));
    refresh();
  } catch {
    // 业务错误已在拦截器统一提示
  }
};

/** 强制下线：提升 tokenVersion，该用户全部设备立即失效 */
const handleForceRevoke = async (row: SessionItem): Promise<void> => {
  if (!(await confirmAction(t("sessionCenter.confirmForce", { users: row.username }), true))) return;
  try {
    await revokeSession(row.id, true);
    ElMessage.success(t("sessionCenter.forceDone", { n: 1 }));
    refresh();
  } catch {
    // 业务错误已在拦截器统一提示
  }
};

const handleBatchRevoke = async (force: boolean): Promise<void> => {
  const rows = [...selectedRows.value];
  if (!rows.length) return;
  const message = force
    ? t("sessionCenter.confirmBatchForce", { users: usersOf(rows) })
    : t("sessionCenter.confirmBatch", { n: rows.length });
  if (!(await confirmAction(message, force))) return;

  try {
    const data = await revokeSessions(
      rows.map((row) => row.id),
      force
    );
    ElMessage.success(
      force ? t("sessionCenter.forceDone", { n: data.affected }) : t("sessionCenter.revokeDone", { n: data.affected })
    );
    clearAllSelection();
    refresh();
  } catch {
    // 业务错误已在拦截器统一提示
  }
};

/** 清理：阈值按创建时间计算，非最后活跃时间 */
const cleanupVisible = ref(false);
const cleanupDays = ref(7);
const cleaning = ref(false);

const openCleanup = (): void => {
  cleanupDays.value = 7;
  cleanupVisible.value = true;
};

const handleCleanup = async (): Promise<void> => {
  cleaning.value = true;
  try {
    const data = await cleanupSessions(cleanupDays.value);
    cleanupVisible.value = false;
    ElMessage.success(
      data.deleted
        ? t("sessionCenter.cleanupDone", { n: data.deleted, days: data.beforeDays })
        : t("sessionCenter.cleanupNone")
    );
    clearAllSelection();
    refresh();
  } catch {
    // 业务错误已在拦截器统一提示
  } finally {
    cleaning.value = false;
  }
};
</script>

<style scoped lang="less">
.session-center-page {
  display: flex;
  flex-direction: column;
  gap: @space-3;
}
</style>
