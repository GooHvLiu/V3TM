/** 单项检查状态（与后端 health.model.ts:13 一致） */
export type HealthItemStatus = "ok" | "warn" | "fail" | "skip";

/** 整体健康状态（与后端 health.model.ts:16 一致） */
export type HealthStatus = "up" | "degraded" | "down";

/** 单项检查结果：文案由 i18n 按 key + params 渲染 */
export interface HealthCheckItem {
  key: string;
  labelKey: string;
  status: HealthItemStatus;
  durationMs: number;
  messageKey: string;
  /** 无插值内容时后端返回 {} */
  params?: Record<string, string | number>;
}

/** 一次检查的整体结果 */
export interface HealthReport {
  status: HealthStatus;
  checkedAt: string;
  durationMs: number;
  items: HealthCheckItem[];
}
