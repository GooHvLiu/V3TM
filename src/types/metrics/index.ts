/**
 * 运行指标 · 数据类型
 * 契约：GET /v1/super-admin/metrics/overview?range=1h|6h|24h
 * 口径：每请求结束记一次，1 分钟一桶、最多 1440 桶，进程重启归零
 */
export type MetricsRange = "1h" | "6h" | "24h";

/** 区间汇总：errors 只统计 HTTP >= 500，业务失败（200 + code != 200）不计入 */
export interface MetricsTotals {
  requests: number;
  errors: number;
  /** 0~1，四位小数 */
  errorRate: number;
  /** 区间总耗时 / 请求数，一位小数 */
  avgDurationMs: number;
  /** 每桶最多保留 200 条耗时样本，近似值 */
  p95DurationMs: number;
}

/** 趋势点：ts 为桶起点毫秒时间戳，空桶补 0 保证曲线连续 */
export interface MetricsPoint {
  ts: number;
  requests: number;
  errors: number;
  p95DurationMs: number;
}

export interface MetricsMemory {
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
  /** 0~1，四位小数 */
  heapUsedRatio: number;
}

export interface MetricsOverview {
  range: MetricsRange;
  since: number;
  until: number;
  totals: MetricsTotals;
  current: {
    /** 最近一个分钟桶的请求数 / 耗时，不是严格实时 QPS */
    qps: number;
    /** 进程运行秒数，不是发布时间 */
    uptimeSec: number;
    memory: MetricsMemory;
  };
  series: MetricsPoint[];
}

export interface MetricsResetResult {
  /** 清理前累计请求数 */
  clearedRequests: number;
  resetAt: number;
}
