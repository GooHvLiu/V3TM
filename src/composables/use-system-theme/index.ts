/**
 * 主题应用：监听 theme 变化 → 挂到 <html> class（theme-blue / theme-green...）
 * 需在应用根部调用一次（如 App.vue）
 */

import { watch, computed, unref } from "vue";

import { CUSTOMIZE_THEMES, RADIUS_OPTIONS, CONTENT_OPTIONS } from "@/constants/style-customize";
import { useThemeStore } from "@/stores";

export function useSystemTheme() {
  const themeStore = useThemeStore();
  const { setCustomizeTheme } = themeStore;
  const customizeTheme = computed(() => unref(themeStore.customizeTheme));
  const customizeRadius = computed(() => unref(themeStore.customizeRadius));
  const contentWidth = computed(() => unref(themeStore.contentWidth));

  if (typeof document !== "undefined") {
    watch(
      customizeTheme,
      (newTheme) => {
        // 先卸掉所有主题 class，再挂当前主题 class
        document.documentElement.classList.remove(...CUSTOMIZE_THEMES.map((t) => `theme-${t}`));
        document.documentElement.classList.add(`theme-${newTheme}`);
      },
      { immediate: true }
    );
    // —— 圆角：档位 → --radius-* 三个 CSS 变量
    watch(
      customizeRadius,
      (v) => {
        const r = RADIUS_OPTIONS.find((i) => i.value === v)?.radii ?? RADIUS_OPTIONS[1].radii;
        const el = document.documentElement;
        el.style.setProperty("--radius-base", `${r.base}px`);
        el.style.setProperty("--radius-lg", `${r.lg}px`);
        el.style.setProperty("--radius-max", `${r.max}px`);
      },
      { immediate: true }
    );

    // —— 内容宽度：档位 → --content-max-width
    watch(
      contentWidth,
      (v) => {
        document.documentElement.style.setProperty(
          "--content-max-width",
          CONTENT_OPTIONS.find((i) => i.value === v)?.width ?? "100%"
        );
      },
      { immediate: true }
    );
  }

  return { customizeTheme, setCustomizeTheme };
}
