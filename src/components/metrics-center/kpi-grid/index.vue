<template>
  <div v-if="loading && !overview" class="skeleton-grid">
    <div v-for="index in 6" :key="index" class="skeleton" />
  </div>
  <div v-else class="kpi-grid">
    <div v-for="card in cards" :key="card.key" class="kpi" :class="`is-${card.tone}`">
      <span class="kpi-label">{{ card.label }}</span>
      <span class="kpi-value">
        {{ card.value }}<em v-if="card.unit" class="kpi-unit">{{ card.unit }}</em>
      </span>
      <span class="kpi-hint">{{ card.hint }}</span>
      <SparkLine v-if="card.spark" class="kpi-spark" :values="card.spark" :tone="card.tone" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MetricsKpiGrid" });

import { computed } from "vue";
import { useI18n } from "vue-i18n";
import SparkLine from "@/components/spark-line/index.vue";
import type { MetricsOverview } from "@/types";
import { errorRateTone, formatCount, formatMs, formatPercent } from "@/pages/super-admin/metrics-center/status";

const props = defineProps<{
  overview: MetricsOverview | null;
  loading: boolean;
}>();

const { t } = useI18n();

/** 卡片色调：与 SparkLine 的 tone 取值保持一致，避免模板里出现宽泛的 string */
type KpiTone = "success" | "warning" | "danger" | "info" | "muted";

interface KpiCard {
  key: string;
  label: string;
  value: string;
  unit?: string;
  hint: string;
  tone: KpiTone;
  spark?: number[];
}

const cards = computed<KpiCard[]>(() => {
  const data = props.overview;
  if (!data) return [];
  const { totals, current, series } = data;
  return [
    {
      key: "requests",
      label: t("metricsCenter.metric.requests"),
      value: formatCount(totals.requests),
      hint: t("metricsCenter.hint.requests"),
      tone: "success",
      spark: series.map((point) => point.requests)
    },
    {
      key: "errors",
      label: t("metricsCenter.metric.errors"),
      value: formatCount(totals.errors),
      hint: t("metricsCenter.hint.errors"),
      tone: "danger",
      spark: series.map((point) => point.errors)
    },
    {
      key: "errorRate",
      label: t("metricsCenter.metric.errorRate"),
      value: formatPercent(totals.errorRate),
      hint: t("metricsCenter.hint.errorRate"),
      tone: errorRateTone(totals.errorRate)
    },
    {
      key: "avg",
      label: t("metricsCenter.metric.avg"),
      value: formatMs(totals.avgDurationMs),
      unit: t("metricsCenter.unit.ms"),
      hint: t("metricsCenter.hint.avg"),
      tone: "info"
    },
    {
      key: "p95",
      label: t("metricsCenter.metric.p95"),
      value: formatMs(totals.p95DurationMs),
      unit: t("metricsCenter.unit.ms"),
      hint: t("metricsCenter.hint.p95"),
      tone: "info"
    },
    {
      key: "qps",
      label: t("metricsCenter.metric.qps"),
      value: formatMs(current.qps),
      hint: t("metricsCenter.hint.qps"),
      tone: "muted"
    }
  ];
});
</script>

<style scoped lang="less">
.kpi-grid,
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: @space-3;
}

.kpi {
  display: flex;
  flex-direction: column;
  gap: @space-1;
  padding: @space-3;
  border: 1px solid @color-border-light;
  border-left-width: 4px;
  border-radius: @radius-lg;
}

.kpi.is-success {
  border-left-color: @color-success;
}

.kpi.is-warning {
  border-left-color: @color-warning;
}

.kpi.is-danger {
  border-left-color: @color-danger;
}

.kpi.is-info {
  border-left-color: @color-info;
}

.kpi.is-muted {
  border-left-color: @color-border-light;
}

.kpi-label {
  font-size: 0.75rem;
  color: @color-text-regular;
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: @color-text-primary;
  font-variant-numeric: tabular-nums;
}

.kpi.is-danger .kpi-value {
  color: @color-danger-text;
}

.kpi.is-warning .kpi-value {
  color: @color-warning-text;
}

.kpi-unit {
  margin-left: @space-1;
  font-size: 0.8rem;
  font-style: normal;
  font-weight: 400;
  color: @color-text-regular;
}

.kpi-hint {
  font-size: 0.72rem;
  color: @color-text-placeholder;
}

.kpi-spark {
  margin-top: @space-2;
}

.skeleton {
  height: 108px;
  border: 1px solid @color-border-light;
  border-radius: @radius-lg;
  background: @color-border-light;
  opacity: 0.4;
}

@media (max-width: @screen-lg) {
  .kpi-grid,
  .skeleton-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: @screen-sm) {
  .kpi-grid,
  .skeleton-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
