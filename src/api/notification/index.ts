/**
 * 通知中心 · 接口
 * 路径与后端 /api/v1/notification 契约一致；http 层已解包 data，函数直接返回业务数据
 * 注意：/notification/create 已下线，此处不提供
 */
import { http } from "@/utils/request";
import type {
  NotificationListParams,
  NotificationListResult,
  NotificationUnreadResult,
  NotificationBatchQueryParams,
  NotificationBatchListResult,
  NotificationBatchDetailResult,
  SendNotificationParams,
  SendNotificationResult,
  RetryNotificationEmailResult
} from "@/types";

enum API {
  LIST = "/v1/notification/list",
  UNREAD_COUNT = "/v1/notification/unread-count",
  READ = "/v1/notification/read/",
  READ_ALL = "/v1/notification/read-all",
  BATCHES = "/v1/notification/admin/batches",
  SEND = "/v1/notification/admin/send"
}

/** 我的通知列表：登录即可访问，不支持关键字 */
export function getNotificationList(params: NotificationListParams): Promise<NotificationListResult> {
  return http.get<NotificationListResult>(API.LIST, { params });
}

/** 未读数：顶栏红点唯一数据源 */
export function getNotificationUnreadCount(): Promise<NotificationUnreadResult> {
  return http.get<NotificationUnreadResult>(API.UNREAD_COUNT);
}

/** 单条已读：幂等；不属于当前用户也返回成功，不可用它判断通知是否存在 */
export function markNotificationRead(id: number): Promise<null> {
  return http.post<null>(`${API.READ}${id}`);
}

/** 全部已读：不返回条数，提示文案用调用前的未读数 */
export function markAllNotificationsRead(): Promise<null> {
  return http.post<null>(API.READ_ALL);
}

/** 发送记录：批次聚合，keyword 只搜标题 */
export function getNotificationBatches(params: NotificationBatchQueryParams): Promise<NotificationBatchListResult> {
  return http.get<NotificationBatchListResult>(API.BATCHES, { params });
}

/** 批次详情：batch 为聚合头，list 为收件人明细 */
export function getNotificationBatchDetail(
  batchId: string,
  params: { page?: number; pageSize?: number }
): Promise<NotificationBatchDetailResult> {
  return http.get<NotificationBatchDetailResult>(`${API.BATCHES}/${encodeURIComponent(batchId)}`, { params });
}

/** 发送通知：邮件为异步排队，返回只代表已入队 */
export function sendNotification(data: SendNotificationParams): Promise<SendNotificationResult> {
  return http.post<SendNotificationResult>(API.SEND, data);
}

/** 重试失败邮件：只处理 emailStatus=failed，无失败记录时后端报 91001 */
export function retryNotificationEmails(batchId: string): Promise<RetryNotificationEmailResult> {
  return http.post<RetryNotificationEmailResult>(`${API.BATCHES}/${encodeURIComponent(batchId)}/retry-email`);
}
