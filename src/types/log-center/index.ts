/**
 * 日志中心 · 数据类型
 * 与后端 /api/v1/log-center 契约一一对应：三类日志共用一张表，邮件行带可选字段
 */

/** 日志分类：操作 / 登录 / 邮件 */
export type LogCategory = "operation" | "login" | "mail";

/** 日志结果：成功 / 失败 / 拦截 */
export type LogResult = "success" | "failed" | "blocked";

/** 统计区间：最近 N 个 24 小时，不是自然日 */
export type LogSummaryRange = "24h" | "7d" | "30d";

/** 单条日志 */
export interface LogDto {
  id: number;
  category: LogCategory;
  userId: number | null;
  /** 操作人为空时后端会填系统值，前端直接展示 */
  username: string;
  module: string;
  action: string;
  result: LogResult;
  reason: string | null;
  target: string | null;
  description: string | null;
  ip: string;
  userAgent: string;
  requestId: string | null;
  createdAt: string;
  /* —— 以下仅邮件行返回 —— */
  toEmail?: string | null;
  subject?: string | null;
  template?: string | null;
  messageId?: string | null;
}

/** 统一列表入参：module / action 为精确匹配，username / keyword 为模糊匹配 */
export interface LogListParams {
  page?: number;
  pageSize?: number;
  category?: LogCategory;
  module?: string;
  action?: string;
  result?: LogResult;
  username?: string;
  keyword?: string;
  /** 带时区 ISO；只传 YYYY-MM-DD 会被后端按 UTC 日界处理 */
  from?: string;
  to?: string;
}

/** 统一列表出参：total 为三类命中数之和 */
export interface LogListResult {
  list: LogDto[];
  total: number;
  page: number;
  pageSize: number;
}

/** 概览入参 */
export interface LogSummaryParams {
  range?: LogSummaryRange;
}

/** 概览出参：三状态之和可小于 total（邮件待发、回执计入总数但不进三状态） */
export interface LogSummary {
  range: LogSummaryRange;
  startAt: string;
  operation: number;
  login: number;
  mail: number;
  total: number;
  success: number;
  failed: number;
  blocked: number;
}

/** 清理入参：confirm 缺失与值不正确对应两个不同错误码 */
export interface LogCleanupParams {
  beforeDays?: number;
  confirm: "CLEANUP";
}

/** 清理出参：operationDeleted 含操作与登录两类 */
export interface LogCleanupResult {
  beforeDays: number;
  beforeAt: string;
  operationDeleted: number;
  mailDeleted: number;
}
