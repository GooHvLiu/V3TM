import type { HealthItemStatus, HealthStatus } from "@/types";

/** 单项状态 → 标签类型 + i18n key + 卡片状态类 */
export const ITEM_STATUS: Record<HealthItemStatus, { tag: "success" | "warning" | "danger" | "info"; text: string }> = {
  ok: { tag: "success", text: "healthCheck.status.ok" },
  warn: { tag: "warning", text: "healthCheck.status.warn" },
  fail: { tag: "danger", text: "healthCheck.status.fail" },
  skip: { tag: "info", text: "healthCheck.status.skip" }
};

/** 整体状态 → 徽标类 + i18n key */
export const OVERALL_STATUS: Record<HealthStatus, { text: string }> = {
  up: { text: "healthCheck.overall.up" },
  degraded: { text: "healthCheck.overall.degraded" },
  down: { text: "healthCheck.overall.down" }
};

/** 毫秒 → 展示文本：不足 1 秒用 ms，否则保留两位秒 */
export const formatDuration = (ms: number): string =>
  ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`;

/** ISO（UTC）→ 本地 HH:mm:ss */
export const formatTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (value: number): string => String(value).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
