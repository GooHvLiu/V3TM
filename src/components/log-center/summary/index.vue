<template>
  <div class="log-summary">
    <div class="log-summary-head">
      <el-radio-group :model-value="range" class="log-summary-range" @change="handleRange">
        <el-radio-button v-for="item in LOG_RANGES" :key="item" :value="item">
          {{ t(`logCenter.summary.range.${item}`) }}
        </el-radio-button>
      </el-radio-group>

      <span class="log-summary-start">
        {{ t("logCenter.summary.startAt", { time: startAtText }) }}
      </span>

      <app-tooltip :content="t('logCenter.summary.rangeTip')">
        <i class="log-summary-help" i-carbon-help />
      </app-tooltip>
    </div>

    <div class="log-summary-grid">
      <div v-for="card in cards" :key="card.key" class="log-summary-card" :class="`is-${card.key}`">
        <span class="log-summary-card-label">{{ card.label }}</span>
        <span class="log-summary-card-value">{{ loading ? "-" : card.value }}</span>
      </div>
    </div>

    <div class="log-summary-status">
      <span class="log-summary-status-item is-success">
        {{ t("logCenter.summary.success") }} {{ loading ? "-" : (summary?.success ?? 0) }}
      </span>
      <span class="log-summary-status-item is-danger">
        {{ t("logCenter.summary.failed") }} {{ loading ? "-" : (summary?.failed ?? 0) }}
      </span>
      <span class="log-summary-status-item is-warning">
        {{ t("logCenter.summary.blocked") }} {{ loading ? "-" : (summary?.blocked ?? 0) }}
      </span>
      <app-tooltip :content="t('logCenter.summary.statusTip')">
        <i class="log-summary-help" i-carbon-help />
      </app-tooltip>
    </div>

    <p v-if="filtered" class="log-summary-filtered">{{ t("logCenter.summary.filteredTip") }}</p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "LogSummary" });

import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatDate } from "@/utils";
import { LOG_RANGES } from "@/constants";
import type { LogSummary, LogSummaryRange } from "@/types";

const props = defineProps<{
  summary: LogSummary | null;
  loading: boolean;
  range: LogSummaryRange;
  /** 非超管账号：概览与列表均已按权限过滤 */
  filtered: boolean;
}>();

const emit = defineEmits<{
  "update:range": [value: LogSummaryRange];
}>();

const { t } = useI18n();

const handleRange = (value: LogSummaryRange): void => emit("update:range", value);

/** 区间起点：后端返回的 startAt 为 ISO 时间 */
const startAtText = computed<string>(() =>
  props.summary?.startAt ? formatDate(props.summary.startAt, "YYYY-MM-DD HH:mm") : "-"
);

const cards = computed(() => [
  { key: "total", label: t("logCenter.summary.total"), value: props.summary?.total ?? 0 },
  { key: "operation", label: t("logCenter.summary.operation"), value: props.summary?.operation ?? 0 },
  { key: "login", label: t("logCenter.summary.login"), value: props.summary?.login ?? 0 },
  { key: "mail", label: t("logCenter.summary.mail"), value: props.summary?.mail ?? 0 }
]);
</script>

<style scoped lang="less">
.log-summary {
  display: flex;
  flex-direction: column;
  gap: @space-2-5;
  padding: @space-3 @space-3;
  border: 1px solid @color-border-light;
  border-radius: @radius-lg;
  background: @color-bg-hover;
}

.log-summary-head {
  display: flex;
  align-items: center;
  gap: @space-2-5;
  flex-wrap: wrap;
}

.log-summary-start {
  font-size: 12px;
  color: @color-text-secondary;
}

.log-summary-help {
  font-size: 15px;
  color: @color-text-placeholder;
  cursor: help;
}

.log-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: @space-2-5;
}

@media (max-width: @mobile-max) {
  .log-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .log-summary-status {
    flex-wrap: wrap;
    gap: @space-2;
  }
}

.log-summary-card {
  display: flex;
  flex-direction: column;
  gap: @space-1;
  padding: @space-2-5 @space-3;
  border: 1px solid @color-border;
  border-radius: @radius-lg;
  background: @color-bg-container;

  &.is-total {
    border-color: @color-primary-light;
  }
}

.log-summary-card-label {
  font-size: 12px;
  color: @color-text-secondary;
}

.log-summary-card-value {
  font-size: 20px;
  font-weight: 600;
  color: @color-text-primary;
}

.log-summary-status {
  display: flex;
  align-items: center;
  gap: @space-4;
  font-size: 13px;
}

.log-summary-status-item {
  &.is-success {
    color: @color-success;
  }

  &.is-danger {
    color: @color-danger;
  }

  &.is-warning {
    color: @color-warning;
  }
}

.log-summary-filtered {
  margin: 0;
  font-size: 12px;
  color: @color-text-secondary;
}
</style>
