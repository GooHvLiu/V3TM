<template>
  <BasicPage :title="t(String(route.meta.title))" :description="t('metricsCenter.description')">
    <template #actions>
      <app-button :loading="loading" variant="outline" @click="load()">
        {{ t("metricsCenter.refresh") }}
      </app-button>
      <app-button v-permission="'superAdmin:metrics:reset'" variant="outline" @click="handleReset">
        {{ t("metricsCenter.reset") }}
      </app-button>
    </template>

    <template #content>
      <div class="metrics-center-page">
        <app-alert v-if="errorMsg" :title="errorMsg" tone="danger" />

        <MetricsOverviewPanel
          v-model:range="range"
          :overview="overview"
          :is-empty="isEmpty"
          @change="handleRange"
        />

        <template v-if="loading || !isEmpty">
          <MetricsKpiGrid :overview="overview" :loading="loading" />
          <MetricsMemoryBar :memory="overview?.current.memory ?? null" />
        </template>
        <div v-else class="metrics-empty">
          <app-empty :description="t('metricsCenter.empty')" />
        </div>
      </div>
    </template>
  </BasicPage>
</template>

<script setup lang="ts">
defineOptions({ name: "MetricsCenter" });

import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import BasicPage from "@/components/page/basic/index.vue";
import MetricsOverviewPanel from "@/components/metrics-center/metrics-overview/index.vue";
import MetricsKpiGrid from "@/components/metrics-center/kpi-grid/index.vue";
import MetricsMemoryBar from "@/components/metrics-center/memory-bar/index.vue";
import { fetchMetricsOverview, resetMetrics } from "@/api";
import type { MetricsOverview, MetricsRange } from "@/types";
import { formatCount } from "./status";

const route = useRoute();
const { t } = useI18n();

const range = ref<MetricsRange>("1h");
const overview = ref<MetricsOverview | null>(null);
const loading = ref(false);
const errorMsg = ref("");

/** 空态判定：区间内没有任何请求，不能当成正常的 0 值图表 */
const isEmpty = computed(() => {
  const data = overview.value;
  if (!data) return true;
  return data.totals.requests === 0 && data.series.every((point) => point.requests === 0);
});

/** silent 用于轮询：不点亮按钮，失败也保留上一次数据 */
const load = async (silent = false): Promise<void> => {
  if (!silent) loading.value = true;
  try {
    overview.value = await fetchMetricsOverview(range.value);
    errorMsg.value = "";
  } catch {
    errorMsg.value = t("metricsCenter.loadFailed");
  } finally {
    if (!silent) loading.value = false;
  }
};

const handleRange = (): void => {
  load();
};

/** 重置二次确认：把清理前累计次数写进文案，避免误以为连日志一起清 */
const handleReset = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      t("metricsCenter.resetConfirm", { n: formatCount(overview.value?.totals.requests ?? 0) }),
      t("metricsCenter.reset"),
      { type: "warning" }
    );
  } catch {
    return;
  }

  try {
    const data = await resetMetrics();
    ElMessage.success(t("metricsCenter.resetDone", { n: formatCount(data.clearedRequests) }));
    await load();
  } catch {
    // 业务错误已由响应拦截器统一提示
  }
};

let timer: number | undefined;

onMounted(() => {
  load();
  // 页面不可见时跳过本轮，切回来自然恢复，不销毁定时器
  timer = window.setInterval(() => {
    if (document.hidden) return;
    load(true);
  }, 10_000);
});

onBeforeUnmount(() => {
  if (timer !== undefined) window.clearInterval(timer);
});
</script>

<style scoped lang="less">
.metrics-center-page {
  display: flex;
  flex-direction: column;
  gap: @space-3;
}
</style>
