import { defineConfig } from "vitepress";
import { resolve } from "node:path";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

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
  themeConfig: {
    nav: [
      { text: "指南", link: "/guide/" },
      { text: "组件", link: "/components/" },
      { text: "业务组件", link: "/business/" },
      { text: "参考", link: "/reference/" },
      { text: "演示", link: "/playground/" }
    ],
    sidebar: {
      "/guide/": [
        {
          text: "指南",
          items: [
            { text: "快速开始", link: "/guide/" },
            { text: "目录与分层", link: "/guide/structure" },
            { text: "环境变量与 Mock", link: "/guide/env" },
            { text: "路由与权限", link: "/guide/routing" },
            { text: "请求层", link: "/guide/request" }
          ]
        }
      ],
      "/components/": [
        {
          text: "原子组件",
          items: [
            { text: "总览", link: "/components/" },
            { text: "按钮 AppButton", link: "/components/button" },
            { text: "标签 AppTag", link: "/components/tag" },
            { text: "提示 AppTooltip", link: "/components/tooltip" },
            { text: "提醒 AppAlert", link: "/components/alert" },
            { text: "卡片 AppCard", link: "/components/card" },
            { text: "头像 AppAvatar", link: "/components/avatar" },
            { text: "徽标 AppBadge", link: "/components/badge" },
            { text: "抽屉 AppDrawer", link: "/components/drawer" },
            { text: "对话框 AppDialog", link: "/components/dialog" },
            { text: "页签 AppTabs", link: "/components/tabs" },
            { text: "分隔 AppSeparator", link: "/components/separator" },
            { text: "空态 AppEmpty", link: "/components/empty" },
            { text: "骨架 AppSkeleton", link: "/components/skeleton" },
            { text: "错误态 AppErrorState", link: "/components/error-state" }
          ]
        }
      ],
      "/business/": [
        {
          text: "业务组件",
          items: [
            { text: "总览", link: "/business/" },
            { text: "表格 ProTable", link: "/business/pro-table" },
            { text: "表单 ProForm", link: "/business/pro-form" },
            { text: "查询 ProSearch", link: "/business/pro-search" },
            { text: "图表 BaseChart", link: "/business/base-chart" }
          ]
        }
      ],
      "/reference/": [
        {
          text: "参考",
          items: [
            { text: "总览", link: "/reference/" },
            { text: "间距令牌", link: "/reference/spacing" },
            { text: "断点", link: "/reference/breakpoints" }
          ]
        }
      ]
    },
    outline: { label: "本页", level: [2, 3] },
    docFooter: { prev: "上一篇", next: "下一篇" },
    returnToTopLabel: "回到顶部",
    darkModeSwitchLabel: "主题",
    sidebarMenuLabel: "目录",
    lastUpdated: { text: "最后更新" },
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
