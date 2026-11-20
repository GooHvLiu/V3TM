// ProForm 纯函数：栅格、显隐、禁用、规则合并与重置
import type { FormItemRule, FormRules } from "element-plus";
import type { ProFormControl, ProFormField, ProFormModel } from "./types";

/** 默认栅格列数 */
export const FORM_COLUMNS = 24;

/** 把跨度限制在 1-24，避免布局越界 */
export const resolveFieldSpan = (span: number | undefined, columns = FORM_COLUMNS): number => {
  if (!Number.isFinite(span ?? NaN)) return columns;
  return Math.min(Math.max(Math.trunc(span as number), 1), columns);
};

/** 字段是否隐藏 */
export const isFieldHidden = (field: ProFormField, model: ProFormModel): boolean =>
  typeof field.hidden === "function" ? field.hidden(model) : Boolean(field.hidden);

/** 字段是否禁用，表单级禁用优先 */
export const isFieldDisabled = (field: ProFormField, model: ProFormModel, formDisabled = false): boolean => {
  if (formDisabled) return true;
  return typeof field.disabled === "function" ? field.disabled(model) : Boolean(field.disabled);
};

/** 控件宽度：数字按 px，字符串原样输出 */
export const resolveFieldWidth = (width: number | string | undefined): string | undefined => {
  if (typeof width === "number") return `${width}px`;
  return width;
};

/** 把单条/多条规则统一成数组 */
const toRuleArray = (rule: FormItemRule | FormItemRule[] | undefined): FormItemRule[] =>
  rule ? (Array.isArray(rule) ? rule : [rule]) : [];

/** 合并表单级与字段级规则，字段级规则追加在后 */
export const mergeFormRules = (fields: ProFormField[], base: FormRules = {}): FormRules => {
  const result: FormRules = { ...base };

  fields.forEach((field) => {
    const fieldRules = toRuleArray(field.rules);
    if (!fieldRules.length) return;

    const current = result[field.prop];
    const baseRules = Array.isArray(current) ? current : current ? [current] : [];
    result[field.prop] = [...baseRules, ...fieldRules];
  });

  return result;
};

/** 文本类控件：重置后是空串，页面读值不必再防 undefined */
const TEXT_CONTROLS: readonly (ProFormControl | undefined)[] = ["input", "password", "textarea", undefined];

/** 重置查询模型：保留未配置字段，已配置字段清空 */
export const clearFormModel = (fields: ProFormField[], current: ProFormModel): ProFormModel => {
  const next: ProFormModel = { ...current };
  fields.forEach((field) => {
    // 区间选择器的「未选」是 null；文本类清成空串；下拉、开关、数字没有自然空串，留 undefined
    if (field.type === "daterange") {
      next[field.prop] = null;
    } else if (TEXT_CONTROLS.includes(field.type)) {
      next[field.prop] = "";
    } else {
      next[field.prop] = undefined;
    }
  });
  return next;
};
