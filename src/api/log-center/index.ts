/**
 * 日志中心 · 接口
 * 全局日志中心走 /list，我的记录走 /my-list；两者共用同一份 LogListResult
 * 无导出接口，故不提供导出方法
 */
import { http } from "@/utils/request";
import type {
  LogListParams,
  LogListResult,
  LogSummaryParams,
  LogSummary,
  LogCleanupParams,
  LogCleanupResult
} from "@/types";

enum API {
  LIST = "/v1/log-center/list",
  MY_LIST = "/v1/log-center/my-list",
  SUMMARY = "/v1/log-center/summary",
  CLEANUP = "/v1/log-center/cleanup"
}

/** 个人日志入参：范围由服务端取当前登录用户，不允许前端再传 username */
export type MyLogListParams = Omit<LogListParams, "username">;

/** 统一列表：total 为三类命中数之和，已按服务端排序倒序返回 */
export function getLogList(params: LogListParams): Promise<LogListResult> {
  return http.get<LogListResult>(API.LIST, { params });
}

/** 个人日志：仅返回当前登录用户的记录，邮件口径由服务端按通知邮件收敛 */
export function getMyLogList(params: MyLogListParams): Promise<LogListResult> {
  return http.get<LogListResult>(API.MY_LIST, { params });
}

/** 概览统计：区间为最近 N 个 24 小时 */
export function getLogSummary(params: LogSummaryParams = {}): Promise<LogSummary> {
  return http.get<LogSummary>(API.SUMMARY, { params });
}

/** 清理日志：仅超管可用，confirm 必须为 CLEANUP */
export function cleanupLogs(data: LogCleanupParams): Promise<LogCleanupResult> {
  return http.post<LogCleanupResult>(API.CLEANUP, data);
}
