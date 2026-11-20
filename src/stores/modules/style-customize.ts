// ==========================================
// Theme | 定制配置模块 | Store 模块
// ==========================================
import { defineStore } from "pinia";
import { ref } from "vue";

// 导入定制样式类型
import type { Customize_Theme } from "@/constants";
import { storage } from "@/utils";
import type { StorageType } from "@/types";

/** 存储驱动类型 */
const STORAGE_TYPE = (import.meta.env.VITE_STORAGE_TYPE || "local") as StorageType;

/** 定制样式存储 key */
const THEME_KEY = "customize_theme";
const RADIUS_KEY = "customize_radius";
const CONTENT_KEY = "customize_content";

export const useThemeStore = defineStore("ThemeStore", () => {
  // ============ State（状态） ============
  /*   const count = ref<number>(0);
  const list = ref<Array<{ id: number; name: string }>>([]); */
  /** 当前定制样式：优先读本地存储，无记录则默认 */
  const customizeTheme = ref<Customize_Theme>(storage.get<Customize_Theme>(THEME_KEY, STORAGE_TYPE) || "Slate");

  /** 当前圆角档位（0/4/8/12） */
  const customizeRadius = ref<number>(storage.get<number>(RADIUS_KEY, STORAGE_TYPE) ?? 8);

  /** 当前内容宽度（full/compact） */
  const contentWidth = ref<"full" | "compact">(storage.get<"full" | "compact">(CONTENT_KEY, STORAGE_TYPE) ?? "full");

  // ============ Getters（计算属性） ============
  /* const doubleCount = computed(() => count.value * 2); */

  // ============ Actions（方法） ============
  /* const increment = () => {
    count.value++;
  };
  const setList = (data: Array<{ id: number; name: string }>) => {
    list.value = data;
  }; */

  /** 切换定制样式：更新状态 + 持久化 */
  const setCustomizeTheme = (newTheme: Customize_Theme) => {
    customizeTheme.value = newTheme;
    storage.set(THEME_KEY, newTheme, {}, STORAGE_TYPE);
  };

  /** 切换圆角档位：更新状态 + 持久化 */
  const setRadius = (v: number) => {
    customizeRadius.value = v;
    storage.set(RADIUS_KEY, v, {}, STORAGE_TYPE);
  };

  /** 切换内容宽度：更新状态 + 持久化 */
  const setContentWidth = (v: "full" | "compact") => {
    contentWidth.value = v;
    storage.set(CONTENT_KEY, v, {}, STORAGE_TYPE);
  };

  // 对外暴露
  return { customizeTheme, customizeRadius, contentWidth, setCustomizeTheme, setRadius, setContentWidth };
});
