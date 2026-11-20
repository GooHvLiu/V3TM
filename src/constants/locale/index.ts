// ==========================================
// Locale | 国际化语言常量（单一来源）
// ------------------------------------------
// 值需与 src/locales/ 下语言包文件夹名保持一致
// 语言接入：此处加一项 + locales/ 下建语言包 + i18n 注册
// ==========================================

/** 支持的语言（value = vue-i18n locale = locales 文件夹名） */
export const LOCALES = {
  ZH_CN: "zh-cn",
  EN_US: "en-us"
} as const;

/** 语言类型自动推导："zh-cn" | "en-us" */
export type Locale = (typeof LOCALES)[keyof typeof LOCALES];

/** 语言下拉选项：value 单点，显示名走 i18n key */
export const LOCALE_OPTIONS: ReadonlyArray<{ value: Locale; labelKey: string }> = [
  { value: LOCALES.ZH_CN, labelKey: "layout.lang.zh" },
  { value: LOCALES.EN_US, labelKey: "layout.lang.en" }
];
