import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { createI18n } from "vue-i18n";
// 只取两个注入键，包根导入会把整套组件库拉进同一个块
import { ID_INJECTION_KEY } from "element-plus/es/hooks/use-id/index.mjs";
import { ZINDEX_INJECTION_KEY } from "element-plus/es/hooks/use-z-index/index.mjs";
import zhCN from "@/locales/zh-cn";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "@/assets/styles/tokens/tokens.css";
import "@/assets/styles/reset/reset.css";
import "@/assets/styles/reset/element.css";
import "./custom.css";

/**
 * 文档站主题：VitePress 默认主题 + 项目样式与语言包。
 * 语言实例只装中文包，组件里的 t() 能取到真实文案，示例与界面一致。
 */
const i18n = createI18n({
  legacy: false,
  locale: "zh-cn",
  fallbackLocale: "zh-cn",
  messages: {
    "zh-cn": zhCN
  }
});

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(i18n);
    // 服务端渲染时 Element Plus 需要固定的 id 与层级起始值，否则水合会对不上
    app.provide(ID_INJECTION_KEY, { prefix: 1024, current: 0 });
    app.provide(ZINDEX_INJECTION_KEY, { current: 0 });
  }
} satisfies Theme;
