// Vue3 框架提供的方法 createApp 方法，可以用来创建应用实例方法
import { createApp } from "vue";
import type { Plugin } from "vue";

// 引入样式重置文件 reset.css
import "@/assets/styles/reset/reset.less";
// 将进度条的进度颜色与主题颜色动态绑定
import "@/assets/styles/reset/nprogress.css";
// 滚动条样式设置
import "@/assets/styles/reset/scrollbar.css";
// element Plus 样式定制
import "@/assets/styles/reset/element.css";
// 弹层在窄屏下的宽度兜底
import "@/assets/styles/reset/responsive.css";
// 键盘焦点环基线
import "@/assets/styles/reset/a11y.less";

// 引入工具 常量 Pinia 动态路由
import { storage } from "@/utils";
import { bindAuthEvents } from "@/utils/auth-bridge";
import { checkI18nKeys } from "@/utils/i18n-check";
import { TOKEN_KEY } from "@/constants";
import { useUserStore, useMenuStore } from "@/stores";
import { registerDynamicRoutes } from "@/router/dynamic";

// 引入根组件App
import App from "./App.vue";

import { router } from "./router";

// 引入 pinia 状态管理工具
import { createPinia } from "pinia";

// 引入 系统配置 store（运行时配置单点读取层）
import { useConfigStore } from "@/stores/modules/config";

// 引入 element-plus 服务样式：组件样式由构建期按需注入，服务类组件需手动引入
import "element-plus/es/components/message/style/css";
import "element-plus/es/components/message-box/style/css";
// Element Plus 官方暗色变量集（html.dark 下覆盖全部 EP 组件底色/文字/边框）
import "element-plus/theme-chalk/dark/css-vars.css";

// 引入动画 [npm install @formkit/auto-animate] 自动跟踪容器内元素的插入 / 删除 / 移动，自动补平滑动画
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";

// 引入 颜色令牌层（CSS 变量唯一家）
import "@/assets/styles/tokens/tokens.less";

// 引入自定义指令 用于判断权限点和渲染
import { permission } from "@/directives/permission.ts";

// 利用 createApp 方法创建应用实例
const app = createApp(App);

// 将创建的 createrPinia 进行挂载
const pinia = createPinia();
app.use(pinia as unknown as Plugin);

// 请求层的认证事件落到 store：放在 pinia 之后，避免 store 尚未就绪
bindAuthEvents();

// 引入国际化配置插件并应用
import i18n, { getLocale, hasSavedLocale, setLocale } from "@/locales";
app.use(i18n as unknown as Plugin);

// 渲染异常、未处理 Promise 与全局脚本错误统一兜底
import { installAppErrorHandler } from "@/utils/app-error";
installAppErrorHandler(app);

// 开发期校验后端固定标识是否都有词条，生产环境不输出 key
if (import.meta.env.DEV) {
  const missingKeys = checkI18nKeys();
  if (missingKeys.length) console.warn("[i18n] missing:", missingKeys);
}
import { request } from "@/utils/request";

// 引入路由守卫
import "./router/guards";

// 使用动画插件
app.use(autoAnimatePlugin);

// 注册 v-permission
app.directive("permission", permission);

// 加载系统参数：已登录拉全量，未登录只读匿名公开白名单
const configStore = useConfigStore();
const applyRuntimeConfig = (): void => {
  // 语言优先级：用户显式选择（本地持久化）> 后端默认语言 > 环境变量
  // 只有本地没有记录时才对齐后端，避免刷新把用户切过的语言冲掉
  const runtimeLocale = hasSavedLocale() ? getLocale() : configStore.defaultLocale;
  i18n.global.locale.value = runtimeLocale;
  setLocale(runtimeLocale);
  // request_timeout 仅前端消费；公开白名单不含该项时走常量兜底
  request.defaults.timeout = configStore.requestTimeout;
};

const configReady = storage.get<string>(TOKEN_KEY)
  ? configStore.fetchConfig()
  : configStore.fetchPublicConfig();

// 拉取失败也套一次兜底值，保证首屏语言与超时口径一致
configReady.then(applyRuntimeConfig).catch(applyRuntimeConfig);

/** 启动：已登录先装配动态路由，再安装路由与挂载（避免首屏路径未匹配） */
const bootstrap = async (): Promise<void> => {
  if (storage.get<string>(TOKEN_KEY)) {
    const userStore = useUserStore();
    const menuStore = useMenuStore();
    try {
      const profile = await userStore.fetchProfile();
      menuStore.setMenus(profile.menus);
      registerDynamicRoutes(menuStore.menuDataArry);
      menuStore.markRoutesReady();
    } catch {
      // 凭证失效等交给守卫后续处理
    }
  }

  // 使用 router 插件，全局注册相关方法
  app.use(router as unknown as Plugin);
  // 将应用实例挂载到挂载点上
  app.mount("#app");
};

bootstrap();
