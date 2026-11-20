/**
 * 响应式断点：监听窗口宽度 → 返回六档屏幕与三端形态
 * 六档给样式与密度用，三端给布局层用（侧边栏三态 / 顶栏区块收起）
 */

import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import { BREAKPOINTS } from "@/constants";

/** 屏幕档位：xs 小屏手机 / sm 大屏手机 / md 横屏手机 / lg 平板竖持 / xl 平板横持 / 2xl 桌面 */
export type ScreenSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/** 端形态：mobile 手机端 / tablet 平板端 / desktop 桌面端 */
export type Breakpoint = "mobile" | "tablet" | "desktop";

/** 宽度落在哪一档：上界取 BREAKPOINTS 的半开区间，与 less 的 @screen-* 一一对应 */
export const resolveScreen = (width: number): ScreenSize => {
  if (width < BREAKPOINTS.XS_MAX) return "xs";
  if (width < BREAKPOINTS.SM_MAX) return "sm";
  if (width < BREAKPOINTS.MD_MAX) return "md";
  if (width < BREAKPOINTS.LG_MAX) return "lg";
  if (width < BREAKPOINTS.XL_MAX) return "xl";
  return "2xl";
};

/** 六档归到三端：小于 lg 归手机端，lg 与 xl 归平板端，其余桌面端 */
export const resolveBreakpoint = (size: ScreenSize): Breakpoint => {
  if (size === "xs" || size === "sm" || size === "md") return "mobile";
  if (size === "lg" || size === "xl") return "tablet";
  return "desktop";
};

export function useBreakpoint() {
  // 窗口宽度（SSR 保护：非浏览器环境给 0）
  const width = ref(typeof window !== "undefined" ? window.innerWidth : 0);

  const screen = computed<ScreenSize>(() => resolveScreen(width.value));
  const breakpoint = computed<Breakpoint>(() => resolveBreakpoint(screen.value));

  // 派生布尔值：模板里直接用 v-if="isMobile"
  const isMobile = computed(() => breakpoint.value === "mobile");
  const isTablet = computed(() => breakpoint.value === "tablet");
  const isDesktop = computed(() => breakpoint.value === "desktop");

  // rAF 节流：resize 高频触发，用 requestAnimationFrame 合并到一帧
  let ticking = false;
  const handleResize = (): void => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      width.value = window.innerWidth;
      ticking = false;
    });
  };

  // 挂载时监听、卸载时移除（防内存泄漏）
  onMounted(() => window.addEventListener("resize", handleResize));
  onBeforeUnmount(() => window.removeEventListener("resize", handleResize));

  return { width, screen, breakpoint, isMobile, isTablet, isDesktop };
}
