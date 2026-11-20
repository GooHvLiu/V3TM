<template>
  <div class="task-card" :class="`is-${statusKey}`">
    <div class="task-card-head">
      <span class="task-card-label">{{ label }}</span>
      <app-tag :type="TASK_STATUS[statusKey].tag" size="small" effect="plain">
        {{ t(TASK_STATUS[statusKey].text) }}
      </app-tag>
    </div>
    <span class="task-card-key">{{ task.key }}</span>
    <p class="task-card-desc">{{ description }}</p>
    <div class="task-card-run">
      <template v-if="task.lastRun">
        <span>{{ formatDate(task.lastRun.startedAt, "MM-DD HH:mm") }}</span>
        <span>{{ formatDuration(task.lastRun.durationMs) }}</span>
      </template>
      <span v-else class="task-card-run-empty">{{ t("taskCenter.lastRun.empty") }}</span>
    </div>
    <p v-if="task.lastRun" class="task-card-message" :class="`is-${statusKey}`">
      {{ messageText }}
    </p>
    <div class="task-card-foot">
      <app-button
        v-permission="permission"
        variant="link"
        :tone="task.danger ? 'danger' : 'primary'"
        :loading="running"
        :disabled="disabled"
        @click="emit('run', task)"
      >
        {{ runText }}
      </app-button>
      <app-button v-if="task.lastRun" variant="link" @click="emit('detail', task)">
        {{ t("taskCenter.detail") }}
      </app-button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "TaskCard" });

import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatDate } from "@/utils";
import { translateKey } from "@/utils/i18n-text";
import type { OpsTaskItem } from "@/types";
import { TASK_STATUS, formatDuration, statusKeyOf, firstLine } from "@/pages/super-admin/task-center/status";

const props = defineProps<{
  task: OpsTaskItem;
  label: string;
  description: string;
  permission: string;
  running: boolean;
  disabled: boolean;
}>();
const emit = defineEmits<{ run: [task: OpsTaskItem]; detail: [task: OpsTaskItem] }>();
const { t } = useI18n();

const statusKey = computed(() => statusKeyOf(props.task));

// 卡片内只放首行，完整内容在详情弹窗里看
const messageText = computed(() => {
  const lastRun = props.task.lastRun;
  return lastRun ? firstLine(translateKey(lastRun.messageKey, lastRun.params)) : "";
});

const runText = computed(() => {
  if (props.running) return t("taskCenter.running");
  return props.task.lastRun ? t("taskCenter.rerun") : t("taskCenter.run");
});
</script>

<style scoped lang="less">
.task-card {
  display: flex;
  flex-direction: column;
  gap: @space-1-5;
  padding: @space-3;
  border: 1px solid @color-border-light;
  border-left-width: 4px;
  border-radius: @radius-lg;
}
.task-card.is-success {
  border-left-color: @color-success;
}
.task-card.is-failed {
  border-left-color: @color-danger;
}
.task-card.is-idle {
  border-left-color: @color-info;
}
.task-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: @space-2;
}
.task-card-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: @color-text-primary;
}
.task-card-key {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.72rem;
  color: @color-text-placeholder;
}
.task-card-desc {
  margin: 0;
  font-size: 0.8rem;
  color: @color-text-regular;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.task-card-run {
  display: flex;
  gap: @space-2-5;
  font-size: 0.72rem;
  color: @color-text-regular;
  font-variant-numeric: tabular-nums;
}
.task-card-run-empty {
  color: @color-text-placeholder;
}
.task-card-message {
  margin: 0;
  font-size: 0.75rem;
  color: @color-text-regular;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.task-card-message.is-failed {
  color: @color-danger;
}
.task-card-foot {
  display: flex;
  align-items: center;
  gap: @space-2;
  margin-top: auto;
  padding-top: @space-0-5;
}
</style>
