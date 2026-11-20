/**
 * 日志中心 · Mock
 * 与后端 /api/v1/log-center 契约一致：全局 / 个人列表、概览统计、清理
 * 邮件行额外保存内部 status，仅用于命中筛选口径，对外返回时剔除
 */
import type { AxiosRequestConfig } from "axios";
import type {
  LogCleanupResult,
  LogDto,
  LogListResult,
  LogSummary,
  LogSummaryRange
} from "@/types";
import { userList } from "../users";
import { resolveMockUsername } from "../auth";
import { mockError, parseBody } from "../utils";

/** 邮件发送状态：sent/failed/skipped/pending/received，列表只展示映射后的 result */
type MockMailStatus = "sent" | "failed" | "skipped" | "pending" | "received";

interface MockLog extends LogDto {
  mailStatus?: MockMailStatus;
}

/** 相对当前时间的分钟偏移 */
const NOW = Date.now();
const minutesAgo = (minutes: number): string => new Date(NOW - minutes * 60 * 1000).toISOString();
const hoursAgo = (hours: number): string => minutesAgo(hours * 60);
const daysAgo = (days: number): string => hoursAgo(days * 24);

let autoId = 1;

const OPERATE_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36";
const MAIL_AGENT = "MailService/1.0";

/** 操作行：只记录写操作，module 取路径第 3 段，target 取末段 */
const operation = (
  createdAt: string,
  username: string,
  module: string,
  action: string,
  result: LogDto["result"],
  detail: { target: string; description: string; reason?: string; ip?: string; userId?: number | null }
): MockLog => ({
  id: autoId++,
  category: "operation",
  userId: detail.userId ?? null,
  username,
  module,
  action,
  result,
  reason: detail.reason ?? null,
  target: detail.target,
  description: detail.description,
  ip: detail.ip ?? "198.51.100.36",
  userAgent: OPERATE_AGENT,
  requestId: `req-${autoId}-op`,
  createdAt
});

/** 登录行 */
const login = (
  createdAt: string,
  username: string,
  result: LogDto["result"],
  reason: string | null,
  ip: string,
  userId: number | null
): MockLog => ({
  id: autoId++,
  category: "login",
  userId,
  username,
  module: "auth",
  action: "LOGIN",
  result,
  reason,
  target: null,
  description: result === "success" ? "账号登录成功" : "账号登录失败",
  ip,
  userAgent: OPERATE_AGENT,
  requestId: `req-${autoId}-login`,
  createdAt
});

/** 邮件行：操作人固定"邮件服务"，module 固定 mail */
const mail = (
  createdAt: string,
  action: "SEND" | "TEST",
  status: MockMailStatus,
  toEmail: string,
  subject: string,
  template: string
): MockLog => ({
  id: autoId++,
  category: "mail",
  userId: null,
  username: "邮件服务",
  module: "mail",
  action,
  result: status === "sent" ? "success" : status === "failed" ? "failed" : "blocked",
  reason: status === "failed" ? "MAIL_SEND_FAILED" : null,
  target: toEmail,
  description: subject,
  ip: "127.0.0.1",
  userAgent: MAIL_AGENT,
  requestId: `req-${autoId}-mail`,
  createdAt,
  toEmail,
  subject,
  template,
  messageId: `<${autoId}.20261110@smtp.example.com>`,
  mailStatus: status
});

/** 日志数据集：按 id 递增即时间递增，列表倒序后最新的在最前 */
export const logList: MockLog[] = [
  // ———— 30 天前，落在 30d 统计之外 ————
  login(daysAgo(28), "admin", "success", null, "198.51.100.36", 1),
  operation(daysAgo(27), "admin", "user", "UPDATE", "success", {
    target: "12",
    description: "PUT /v1/user/12",
    userId: 1
  }),
  mail(daysAgo(26), "SEND", "sent", "wangfang@example.com", "系统维护通知", "notify_announcement"),
  operation(daysAgo(25), "admin", "dict", "DELETE", "success", {
    target: "9",
    description: "DELETE /v1/dict/9",
    userId: 1
  }),
  login(daysAgo(24), "zhangjian", "success", null, "203.0.113.18", 2),

  // ———— 30 天区间内 ————
  operation(daysAgo(20), "admin", "menu", "UPDATE", "success", {
    target: "66",
    description: "PUT /v1/menu/66",
    userId: 1
  }),
  operation(daysAgo(18), "admin", "config", "UPDATE", "blocked", {
    target: "mail_notify_enabled",
    description: "PUT /v1/config/mail_notify_enabled",
    reason: "PERMISSION_DENIED",
    userId: 1
  }),
  login(daysAgo(16), "liuyang", "failed", "USER_PASSWORD_ERROR", "203.0.113.31", 3),
  mail(daysAgo(15), "SEND", "failed", "liuyang@example.com", "账号安全提醒", "notify_security"),
  operation(daysAgo(14), "admin", "role", "UPDATE", "success", {
    target: "3",
    description: "PUT /v1/role/3",
    userId: 1
  }),
  operation(daysAgo(12), "admin", "help", "UPDATE", "success", {
    target: "zh-cn",
    description: "PUT /v1/help/admin/locales/zh-cn",
    userId: 1
  }),
  login(daysAgo(10), "superAdmin", "success", null, "198.51.100.12", 11),
  mail(daysAgo(9), "SEND", "skipped", "zhaomin@example.com", "会话已失效提醒", "notify_security"),
  operation(daysAgo(8), "superAdmin", "dict", "CREATE", "success", {
    target: "dict_item",
    description: "POST /v1/dict/item",
    userId: 11
  }),
  login(daysAgo(7), "chenhao", "blocked", "USER_DISABLED", "203.0.113.55", 6),
  operation(daysAgo(6), "admin", "user", "APPROVE", "success", {
    target: "13",
    description: "POST /v1/user/13/approve",
    userId: 1
  }),
  mail(daysAgo(5), "TEST", "sent", "admin@example.com", "邮件服务连通性测试", "notify_system"),
  operation(daysAgo(4), "admin", "notification", "CREATE", "success", {
    target: "send",
    description: "POST /v1/notification/admin/send",
    userId: 1
  }),

  // ———— 7 天区间内 ————
  login(daysAgo(3), "wangfang", "success", null, "203.0.113.77", 4),
  operation(daysAgo(3), "admin", "session", "REVOKE", "success", {
    target: "1042",
    description: "POST /v1/session/1042/revoke",
    userId: 1
  }),
  mail(daysAgo(2), "SEND", "pending", "chenhao@example.com", "系统将于 11 月 15 日停机维护", "notify_announcement"),
  operation(daysAgo(2), "admin", "log-center", "CLEANUP", "success", {
    target: "cleanup",
    description: "POST /v1/log-center/cleanup",
    userId: 1
  }),
  operation(daysAgo(1), "admin", "menu", "CREATE", "failed", {
    target: "menu",
    description: "POST /v1/menu",
    reason: "MENU_PERMISSION_EXIST",
    userId: 1
  }),
  login(daysAgo(1), "newUserNotLogin", "failed", "USER_NOT_EXIST", "203.0.113.90", null),
  mail(daysAgo(1), "SEND", "received", "zhangjian@example.com", "帮助文档已更新", "notify_business"),
  operation(hoursAgo(20), "admin", "notice-center", "UPDATE", "success", {
    target: "2036",
    description: "PUT /v1/menu/2036",
    userId: 1
  }),

  // ———— 24 小时区间内 ————
  login(hoursAgo(18), "zhaomin", "blocked", "USER_PENDING_APPROVAL", "203.0.113.66", 5),
  operation(hoursAgo(16), "admin", "role", "UPDATE", "success", {
    target: "2",
    description: "PUT /v1/role/2",
    userId: 1
  }),
  mail(hoursAgo(12), "SEND", "sent", "admin@example.com", "知识库支持文件夹改名与删除", "notify_business"),
  operation(hoursAgo(10), "superAdmin", "log-center", "CLEANUP", "success", {
    target: "cleanup",
    description: "POST /v1/log-center/cleanup",
    userId: 11
  }),
  login(hoursAgo(9), "superAdmin", "failed", "ACCOUNT_LOCKED", "198.51.100.12", 11),
  operation(hoursAgo(8), "admin", "notification", "CREATE", "blocked", {
    target: "send",
    description: "POST /v1/notification/admin/send",
    reason: "PERMISSION_DENIED",
    userId: 1
  }),
  operation(hoursAgo(6), "admin", "user", "RESET_PASSWORD", "success", {
    target: "7",
    description: "POST /v1/user/7/reset-password",
    userId: 1
  }),
  mail(hoursAgo(4), "SEND", "failed", "sunli@example.com", "登录密码已修改", "notify_security"),
  login(hoursAgo(3), "admin", "success", null, "198.51.100.36", 1),
  operation(hoursAgo(2), "admin", "menu", "REINDEX", "success", {
    target: "reindex",
    description: "POST /v1/menu/reindex",
    userId: 1
  }),
  mail(hoursAgo(1), "TEST", "sent", "admin@example.com", "邮件服务连通性测试", "notify_system"),
  login(minutesAgo(30), "zhangjian", "success", null, "203.0.113.18", 2),
  operation(minutesAgo(12), "admin", "notice-center", "CREATE", "success", {
    target: "2037",
    description: "POST /v1/menu",
    userId: 1
  })
];

/** 对外剔除内部字段 */
const publicOf = (row: MockLog): LogDto => {
  const rest: MockLog = { ...row };
  delete rest.mailStatus;
  return rest;
};

/** 当前登录身份是否为超管：非超管看不到超管的操作与超管收件人的邮件 */
const isSuperViewer = (config: AxiosRequestConfig): boolean => {
  const username = resolveMockUsername(config);
  return userList.find((user) => user.username === username)?.roles.includes("superAdmin") ?? false;
};

/** 超管邮箱集合：用于过滤邮件行可见性 */
const superAdminEmails = (): string[] =>
  userList.filter((user) => user.roles.includes("superAdmin") && user.email).map((user) => String(user.email));

const toTime = (value: string | undefined): number => (value ? new Date(value).getTime() : Number.NaN);

interface MockLogScope {
  userId: number;
  email: string;
}

/** GET /v1/log-center/list：scope 存在时按个人范围收敛，供 /my-list 复用 */
const queryLogList = (config: AxiosRequestConfig, scope?: MockLogScope): LogListResult => {
  const params = (config.params ?? {}) as Record<string, unknown>;
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 20);
  const category = String(params.category ?? "");
  const module = String(params.module ?? "").trim();
  const action = String(params.action ?? "").trim();
  const result = String(params.result ?? "");
  const username = scope ? "" : String(params.username ?? "").trim();
  const keyword = String(params.keyword ?? "").trim();
  const from = toTime(params.from as string | undefined);
  const to = toTime(params.to as string | undefined);

  let rows = scope
    ? logList.filter((row) => {
        if (row.category === "mail") {
          if (!String(row.template ?? "").startsWith("notify_")) return false;
          return row.userId === scope.userId || String(row.toEmail ?? "") === scope.email;
        }
        return row.userId === scope.userId;
      })
    : logList.slice();

  // 非超管：操作/登录排除超管，邮件排除超管收件人
  if (!scope && !isSuperViewer(config)) {
    const superEmails = superAdminEmails();
    rows = rows.filter((row) => {
      if (row.category === "mail") return !superEmails.includes(String(row.toEmail ?? ""));
      return row.username !== "superAdmin";
    });
  }

  // 邮件页签的硬约束：module 非 mail、动作为 SEND/TEST 之外、带 username 都是空集
  if (category === "mail") {
    if (module && module !== "mail") return { list: [], total: 0, page, pageSize };
    if (action && !["SEND", "TEST"].includes(action)) return { list: [], total: 0, page, pageSize };
    if (username) return { list: [], total: 0, page, pageSize };
  }

  if (category) rows = rows.filter((row) => row.category === category);
  if (module) rows = rows.filter((row) => row.module === module);
  if (action) rows = rows.filter((row) => row.action === action);
  if (result) rows = rows.filter((row) => row.result === result);
  if (username) rows = rows.filter((row) => row.username.includes(username));
  if (!Number.isNaN(from)) rows = rows.filter((row) => new Date(row.createdAt).getTime() >= from);
  if (!Number.isNaN(to)) rows = rows.filter((row) => new Date(row.createdAt).getTime() <= to);
  if (keyword) {
    rows = rows.filter((row) => {
      const fields =
        row.category === "mail"
          ? [row.subject, row.toEmail, row.template]
          : [row.module, row.action, row.username, row.target, row.description, row.reason];
      return fields.some((field) => String(field ?? "").includes(keyword));
    });
  }

  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return {
    list: rows.slice((page - 1) * pageSize, page * pageSize).map(publicOf),
    total: rows.length,
    page,
    pageSize
  };
};

/** GET /v1/log-center/list：全局日志中心 */
export const mockLogList = (config: AxiosRequestConfig): LogListResult => queryLogList(config);

/** GET /v1/log-center/my-list：个人范围，服务端按当前登录用户过滤 */
export const mockMyLogList = (config: AxiosRequestConfig): LogListResult => {
  const current = userList.find((user) => user.username === resolveMockUsername(config));
  if (!current) throw mockError(20001, "USER_NOT_EXIST");
  return queryLogList(config, { userId: current.id, email: String(current.email ?? "") });
};

/** 区间起点：最近 N 个 24 小时 */
const rangeStart = (range: LogSummaryRange): string => {
  const span = range === "7d" ? 7 : range === "30d" ? 30 : 1;
  return new Date(NOW - span * 24 * 60 * 60 * 1000).toISOString();
};

/** GET /v1/log-center/summary */
export const mockLogSummary = (config: AxiosRequestConfig): LogSummary => {
  const params = (config.params ?? {}) as Record<string, unknown>;
  const range = (params.range as LogSummaryRange) || "24h";
  const startAt = rangeStart(range);

  let rows = logList.filter((row) => new Date(row.createdAt).getTime() >= new Date(startAt).getTime());
  if (!isSuperViewer(config)) {
    const superEmails = superAdminEmails();
    rows = rows.filter((row) => {
      if (row.category === "mail") return !superEmails.includes(String(row.toEmail ?? ""));
      return row.username !== "superAdmin";
    });
  }

  const operation = rows.filter((row) => row.category === "operation").length;
  const loginCount = rows.filter((row) => row.category === "login").length;
  const mailCount = rows.filter((row) => row.category === "mail").length;

  return {
    range,
    startAt,
    operation,
    login: loginCount,
    mail: mailCount,
    total: operation + loginCount + mailCount,
    success: rows.filter((row) => row.result === "success").length,
    failed: rows.filter((row) => row.result === "failed").length,
    blocked: rows.filter((row) => row.result === "blocked").length
  };
};

/** POST /v1/log-center/cleanup：confirm 缺失与值不正确对应不同错误码 */
export const mockLogCleanup = (config: AxiosRequestConfig): LogCleanupResult => {
  const body = parseBody<{ beforeDays?: number; confirm?: string }>(config);
  if (body.confirm === undefined || body.confirm === null || (body.confirm as string) === "") {
    throw mockError(10003, "PARAM_INVALID", { field: "confirm" });
  }
  if (body.confirm !== "CLEANUP") throw mockError(92001, "LOG_CLEANUP_CONFIRM_REQUIRED");

  const beforeDays = Number(body.beforeDays ?? 90);
  if (!Number.isInteger(beforeDays) || beforeDays < 1 || beforeDays > 3650) {
    throw mockError(10003, "PARAM_INVALID", { field: "beforeDays" });
  }

  const beforeAt = new Date(NOW - beforeDays * 24 * 60 * 60 * 1000).toISOString();
  const deadline = new Date(beforeAt).getTime();

  let operationDeleted = 0;
  let mailDeleted = 0;
  for (let index = logList.length - 1; index >= 0; index -= 1) {
    const row = logList[index];
    if (new Date(row.createdAt).getTime() >= deadline) continue;
    if (row.category === "mail") mailDeleted += 1;
    else operationDeleted += 1;
    logList.splice(index, 1);
  }

  return { beforeDays, beforeAt, operationDeleted, mailDeleted };
};
