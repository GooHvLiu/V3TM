/**
 * ==========================================
 * 多媒体查询相关常量 · 注入契约
 * ------------------------------------------
 * provide/inject 用 symbol 常量 key，类型一并携带
 * 防止字符串拼错、命名冲突、泛型漏写
 * ==========================================
 */
import type { InjectionKey, Ref } from "vue";

/** 当前屏幕是否为桌面端模式 */
export const IS_DESKTOP_KEY: InjectionKey<Ref<boolean>> = Symbol("isDesktop");

/** 当前屏幕是否为平板端模式 */
export const IS_TABLET_KEY: InjectionKey<Ref<boolean>> = Symbol("isTablet");

/** 当前屏幕是否为移动端模式 */
export const IS_MOBILE_KEY: InjectionKey<Ref<boolean>> = Symbol("isMobile");
