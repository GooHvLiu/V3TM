<template>
  <div class="metrics-overview">
    <div class="overview-status" :class="isEmpty ? 'is-idle' : 'is-collecting'">
      <span class="overview-dot" />
      <span class="overview-text">
        {{ isEmpty ? t("metricsCenter.status.idle") : t("metricsCenter.status.collecting") }}
      </span>
    </div>
    <p class="overview-summary">
      {{ summaryText }}
    </p>
    <div class="overview-metric">
      <span>{{ t("metricsCenter.metric.uptime") }} {{ uptimeText }}</span>
      <span>{{ t("metricsCenter.metric.buckets") }} {{ bucketText }}</span>
    </div>
    <el-radio-group :model-value="range" class="overview-range" @update:model-value="handleRange">
      <el-radio-button v-for="item in rangeOptions" :key="item.value" :value="item.value">
        {{ item.label }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MetricsOverviewPanel" });

import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { MetricsOverview, MetricsRange } from "@/types";
import { METRICS_RANGE, RANGE_VALUES, formatCount, formatUptime } from "@/pages/super-admin/metrics-center/status";

const props = defineProps<{
  overview: MetricsOverview | null;
  range: MetricsRange;
  isEmpty: boolean;
}>();

const emit = defineEmits<{
  (e: "update:range", value: MetricsRange): void;
  (e: "change", value: MetricsRange): void;
}>();

const { t } = useI18n();

const rangeOptions = computed(() => RANGE_VALUES.map((value) => ({ value, label: t(METRICS_RANGE[value].label) })));

const summaryText = computed(() => {
  const data = props.overview;
  if (!data) return "";
  return t("metricsCenter.summary", {
    range: t(METRICS_RANGE[data.range].label),
    requests: formatCount(data.totals.requests),
    errors: formatCount(data.totals.errors)
  });
});

const uptimeText = computed(() => formatUptime(props.overview?.current.uptimeSec ?? 0));

const bucketText = computed(() => {
  const entry = METRICS_RANGE[props.range];
  return t("metricsCenter.bucketText", { n: entry.buckets, step: t(entry.step) });
});

const handleRange = (value: MetricsRange): void => {
  emit("update:range", value);
  emit("change", value);
};
</script>

<style scoped lang="less">
.metrics-overview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: @space-3;
  padding: @space-3;
  border: 1px solid @color-border-light;
  border-radius: @radius-lg;
}

.overview-status {
  display: flex;
  align-items: center;
  gap: @space-2;
  font-size: 1rem;
  font-weight: 700;
}

.overview-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: @color-info;
}

.overview-status.is-collecting .overview-dot {
  background: @color-success;
}

.overview-status.is-collecting .overview-text {
  color: @color-success-text;
}

.overview-status.is-idle .overview-text {
  color: @color-text-regular;
}

.overview-summary {
  flex: 1;
  min-width: 200px;
  margin: 0;
  padding-left: @space-3;
  border-left: 1px solid @color-border-light;
  font-size: 0.8rem;
  color: @color-text-regular;
}

.overview-metric {
  display: flex;
  gap: @space-4;
  font-size: 0.8rem;
  color: @color-text-regular;
}

.overview-range {
  margin-left: auto;
}

@media (max-width: @screen-sm) {
  .overview-summary {
    flex-basis: 100%;
    padding-left: 0;
    border-left: none;
  }

  .overview-metric {
    flex-wrap: wrap;
    gap: @space-1-5 @space-4;
  }

  .overview-range {
    width: 100%;
    margin-left: 0;
  }
}
</style>
