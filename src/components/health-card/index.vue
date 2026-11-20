<template>
  <div class="health-card" :class="`is-${item.status}`">
    <div class="health-card-head">
      <span class="health-card-label">{{ label }}</span>
      <app-tag :type="statusTag" size="small" effect="plain">{{ statusText }}</app-tag>
    </div>
    <p class="health-card-message" :class="`is-${item.status}`">{{ messageText }}</p>
    <div class="health-card-foot">
      <div class="health-card-bar">
        <span v-if="showBar" class="health-card-bar-inner" :style="{ width: barWidth }" />
      </div>
      <span class="health-card-duration">{{ durationText }}</span>
      <app-button v-permission="'superAdmin:health:probe'" variant="link" size="sm" @click="emit('probe', item.key)">
        {{ t("healthCheck.probeOne") }}
      </app-button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "HealthCard" });

import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { HealthCheckItem } from "@/types";
import { ITEM_STATUS, formatDuration } from "@/pages/super-admin/health-check/status";
import { translateKey } from "@/utils/i18n-text";

const props = defineProps<{ item: HealthCheckItem; label: string; maxDuration: number }>();
const emit = defineEmits<{ probe: [key: string] }>();
const { t } = useI18n();

const statusEntry = computed(() => ITEM_STATUS[props.item.status]);

const statusTag = computed(() => statusEntry.value?.tag ?? "info");

const statusText = computed(() => {
  const entry = statusEntry.value;
  if (!entry) {
    console.warn(`[health-check] 未知的单项状态：${props.item.status}`);
    return String(props.item.status);
  }
  return t(entry.text);
});

// 失败项耗时多为超时阈值，跳过项无耗时，两者都不画条
const showBar = computed(
  () => props.item.status !== "fail" && props.item.status !== "skip" && props.item.durationMs > 0
);

const barWidth = computed(
  () => `${Math.min(100, Math.round((props.item.durationMs / Math.max(props.maxDuration, 1)) * 100))}%`
);

// 结论只给 key，插值参数来自 params
const messageText = computed(() => translateKey(props.item.messageKey, props.item.params));

const durationText = computed(() => formatDuration(props.item.durationMs));
</script>

<style scoped lang="less">
.health-card {
  display: flex;
  flex-direction: column;
  gap: @space-2;
  padding: @space-3;
  border: 1px solid @color-border-light;
  border-left-width: 4px;
  border-radius: @radius-lg;
}
.health-card.is-ok {
  border-left-color: @color-success;
}
.health-card.is-warn {
  border-left-color: @color-warning;
}
.health-card.is-fail {
  border-left-color: @color-danger;
}
.health-card.is-skip {
  border-left-color: @color-info;
}
.health-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: @space-2;
}
.health-card-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: @color-text-primary;
}
.health-card-message {
  margin: 0;
  min-height: 20px;
  font-size: 0.8rem;
  color: @color-text-regular;
}
.health-card-message.is-warn {
  color: @color-warning-text;
}
.health-card-message.is-fail {
  color: @color-danger-text;
}
.health-card-foot {
  display: flex;
  align-items: center;
  gap: @space-2;
  margin-top: auto;
}
.health-card-bar {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: @color-border-light;
  overflow: hidden;
}
.health-card-bar-inner {
  display: block;
  height: 3px;
  background: @color-success;
}
.health-card.is-warn .health-card-bar-inner {
  background: @color-warning;
}
.health-card.is-fail .health-card-bar-inner {
  background: @color-danger;
}
.health-card-duration {
  font-size: 0.75rem;
  color: @color-text-regular;
  font-variant-numeric: tabular-nums;
}
</style>
