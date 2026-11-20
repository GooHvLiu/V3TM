<template>
  <div v-if="memory" class="metrics-memory">
    <span class="memory-label">{{ t("metricsCenter.memory.label") }}</span>
    <div class="memory-bar">
      <span class="memory-bar-inner" :class="`is-${tone}`" :style="{ width }" />
    </div>
    <span class="memory-value">{{ valueText }}</span>
    <span class="memory-rss">{{ rssText }}</span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MetricsMemoryBar" });

import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { MetricsMemory } from "@/types";
import { formatPercent, memoryTone } from "@/pages/super-admin/metrics-center/status";

const props = defineProps<{
  memory: MetricsMemory | null;
}>();

const { t } = useI18n();

const tone = computed(() => memoryTone(props.memory?.heapUsedRatio ?? 0));

const width = computed(() => `${Math.min(100, Math.round((props.memory?.heapUsedRatio ?? 0) * 100))}%`);

const valueText = computed(() => {
  const memory = props.memory;
  if (!memory) return "";
  return t("metricsCenter.memory.value", {
    used: memory.heapUsedMB.toFixed(1),
    total: memory.heapTotalMB.toFixed(1),
    ratio: formatPercent(memory.heapUsedRatio)
  });
});

const rssText = computed(() =>
  t("metricsCenter.memory.rss", { value: (props.memory?.rssMB ?? 0).toFixed(1) })
);
</script>

<style scoped lang="less">
.metrics-memory {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: @space-3;
  padding: @space-3;
  border: 1px solid @color-border-light;
  border-radius: @radius-lg;
}

.memory-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: @color-text-primary;
}

.memory-bar {
  flex: 1;
  min-width: 160px;
  height: 6px;
  border-radius: 3px;
  background: @color-border-light;
  overflow: hidden;
}

.memory-bar-inner {
  display: block;
  height: 6px;
  background: @color-success;
  transition: width 0.3s;
}

.memory-bar-inner.is-warning {
  background: @color-warning;
}

.memory-bar-inner.is-danger {
  background: @color-danger;
}

.memory-value {
  font-size: 0.78rem;
  color: @color-text-regular;
  font-variant-numeric: tabular-nums;
}

.memory-rss {
  font-size: 0.78rem;
  color: @color-text-placeholder;
  font-variant-numeric: tabular-nums;
}
</style>
