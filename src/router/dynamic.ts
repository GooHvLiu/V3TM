/**
 * ==========================================
 * 动态路由（菜单驱动）
 * ------------------------------------------
 * 数据源：/v1/auth/profile 返回的 menus（已按角色 menuIds 裁剪）
 * 约定：
 *   ① 全部业务页作为 Layout 的子路由注册，不嵌套 DIR，避免相对路径歧义
 *   ② DIR 只生成 redirect（其 index.vue 不存在，仅作分组容器）
 *   ③ 外链（about:githubPage）与组件缺失的节点跳过，缺失清单在开发期打印
 *   ④ 兜底路由最后注册：addRoute 按注册顺序匹配，先注册会被 catch-all 抢走
 * ==========================================
 */
import type { Menu, MenuItems } from "@/types";
import type { RouteRecordRaw } from "vue-router";
import { router } from "./routes";
import { ERROR_PAGE, FALLBACK_ERROR_CODE, LAYOUT } from "@/constants";

// 构建期登记全部页面组件，key 形如 /src/pages/xxx/index.vue
const pages = import.meta.glob("/src/pages/**/*.vue");

export const FALLBACK_NAME = "Fallback";

/** 组件路径归一：@/pages/... → /src/pages/... */
const toGlobKey = (component: string): string => component.replace(/^@\//, "/src/");

/** 组件解析，取不到返回 null（由调用方汇总告警） */
const resolveComponent = (component: string): RouteRecordRaw["component"] | null => {
  if (!component) return null;
  const loader = pages[toGlobKey(component)];
  return loader ? () => loader() : null;
};

/** 递归拍平菜单（保留原始节点，不做层级嵌套） */
const flattenMenus = (menus: Menu[], out: Menu[] = []): Menu[] => {
  menus.forEach((menu) => {
    out.push(menu);
    if (menu.children?.length) flattenMenus(menu.children, out);
  });
  return out;
};

/** 从子项里取第一个可跳转的内部路径（跳过 BUTTON 与外链） */
const firstInternalPath = (menus: Menu[] = []): string | undefined =>
  menus.find((menu) => menu.type !== "BUTTON" && menu.path.startsWith("/"))?.path;

/** 菜单树 → 扁平路由记录 */
const buildRouteRecords = (menus: MenuItems, warns: string[]): RouteRecordRaw[] => {
  const records: RouteRecordRaw[] = [];

  for (const menu of flattenMenus(menus)) {
    // 按钮节点与外链不参与路由
    if (menu.type === "BUTTON" || !menu.path.startsWith("/")) continue;

    if (menu.type === "DIR") {
      const redirect = firstInternalPath(menu.children);
      if (!redirect) continue;
      records.push({ path: menu.path, redirect, meta: { title: menu.name } });
      continue;
    }

    const component = resolveComponent(menu.component);
    if (!component) {
      warns.push(`${menu.name} → 组件缺失：${menu.component || "(空)"}`);
      continue;
    }
    records.push({ path: menu.path, component, meta: { title: menu.name } });
  }

  return records;
};

/**
 * 菜单外的扩展页
 * require：准入菜单 path，仅当该菜单存在于当前角色菜单树时才注册本条
 * record：页面自身的路由记录
 */
const EXTRA_PAGES: Array<{ require: string; record: RouteRecordRaw }> = [
  {
    require: `/${LAYOUT.SUPER_ADMIN.ROOT}/${LAYOUT.SUPER_ADMIN.DICT_CENTER.ROOT}`,
    record: {
      path: `/${LAYOUT.SUPER_ADMIN.ROOT}/${LAYOUT.SUPER_ADMIN.DICT_CENTER.ROOT}/${LAYOUT.SUPER_ADMIN.DICT_CENTER.DICTDATA}`,
      component: () => import("@/pages/super-admin/dict-center/dict-date/index.vue"),
      meta: { title: "route.superAdmin.dictCenter.dictDate" }
    }
  }
];

// 已注册路由的移除函数集合（reset 时逐个撤销）
let removers: Array<() => void> = [];

/** 撤销全部动态路由（登出 / 身份切换 / 重新注册前） */
export const resetDynamicRoutes = (): void => {
  removers.forEach((remove) => remove());
  removers = [];
  if (router.hasRoute(FALLBACK_NAME)) router.removeRoute(FALLBACK_NAME);
};

/**
 * 注册动态路由
 * 入参为已过滤的菜单（subMenuStore.menuDataArry）
 */
export const registerDynamicRoutes = (menus: MenuItems): string[] => {
  resetDynamicRoutes();

  const warns: string[] = [];
  const records = buildRouteRecords(menus, warns);

  // 扩展页依赖所属菜单存在才注册：无字典中心权限的角色拿不到这条路由
  const registeredPaths = new Set(records.map((record) => record.path));
  EXTRA_PAGES.forEach((extra) => {
    if (registeredPaths.has(extra.require)) records.push(extra.record);
  });

  records.forEach((record) => removers.push(router.addRoute("Layout", record)));

  // 兜底必须最后注册，否则任何未命中路径都会被它先吃掉
  removers.push(
    router.addRoute({
      name: FALLBACK_NAME,
      path: "/:pathMatch(.*)*",
      redirect: `/${ERROR_PAGE.ROOT}/${FALLBACK_ERROR_CODE}`
    })
  );

  return warns;
};
