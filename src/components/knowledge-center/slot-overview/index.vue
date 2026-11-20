<template>
  <div class="slot-overview">
    <div class="overview">
      <div class="stat">
        <span class="stat-label">{{ t("knowledgeCenter.summary.docs") }}</span>
        <span class="stat-value">{{ slots.summary.docCount }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ t("knowledgeCenter.summary.published") }}</span>
        <span class="stat-value is-success">{{ slots.summary.publishedCount }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ t("knowledgeCenter.summary.empty") }}</span>
        <span class="stat-value">{{ slots.summary.emptyCount }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ t("knowledgeCenter.summary.stale") }}</span>
        <span class="stat-value is-warning">{{ slots.summary.staleCount }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ t("knowledgeCenter.summary.orphan") }}</span>
        <span class="stat-value">{{ slots.summary.orphanCount }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ t("knowledgeCenter.summary.indexed") }}</span>
        <span class="stat-value">{{ slots.index.indexedCount }}</span>
        <app-tag size="small" :type="INDEX_STATE[slots.index.state].tone">
          {{ t(INDEX_STATE[slots.index.state].labelKey) }}
        </app-tag>
      </div>
    </div>

    <app-alert
      v-if="!slots.manifestExists"
      tone="warning"
      :title="t('knowledgeCenter.locale.missing')"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "KnowledgeSlotOverview" });

import { useI18n } from "vue-i18n";
import type { AdminSlotListResult } from "@/types/help/admin";
import { INDEX_STATE } from "@/pages/super-admin/knowledge-center/status";

defineProps<{
  slots: AdminSlotListResult;
}>();

const { t } = useI18n();
</script>

<style scoped lang="less">
.slot-overview {
  display: flex;
  flex-direction: column;
  gap: @space-3;
}

.overview {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: @space-3;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: @space-1-5;
  padding: @space-2-5 @space-3;
  border: 1px solid @color-border-lighter;
  border-radius: @radius-base;
  background: @color-bg-container;
}

.stat-label {
  font-size: 12px;
  color: @color-text-secondary;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  color: @color-text-primary;

  &.is-success {
    color: @color-success;
  }

  &.is-warning {
    color: @color-warning;
  }
}

@media (max-width: @screen-xl) {
  .overview {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: @mobile-max) {
  .overview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
