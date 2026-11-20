import type { SessionStatus } from "@/types";

/** 会话状态 → 标签类型 + i18n key（与健康检查的 status.ts 同构） */
export const SESSION_STATUS: Record<SessionStatus, { tag: "success" | "warning" | "info"; text: string }> = {
  active: { tag: "success", text: "sessionCenter.status.active" },
  expired: { tag: "warning", text: "sessionCenter.status.expired" },
  revoked: { tag: "info", text: "sessionCenter.status.revoked" }
};
