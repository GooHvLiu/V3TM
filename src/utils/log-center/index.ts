/**
 * 日志中心 · 枚举文案
 * 语言包缺项时回落原始枚举值，未覆盖的新枚举一眼可见，便于后续补键
 */

type Translate = (key: string) => string;
type TranslateExists = (key: string) => boolean;

/** 空值不查语言包：日志行缺 module / action 时直接显示占位，避免拼出 undefined 键 */
const fallback = (
  t: Translate,
  key: string,
  raw: string | null | undefined,
  te?: TranslateExists
): string => {
  if (typeof raw !== "string" || raw.trim() === "") return "-";
  if (te && !te(key)) return raw;
  const text = t(key);
  return text === key ? raw : text;
};

/** 模块名 */
export const logModuleLabel = (
  t: Translate,
  module: string | null | undefined,
  te?: TranslateExists
): string => fallback(t, `logCenter.module.${module}`, module, te);

/** 动作名 */
export const logActionLabel = (
  t: Translate,
  action: string | null | undefined,
  te?: TranslateExists
): string => fallback(t, `logCenter.action.${action}`, action, te);
