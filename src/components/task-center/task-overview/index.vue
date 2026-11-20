<template>
  <div class="task-overview">
    <div class="overview-stat">
      <span class="stat-value">{{ stats.total }}</span>
      <span>{{ t("taskCenter.stats.total") }}</span>
    </div>
    <div class="overview-stat is-success">
      <span class="stat-value">{{ stats.success }}</span>
      <span>{{ t("taskCenter.stats.success") }}</span>
    </div>
    <div class="overview-stat is-failed">
      <span class="stat-value">{{ stats.failed }}</span>
      <span>{{ t("taskCenter.stats.failed") }}</span>
    </div>
    <div class="overview-stat">
      <span class="stat-value">{{ stats.idle }}</span>
      <span>{{ t("taskCenter.stats.idle") }}</span>
    </div>
    <span class="overview-tip">{{ t("taskCenter.statsTip") }}</span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "TaskOverview" });

import { useI18n } from "vue-i18n";

defineProps<{
  stats: { total: number; success: number; failed: number; idle: number };
}>();

const { t } = useI18n();
</script>

<style scoped lang="less">
.task-overview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: @space-3;
  padding: @space-3;
  border: 1px solid @color-border-light;
  border-radius: @radius-lg;
}

.overview-stat {
  display: flex;
  align-items: baseline;
  gap: @space-2;
  font-size: 0.8rem;
  color: @color-text-regular;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: @color-text-primary;
  font-variant-numeric: tabular-nums;
}

.overview-stat.is-success .stat-value {
  color: @color-success-text;
}

.overview-stat.is-failed .stat-value {
  color: @color-danger-text;
}

.overview-tip {
  margin-left: auto;
  font-size: 0.75rem;
  color: @color-text-placeholder;
}
</style>
