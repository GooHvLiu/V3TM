/**
 * ==========================================
 * 路由导航守卫（鉴权） TS版
 * ==========================================
 * 规则：
 * ① 未登录 + 非白名单 → 跳 /auth/login?redirect=原路径（登录后回跳）
 * ② 未完成强制改密 → 一律先落改密页（改密页自身不再跳）
 * ③ 已登录 + 访问 auth 页 → 跳首页（改密页除外）
 * ④ 白名单（auth/legal/errors）免登录
 * ⑤ 标题：i18n + APP_NAME
 * ==========================================
 */

// 引入国际化配置文件
import i18n from "@/locales";

// 引入Pinia Store 和动态路由工具
import { useUserStore, useMenuStore } from "@/stores";
import { FALLBACK_NAME, registerDynamicRoutes } from "./dynamic";

// 引入系统参数常量
import { APP_NAME, AUTH, LAYOUT, LEGAL, ERROR_PAGE, FALLBACK_ERROR_CODE, TOKEN_KEY } from "@/constants";

// 引入 token 读取工具（守卫顶层读 storage，避免 pinia 实例化时机依赖）
import { storage } from "@/utils";

// 引入进度条工具 nprogress
import NProgress from "nprogress";
// 引入进度条工具 nprogress 样式：nprogress/nprogress.css
import "nprogress/nprogress.css";
// 隐藏 NProgress 顶部加载小球；模板改用类选择器，避免非标准 role 进入无障碍树
NProgress.configure({
  showSpinner: false,
  barSelector: ".bar",
  spinnerSelector: ".spinner",
  template: '<div class="bar"><div class="peg"></div></div><div class="spinner"><div class="spinner-icon"></div></div>'
});

/** 进度条是纯视觉提示：整条链路对读屏器隐藏 */
const markProgressDecorative = (): void => {
  const bar = document.getElementById("nprogress");
  if (!bar) return;
  bar.setAttribute("aria-hidden", "true");
};

//引入路由器
import { router } from "./index";

// 存储用户未登录可以访问的路由名单
const WHITE_LIST = [AUTH.ROOT, `/${LEGAL.ROOT}`, `/${ERROR_PAGE.ROOT}`];

/** 精确前缀匹配（防止 /auth 误匹配 /authxxx） */
const isWhiteListed = (path: string): boolean =>
  WHITE_LIST.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

/** 登录后默认首页 */
const HOME_PATH = `${LAYOUT.ROOT}${LAYOUT.DASH_BOARD}`;

// 前端路由守卫 - 前置守卫：进度条开始 + 设置标题
router.beforeEach(async (to) => {
  // 获取 store
  const userStore = useUserStore();
  const menuStore = useMenuStore();

  NProgress.start();
  markProgressDecorative();

  const token = storage.get<string>(TOKEN_KEY);
  const forcePath = `${AUTH.ROOT}/${AUTH.FORCE_PASSWORD}`;

  // 未登录 + 非白名单 → 跳登录（带 redirect 回跳）
  if (!token && !isWhiteListed(to.path)) {
    return { path: `${AUTH.ROOT}/${AUTH.LOGIN}`, query: { redirect: to.fullPath } };
  }

  // 未完成强制改密：除改密页外一律先回改密页
  if (token && userStore.mustChangePassword && to.path !== forcePath) {
    return { path: forcePath, replace: true };
  }

  // 已完成改密却停在改密页：回根路径
  if (token && !userStore.mustChangePassword && to.path === forcePath) {
    return { path: LAYOUT.ROOT, replace: true };
  }

  // 已登录 + 访问登录/注册/忘记密码 → 回根路径（改密页除外）
  if (token && isWhiteListed(to.path) && to.path.startsWith(AUTH.ROOT) && to.path !== forcePath) {
    return { path: LAYOUT.ROOT, replace: true };
  }

  // 已登录且路由表未就绪：先拉 profile（唯一数据源）再注册业务路由
  // 改密页不装业务菜单，跳过这一步
  if (token && !menuStore.routesReady && to.path !== forcePath) {
    try {
      const profile = await userStore.fetchProfile();
      // 首次登录被要求改密：不装配业务菜单，直接去改密页
      if (profile.mustChangePassword) {
        return { path: forcePath, replace: true };
      }
      menuStore.setMenus(profile.menus);
      const warns = registerDynamicRoutes(menuStore.menuDataArry);
      if (warns.length) console.warn("[动态路由] 以下菜单未生成路由：\n" + warns.join("\n"));
      menuStore.markRoutesReady();
    } catch {
      // 拉取失败：直接落错误页，避免"未命中 → 重解析"形成循环
      return { path: `/${ERROR_PAGE.ROOT}/${FALLBACK_ERROR_CODE}`, replace: true };
    }

    // 注册完成前本次目标可能已落到兜底路由；兜底是 redirect，原始地址在 redirectedFrom 上
    const fallbackFrom = to.redirectedFrom;
    if (to.matched.length === 0 || to.name === FALLBACK_NAME || fallbackFrom?.name === FALLBACK_NAME) {
      return {
        path: fallbackFrom?.path ?? to.path,
        query: fallbackFrom?.query ?? to.query,
        hash: fallbackFrom?.hash ?? to.hash,
        replace: true
      };
    }
  }

  // 根路径落到首页：Layout 不再写死 redirect，避免无该菜单的角色直接 404
  if (token && to.path === LAYOUT.ROOT) {
    return { path: HOME_PATH, replace: true };
  }

  document.title = i18n.global.t(to.meta.title as string) + " - " + APP_NAME;
});

// 前端路由守卫 - 后置守卫:进度条结束
router.afterEach(() => {
  /* NProgress.start() 表示进度条结束 */

  NProgress.done();
});
