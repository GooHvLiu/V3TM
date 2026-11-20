/**
 * 运行指标 · Mock 数据
 * 与后端口径一致：1 分钟一桶、空桶补 0、errors 只统计 5xx；
 * 采样点数 1h 61 / 6h 73 / 24h 97，与后端分桶规则对齐
 */
import type { AxiosRequestConfig } from "axios";
import type { MetricsOverview, MetricsPoint, MetricsRange, MetricsResetResult } from "@/types";

/** 点数与桶宽：改动后必须同步页面文案里的「N 桶 · 步长」 */
const RANGE_CONFIG: Record<MetricsRange, { buckets: number; stepMs: number }> = {
  "1h": { buckets: 61, stepMs: 60 * 1000 },
  "6h": { buckets: 73, stepMs: 5 * 60 * 1000 },
  "24h": { buckets: 97, stepMs: 15 * 60 * 1000 }
};

const START_AT = Date.now();
/** 本页每次拉取也会被后端计数，这里同步累加，便于观察请求数自增长 */
let pageHits = 0;
/** 重置时刻；之后一分钟内返回全 0，用来验证页面空态 */
let resetAt = 0;
const RESET_EMPTY_MS = 60 * 1000;

/** 固定曲线，不用随机数：保证每次请求图形稳定，便于比对样式 */
const trafficAt = (index: number): { requests: number; errors: number; p95: number } => {
  const wave = Math.sin(index / 7) * 18 + Math.sin(index / 3) * 6;
  const requests = Math.max(0, Math.round(32 + wave));
  const errors = requests > 40 ? Math.round(requests / 12) : 0;
  const p95 = requests ? Math.round(28 + Math.abs(wave)) : 0;
  return { requests, errors, p95 };
};

const buildSeries = (range: MetricsRange): MetricsPoint[] => {
  const { buckets, stepMs } = RANGE_CONFIG[range];
  const until = Math.floor(Date.now() / stepMs) * stepMs;
  const since = until - (buckets - 1) * stepMs;
  const suppressed = resetAt > 0 && Date.now() < resetAt + RESET_EMPTY_MS;

  return Array.from({ length: buckets }, (_, index) => {
    const ts = since + index * stepMs;
    const base = trafficAt(index);
    // 重置之后到下一个整分钟之间不产生新流量，页面走空态分支
    const silent = suppressed || ts < resetAt;
    const requests = silent ? 0 : index === buckets - 1 ? base.requests + pageHits : base.requests;
    return {
      ts,
      requests,
      errors: silent ? 0 : base.errors,
      p95DurationMs: silent || !requests ? 0 : base.p95
    };
  });
};

const summarize = (series: MetricsPoint[]) => {
  const requests = series.reduce((sum, point) => sum + point.requests, 0);
  const errors = series.reduce((sum, point) => sum + point.errors, 0);
  const samples = series.filter((point) => point.requests > 0);
  const p95 = samples.length ? samples.reduce((sum, point) => sum + point.p95DurationMs, 0) / samples.length : 0;
  return {
    requests,
    errors,
    errorRate: requests ? Number((errors / requests).toFixed(4)) : 0,
    avgDurationMs: requests ? Number((p95 * 0.74).toFixed(1)) : 0,
    p95DurationMs: Number(p95.toFixed(1))
  };
};

/** 固定内存水位：接入后端后由进程真实数据替换 */
const MEMORY = {
  heapUsedMB: 19.3,
  heapTotalMB: 32.7,
  rssMB: 94.7,
  heapUsedRatio: Number((19.3 / 32.7).toFixed(4))
};

/** GET /v1/super-admin/metrics/overview：非法 range 回落 1h（tsoa 版会返回 10003） */
export const mockMetricsOverview = (config: AxiosRequestConfig): MetricsOverview => {
  const raw = (config.params as { range?: string } | undefined)?.range;
  const range: MetricsRange = raw === "6h" || raw === "24h" ? raw : "1h";
  const series = buildSeries(range);
  // 请求结束时才计数，本次请求不计入自己
  pageHits += 1;
  return {
    range,
    since: series[0].ts,
    until: series[series.length - 1].ts,
    totals: summarize(series),
    current: {
      qps: Number((series[series.length - 1].requests / 60).toFixed(1)),
      uptimeSec: Math.round((Date.now() - START_AT) / 1000),
      memory: MEMORY
    },
    series
  };
};

/** POST /v1/super-admin/metrics/reset：清空分桶并返回清理前累计请求数 */
export const mockMetricsReset = (): MetricsResetResult => {
  const clearedRequests = summarize(buildSeries("1h")).requests;
  resetAt = Date.now();
  pageHits = 0;
  return { clearedRequests, resetAt };
};
