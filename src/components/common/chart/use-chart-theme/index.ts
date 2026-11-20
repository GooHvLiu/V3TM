/**
 * 图表主题：把设计令牌读成 ECharts 主题
 * 颜色不另存一份，全部经 CSS 变量取当前主题的实际值；切换明暗时重新登记并重建实例
 */
import { computed, watch } from "vue";

import { useColorMode } from "@/composables/use-color-mode";

import { registerTheme } from "../echarts";

/** 主题名：与 ECharts 实例绑定，重建时按当前明暗取用 */
export const LIGHT_THEME_NAME = "v3-light";
export const DARK_THEME_NAME = "v3-dark";

/** 字体栈：与全局正文一致，图表不另立字体 */
const FONT_FAMILY = '"Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

/** 读设计令牌：非浏览器环境或变量缺失时回落到给定值 */
export const readToken = (name: string, fallback: string): string => {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

/** 系列调色板：主色打头，其余语义色依次补位 */
export const buildPalette = (): string[] => [
  readToken("--color-primary", "#409eff"),
  readToken("--color-success", "#67c23a"),
  readToken("--color-warning", "#e6a23c"),
  readToken("--color-danger", "#f56c6c"),
  readToken("--color-info", "#909399")
];

/** 组装主题对象：文字、分割线、悬浮框、坐标轴统一从这里取色 */
export const buildChartTheme = (dark: boolean): Record<string, unknown> => {
  const text = readToken("--color-text-regular", dark ? "#c9c9cf" : "#606266");
  const strong = readToken("--color-text-primary", dark ? "#ffffff" : "#09090b");
  const split = readToken("--color-border-lighter", dark ? "#2a2a30" : "#ebeef5");
  const axis = readToken("--color-border-light", dark ? "#3b424f" : "#e4e7ed");
  const surface = readToken("--color-bg-container", dark ? "#1b1e25" : "#ffffff");

  return {
    color: buildPalette(),
    backgroundColor: "transparent",
    textStyle: { color: text, fontFamily: FONT_FAMILY },
    title: {
      textStyle: { color: strong, fontWeight: 600, fontSize: 14 },
      subtextStyle: { color: text }
    },
    legend: { textStyle: { color: text }, inactiveColor: split },
    tooltip: {
      backgroundColor: surface,
      borderColor: axis,
      borderWidth: 1,
      textStyle: { color: strong },
      extraCssText: "box-shadow:0 4px 12px rgba(0, 0, 0, 0.08);"
    },
    categoryAxis: {
      axisLine: { lineStyle: { color: axis } },
      axisTick: { lineStyle: { color: axis } },
      axisLabel: { color: text },
      splitLine: { lineStyle: { color: split } }
    },
    valueAxis: {
      axisLine: { lineStyle: { color: axis } },
      axisLabel: { color: text },
      splitLine: { lineStyle: { color: split } }
    },
    line: { symbolSize: 6, smooth: true },
    bar: { barMaxWidth: 28 }
  };
};

/** 登记两套主题：只做一次，重复登记同名的覆盖即可 */
let registered = false;

export const ensureThemes = (): void => {
  if (registered) return;
  registerTheme(LIGHT_THEME_NAME, buildChartTheme(false));
  registerTheme(DARK_THEME_NAME, buildChartTheme(true));
  registered = true;
};

/** 明暗主题组合式函数：给出当前主题名，并在切换时通知调用方重建 */
export function useChartTheme() {
  const { isDark } = useColorMode();

  const themeName = computed(() => (isDark.value ? DARK_THEME_NAME : LIGHT_THEME_NAME));

  // 主题切换后令牌值才变成新主题的值，登记要等这一步之后再跑一次
  watch(
    isDark,
    () => {
      registered = false;
      ensureThemes();
    },
    { flush: "post" }
  );

  return { isDark, themeName, ensureThemes };
}
