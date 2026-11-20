import type { MetricsRange } from "@/types";

/** range → 文案 key、采样桶数、步长文案；桶数必须与后端一致 */
export const METRICS_RANGE: Record<MetricsRange, { label: string; buckets: number; step: string }> = {
  "1h": { label: "metricsCenter.range.1h", buckets: 61, step: "metricsCenter.step.1m" },
  "6h": { label: "metricsCenter.range.6h", buckets: 73, step: "metricsCenter.step.5m" },
  "24h": { label: "metricsCenter.range.24h", buckets: 97, step: "metricsCenter.step.15m" }
};

export const RANGE_VALUES: MetricsRange[] = ["1h", "6h", "24h"];

/** 错误率分档：错误率只覆盖 HTTP 5xx，不代表业务失败率 */
export const ERROR_RATE_LEVEL = { warning: 0.01, danger: 0.05 } as const;
/** 堆内存水位分档 */
export const MEMORY_LEVEL = { warning: 0.7, danger: 0.85 } as const;

export const errorRateTone = (rate: number): "success" | "warning" | "danger" =>
  rate >= ERROR_RATE_LEVEL.danger ? "danger" : rate >= ERROR_RATE_LEVEL.warning ? "warning" : "success";

export const memoryTone = (ratio: number): "success" | "warning" | "danger" =>
  ratio >= MEMORY_LEVEL.danger ? "danger" : ratio >= MEMORY_LEVEL.warning ? "warning" : "success";

export const formatCount = (value: number): string => value.toLocaleString();

/** 毫秒保留一位小数 */
export const formatMs = (value: number): string => value.toFixed(1);

/** 0~1 → 两位小数百分比 */
export const formatPercent = (ratio: number): string => `${(ratio * 100).toFixed(2)}%`;

/** 进程运行秒数 → 4h 12m / 12m 30s / 45s */
export const formatUptime = (seconds: number): string => {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${rest}s`;
  return `${rest}s`;
};
