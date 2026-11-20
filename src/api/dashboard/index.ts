/**
 * 看板 · 接口层
 * 契约：GET 取聚合结果，前端不再二次聚明细
 * 后端端点尚未实现，联调前由 mock 提供同构响应
 */
import { http } from "@/utils/request";
import type { DashboardTrend } from "@/types";

enum API {
  TREND = "/v1/dashboard/trend"
}

/** 近七日操作趋势 */
export function fetchDashboardTrend(): Promise<DashboardTrend> {
  return http.get<DashboardTrend>(API.TREND);
}
