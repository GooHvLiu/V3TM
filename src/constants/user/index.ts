/**
 * ==========================================
 * 用户相关常量 · 注入契约
 * ------------------------------------------
 * provide/inject 用 symbol 常量 key，类型一并携带
 * 防止字符串拼错、命名冲突、泛型漏写
 * ==========================================
 */
import type { ComputedRef, InjectionKey, Ref } from "vue";

import type { AuthProfile } from "@/types";

/** 用户信息 */
export const USER_INFO_KEY: InjectionKey<ComputedRef<Partial<AuthProfile> | null>> = Symbol("user-info");

/** 用户信息加载态（fetchProfile 期间） */
export const USER_LOADING_KEY: InjectionKey<Ref<boolean>> = Symbol("user-loading");
