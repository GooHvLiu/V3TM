<template>
  <BasicPage :title="t(String(route.meta.title))" :description="t('taskCenter.description')">
    <template #actions>
      <app-button :loading="loading" variant="outline" @click="loadTasks">
        {{ t("taskCenter.refresh") }}
      </app-button>
    </template>

    <template #content>
      <div class="task-center-page">
        <app-alert v-if="errorMsg" :title="errorMsg" tone="danger" />

        <TaskOverview :stats="stats" />

        <TaskGrid
          :normal-tasks="normalTasks"
          :danger-task="dangerTask"
          :running-key="runningKey"
          :loading="loading"
          @run="handleRun"
          @reseed="handleReseed"
          @detail="openDetail"
        />
      </div>

      <TaskDetailDialog v-model:visible="detailVisible" :task="detailTask" />
    </template>
  </BasicPage>
</template>

<script setup lang="ts">
defineOptions({ name: "TaskCenter" });

import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import BasicPage from "@/components/page/basic/index.vue";
import TaskOverview from "@/components/task-center/task-overview/index.vue";
import TaskGrid from "@/components/task-center/task-grid/index.vue";
import TaskDetailDialog from "@/components/task-center/task-detail/index.vue";
import { translateKey } from "@/utils/i18n-text";
import { fetchOpsTasks, runOpsTask, reseed } from "@/api";
import type { OpsTaskItem, OpsTaskRunResult, PublicRequestError } from "@/types";

const route = useRoute();
const { t } = useI18n();

const tasks = ref<OpsTaskItem[]>([]);
const loading = ref(false);
const errorMsg = ref("");
/** 同一时刻只允许一个任务在跑，按钮据此统一禁用 */
const runningKey = ref("");

const normalTasks = computed(() => tasks.value.filter((task) => task.group !== "danger"));
const dangerTask = computed(() => tasks.value.find((task) => task.group === "danger") ?? null);

const stats = computed(() => {
  const total = tasks.value.length;
  const success = tasks.value.filter((task) => task.lastRun?.status === "success").length;
  const failed = tasks.value.filter((task) => task.lastRun?.status === "failed").length;
  return { total, success, failed, idle: total - success - failed };
});

const loadTasks = async (): Promise<void> => {
  loading.value = true;
  try {
    const data = await fetchOpsTasks();
    tasks.value = data.list;
    errorMsg.value = "";
  } catch {
    errorMsg.value = t("taskCenter.loadFailed");
  } finally {
    loading.value = false;
  }
};

/** 失败任务同样是 code 200，成败必须看 data.status */
const notifyResult = (data: OpsTaskRunResult): void => {
  const text = translateKey(data.messageKey, data.params);
  if (data.status === "failed") {
    ElMessage.error(text);
    return;
  }
  ElMessage.success(text);
};

const handleRunFailure = (error: unknown): void => {
  // 失败也走 200 是当前后端行为；保留 504 + data 的分支，兼容按 HTTP 语义返回的部署
  const failed = error as PublicRequestError;
  if (failed?.code === 60006 && failed.data) notifyResult(failed.data as OpsTaskRunResult);
};

const handleRun = async (task: OpsTaskItem): Promise<void> => {
  if (runningKey.value) return;
  runningKey.value = task.key;
  try {
    const data = await runOpsTask(task.key);
    notifyResult(data);
    await loadTasks();
  } catch (error) {
    handleRunFailure(error);
  } finally {
    runningKey.value = "";
  }
};

const handleReseed = async (): Promise<void> => {
  if (runningKey.value || !dangerTask.value) return;

  try {
    await ElMessageBox.prompt(t("taskCenter.danger.prompt"), t("taskCenter.danger.title"), {
      inputPlaceholder: "RESEED",
      confirmButtonText: t("taskCenter.run"),
      cancelButtonText: t("common.cancel"),
      type: "warning",
      // 区分大小写，输错不允许提交
      inputValidator: (value: string) => value === "RESEED" || t("taskCenter.danger.wrong")
    });
  } catch {
    return;
  }

  runningKey.value = dangerTask.value.key;
  try {
    const data = await reseed();
    notifyResult(data);
    await loadTasks();
  } catch (error) {
    handleRunFailure(error);
  } finally {
    runningKey.value = "";
  }
};

const detailVisible = ref(false);
const detailTask = ref<OpsTaskItem | null>(null);

const openDetail = (task: OpsTaskItem): void => {
  detailTask.value = task;
  detailVisible.value = true;
};

onMounted(loadTasks);
</script>

<style scoped lang="less">
.task-center-page {
  display: flex;
  flex-direction: column;
  gap: @space-3;
}
</style>
