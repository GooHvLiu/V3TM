/**
 * 通知中心 · 展示常量
 * 枚举 → 文案 key / 标签色的单点映射；后端未识别的值由调用方按原值兜底
 */
import type { NotificationCategory, NotificationEmailStatus, NotificationType } from "@/types";

/** el-tag 支持的类型 */
type TagType = "primary" | "success" | "info" | "warning" | "danger";

/** 分类：文案 key + 标签色 */
export const NOTIFICATION_CATEGORY_META: Record<NotificationCategory, { labelKey: string; tagType: TagType }> = {
  system: { labelKey: "notification.category.system", tagType: "info" },
  security: { labelKey: "notification.category.security", tagType: "warning" },
  business: { labelKey: "notification.category.business", tagType: "primary" },
  announcement: { labelKey: "notification.category.announcement", tagType: "success" }
};

/** 级别：文案 key + 标签色（视图侧另配图标，做到图标 + 颜色 + 文字三重表达） */
export const NOTIFICATION_TYPE_META: Record<NotificationType, { labelKey: string; tagType: TagType }> = {
  info: { labelKey: "notification.type.info", tagType: "info" },
  success: { labelKey: "notification.type.success", tagType: "success" },
  warning: { labelKey: "notification.type.warning", tagType: "warning" },
  error: { labelKey: "notification.type.error", tagType: "danger" }
};

/** 邮件投递状态：文案 key + 标签色 */
export const NOTIFICATION_EMAIL_META: Record<NotificationEmailStatus, { labelKey: string; tagType: TagType }> = {
  none: { labelKey: "notification.email.none", tagType: "info" },
  pending: { labelKey: "notification.email.pending", tagType: "warning" },
  sent: { labelKey: "notification.email.sent", tagType: "success" },
  failed: { labelKey: "notification.email.failed", tagType: "danger" },
  skipped: { labelKey: "notification.email.skipped", tagType: "info" }
};

/** 分类下拉顺序（我的通知与发送表单共用） */
export const NOTIFICATION_CATEGORIES: NotificationCategory[] = ["system", "security", "business", "announcement"];

/** 级别下拉顺序 */
export const NOTIFICATION_TYPES: NotificationType[] = ["info", "success", "warning", "error"];

/** 顶栏浮层：每次取 5 条未读、不翻页 */
export const NOTIFICATION_PREVIEW_SIZE = 5;

/** 未读数轮询间隔（毫秒） */
export const NOTIFICATION_POLL_INTERVAL = 60 * 1000;

/** 红点显示上限：超过显示 99+ */
export const NOTIFICATION_UNREAD_CAP = 99;

/** 发送表单字段上限，与后端 Joi 约束一致 */
export const NOTIFICATION_TITLE_MAX = 100;
export const NOTIFICATION_CONTENT_MAX = 5000;
export const NOTIFICATION_LINK_MAX = 500;
