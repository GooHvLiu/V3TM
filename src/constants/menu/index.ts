/**
 * ==========================================
 * 侧边栏菜单 · 注入契约
 * ------------------------------------------
 * provide/inject 用 symbol 常量 key，类型一并携带
 * 防止字符串拼错、命名冲突、泛型漏写
 * ==========================================
 */
import type { InjectionKey, Ref } from "vue";

// 引入数据类型
import type { BreadcrumbData, Menu, NavGroup } from "@/types/index";

/** 当前展开的 DIR 链（每层手风琴） */
export const OPEN_PATHS_KEY: InjectionKey<Ref<string[]>> = Symbol("openPaths");

/** 切换展开函数 */
export const TOGGLE_MENU_KEY: InjectionKey<(path: string) => void> = Symbol("toggleMenu");

/* 菜单是否折叠的常量 */
export const ISCOLLAPSED_KEY: InjectionKey<Ref<boolean>> = Symbol("isCollapsed");

/* 点击菜单折叠按钮的方法名称 */
export const HANDLE_FOLD_CLICK_KEY: InjectionKey<() => void> = Symbol("handleFoldClick");

/* 面包屑数据变量 */
export const BREADCRUMBS_KEY: InjectionKey<Ref<BreadcrumbData[]>> = Symbol("breadcrumbs");

/* 菜单原始数据注入键，layout 提供给子组件用于搜索菜单使用 */
export const MENU_ITEMS_KEY: InjectionKey<Ref<Menu[]>> = Symbol("menuDataArry");

/* 菜单数据完成分组后，用于菜单分组显示 */
export const GROUP_MENU_KEY: InjectionKey<Ref<NavGroup[]>> = Symbol("groupedMenus");

/* 折叠态 菜单被点击后返回layout用于通知 折叠态退出 */
export const EXPAND_SIDEBAR_KEY: InjectionKey<() => void> = Symbol("expandSidebar");
