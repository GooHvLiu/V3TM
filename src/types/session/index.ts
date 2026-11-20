/** 会话状态：由吊销标记与到期时间实时推导，不落库 */
export type SessionStatus = "active" | "expired" | "revoked";

/** 一条 refresh token 即一个设备会话 */
export interface SessionItem {
  id: number;
  userId: number;
  username: string;
  status: SessionStatus;
  expiresAt: string;
  createdAt: string;
}

/** 全量统计：不随筛选变化 */
export interface SessionSummary {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  users: number;
}

export interface SessionListResult {
  summary: SessionSummary;
  list: SessionItem[];
  total: number;
  page: number;
  pageSize: number;
}

/** 列表查询参数：分页基座 + 可选筛选 */
export interface SessionQueryParams {
  page: number;
  pageSize: number;
  status?: SessionStatus;
  keyword?: string;
}

export interface SessionRevokeResult {
  id: number;
  revoked: boolean;
  force: boolean;
  tokenVersion?: number;
}

export interface SessionBatchRevokeResult {
  affected: number;
  force: boolean;
}

export interface SessionCleanupResult {
  deleted: number;
  beforeDays: number;
}
