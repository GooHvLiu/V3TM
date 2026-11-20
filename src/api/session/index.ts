/**
 * 会话管理 · 接口层
 * 契约：GET 列表 / POST 单条吊销 / POST 批量吊销 / POST 清理失效会话
 * 权限码：superAdmin:sessionCenter:list（列表）、superAdmin:session:revoke（吊销）、superAdmin:session:cleanup（清理）
 * 约定：POST 必须携带 body（无参数时发空对象），后端校验不接受定义之外的字段
 */
import { http } from "@/utils/request";
import type {
  SessionBatchRevokeResult,
  SessionCleanupResult,
  SessionListResult,
  SessionQueryParams,
  SessionRevokeResult
} from "@/types";

enum API {
  SESSIONS = "/v1/super-admin/sessions",
  // :id 为会话主键（SessionItem.id），调用前替换
  REVOKE = "/v1/super-admin/sessions/:id/revoke",
  REVOKE_BATCH = "/v1/super-admin/sessions/revoke-batch",
  CLEANUP = "/v1/super-admin/sessions/cleanup"
}

/** 会话分页列表：status 缺省表示全部，keyword 按用户名模糊匹配 */
export function fetchSessionList(params: SessionQueryParams): Promise<SessionListResult> {
  const query: Record<string, string | number> = { page: params.page, pageSize: params.pageSize };
  const keyword = params.keyword?.trim();
  if (params.status) query.status = params.status;
  if (keyword) query.keyword = keyword;
  return http.get<SessionListResult>(API.SESSIONS, { params: query });
}

/** 吊销单条会话：force=true 同时提升该用户 tokenVersion，使其全部设备下线 */
export function revokeSession(id: number, force = false): Promise<SessionRevokeResult> {
  return http.post<SessionRevokeResult>(API.REVOKE.replace(":id", String(id)), { force });
}

/** 批量吊销：ids 至少 1 个有效主键，已吊销的记录不计入 affected */
export function revokeSessions(ids: number[], force = false): Promise<SessionBatchRevokeResult> {
  return http.post<SessionBatchRevokeResult>(API.REVOKE_BATCH, { ids, force });
}

/** 清理失效会话：删除创建时间早于 beforeDays 天、且已吊销或已过期的记录 */
export function cleanupSessions(beforeDays?: number): Promise<SessionCleanupResult> {
  return http.post<SessionCleanupResult>(API.CLEANUP, beforeDays === undefined ? {} : { beforeDays });
}
