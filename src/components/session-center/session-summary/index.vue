<template>
  <div class="session-overview">
    <div class="overview-stat">
      <span class="stat-value">{{ summary?.total ?? 0 }}</span>
      <span>{{ t("sessionCenter.stats.total") }}</span>
    </div>
    <div class="overview-stat is-active">
      <span class="stat-value">{{ summary?.active ?? 0 }}</span>
      <span>{{ t("sessionCenter.stats.active") }}</span>
    </div>
    <div class="overview-stat is-expired">
      <span class="stat-value">{{ summary?.expired ?? 0 }}</span>
      <span>{{ t("sessionCenter.stats.expired") }}</span>
    </div>
    <div class="overview-stat is-revoked">
      <span class="stat-value">{{ summary?.revoked ?? 0 }}</span>
      <span>{{ t("sessionCenter.stats.revoked") }}</span>
    </div>
    <div class="overview-stat">
      <span class="stat-value">{{ summary?.users ?? 0 }}</span>
      <span>{{ t("sessionCenter.stats.users") }}</span>
    </div>
    <span class="overview-tip">{{ t("sessionCenter.statsTip") }}</span>

    <div class="overview-filter">
      <el-select
        :model-value="status"
        class="filter-select"
        :aria-label="t('sessionCenter.columns.status')"
        @update:model-value="handleStatus"
      >
        <el-option
          v-for="option in statusOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-input
        :model-value="keyword"
        class="filter-keyword"
        :placeholder="t('sessionCenter.keyword')"
        clearable
        @update:model-value="handleKeyword"
        @keyup.enter="emit('apply')"
        @clear="emit('apply')"
      />
      <app-button variant="outline" @click="emit('reset')">
        {{ t("sessionCenter.reset") }}
      </app-button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "SessionOverviewPanel" });

import { useI18n } from "vue-i18n";
import type { SessionStatus, SessionSummary } from "@/types";

defineProps<{
  summary: SessionSummary | null;
  status: "all" | SessionStatus;
  keyword: string;
  statusOptions: Array<{ value: "all" | SessionStatus; label: string }>;
}>();

const emit = defineEmits<{
  (e: "update:status", value: "all" | SessionStatus): void;
  (e: "update:keyword", value: string): void;
  (e: "apply"): void;
  (e: "reset"): void;
}>();

const { t } = useI18n();

const handleStatus = (value: "all" | SessionStatus): void => {
  emit("update:status", value);
};

const handleKeyword = (value: string): void => {
  emit("update:keyword", value);
};
</script>

<style scoped lang="less">
.session-overview {
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

.overview-stat.is-active .stat-value {
  color: @color-success-text;
}

.overview-stat.is-expired .stat-value {
  color: @color-warning-text;
}

.overview-tip {
  font-size: 0.75rem;
  color: @color-text-placeholder;
}

.overview-filter {
  display: flex;
  flex-wrap: wrap;
  gap: @space-2;
  margin-left: auto;
}

.filter-select {
  width: 140px;
}

.filter-keyword {
  width: 200px;
}

@media (max-width: @screen-sm) {
  .overview-filter {
    width: 100%;
    margin-left: 0;
  }

  .filter-select,
  .filter-keyword {
    flex: 1 1 140px;
    width: auto;
    min-width: 0;
  }

  .overview-filter .el-button {
    margin-left: auto;
  }
}
</style>
