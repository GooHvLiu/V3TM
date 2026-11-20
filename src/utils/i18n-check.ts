/**
 * 语言包完整性自检
 * 只校验后端会下发的固定标识，缺词条时返回 key，由启动入口决定如何提示。
 */
import i18n from "@/locales";
import backendMessages from "@/locales/zh-cn/common/backend";
import zhCn from "@/locales/zh-cn";
import enUs from "@/locales/en-us";

// 角色、健康检查、运维、通知里会被后端直接引用的标识
const BASE_KEYS = [
  "role.superAdmin.name",
  "role.admin.name",
  "role.operator.name",
  "role.viewer.name",
  "health.database.label",
  "health.memory.label",
  "opsTask.sessionCleanup.label",
  "notification.auth.registerPending.title"
];

// 错误码按 error 命名空间校验
const ERROR_KEYS = Object.keys(backendMessages).map((key) => `error.${key}`);

const REQUIRED_KEYS = Array.from(new Set([...BASE_KEYS, ...ERROR_KEYS]));

export const checkI18nKeys = (): string[] =>
  REQUIRED_KEYS.filter((key) => i18n.global.t(key) === key);

type Dict = Record<string, unknown>;

// 逐层收集叶子词条：数组按索引拼进路径，与语言包结构一一对应
const flatten = (dict: Dict, prefix = "", out = new Map<string, string>()): Map<string, string> => {
  Object.entries(dict).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") {
      flatten(value as Dict, path, out);
      return;
    }
    out.set(path, String(value));
  });
  return out;
};

const slotsOf = (text: string): string =>
  Array.from(text.matchAll(/\{(\w+)\}/g))
    .map((match) => match[1])
    .sort()
    .join(",");

/**
 * 中英语言包结构自检：叶子词条一一对应，插值占位符同名同序。
 * 只比对结构，不判断译文质量。
 */
export const checkLocaleParity = (): string[] => {
  const zh = flatten(zhCn as Dict);
  const en = flatten(enUs as Dict);
  const problems: string[] = [];

  zh.forEach((zhText, path) => {
    const enText = en.get(path);
    if (enText === undefined) {
      problems.push(`英文缺词条：${path}`);
      return;
    }
    if (slotsOf(zhText) !== slotsOf(enText)) {
      problems.push(`插值占位符不一致：${path}`);
    }
  });

  en.forEach((_text, path) => {
    if (!zh.has(path)) problems.push(`英文多词条：${path}`);
  });

  return problems;
};
