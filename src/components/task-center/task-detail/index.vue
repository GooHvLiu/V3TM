<template>
  <app-dialog
    :model-value="visible"
    :title="t('taskCenter.detailTitle')"
    width="560px"
    @update:model-value="handleVisible"
  >
    <div v-if="task" class="task-detail">
      <div class="detail-head">
        <span class="detail-label">{{ t(task.labelKey) }}</span>
        <app-tag :type="TASK_STATUS[statusKeyOf(task)].tag" size="small" effect="plain">
          {{ t(TASK_STATUS[statusKeyOf(task)].text) }}
        </app-tag>
      </div>
      <div class="detail-meta">
        <span>{{ formatDate(task.lastRun?.startedAt, "YYYY-MM-DD HH:mm:ss") }}</span>
        <span>{{ formatDuration(task.lastRun?.durationMs ?? 0) }}</span>
      </div>
      <!-- 失败原因可能较长，保留换行 -->
      <pre class="detail-message">{{ message }}</pre>
    </div>
    <template #footer>
      <app-button variant="outline" @click="handleVisible(false)">
        {{ t("taskCenter.close") }}
      </app-button>
    </template>
  </app-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: "TaskDetailDialog" });

import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatDate } from "@/utils";
import { translateKey } from "@/utils/i18n-text";
import type { OpsTaskItem } from "@/types";
import { TASK_STATUS, formatDuration, statusKeyOf } from "@/pages/super-admin/task-center/status";

const props = defineProps<{
  visible: boolean;
  task: OpsTaskItem | null;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();

const { t } = useI18n();

const message = computed(() => {
  const lastRun = props.task?.lastRun;
  return lastRun ? translateKey(lastRun.messageKey, lastRun.params) : "";
});

const handleVisible = (value: boolean): void => {
  emit("update:visible", value);
};
</script>

<style scoped lang="less">
.task-detail {
  display: flex;
  flex-direction: column;
  gap: @space-2;
}

.detail-head {
  display: flex;
  align-items: center;
  gap: @space-2;
}

.detail-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: @color-text-primary;
}

.detail-meta {
  display: flex;
  gap: @space-4;
  font-size: 0.78rem;
  color: @color-text-regular;
  font-variant-numeric: tabular-nums;
}

.detail-message {
  margin: 0;
  max-height: 320px;
  padding: @space-3;
  border: 1px solid @color-border-light;
  border-radius: @radius-lg;
  background: @color-bg-page;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.78rem;
  line-height: 1.7;
  color: @color-text-regular;
  white-space: pre-wrap;
  word-break: break-all;
  overflow: auto;
}
</style>
