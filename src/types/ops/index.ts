/**
 * 运维任务 · 数据类型
 * 契约：GET /ops/tasks、POST /ops/tasks/:key/run、POST /ops/reseed
 * 执行结果用 status 表达成败：成功在 data 里返回 success，
 * 失败既可能是 data.status=failed，也可能是 HTTP 504 + code 60006 + 执行记录
 */
export type OpsTaskGroup = "maintenance" | "index" | "backup" | "danger";
export type OpsTaskStatus = "running" | "success" | "failed";

/** 最近一次执行：running 不会写进来，实际只出现 success / failed */
export interface OpsTaskLastRun {
  status: OpsTaskStatus;
  startedAt: string;
  durationMs: number;
  messageKey: string;
  params?: Record<string, string | number>;
}

export interface OpsTaskItem {
  key: string;
  labelKey: string;
  group: OpsTaskGroup;
  danger: boolean;
  descriptionKey: string;
  /** 从未执行过为 null */
  lastRun: OpsTaskLastRun | null;
}

export interface OpsTaskRunResult {
  key: string;
  status: OpsTaskStatus;
  startedAt: string;
  durationMs: number;
  messageKey: string;
  params?: Record<string, string | number>;
}
