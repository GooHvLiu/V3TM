/**
 * 服务端字段错误
 * --------------
 * 接口错误里 `params.field` 指明字段时，把它回填到表单对应项；
 * 没有字段信息就交回全局提示，不在表单里猜字段。
 */
import type { PublicRequestError } from "@/types";
import type { ComputedRef } from "vue";
import { computed, reactive } from "vue";

/** 回填结果，便于调用方决定是否再走全局提示 */
export interface FormServerError {
  field: string;
  message: string;
}

interface ApplyOptions {
  /** 接口未带 `params.field` 时的兜底字段 */
  field?: string;
  /** 按字段替换展示文案，优先于后端已翻译文案 */
  messages?: Record<string, string>;
}

/**
 * 字段错误状态
 * @param fields 允许回填的字段；传入后，白名单之外的字段不会写进表单
 */
export function useFormServerErrors(fields: string[] = []) {
  const state = reactive<Record<string, string>>({});

  /** 只暴露只读快照，避免页面绕过 set / clear 直接改 */
  const errors: ComputedRef<Record<string, string>> = computed(() => ({ ...state }));

  const set = (field: string, message: string): void => {
    if (!field || !message) return;
    if (fields.length > 0 && !fields.includes(field)) return;
    state[field] = message;
  };

  const clear = (field?: string): void => {
    if (!field) {
      Object.keys(state).forEach((key) => delete state[key]);
      return;
    }
    delete state[field];
  };

  /** 从请求错误中取字段并回填；返回 null 表示不是字段级错误 */
  const apply = (error: unknown, options: ApplyOptions = {}): FormServerError | null => {
    if (!error || typeof error !== "object") return null;

    const requestError = error as PublicRequestError;
    const field = String(requestError.params?.field ?? options.field ?? "");
    const message = options.messages?.[field] ?? requestError.translated ?? requestError.message ?? "";
    if (!field || !message) return null;
    if (fields.length > 0 && !fields.includes(field)) return null;

    state[field] = message;
    return { field, message };
  };

  return { errors, apply, set, clear };
}
