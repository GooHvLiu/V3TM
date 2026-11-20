/**
 * 明暗模式开关（策略：html.dark）
 * 三态：light / dark / system（跟随系统）
 * 模块级单例：所有调用方共享同一 mode（HeaderTheme / App 初始化）
 */
import { ref, watch } from "vue";
import { storage } from "@/utils";
import { THEMES } from "@/constants";
import type { StorageType } from "@/types";
import type { Theme } from "@/constants";

/** 存储驱动类型 */
const STORAGE_TYPE = (import.meta.env.VITE_STORAGE_TYPE || "local") as StorageType;

/** 明暗模式存储 key */
const DARK_KEY = "color-mode";

/** 系统当前是否偏好暗色（实时查询 matchMedia） */
const getSystemDark = (): boolean =>
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;

/** 初始模式：持久化优先，无记录 → system */
const getInitialMode = (): Theme => {
  const saved = storage.get<Theme>(DARK_KEY, STORAGE_TYPE);
  if (saved && Object.values(THEMES).includes(saved)) return saved;
  return THEMES.SYSTEM;
};

// 模块级单例状态（首次 import 初始化，所有调用方共享）
const mode = ref<Theme>(getInitialMode());

/** 当前是否实际暗色（dark 直接 true；system 跟随系统） */
const isDark = ref<boolean>(mode.value === THEMES.DARK || (mode.value === THEMES.SYSTEM && getSystemDark()));

/** 切换模式 */
const setMode = (next: Theme): void => {
  mode.value = next;
};

// 挂 html.dark 类 + 持久化（watch 注册一次，全站单点）
watch(
  mode,
  (next) => {
    // system 模式下跟随系统实时偏好
    const dark = next === THEMES.DARK || (next === THEMES.SYSTEM && getSystemDark());
    isDark.value = dark;
    document.documentElement.classList.toggle("dark", dark);
    storage.set(DARK_KEY, next, {}, STORAGE_TYPE);
  },
  { immediate: true }
);

// system 模式：OS 偏好实时变化跟随（模块级注册一次）
const media =
  typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
if (media) {
  media.addEventListener("change", (e: MediaQueryListEvent) => {
    // 非 system 模式不响应（light/dark 由用户显式选择，不应被系统带跑）
    if (mode.value !== THEMES.SYSTEM) return;
    isDark.value = e.matches;
    document.documentElement.classList.toggle("dark", e.matches);
  });
}

/** 明暗模式组合式函数 */
export function useColorMode() {
  return { mode, isDark, setMode };
}
