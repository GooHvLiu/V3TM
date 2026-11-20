/**
 * 通知中心 · 数据类型
 * 与后端 /api/v1/notification 契约一一对应：字段名、枚举值不做改写
 */

/** 通知分类：system 系统 / security 安全 / business 业务 / announcement 公告 */
export type NotificationCategory = "system" | "security" | "business" | "announcement";

/** 通知级别：info / success / warning / error */
export type NotificationType = "info" | "success" | "warning" | "error";

/** 邮件投递状态：未申请 / 待发 / 已发 / 失败 / 跳过 */
export type NotificationEmailStatus = "none" | "pending" | "sent" | "failed" | "skipped";

/** 已读标记：后端返回数字 0/1 */
export type NotificationReadFlag = 0 | 1;

/** 受众类型：全部用户 / 按角色 / 按用户 */
export type NotificationAudienceType = "all" | "role" | "user";

/** 单条通知（收件箱与批次明细同构） */
export interface NotificationDto {
  id: number;
  userId: number;
  category: NotificationCategory;
  /** 手写标题；系统通知为空串，改用 titleKey 渲染 */
  title: string;
  /** 手写正文；系统通知为空串，改用 contentKey 渲染 */
  content: string;
  /** 系统通知标题 key；管理员手写通知为 null */
  titleKey: string | null;
  /** 系统通知正文 key；管理员手写通知为 null */
  contentKey: string | null;
  type: NotificationType;
  /** 系统通知的插值参数，手写通知为空对象 */
  data: Record<string, unknown> | null;
  /** 来源：admin / auth / user / session / system 等 */
  source: string;
  /** 站内跳转：仅 http(s) 或 / 开头，空则不渲染入口 */
  link: string | null;
  senderId: number | null;
  batchId: string | null;
  templateKey: string | null;
  emailStatus: NotificationEmailStatus;
  emailError: string | null;
  isRead: NotificationReadFlag;
  readAt: string | null;
  createdAt: string;
}

/** 我的通知列表入参：接口不支持关键字，只有分类 / 级别 / 已读 */
export interface NotificationListParams {
  page?: number;
  pageSize?: number;
  isRead?: NotificationReadFlag;
  category?: NotificationCategory;
  type?: NotificationType;
}

/** 我的通知列表出参 */
export interface NotificationListResult {
  list: NotificationDto[];
  total: number;
  page: number;
  pageSize: number;
}

/** 未读数出参：不要拉全量自己算 */
export interface NotificationUnreadResult {
  count: number;
}

/** 受众选择 */
export interface NotificationAudience {
  type: NotificationAudienceType;
  /** type=role 时至少 1 个，提交角色编码 */
  roleCodes?: string[];
  /** type=user 时至少 1 个，提交用户 id */
  userIds?: number[];
}

/** 发送通知入参 */
export interface SendNotificationParams {
  title: string;
  content: string;
  category?: NotificationCategory;
  type?: NotificationType;
  audience: NotificationAudience;
  link?: string;
  sendEmail?: boolean;
}

/** 发送结果：邮件为异步排队，字段只代表已入队数量 */
export interface SendNotificationResult {
  batchId: string;
  recipientCount: number;
  emailQueued: number;
  emailSkipped: number;
}

/** 批次聚合：一条记录代表一次群发 */
export interface NotificationBatchItem {
  batchId: string;
  title: string;
  category: NotificationCategory;
  type: NotificationType;
  source: string;
  recipientCount: number;
  readCount: number;
  emailPending: number;
  emailSent: number;
  emailFailed: number;
  emailSkipped: number;
  createdAt: string;
}

/** 发送记录入参：keyword 只搜标题 */
export interface NotificationBatchQueryParams {
  page?: number;
  pageSize?: number;
  category?: NotificationCategory;
  type?: NotificationType;
  source?: string;
  keyword?: string;
}

/** 发送记录出参 */
export interface NotificationBatchListResult {
  list: NotificationBatchItem[];
  total: number;
  page: number;
  pageSize: number;
}

/** 批次详情出参：batch 为聚合头，list 为该批次收件人明细 */
export interface NotificationBatchDetailResult {
  batch: NotificationBatchItem;
  list: NotificationDto[];
  total: number;
  page: number;
  pageSize: number;
}

/** 重试失败邮件出参：retried 可大于 sent+failed（差额转 skipped） */
export interface RetryNotificationEmailResult {
  retried: number;
  sent: number;
  failed: number;
}
