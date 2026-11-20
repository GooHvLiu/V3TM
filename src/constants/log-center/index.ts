/**
 * 日志中心 · 展示常量
 * 枚举 → 文案 key / 标签色的单点映射；已知枚举之外的取值按原值展示
 */
import type { LogCategory, LogResult, LogSummaryRange } from "@/types";

type TagType = "primary" | "success" | "info" | "warning" | "danger";

/** 分类：文案 key + 页签顺序 */
export const LOG_CATEGORY_META: Record<LogCategory, { labelKey: string }> = {
  operation: { labelKey: "logCenter.category.operation" },
  login: { labelKey: "logCenter.category.login" },
  mail: { labelKey: "logCenter.category.mail" }
};

/** 分类页签顺序 */
export const LOG_CATEGORIES: LogCategory[] = ["operation", "login", "mail"];

/** 结果：文案 key + 标签色 */
export const LOG_RESULT_META: Record<LogResult, { labelKey: string; tagType: TagType }> = {
  success: { labelKey: "logCenter.result.success", tagType: "success" },
  failed: { labelKey: "logCenter.result.failed", tagType: "danger" },
  blocked: { labelKey: "logCenter.result.blocked", tagType: "warning" }
};

/** 结果下拉顺序 */
export const LOG_RESULTS: LogResult[] = ["success", "failed", "blocked"];

/** 统计区间：最近 N 个 24 小时 */
export const LOG_RANGES: LogSummaryRange[] = ["24h", "7d", "30d"];

/** 邮件日志只接受这两个动作，其余组合后端直接返回空集 */
export const LOG_MAIL_ACTIONS = ["SEND", "TEST"];

/** 动作常量：下拉顺序与后端枚举一致，区分大小写 */
export const LOG_ACTIONS: string[] = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "REVOKE",
  "CLEANUP",
  "REINDEX",
  "TEST",
  "LOGIN",
  "LOGOUT",
  "RESET_PASSWORD"
];

/** 常见模块：筛选下拉用，未列出的取值按原值展示 */
export const LOG_MODULES: string[] = [
  "auth",
  "user",
  "role",
  "menu",
  "dict",
  "config",
  "mail",
  "notification",
  "notice-center",
  "log-center",
  "session",
  "help",
  "unknown"
];

/** 清理保留天数：配置项取不到时的兜底值，与后端默认一致 */
export const LOG_CLEANUP_DEFAULT_DAYS = 90;

/** 清理确认短语：值必须逐字一致 */
export const LOG_CLEANUP_CONFIRM_TEXT = "CLEANUP";
