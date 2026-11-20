/**
 * ==========================================
 * 路由表 TS版
 * ==========================================
 */
import { LAYOUT, AUTH, LEGAL, ERROR_PAGE, FALLBACK_ERROR_CODE } from "@/constants";
import { createRouter, createWebHistory } from "vue-router";

// createRouter方法，用于创建路由器实例，可以管理多个路由
export const router = createRouter({
  // 路由基址跟随构建基址，静态站点挂子路径时无需再改代码
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // Layout 根路由就是**整个后台外壳**（侧边栏 + 顶栏 + 内容区），菜单就是渲染在它里面
    {
      path: LAYOUT.ROOT,
      // 动态路由挂载点 依赖此 name
      name: "Layout",
      component: () => import("@/layout/index.vue"),
      children: [
        //只保留个人中心 其他动态生成
        {
          path: LAYOUT.PROFILE,
          component: () => import("@/pages/profile/index.vue"),
          meta: { title: "route.profile" }
        }
      ]
    },
    // Auth 登录与注册页面
    {
      path: AUTH.ROOT,
      redirect: `${AUTH.ROOT}/${AUTH.LOGIN}`,
      meta: { title: "route.auth.title" },
      children: [
        {
          path: AUTH.LOGIN,
          component: () => import("@/pages/auth/login/index.vue"),
          meta: { title: "route.auth.login" }
        },
        {
          path: AUTH.REGISTER,
          component: () => import("@/pages/auth/register/index.vue"),
          meta: { title: "route.auth.register" }
        },
        {
          path: AUTH.FORGOT,
          component: () => import("@/pages/auth/forgot/index.vue"),
          meta: { title: "route.auth.forgot" }
        },
        {
          path: AUTH.FORCE_PASSWORD,
          component: () => import("@/pages/auth/force-password/index.vue"),
          meta: { title: "route.auth.forcePassword" }
        }
      ]
    },
    // Legal 独立法律页terms 和 privacy
    {
      path: `/${LEGAL.ROOT}`,
      redirect: `/${LEGAL.ROOT}/${LEGAL.TERMS}`,
      meta: { title: "route.legal.title" },
      children: [
        {
          path: LEGAL.TERMS,
          component: () => import("@/pages/legal/terms/index.vue"),
          meta: { title: "route.legal.terms" }
        },
        {
          path: LEGAL.PRIVACY,
          component: () => import("@/pages/legal/privacy/index.vue"),
          meta: { title: "route.legal.privacy" }
        }
      ]
    },
    // 错误页面 :code 任意字符串，页面内兜底 404
    {
      path: `/${ERROR_PAGE.ROOT}`,
      redirect: `/${ERROR_PAGE.ROOT}/${FALLBACK_ERROR_CODE}`,
      meta: { title: "route.errors" },
      children: [
        {
          path: ERROR_PAGE.CODE,
          component: () => import("@/pages/errors/[code].vue"),
          meta: { title: "route.errors" }
        }
      ]
    }
  ],
  // 管理滚动行为 保证每次跳转，滚动条都回到最初的上面位置
  scrollBehavior() {
    return {
      left: 0,
      top: 0
    };
  }
});
