<template>
  <div v-if="loading && !normalTasks.length && !dangerTask" class="skeleton-grid">
    <div v-for="index in 3" :key="index" class="skeleton" />
  </div>

  <template v-else>
    <div v-if="normalTasks.length" class="task-grid">
      <TaskCard
        v-for="task in normalTasks"
        :key="task.key"
        :task="task"
        :label="t(task.labelKey)"
        :description="t(task.descriptionKey)"
        permission="superAdmin:task:run"
        :running="runningKey === task.key"
        :disabled="Boolean(runningKey)"
        @run="emit('run', task)"
        @detail="emit('detail', task)"
      />
    </div>
    <app-empty v-else :description="t('taskCenter.empty')" />

    <div v-if="dangerTask" class="task-danger">
      <div class="danger-head">
        <span class="danger-title">{{ t("taskCenter.danger.zone") }}</span>
        <span class="danger-tip">{{ t("taskCenter.danger.tip") }}</span>
      </div>
      <TaskCard
        :task="dangerTask"
        :label="t(dangerTask.labelKey)"
        :description="t(dangerTask.descriptionKey)"
        permission="superAdmin:task:danger"
        :running="runningKey === dangerTask.key"
        :disabled="Boolean(runningKey)"
        @run="emit('reseed')"
        @detail="emit('detail', dangerTask)"
      />
      <p class="danger-note">
        {{ t("taskCenter.danger.note") }}
      </p>
    </div>
  </template>
</template>

<script setup lang="ts">
defineOptions({ name: "TaskGrid" });

import { useI18n } from "vue-i18n";
import TaskCard from "@/components/task-card/index.vue";
import type { OpsTaskItem } from "@/types";

defineProps<{
  normalTasks: OpsTaskItem[];
  dangerTask: OpsTaskItem | null;
  runningKey: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "run", task: OpsTaskItem): void;
  (e: "reseed"): void;
  (e: "detail", task: OpsTaskItem): void;
}>();

const { t } = useI18n();
</script>

<style scoped lang="less">
.task-grid,
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: @space-3;
}

.skeleton {
  height: 168px;
  border: 1px solid @color-border-light;
  border-radius: @radius-lg;
  background: @color-border-light;
  opacity: 0.4;
}

.task-danger {
  display: flex;
  flex-direction: column;
  gap: @space-2;
  margin-top: @space-1;
  padding: @space-3;
  border: 2px solid @color-danger;
  border-radius: @radius-lg;
}

.danger-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: @space-2;
}

.danger-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: @color-danger-text;
}

.danger-tip,
.danger-note {
  font-size: 0.75rem;
  color: @color-text-regular;
}

.danger-note {
  margin: 0;
}

@media (max-width: @screen-lg) {
  .task-grid,
  .skeleton-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
