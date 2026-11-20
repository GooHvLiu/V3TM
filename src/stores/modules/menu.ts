// ==========================================
// Menu | 菜单获取与存储模块 | Store 模块
// ==========================================
import { defineStore } from "pinia";
import { ref, computed, readonly } from "vue";

// 导入后端相应的菜单 数据类型
import type { MenuItems, NavGroup } from "@/types";

// 引入动态路由工具
import { registerDynamicRoutes, resetDynamicRoutes } from "@/router/dynamic";

// 引入身份与菜单接口（刷新菜单后重建路由用）
import { getProfile } from "@/api";

// 引入分组聚合函数
import { filterMenuEnabled, groupMenuData } from "@/utils";

export const useMenuStore = defineStore("MenuStore", () => {
  // ============ State（状态） ============
  /*   const count = ref<number>(0);
  const list = ref<Array<{ id: number; name: string }>>([]); */
  // 菜单数据（数据源统一来自 /v1/auth/profile，由 layout 拉取后回填）
  const menuDataArry = ref<MenuItems>([]);

  // 动态路由是否已按当前身份注册
  const routesReady = ref<boolean>(false);

  // ============ Getters（计算属性） ============
  /* const doubleCount = computed(() => count.value * 2); */
  /** 分组后的菜单（供侧边栏渲染：分组标签 + 组内菜单） */
  const groupedMenus = computed<NavGroup[]>(() => groupMenuData(menuDataArry.value));

  // ============ Actions（方法） ============
  /* const increment = () => {
    count.value++;
  };
  const setList = (data: Array<{ id: number; name: string }>) => {
    list.value = data;
  }; */
  // 菜单写入统一出口
  /** 菜单写入出口：数据源统一来自 /v1/auth/profile（layout fetchProfile 后回填） */
  const setMenus = (menus: MenuItems): void => {
    menuDataArry.value = filterMenuEnabled(menus);
    // 菜单为空（登出 / 401 清场 / 全部禁用）→ 同步撤销动态路由，并标记需要重建
    if (!menuDataArry.value.length) {
      resetDynamicRoutes();
      routesReady.value = false;
    }
  };

  /** 动态路由注册完成后标记就绪；routesReady 对外只读，只能经此入口改写 */
  const markRoutesReady = (): void => {
    routesReady.value = true;
  };

  /**
   * 重取菜单并重建动态路由（菜单管理写入后同步侧边栏）
   * - 菜单数据与 /menu/tree 同源：只能走 profile，不能拿管理端全量树
   * - registerDynamicRoutes 内部先撤销全部动态路由，调用方需自行回到目标路径
   */
  const reloadMenus = async (): Promise<string[]> => {
    const profile = await getProfile();
    setMenus(profile.menus);
    const warns = registerDynamicRoutes(menuDataArry.value);
    markRoutesReady();
    return warns;
  };

  // 对外暴露
  return { routesReady: readonly(routesReady), menuDataArry, setMenus, markRoutesReady, reloadMenus, groupedMenus };
});
