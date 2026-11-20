import type { OpsTaskItem } from "@/types";

/** 未执行是「没有 lastRun」派生出来的状态，不是后端值 */
export type TaskStatusKey = "success" | "failed" | "idle";

export const TASK_STATUS: Record<TaskStatusKey, { tag: "success" | "danger" | "info"; text: string }> = {
  success: { tag: "success", text: "taskCenter.status.success" },
  failed: { tag: "danger", text: "taskCenter.status.failed" },
  idle: { tag: "info", text: "taskCenter.status.idle" }
};

/** 任务 key → 界面文案由后端 labelKey / descriptionKey 提供，这里只保留状态映射 */
export const statusKeyOf = (task: OpsTaskItem): TaskStatusKey =>
  task.lastRun?.status === "success" ? "success" : task.lastRun?.status === "failed" ? "failed" : "idle";

/** 毫秒 → 展示文本：不足 1 秒用 ms，否则保留两位秒 */
export const formatDuration = (ms: number): string =>
  ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`;

/** 展示文本可能较长，卡片内只取首行 */
export const firstLine = (text: string): string => text.split("\n")[0] ?? text;
