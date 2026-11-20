/**
 * i18n 文案渲染
 * 用于后端下发完整 key 的场景，例如 health.*、opsTask.*、notification.*；
 * 与错误码的 translateMessage 分开，避免给完整 key 再加 error. 前缀。
 */
import i18n from "@/locales";

type MessageParam = string | number | boolean | undefined;

export const translateKey = (
  key: string,
  params: Record<string, MessageParam> = {},
  fallback = ""
): string => {
  if (!key) return fallback;
  const safeParams = Object.fromEntries(
    Object.entries(params).map(([name, value]) => [name, value ?? ""])
  );
  const text = i18n.global.t(key, safeParams);
  return text === key ? fallback : text;
};
