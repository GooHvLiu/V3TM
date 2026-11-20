/**
 * ==========================================
 * i18n 实例与语言持久化
 * ------------------------------------------
 * 本文件为框架层，语言接入无需修改本文件
 * ==========================================
 */
import { createI18n } from "vue-i18n";
import { storage } from "@/utils";
import { LOCALES } from "@/constants";
import type { Locale } from "@/constants";

// 引入本地存储数据类型
import type { StorageType } from "@/types";

// 引入语言包（聚合出口）
import zhCN from "./zh-cn";
import enUS from "./en-us";

/** 存储驱动类型（local | session），从环境变量读取 */
const STORAGE_TYPE = (import.meta.env.VITE_STORAGE_TYPE || "local") as StorageType;

/** 语言存储 key（固定常量，勿变） */
const LOCALE_KEY = "locale";

/** 默认语言：从环境变量读取（构建时注入，每环境可配不同默认） */
const DEFAULT_LOCALE = import.meta.env.VITE_APP_LOCALE || LOCALES.ZH_CN;

/** 读取当前语言（无记录时默认中文） */
export const getLocale = (): Locale => {
  const saved = storage.get<string>(LOCALE_KEY, STORAGE_TYPE);
  const validLocales = Object.values(LOCALES) as Locale[];
  return saved && validLocales.includes(saved as Locale) ? (saved as Locale) : (DEFAULT_LOCALE as Locale);
};

/** 本地是否已有用户选择记录（区别于首次进入，用于尊重用户显式选择） */
export const hasSavedLocale = (): boolean => {
  const saved = storage.get<string>(LOCALE_KEY, STORAGE_TYPE);
  return Boolean(saved) && (Object.values(LOCALES) as string[]).includes(saved as string);
};

/** 切换语言：持久化 + 同步 <html lang>（SEO/无障碍规范） */
export const setLocale = (locale: string): void => {
  storage.set(LOCALE_KEY, locale, {}, STORAGE_TYPE);
  document.documentElement.lang = locale;
};

/** i18n 实例（legacy:false = 组合式 API 模式） */
const i18n = createI18n({
  legacy: false,
  locale: getLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    // 其他语言包可以继续配置 告诉 vue-i18n：当语言是 '索引值' 时，请使用 zhCN 这个对象里的文案
    [LOCALES.ZH_CN]: zhCN,
    [LOCALES.EN_US]: enUS
  }
});

export default i18n;
