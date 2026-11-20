<template>
  <BasicPage :title="t(String(route.meta.title))" :description="t('healthCheck.description')">
    <template #actions>
      <app-button :loading="loading" variant="outline" @click="loadAll">{{ t("healthCheck.refresh") }}</app-button>
      <app-button
        v-permission="'superAdmin:health:probe'"
        tone="primary"
        :loading="probing"
        :disabled="!selectedKeys.length"
        @click="probeSelected"
      >
        {{ t("healthCheck.probe") }}
      </app-button>
    </template>

    <template #content>
      <div class="health-check-page">
        <app-alert v-if="errorMsg" :title="errorMsg" tone="danger" />

        <div class="health-overview">
          <div class="health-overview-status" :class="`is-${report?.status ?? 'unknown'}`">
            <span class="health-overview-dot" />
            <span class="health-overview-text">{{ overallText }}</span>
          </div>
          <p class="health-overview-summary">{{ summaryText }}</p>
          <div class="health-overview-metric">
            <span>{{ t("healthCheck.metric.checkedAt") }} {{ checkedAtText }}</span>
            <span>{{ t("healthCheck.metric.duration") }} {{ formatDuration(report?.durationMs ?? 0) }}</span>
          </div>
          <el-select
            v-model="selectedKeys"
            class="health-overview-select"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :placeholder="t('healthCheck.filter')"
            :aria-label="t('healthCheck.filter')"
            :disabled="!allItems.length"
          >
            <el-option v-for="meta in allItems" :key="meta.key" :label="labelOf(meta)" :value="meta.key" />
          </el-select>
        </div>

        <p v-if="hasUnprobed" class="health-overview-tip">{{ t("healthCheck.filterTip") }}</p>
        <p v-if="!selectedKeys.length" class="health-check-page-empty">{{ t("healthCheck.filterEmpty") }}</p>
        <p v-if="partialProbe" class="health-overview-tip">{{ t("healthCheck.partialProbe") }}</p>

        <div v-if="loading && !visibleItems.length" class="health-grid">
          <div v-for="index in 6" :key="index" class="health-card-skeleton" />
        </div>
        <div v-else-if="visibleItems.length" v-loading="probing" class="health-grid">
          <HealthCard
            v-for="item in visibleItems"
            :key="item.key"
            :item="item"
            :label="labelOf(item)"
            :max-duration="maxDuration"
            @probe="probeOne"
          />
        </div>
        <app-empty v-else :description="t('healthCheck.empty')" />
      </div>
    </template>
  </BasicPage>
</template>

<script setup lang="ts">
defineOptions({ name: "HealthCheck" });

import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import BasicPage from "@/components/page/basic/index.vue";
import HealthCard from "@/components/health-card/index.vue";
import { fetchHealthChecks, probeHealth } from "@/api";
import type { HealthCheckItem, HealthReport } from "@/types";
import { OVERALL_STATUS, formatDuration, formatTime } from "./status";

const route = useRoute();
const { t } = useI18n();

const report = ref<HealthReport | null>(null);
// 全量元数据，只用于生成筛选项（接口按 keys 过滤时不会返回未选中项）
const allItems = ref<HealthCheckItem[]>([]);
const selectedKeys = ref<string[]>([]);
const loading = ref(false);
const probing = ref(false);
const errorMsg = ref("");
const partialProbe = ref(false);

/** 标题由后端下发 i18n key，直接按 key 渲染 */
const labelOf = (item: HealthCheckItem): string => t(item.labelKey);

const visibleItems = computed(() =>
  (report.value?.items ?? []).filter((item) => selectedKeys.value.includes(item.key))
);

const hasUnprobed = computed(() =>
  selectedKeys.value.some((key) => !report.value?.items.some((item) => item.key === key))
);

// 归一基数排除 fail / skip：超时阈值会把正常项压成一条线
const maxDuration = computed(() => {
  const list = visibleItems.value.filter((item) => item.status !== "fail" && item.status !== "skip");
  return list.length ? Math.max(...list.map((item) => item.durationMs), 1) : 1;
});

const overallText = computed(() => {
  const status = report.value?.status;
  if (!status) return "";
  const entry = OVERALL_STATUS[status];
  if (!entry) {
    console.warn(`[health-check] 未知的整体状态：${status}`);
    return String(status);
  }
  return t(entry.text);
});

const summaryText = computed(() => {
  const items = visibleItems.value;
  if (!items.length) return "";
  const fail = items.filter((item) => item.status === "fail");
  const warn = items.filter((item) => item.status === "warn");
  const skip = items.filter((item) => item.status === "skip");
  const normal = items.length - fail.length - warn.length - skip.length;

  let text = "";
  if (fail.length) {
    text = t("healthCheck.summary.failed", { label: labelOf(fail[0]), n: normal + warn.length });
  } else if (warn.length) {
    text = t("healthCheck.summary.degraded", { n: warn.length });
  } else {
    text = t("healthCheck.summary.allOk", { n: normal });
  }
  if (skip.length) text += t("healthCheck.summary.skippedSuffix", { n: skip.length });
  return text;
});

const checkedAtText = computed(() => (report.value?.checkedAt ? formatTime(report.value.checkedAt) : ""));

const loadAll = async (): Promise<void> => {
  loading.value = true;
  errorMsg.value = "";
  try {
    const data = await fetchHealthChecks();
    report.value = data;
    allItems.value = data.items.map((item) => ({ ...item }));
    selectedKeys.value = selectedKeys.value.length
      ? selectedKeys.value.filter((key) => data.items.some((item) => item.key === key))
      : data.items.map((item) => item.key);
    partialProbe.value = false;
  } catch {
    // 失败保留上次结果
    errorMsg.value = t("healthCheck.loadFailed");
  } finally {
    loading.value = false;
  }
};

const probeSelected = async (): Promise<void> => {
  if (!selectedKeys.value.length) return;
  probing.value = true;
  errorMsg.value = "";
  try {
    report.value = await probeHealth([...selectedKeys.value]);
    partialProbe.value = false;
  } catch {
    errorMsg.value = t("healthCheck.loadFailed");
  } finally {
    probing.value = false;
  }
};

// 单项重探只替换该卡：返回的 status 仅按单项计算，不能写回总览
const probeOne = async (key: string): Promise<void> => {
  probing.value = true;
  errorMsg.value = "";
  try {
    const data = await probeHealth([key]);
    const item = data.items.find((entry) => entry.key === key);
    const index = report.value?.items.findIndex((entry) => entry.key === key) ?? -1;
    if (item && report.value && index > -1) {
      report.value.items[index] = { ...item };
      partialProbe.value = true;
    }
  } catch {
    errorMsg.value = t("healthCheck.loadFailed");
  } finally {
    probing.value = false;
  }
};

onMounted(loadAll);
</script>

<style scoped lang="less">
.health-check-page {
  display: flex;
  flex-direction: column;
  gap: @space-3;
}
.health-overview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: @space-3;
  padding: @space-3;
  border: 1px solid @color-border-light;
  border-radius: @radius-lg;
}
.health-overview-status {
  display: flex;
  align-items: center;
  gap: @space-2;
  font-size: 1rem;
  font-weight: 700;
}
.health-overview-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: @color-info;
}
.health-overview-status.is-up .health-overview-dot {
  background: @color-success;
}
.health-overview-status.is-up .health-overview-text {
  color: @color-success-text;
}
.health-overview-status.is-degraded .health-overview-dot {
  background: @color-warning;
}
.health-overview-status.is-degraded .health-overview-text {
  color: @color-warning-text;
}
.health-overview-status.is-down .health-overview-dot {
  background: @color-danger;
}
.health-overview-status.is-down .health-overview-text {
  color: @color-danger-text;
}
.health-overview-summary {
  flex: 1;
  min-width: 200px;
  margin: 0;
  padding-left: @space-3;
  border-left: 1px solid @color-border-light;
  font-size: 0.8rem;
  color: @color-text-regular;
}
.health-overview-metric {
  display: flex;
  gap: @space-4;
  font-size: 0.8rem;
  color: @color-text-regular;
}
.health-overview-select {
  width: 220px;
}
.health-overview-tip,
.health-check-page-empty {
  margin: 0;
  font-size: 0.78rem;
  color: @color-text-regular;
}
.health-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: @space-3;
}
.health-card-skeleton {
  height: 108px;
  border: 1px solid @color-border-light;
  border-radius: @radius-lg;
  background: @color-border-light;
  opacity: 0.4;
}
@media (max-width: @screen-lg) {
  .health-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: @screen-sm) {
  .health-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .health-overview-summary {
    flex-basis: 100%;
    padding-left: 0;
    border-left: none;
  }
  .health-overview-metric {
    flex-wrap: wrap;
    gap: @space-1-5 @space-4;
  }
  .health-overview-select {
    width: 100%;
  }
}
</style>
