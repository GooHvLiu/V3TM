/**
 * 运维任务 · Mock 数据
 * 与后端契约一致：固定四项、lastRun 初始为 null、同 key 并发返回 TASK_RUNNING、
 * 危险任务只能走 /reseed 且必须携带 confirm；结果只给 key 与 params
 */
import type { AxiosRequestConfig } from "axios";
import type { OpsTaskItem, OpsTaskLastRun, OpsTaskRunResult } from "@/types";
import { mockError, parseBody } from "../utils";

const TASKS: OpsTaskItem[] = [
  {
    key: "session-cleanup",
    labelKey: "opsTask.sessionCleanup.label",
    group: "maintenance",
    danger: false,
    descriptionKey: "opsTask.sessionCleanup.description",
    lastRun: null
  },
  {
    key: "help-reindex",
    labelKey: "opsTask.helpReindex.label",
    group: "index",
    danger: false,
    descriptionKey: "opsTask.helpReindex.description",
    lastRun: null
  },
  {
    key: "db-backup",
    labelKey: "opsTask.dbBackup.label",
    group: "backup",
    danger: false,
    descriptionKey: "opsTask.dbBackup.description",
    lastRun: null
  },
  {
    key: "db-reseed",
    labelKey: "opsTask.dbReseed.label",
    group: "danger",
    danger: true,
    descriptionKey: "opsTask.dbReseed.description",
    lastRun: null
  }
];

/** 正在执行的任务：用来复现同 key 并发返回 TASK_RUNNING */
const RUNNING = new Set<string>();
const RUN_WINDOW_MS = 800;

/** 需要演示失败分支时改成某个任务 key；null 表示全部成功 */
const FORCE_FAIL_KEY: string | null = null;

const durationOf = (key: string): number =>
  key === "db-reseed" ? 3086 : key === "help-reindex" ? 860 : key === "db-backup" ? 640 : 1180;

/** 成功结论：key + 插值参数 */
const successOf = (key: string): { messageKey: string; params: Record<string, string | number> } => {
  const dict: Record<string, { messageKey: string; params: Record<string, string | number> }> = {
    "session-cleanup": { messageKey: "opsTask.sessionCleanup.success", params: { deleted: 11, beforeDays: 7 } },
    "help-reindex": { messageKey: "opsTask.helpReindex.success", params: { count: 32 } },
    "db-backup": { messageKey: "opsTask.dbBackup.success", params: { file: "v3tm-20261015.db", kept: 7 } },
    "db-reseed": { messageKey: "opsTask.dbReseed.success", params: {} }
  };
  return dict[key] ?? { messageKey: "opsTask.failed", params: { reason: "UNKNOWN_ERROR" } };
};

const recordOf = (result: OpsTaskRunResult): OpsTaskLastRun => ({
  status: result.status,
  startedAt: result.startedAt,
  durationMs: result.durationMs,
  messageKey: result.messageKey,
  params: result.params
});

/** GET /v1/super-admin/ops/tasks */
export const mockOpsTasks = (): { list: OpsTaskItem[] } => ({ list: TASKS });

/** POST /v1/super-admin/ops/tasks/:key/run：成功与失败都是 200，成败看 status */
export const mockOpsTaskRun = (config: AxiosRequestConfig): OpsTaskRunResult => {
  const key = String((config.params as { key?: string } | undefined)?.key ?? "");
  const task = TASKS.find((item) => item.key === key);
  if (!task) throw mockError(60003, "TASK_NOT_FOUND");
  if (task.danger) throw mockError(60008, "TASK_DANGER_ONLY");
  if (RUNNING.has(key)) throw mockError(60004, "TASK_RUNNING");

  RUNNING.add(key);
  setTimeout(() => RUNNING.delete(key), RUN_WINDOW_MS);

  const startedAt = new Date().toISOString();
  const result: OpsTaskRunResult =
    FORCE_FAIL_KEY === key
      ? { key, status: "failed", startedAt, durationMs: 420, messageKey: "opsTask.failed", params: { reason: "BACKUP_FAILED" } }
      : { key, status: "success", startedAt, durationMs: durationOf(key), ...successOf(key) };

  task.lastRun = recordOf(result);
  return result;
};

/** POST /v1/super-admin/ops/reseed：只接受 confirm=RESEED，多传字段判参数非法 */
export const mockOpsReseed = (config: AxiosRequestConfig): OpsTaskRunResult => {
  const body = parseBody<Record<string, unknown>>(config);
  const extras = Object.keys(body).filter((name) => name !== "confirm");
  if (extras.length) throw mockError(10003, "PARAM_INVALID", { field: "body" });
  if (body.confirm !== "RESEED") throw mockError(60005, "TASK_CONFIRM_REQUIRED");

  const startedAt = new Date().toISOString();
  const result: OpsTaskRunResult = {
    key: "db-reseed",
    status: "success",
    startedAt,
    durationMs: 3086,
    ...successOf("db-reseed")
  };

  const task = TASKS.find((item) => item.key === "db-reseed");
  if (task) task.lastRun = recordOf(result);
  return result;
};
