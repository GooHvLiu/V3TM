import { defineConfig } from "vitepress";
import { resolve } from "node:path";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import { enNav, enSidebar, zhNav, zhSidebar } from "./locales.mts";

const root = resolve(import.meta.dirname, "../..");

/**
 * 站点基址：默认挂在根路径。
 * 部署到子路径时由构建脚本注入 DOCS_BASE，如 /V3TM/
 */
const rawBase = process.env.DOCS_BASE || "/";
const basePath = rawBase.startsWith("/") ? rawBase : `/${rawBase}`;
const siteBase = basePath.endsWith("/") ? basePath : `${basePath}/`;

export default defineConfig({
  base: siteBase,
  lang: "zh-CN",
  title: "V3TM",
  description: "Vue 3 + Element Plus 中后台前端模板",
  cleanUrls: true,
  // README 是给维护者看的说明，不进页面
  srcExclude: ["README.md"],
  head: [["link", { rel: "icon", href: `${siteBase}favicon.svg`, type: "image/svg+xml" }]],
  // 中文挂在根路径，英文走 /en/ 前缀；两套导航与侧边栏分别来自 locales
  locales: {
    root: {
      label: "简体中文",
      lang: "zh-CN",
      title: "V3TM",
      description: "Vue 3 + Element Plus 中后台前端模板",
      themeConfig: {
        nav: zhNav,
        sidebar: zhSidebar,
        outline: { label: "本页", level: [2, 3] },
        docFooter: { prev: "上一篇", next: "下一篇" },
        returnToTopLabel: "回到顶部",
        darkModeSwitchLabel: "主题",
        sidebarMenuLabel: "目录",
        lastUpdated: { text: "最后更新" }
      }
    },
    en: {
      label: "English",
      lang: "en-US",
      title: "V3TM",
      description: "Vue 3 + Element Plus admin template",
      themeConfig: {
        nav: enNav,
        sidebar: enSidebar,
        outline: { label: "On this page", level: [2, 3] },
        docFooter: { prev: "Previous", next: "Next" },
        returnToTopLabel: "Back to top",
        darkModeSwitchLabel: "Theme",
        sidebarMenuLabel: "Menu",
        lastUpdated: { text: "Last updated" }
      }
    }
  },
  themeConfig: {
    search: { provider: "local" }
  },
  vite: {
    plugins: [
      Components({
        resolvers: [ElementPlusResolver({ importStyle: false })]
      })
    ],
    // 生产构建常量：SSR 阶段 vue-i18n 读不到 Vite 的默认注入时用它兜底
    define: {
      __VUE_PROD_DEVTOOLS__: "false",
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false"
    },
    // 语言包要参与转换，否则 SSR 外部化后常量替换不生效
    ssr: {
      noExternal: ["vue-i18n"]
    },
    resolve: {
      alias: {
        "@": resolve(root, "src")
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import "@/assets/styles/variables/variables.less";`
        }
      }
    },
    build: {
      // 组件库是项目既有公共依赖，单块约 1 MB，与主应用同源；阈值按实测留出余量
      chunkSizeWarningLimit: 1100,
      rollupOptions: {
        output: {
          // 组件库与图表单独成块，页面 chunk 不带这两份公共依赖
          manualChunks(id: string) {
            if (id.includes("node_modules/element-plus")) return "element-plus";
            if (id.includes("node_modules/echarts") || id.includes("node_modules/zrender")) return "echarts";
            return undefined;
          }
        }
      }
    }
  }
});
