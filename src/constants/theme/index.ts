// ==========================================
// Theme | 主题常量（单一来源）
// ==========================================

/* 支持的主题 */
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system"
};

/* 主题类型自动推导："light" | "dark" | "system" */
export type Theme = (typeof THEMES)[keyof typeof THEMES];

/* 主题下拉选项：value 单点，显示名走 i18n key */
export const THEMES_OPTIONS: ReadonlyArray<{ value: Theme; themeKey: string }> = [
  { value: THEMES.LIGHT, themeKey: "layout.theme.light" },
  { value: THEMES.DARK, themeKey: "layout.theme.dark" },
  { value: THEMES.SYSTEM, themeKey: "layout.theme.system" }
];
