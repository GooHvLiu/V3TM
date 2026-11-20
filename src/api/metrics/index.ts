/**
 * 运行指标 · 接口层
 * 权限码：superAdmin:metricsCenter:list（概览）、superAdmin:metrics:reset（重置）
 * 约定：POST 带空对象，后端不接受定义之外的字段
 */
import { http } from "@/utils/request";
import type { MetricsOverview, MetricsRange, MetricsResetResult } from "@/types";

enum API {
  OVERVIEW = "/v1/super-admin/metrics/overview",
  RESET = "/v1/super-admin/metrics/reset"
}

/** 概览：range 只传三个合法值，非法值会被判参数错误 */
export function fetchMetricsOverview(range: MetricsRange): Promise<MetricsOverview> {
  return http.get<MetricsOverview>(API.OVERVIEW, { params: { range } });
}

/** 重置计数：只清内存分桶，不传业务字段 */
export function resetMetrics(): Promise<MetricsResetResult> {
  return http.post<MetricsResetResult>(API.RESET, {});
}
