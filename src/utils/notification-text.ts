/**
 * 通知文案渲染
 * 系统事件只存 titleKey / contentKey，插值取自 data；
 * 管理员手写通知沿用 title / content 原文，不做翻译。
 */
import type { NotificationDto } from "@/types";
import { translateKey } from "./i18n-text";

type NoticeField = "title" | "content";

const paramsOf = (data: NotificationDto["data"]): Record<string, string | number | boolean> =>
  (data ?? {}) as Record<string, string | number | boolean>;

export const notificationText = (item: NotificationDto, field: NoticeField): string => {
  const key = field === "title" ? item.titleKey : item.contentKey;
  const original = (field === "title" ? item.title : item.content) ?? "";
  return key ? translateKey(key, paramsOf(item.data), original) : original;
};
