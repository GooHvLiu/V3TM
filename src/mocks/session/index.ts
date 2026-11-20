/**
 * 会话管理 · Mock 数据
 * 与后端 /v1/super-admin/sessions 系列契约一致：
 * 一条 refresh token 对应一个设备会话，status 由吊销标记与到期时间实时推导
 */
import type {
  SessionBatchRevokeResult,
  SessionCleanupResult,
  SessionItem,
  SessionListResult,
  SessionRevokeResult,
  SessionStatus,
  SessionSummary
} from "@/types";
import { mockError, parseBody } from "../utils";

const DAY = 24 * 60 * 60 * 1000;
/** 会话有效期 7 天 */
const SESSION_TTL = 7 * DAY;
const STATUS_VALUES: SessionStatus[] = ["active", "expired", "revoked"];

/** mock 内部行：只存吊销标记与时间戳，状态读取时推导 */
interface MockSessionRow {
  id: number;
  userId: number;
  username: string;
  revoked: boolean;
  createdAt: number;
  expiresAt: number;
}

/** 数据基准时间：模块加载时固定，避免同一次请求内状态漂移 */
const ANCHOR = Date.now();

const makeSession = (
  id: number,
  userId: number,
  username: string,
  createdAgoDays: number,
  options: { revoked?: boolean } = {}
): MockSessionRow => {
  const createdAt = ANCHOR - createdAgoDays * DAY;
  return {
    id,
    userId,
    username,
    revoked: options.revoked ?? false,
    createdAt,
    expiresAt: createdAt + SESSION_TTL
  };
};

/** 28 条：活跃 15 / 已过期 9 / 已吊销 4，涉及 11 个账号 */
const SESSIONS: MockSessionRow[] = [
  makeSession(41, 2, "superAdmin", 0.1),
  makeSession(40, 2, "superAdmin", 2.6),
  makeSession(39, 1, "admin", 0.4),
  makeSession(38, 1, "admin", 9),
  makeSession(37, 1, "admin", 1.2, { revoked: true }),
  makeSession(36, 3, "operator01", 0.8),
  makeSession(35, 3, "operator01", 3.2),
  makeSession(34, 4, "operator02", 6.5),
  makeSession(33, 4, "operator02", 12),
  makeSession(32, 5, "viewer01", 1.9),
  makeSession(31, 5, "viewer01", 20),
  makeSession(30, 6, "sales01", 0.6),
  makeSession(29, 6, "sales01", 4),
  makeSession(28, 6, "sales01", 40),
  makeSession(27, 7, "sales02", 2.1),
  makeSession(26, 7, "sales02", 8),
  makeSession(25, 7, "sales02", 1.1, { revoked: true }),
  makeSession(24, 8, "sales03", 5.5),
  makeSession(23, 8, "sales03", 25),
  makeSession(22, 9, "sales04", 0.3),
  makeSession(21, 9, "sales04", 6.8),
  makeSession(20, 9, "sales04", 14, { revoked: true }),
  makeSession(19, 10, "sales05", 3.5),
  makeSession(18, 10, "sales05", 30),
  makeSession(17, 11, "sales06", 1.6),
  makeSession(16, 11, "sales06", 45),
  makeSession(15, 11, "sales06", 9.5, { revoked: true }),
  makeSession(14, 11, "sales06", 60)
];

/** 各用户的令牌版本：force=true 时递增 */
const TOKEN_VERSIONS = new Map<number, number>();

const bumpTokenVersion = (userId: number): number => {
  const next = (TOKEN_VERSIONS.get(userId) ?? 0) + 1;
  TOKEN_VERSIONS.set(userId, next);
  return next;
};

const resolveStatus = (row: MockSessionRow, now: number): SessionStatus =>
  row.revoked ? "revoked" : row.expiresAt <= now ? "expired" : "active";

const toItem = (row: MockSessionRow, now: number): SessionItem => ({
  id: row.id,
  userId: row.userId,
  username: row.username,
  status: resolveStatus(row, now),
  expiresAt: new Date(row.expiresAt).toISOString(),
  createdAt: new Date(row.createdAt).toISOString()
});

const buildSummary = (rows: MockSessionRow[], now: number): SessionSummary => {
  const statuses = rows.map((row) => resolveStatus(row, now));
  return {
    total: rows.length,
    active: statuses.filter((status) => status === "active").length,
    expired: statuses.filter((status) => status === "expired").length,
    revoked: statuses.filter((status) => status === "revoked").length,
    users: new Set(rows.map((row) => row.userId)).size
  };
};

/** GET /v1/super-admin/sessions：分页 + 状态 + 用户名关键字 */
export const mockSessionList = (config: { params?: Record<string, unknown> }): SessionListResult => {
  const raw = config.params ?? {};
  const now = Date.now();
  const page = Math.max(1, Number(raw.page) || 1);
  // 与后端一致：pageSize 硬上限 100，超出静默截断
  const pageSize = Math.min(100, Math.max(1, Number(raw.pageSize) || 10));

  let status: SessionStatus | undefined;
  if (typeof raw.status === "string" && raw.status) {
    if (!STATUS_VALUES.includes(raw.status as SessionStatus)) {
      throw mockError(10003, "PARAM_INVALID", { field: "status" });
    }
    status = raw.status as SessionStatus;
  }

  const keyword = typeof raw.keyword === "string" ? raw.keyword.trim().toLowerCase() : "";

  const summary = buildSummary(SESSIONS, now);
  const filtered = [...SESSIONS]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((row) => toItem(row, now))
    .filter((item) => (status ? item.status === status : true))
    .filter((item) => (keyword ? item.username.toLowerCase().includes(keyword) : true));

  const start = (page - 1) * pageSize;
  return {
    summary,
    list: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize
  };
};

/** POST /v1/super-admin/sessions/:id/revoke：force=true 时递增用户令牌版本 */
export const mockSessionRevoke = (config: {
  params?: Record<string, unknown>;
  data?: unknown;
}): SessionRevokeResult => {
  const id = Number(config.params?.id);
  const body = parseBody<{ force?: boolean }>(config);
  const row = SESSIONS.find((item) => item.id === id);
  if (!row) throw mockError(60001, "SESSION_NOT_FOUND");
  if (row.revoked) throw mockError(60002, "SESSION_ALREADY_REVOKED");

  row.revoked = true;
  const force = body.force === true;
  if (!force) return { id, revoked: true, force };
  return { id, revoked: true, force, tokenVersion: bumpTokenVersion(row.userId) };
};

/** POST /v1/super-admin/sessions/revoke-batch：已吊销的 id 不计入 affected */
export const mockSessionRevokeBatch = (config: { data?: unknown }): SessionBatchRevokeResult => {
  const body = parseBody<{ ids?: unknown; force?: boolean }>(config);
  const ids = Array.isArray(body.ids)
    ? [
        ...new Set(
          body.ids.filter((value): value is number => typeof value === "number" && Number.isInteger(value) && value > 0)
        )
      ]
    : [];
  if (!ids.length) throw mockError(10003, "PARAM_INVALID", { field: "ids" });

  const force = body.force === true;
  const touchedUsers = new Set<number>();
  let affected = 0;

  ids.forEach((id) => {
    const row = SESSIONS.find((item) => item.id === id);
    if (!row || row.revoked) return;
    row.revoked = true;
    affected += 1;
    touchedUsers.add(row.userId);
  });

  if (force) touchedUsers.forEach((userId) => bumpTokenVersion(userId));

  return { affected, force };
};

/** POST /v1/super-admin/sessions/cleanup：物理删除创建早于阈值且已失效的会话 */
export const mockSessionCleanup = (config: { data?: unknown }): SessionCleanupResult => {
  const body = parseBody<{ beforeDays?: number }>(config);
  const beforeDays =
    typeof body.beforeDays === "number" && Number.isFinite(body.beforeDays)
      ? Math.min(365, Math.max(1, Math.round(body.beforeDays)))
      : 7;

  const now = Date.now();
  const cutoff = now - beforeDays * DAY;
  const kept: MockSessionRow[] = [];
  let deleted = 0;

  SESSIONS.forEach((row) => {
    const status = resolveStatus(row, now);
    if ((status === "revoked" || status === "expired") && row.createdAt < cutoff) {
      deleted += 1;
      return;
    }
    kept.push(row);
  });

  SESSIONS.splice(0, SESSIONS.length, ...kept);
  return { deleted, beforeDays };
};

/** 登出：按用户名吊销其全部未吊销会话（对齐后端「按 userId 全端下线」） */
export const revokeSessionsOfUser = (username: string): number => {
  const userId = SESSIONS.find((row) => row.username === username)?.userId;
  if (userId === undefined) return 0;
  let affected = 0;
  SESSIONS.forEach((row) => {
    if (row.userId === userId && !row.revoked) {
      row.revoked = true;
      affected += 1;
    }
  });
  bumpTokenVersion(userId);
  return affected;
};
