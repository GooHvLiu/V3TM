/**
 * 知识库状态展示映射
 */
import type { HelpDocStatus, HelpIndexState } from "@/types/help/admin";

export type StatusTone = "success" | "info" | "warning" | "danger";

/** 文档位状态 */
export const DOC_STATUS: Record<HelpDocStatus, { tone: StatusTone; labelKey: string }> = {
  published: { tone: "success", labelKey: "knowledgeCenter.status.published" },
  empty: { tone: "info", labelKey: "knowledgeCenter.status.empty" },
  stale: { tone: "warning", labelKey: "knowledgeCenter.status.stale" }
};

/** 索引状态 */
export const INDEX_STATE: Record<HelpIndexState, { tone: StatusTone; labelKey: string }> = {
  clean: { tone: "success", labelKey: "knowledgeCenter.status.clean" },
  stale: { tone: "warning", labelKey: "knowledgeCenter.status.indexStale" },
  missing: { tone: "danger", labelKey: "knowledgeCenter.status.indexMissing" }
};

/** 语言包接入情况 */
export const manifestLabelKey = (item: { manifestExists: boolean; manifestValid: boolean }): string => {
  if (!item.manifestExists) return "knowledgeCenter.locale.missing";
  if (!item.manifestValid) return "knowledgeCenter.locale.invalid";
  return "knowledgeCenter.locale.managed";
};

/** 字节数转可读体积 */
export const formatSize = (size: number): string => {
  if (!size) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

/** ISO 时间转本地展示 */
export const formatTime = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
