/**
 * 通知中心 · Mock
 * 与后端 /api/v1/notification 契约一致：收件箱 / 未读数 / 已读 / 批次聚合 / 群发 / 重试邮件
 * 数据集为内存态，已读与发送会直接改动数组，刷新页面即回到初始种子
 */
import type { AxiosRequestConfig } from "axios";
import type {
  NotificationAudience,
  NotificationBatchDetailResult,
  NotificationBatchItem,
  NotificationBatchListResult,
  NotificationCategory,
  NotificationDto,
  NotificationEmailStatus,
  NotificationListResult,
  NotificationType,
  RetryNotificationEmailResult,
  SendNotificationParams,
  SendNotificationResult
} from "@/types";
import { userList } from "../users";
import { resolveMockUsername } from "../auth";
import { mockError, parseBody } from "../utils";

/** 邮件总开关（对应配置 mail_notify_enabled）：mock 置开，便于看到待发/已发；后端默认为关 */
const MAIL_NOTIFY_ENABLED = true;

/** 相对当前时间的分钟偏移，避免种子数据随日期推移变成"很久以前" */
const NOW = Date.now();
const minutesAgo = (minutes: number): string => new Date(NOW - minutes * 60 * 1000).toISOString();

/** 单个收件人的邮件落点 */
interface SeedRecipient {
  userId: number;
  isRead: 0 | 1;
  emailStatus: NotificationEmailStatus;
  emailError?: string | null;
}

/** 批次种子：明细按收件人逐条生成 */
interface BatchSeed {
  batchId: string;
  title: string;
  content: string;
  category: NotificationCategory;
  type: NotificationType;
  source: string;
  link: string | null;
  createdAt: string;
  recipients: SeedRecipient[];
}

const BATCH_SEEDS: BatchSeed[] = [
  {
    batchId: "batch-20261110-0003",
    title: "知识库支持文件夹改名与删除",
    content:
      "知识库管理已支持文件夹改名与删除，右键文件夹或空白区域即可操作。删除前请确认目录内文档已迁移，删除后不可恢复。",
    category: "business",
    type: "success",
    source: "admin",
    link: "/super-admin/knowledge-center",
    createdAt: minutesAgo(26 * 60),
    recipients: [
      { userId: 1, isRead: 0, emailStatus: "sent" },
      { userId: 3, isRead: 1, emailStatus: "sent" },
      { userId: 4, isRead: 1, emailStatus: "sent" },
      { userId: 6, isRead: 1, emailStatus: "sent" },
      { userId: 7, isRead: 1, emailStatus: "failed", emailError: "MAIL_SEND_FAILED" }
    ]
  },
  {
    batchId: "batch-20261110-0002",
    title: "检测到异地登录，请确认是否为本人操作",
    content:
      "账号于 10 分钟前在新的设备上完成登录。若非本人操作，请立即修改密码并退出全部会话。",
    category: "security",
    type: "warning",
    source: "admin",
    link: null,
    createdAt: minutesAgo(120),
    recipients: [
      { userId: 1, isRead: 1, emailStatus: "none" },
      { userId: 11, isRead: 0, emailStatus: "none" }
    ]
  },
  {
    batchId: "batch-20261110-0001",
    title: "系统将于 11 月 15 日 02:00 停机维护",
    content:
      "为完成数据库扩容，系统将于 11 月 15 日 02:00 至 04:00 停机维护，期间无法登录与提交业务数据，请提前保存工作内容。",
    category: "announcement",
    type: "info",
    source: "admin",
    link: null,
    createdAt: minutesAgo(20),
    recipients: [
      { userId: 1, isRead: 0, emailStatus: "sent" },
      { userId: 11, isRead: 0, emailStatus: "sent" },
      { userId: 2, isRead: 1, emailStatus: "sent" },
      { userId: 3, isRead: 1, emailStatus: "failed", emailError: "MAIL_SEND_FAILED" },
      { userId: 4, isRead: 1, emailStatus: "skipped", emailError: "MAIL_DISABLED" },
      { userId: 6, isRead: 0, emailStatus: "pending" }
    ]
  }
];

/** 收件箱与批次明细共用的一维数据集 */
export const notificationList: NotificationDto[] = [];

let autoId = 1;

/** 逐条写入批次收件人，id 递增保证"批次内按 id 倒序"可用 */
const pushBatch = (seed: BatchSeed): void => {
  seed.recipients.forEach((recipient) => {
    notificationList.push({
      id: autoId++,
      userId: recipient.userId,
      category: seed.category,
      title: seed.title,
      content: seed.content,
      titleKey: null,
      contentKey: null,
      type: seed.type,
      data: {},
      source: seed.source,
      link: seed.link,
      senderId: 1,
      batchId: seed.batchId,
      templateKey: null,
      emailStatus: recipient.emailStatus,
      emailError: recipient.emailError ?? null,
      isRead: recipient.isRead,
      readAt: recipient.isRead === 1 ? seed.createdAt : null,
      createdAt: seed.createdAt
    });
  });
};

// 先铺内置事件，再铺批次：id 顺序与时间顺序保持一致
const builtinSeeds: Array<Omit<NotificationDto, "id" | "titleKey" | "contentKey">> = [
  {
    userId: 1,
    category: "system",
    title: "欢迎使用管理中心",
    content: "账号已开通，可在管理中心维护用户、日志与通知。首次登录请先修改初始密码。",
    type: "info",
    data: {},
    source: "system",
    link: null,
    senderId: null,
    batchId: null,
    templateKey: null,
    emailStatus: "none",
    emailError: null,
    isRead: 1,
    readAt: minutesAgo(5 * 24 * 60),
    createdAt: minutesAgo(5 * 24 * 60)
  },
  {
    userId: 1,
    category: "security",
    title: "登录密码已修改",
    content: "你的登录密码已修改成功。如非本人操作，请立即联系管理员冻结账号。",
    type: "success",
    data: {},
    source: "auth",
    link: null,
    senderId: null,
    batchId: null,
    templateKey: "password_changed",
    emailStatus: "sent",
    emailError: null,
    isRead: 1,
    readAt: minutesAgo(3 * 24 * 60),
    createdAt: minutesAgo(3 * 24 * 60)
  },
  {
    userId: 1,
    category: "business",
    title: "帮助文档《账号安全指引》已更新",
    content: "帮助中心新增账号安全指引，包含密码策略、会话管理与异常登录处置流程。",
    type: "info",
    data: {},
    source: "system",
    link: "/about/help",
    senderId: null,
    batchId: null,
    templateKey: null,
    emailStatus: "none",
    emailError: null,
    isRead: 1,
    readAt: minutesAgo(2 * 24 * 60),
    createdAt: minutesAgo(2 * 24 * 60)
  },
  {
    userId: 11,
    category: "security",
    title: "会话已被强制下线",
    content: "你的账号在其他设备被强制下线，所有已签发的登录凭证立即失效。",
    type: "warning",
    data: {},
    source: "session",
    link: null,
    senderId: null,
    batchId: null,
    templateKey: "session_revoked",
    emailStatus: "none",
    emailError: null,
    isRead: 1,
    readAt: minutesAgo(24 * 60),
    createdAt: minutesAgo(24 * 60)
  },
  {
    userId: 11,
    category: "business",
    title: "新用户注册待审核",
    content: "账号 pendingUser 提交了注册申请，请在用户中心完成审核。",
    type: "info",
    data: {},
    source: "auth",
    link: "/admin-center/user-center",
    senderId: null,
    batchId: null,
    templateKey: "register_pending",
    emailStatus: "none",
    emailError: null,
    isRead: 0,
    readAt: null,
    createdAt: minutesAgo(45)
  },
  {
    userId: 1,
    category: "security",
    title: "会话已被强制下线",
    content: "你的账号在其他设备被强制下线，所有已签发的登录凭证立即失效。",
    type: "warning",
    data: {},
    source: "session",
    link: null,
    senderId: null,
    batchId: null,
    templateKey: "session_revoked",
    emailStatus: "none",
    emailError: null,
    isRead: 0,
    readAt: null,
    createdAt: minutesAgo(30)
  }
];

builtinSeeds.forEach((seed) => notificationList.push({ id: autoId++, titleKey: null, contentKey: null, ...seed }));

// 种子按"从旧到新"排列，id 递增与时间递增保持一致
BATCH_SEEDS.forEach(pushBatch);

/** 当前登录用户（按 token 解析用户名，落在用户表里取 id） */
const currentUserOf = (config: AxiosRequestConfig) => {
  const username = resolveMockUsername(config);
  return userList.find((user) => user.username === username) ?? userList[0];
};

/** 分页切片 */
const slice = <T>(rows: T[], page: number, pageSize: number): T[] =>
  rows.slice((page - 1) * pageSize, page * pageSize);

/** 批次聚合：计数全部由明细现算，保证 readCount + 未读 = recipientCount */
const buildBatches = (): NotificationBatchItem[] => {
  const groups = new Map<string, NotificationDto[]>();
  notificationList.forEach((row) => {
    if (!row.batchId) return;
    const group = groups.get(row.batchId) ?? [];
    group.push(row);
    groups.set(row.batchId, group);
  });

  return [...groups.entries()]
    .map(([batchId, rows]) => {
      const newest = rows.reduce((a, b) => (a.id > b.id ? a : b));
      const countEmail = (status: NotificationEmailStatus): number =>
        rows.filter((row) => row.emailStatus === status).length;
      return {
        batchId,
        title: newest.title,
        category: newest.category,
        type: newest.type,
        source: newest.source,
        recipientCount: rows.length,
        readCount: rows.filter((row) => row.isRead === 1).length,
        emailPending: countEmail("pending"),
        emailSent: countEmail("sent"),
        emailFailed: countEmail("failed"),
        emailSkipped: countEmail("skipped"),
        createdAt: newest.createdAt
      };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
};

/** GET /v1/notification/list：仅返回当前用户的通知 */
export const mockNotificationList = (config: AxiosRequestConfig): NotificationListResult => {
  const current = currentUserOf(config);
  const params = (config.params ?? {}) as Record<string, unknown>;
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);

  let rows = notificationList.filter((row) => row.userId === current.id);
  if (params.isRead !== undefined && params.isRead !== "") {
    const isRead = Number(params.isRead);
    rows = rows.filter((row) => row.isRead === isRead);
  }
  if (params.category) rows = rows.filter((row) => row.category === params.category);
  if (params.type) rows = rows.filter((row) => row.type === params.type);

  rows = rows.slice().sort((a, b) => b.id - a.id);
  return { list: slice(rows, page, pageSize), total: rows.length, page, pageSize };
};

/** GET /v1/notification/unread-count */
export const mockNotificationUnreadCount = (config: AxiosRequestConfig): { count: number } => {
  const current = currentUserOf(config);
  const count = notificationList.filter((row) => row.userId === current.id && row.isRead === 0).length;
  return { count };
};

/** POST /v1/notification/read/:id：幂等，不属于当前用户也返回成功 */
export const mockNotificationRead = (config: AxiosRequestConfig): null => {
  const id = Number(config.params?.id);
  const current = currentUserOf(config);
  const target = notificationList.find((row) => row.id === id && row.userId === current.id);
  if (target && target.isRead === 0) {
    target.isRead = 1;
    target.readAt = new Date().toISOString();
  }
  return null;
};

/** POST /v1/notification/read-all：只动当前用户 */
export const mockNotificationReadAll = (config: AxiosRequestConfig): null => {
  const current = currentUserOf(config);
  const readAt = new Date().toISOString();
  notificationList.forEach((row) => {
    if (row.userId === current.id && row.isRead === 0) {
      row.isRead = 1;
      row.readAt = readAt;
    }
  });
  return null;
};

/** GET /v1/notification/admin/batches */
export const mockNotificationBatches = (config: AxiosRequestConfig): NotificationBatchListResult => {
  const params = (config.params ?? {}) as Record<string, unknown>;
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  const keyword = String(params.keyword ?? "").trim();

  let rows = buildBatches();
  if (params.category) rows = rows.filter((row) => row.category === params.category);
  if (params.type) rows = rows.filter((row) => row.type === params.type);
  if (params.source) rows = rows.filter((row) => row.source === params.source);
  if (keyword) rows = rows.filter((row) => row.title.includes(keyword));

  return { list: slice(rows, page, pageSize), total: rows.length, page, pageSize };
};

/** GET /v1/notification/admin/batches/:batchId */
export const mockNotificationBatchDetail = (config: AxiosRequestConfig): NotificationBatchDetailResult => {
  const batchId = String(config.params?.batchId ?? "");
  const params = (config.params ?? {}) as Record<string, unknown>;
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 20);

  const batch = buildBatches().find((item) => item.batchId === batchId);
  if (!batch) throw mockError(91001, "NOTIFICATION_NOT_FOUND");

  const rows = notificationList
    .filter((row) => row.batchId === batchId)
    .slice()
    .sort((a, b) => b.id - a.id);

  return { batch, list: slice(rows, page, pageSize), total: rows.length, page, pageSize };
};

/** 收件人解析：userIds ∪ roleCodes 命中，再排除超管与停用账号 */
const resolveRecipients = (audience: NotificationAudience) => {
  const active = userList.filter((user) => user.status === 1 && !user.roles.includes("superAdmin"));
  if (audience.type === "all") return active;
  if (audience.type === "role") {
    const codes = audience.roleCodes ?? [];
    return active.filter((user) => user.roles.some((role) => codes.includes(role)));
  }
  const ids = audience.userIds ?? [];
  return active.filter((user) => ids.includes(user.id));
};

/** POST /v1/notification/admin/send */
export const mockSendNotification = (config: AxiosRequestConfig): SendNotificationResult => {
  const body = parseBody<SendNotificationParams>(config);
  const title = (body.title ?? "").trim();
  const content = (body.content ?? "").trim();
  const audience = body.audience;

  if (!title) throw mockError(10003, "PARAM_INVALID", { field: "title" });
  if (title.length > 100) throw mockError(10003, "PARAM_INVALID", { field: "title" });
  if (!content) throw mockError(10003, "PARAM_INVALID", { field: "content" });
  if (content.length > 5000) throw mockError(10003, "PARAM_INVALID", { field: "content" });
  if (!audience || !["all", "role", "user"].includes(audience.type)) {
    throw mockError(10003, "PARAM_INVALID", { field: "audience.type" });
  }
  if (audience.type === "role" && !(audience.roleCodes ?? []).length) {
    throw mockError(91003, "NOTIFICATION_AUDIENCE_INVALID");
  }
  if (audience.type === "user" && !(audience.userIds ?? []).length) {
    throw mockError(91003, "NOTIFICATION_AUDIENCE_INVALID");
  }
  if (body.link && !body.link.startsWith("/") && !body.link.startsWith("http")) {
    throw mockError(10003, "PARAM_INVALID", { field: "link" });
  }

  const recipients = resolveRecipients(audience);
  if (!recipients.length) throw mockError(91002, "NOTIFICATION_RECIPIENT_EMPTY");

  const batchId = `batch-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const category = body.category ?? "system";
  const type = body.type ?? "info";
  let emailQueued = 0;
  let emailSkipped = 0;

  recipients.forEach((user) => {
    let emailStatus: NotificationEmailStatus = "none";
    let emailError: string | null = null;
    if (body.sendEmail) {
      if (!MAIL_NOTIFY_ENABLED) {
        emailStatus = "skipped";
        emailError = "MAIL_DISABLED";
        emailSkipped += 1;
      } else if (!user.email) {
        emailStatus = "skipped";
        emailError = "MAIL_RECIPIENT_EMPTY";
        emailSkipped += 1;
      } else {
        emailStatus = "pending";
        emailQueued += 1;
      }
    }
    notificationList.push({
      id: autoId++,
      userId: user.id,
      category,
      title,
      content,
      titleKey: null,
      contentKey: null,
      type,
      data: {},
      source: "admin",
      link: body.link || null,
      senderId: 1,
      batchId,
      templateKey: null,
      emailStatus,
      emailError,
      isRead: 0,
      readAt: null,
      createdAt
    });
  });

  return { batchId, recipientCount: recipients.length, emailQueued, emailSkipped };
};

/** POST /v1/notification/admin/batches/:batchId/retry-email：只处理 failed */
export const mockRetryNotificationEmails = (config: AxiosRequestConfig): RetryNotificationEmailResult => {
  const batchId = String(config.params?.batchId ?? "");
  const rows = notificationList.filter((row) => row.batchId === batchId);
  if (!rows.length) throw mockError(91001, "NOTIFICATION_NOT_FOUND");

  const failed = rows.filter((row) => row.emailStatus === "failed");
  if (!failed.length) throw mockError(91001, "NOTIFICATION_NOT_FOUND");

  let sent = 0;
  failed.forEach((row) => {
    const user = userList.find((item) => item.id === row.userId);
    if (MAIL_NOTIFY_ENABLED && user?.email) {
      row.emailStatus = "sent";
      row.emailError = null;
      sent += 1;
    } else {
      row.emailStatus = "skipped";
      row.emailError = user?.email ? "MAIL_DISABLED" : "MAIL_RECIPIENT_EMPTY";
    }
  });

  return { retried: failed.length, sent, failed: failed.length - sent };
};
