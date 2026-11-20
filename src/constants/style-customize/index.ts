/**
 * ==========================================
 * 定制主题 style-customize 常量
 * ------------------------------------------
 * THEMES：全部主题名（联合类型的来源）
 * THEME_PRIMARY_COLORS：主题名 → 主色（UI 色板用）
 * 主题接入：THEMES 加名 + 色板加色 + tokens.less 加覆盖块
 * ==========================================
 */
export const CUSTOMIZE_THEMES = ["Slate", "Sapphire", "Emerald", "Amber", "Ruby", "Amethyst"] as const;

/**
 * number 取这个元组中所有数字索引对应的值的联合类型
 * Theme 主题类型：'Slate'板岩 | 'Sapphire'蓝宝石 | 'Emerald'祖母绿  | 'Amber'琥珀 | 'Ruby'红宝石 | 'Amethyst'紫水晶 */
export type Customize_Theme = (typeof CUSTOMIZE_THEMES)[number];

/** 主题 → 主色映射（色板按钮用，与 tokens.less 覆盖块同源） */
export const THEME_PRIMARY_COLORS: { theme: Customize_Theme; primaryColor: string }[] = [
  { theme: "Slate", primaryColor: "#52525C" },
  { theme: "Sapphire", primaryColor: "#409eff" },
  { theme: "Emerald", primaryColor: "#67c23a" },
  { theme: "Amber", primaryColor: "#e6a23c" },
  { theme: "Ruby", primaryColor: "#f56c6c" },
  { theme: "Amethyst", primaryColor: "#8e44ad" }
];

/** 圆角档位：value 存 store；radii 三元组映射 CSS 变量 */
export const RADIUS_OPTIONS: ReadonlyArray<{
  value: number;
  labelKey: string;
  radii: { base: number; lg: number; max: number };
}> = [
  { value: 0, labelKey: "theme.customize.radius.zero", radii: { base: 0, lg: 0, max: 0 } },
  { value: 4, labelKey: "theme.customize.radius.small", radii: { base: 4, lg: 8, max: 12 } },
  { value: 8, labelKey: "theme.customize.radius.medium", radii: { base: 8, lg: 12, max: 16 } },
  { value: 12, labelKey: "theme.customize.radius.large", radii: { base: 12, lg: 16, max: 20 } }
];

/** 内容宽度档位：Full 全宽 / Compact 1280px 居中 */
export const CONTENT_OPTIONS: ReadonlyArray<{
  value: "full" | "compact";
  labelKey: string;
  width: string;
}> = [
  { value: "full", labelKey: "theme.customize.content.full", width: "100%" },
  { value: "compact", labelKey: "theme.customize.content.compact", width: "1280px" }
];
