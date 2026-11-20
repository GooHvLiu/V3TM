/**
 * zod schema → Element Plus 表单 rules 桥接
 * ------------------------------------------
 * 每个字段：先单字段 safeParse（非空/格式），再整体 safeParse（触发 superRefine 跨字段规则）
 * 错误消息存 i18n key，由 t() 现场翻译
 */
import type { FormItemRule } from "element-plus";
import type { ZodObject, ZodRawShape, ZodTypeAny } from "zod";

export const zodToRules = <T extends ZodObject<ZodRawShape>>(
  schema: T,
  // i18n 翻译函数，用来把 Zod 错误消息里的 key 转成实际文案
  t: (key: string) => string,
  // 可选，用来获取当前完整表单数据，支持跨字段校验
  getForm?: () => Record<string, unknown>
): Record<string, FormItemRule[]> => {
  const shape = schema.shape as Record<string, ZodTypeAny>;
  return Object.keys(shape).reduce(
    (rules, field) => {
      rules[field] = [
        {
          validator: (_rule, value, callback) => {
            // ① 单字段校验：非空/格式（blur 即时报）
            const single = shape[field]!.safeParse(value);

            if (!single.success) {
              return callback(new Error(t(single.error.issues[0]!.message)));
            }
            // ② 整体校验：触发 superRefine 等对象级规则，错误落在本字段才报
            if (getForm) {
              const full = schema.safeParse(getForm());
              if (!full.success) {
                const issue = full.error.issues.find((item) => item.path[0] === field);
                if (issue) return callback(new Error(t(issue.message)));
              }
            }
            callback();
          },
          trigger: ["blur", "change"]
        }
      ];
      return rules;
    },
    {} as Record<string, FormItemRule[]>
  );
};

/**
 * zod schema → 字段错误表
 * ----------------------
 * 给不使用 Element Plus 校验器的复合表单用：一次整体校验，
 * 同一个字段只保留第一条错误，值按 i18n key 现场翻译。
 */
export const zodToErrors = <T extends ZodObject<ZodRawShape>>(
  schema: T,
  value: Record<string, unknown>,
  t: (key: string) => string
): Record<string, string> => {
  const result = schema.safeParse(value);
  if (result.success) return {};

  return result.error.issues.reduce(
    (errors, issue) => {
      const field = String(issue.path[0] ?? "");
      if (field && !errors[field]) errors[field] = t(issue.message);
      return errors;
    },
    {} as Record<string, string>
  );
};
