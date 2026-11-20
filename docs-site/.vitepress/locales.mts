/**
 * 文档站导航与侧边栏
 * 中英两份并排维护：新增页面时两边各加一条，路径一一对应
 */
import type { DefaultTheme } from "vitepress";

export const zhNav: DefaultTheme.NavItem[] = [
  { text: "指南", link: "/guide/" },
  { text: "组件", link: "/components/" },
  { text: "业务组件", link: "/business/" },
  { text: "参考", link: "/reference/" },
  { text: "演示", link: "/playground/" }
];

export const enNav: DefaultTheme.NavItem[] = [
  { text: "Guide", link: "/en/guide/" },
  { text: "Components", link: "/en/components/" },
  { text: "Business", link: "/en/business/" },
  { text: "Reference", link: "/en/reference/" },
  { text: "Playground", link: "/en/playground/" }
];

export const zhSidebar: DefaultTheme.SidebarMulti = {
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
};

export const enSidebar: DefaultTheme.SidebarMulti = {
  "/en/guide/": [
    {
      text: "Guide",
      items: [
        { text: "Getting started", link: "/en/guide/" },
        { text: "Layout and layers", link: "/en/guide/structure" },
        { text: "Environment and mock", link: "/en/guide/env" },
        { text: "Routing and permissions", link: "/en/guide/routing" },
        { text: "Request layer", link: "/en/guide/request" }
      ]
    }
  ],
  "/en/components/": [
    {
      text: "Atoms",
      items: [
        { text: "Overview", link: "/en/components/" },
        { text: "Button AppButton", link: "/en/components/button" },
        { text: "Tag AppTag", link: "/en/components/tag" },
        { text: "Tooltip AppTooltip", link: "/en/components/tooltip" },
        { text: "Alert AppAlert", link: "/en/components/alert" },
        { text: "Card AppCard", link: "/en/components/card" },
        { text: "Avatar AppAvatar", link: "/en/components/avatar" },
        { text: "Badge AppBadge", link: "/en/components/badge" },
        { text: "Drawer AppDrawer", link: "/en/components/drawer" },
        { text: "Dialog AppDialog", link: "/en/components/dialog" },
        { text: "Tabs AppTabs", link: "/en/components/tabs" },
        { text: "Separator AppSeparator", link: "/en/components/separator" },
        { text: "Empty AppEmpty", link: "/en/components/empty" },
        { text: "Skeleton AppSkeleton", link: "/en/components/skeleton" },
        { text: "Error state AppErrorState", link: "/en/components/error-state" }
      ]
    }
  ],
  "/en/business/": [
    {
      text: "Business",
      items: [
        { text: "Overview", link: "/en/business/" },
        { text: "Table ProTable", link: "/en/business/pro-table" },
        { text: "Form ProForm", link: "/en/business/pro-form" },
        { text: "Search ProSearch", link: "/en/business/pro-search" },
        { text: "Chart BaseChart", link: "/en/business/base-chart" }
      ]
    }
  ],
  "/en/reference/": [
    {
      text: "Reference",
      items: [
        { text: "Overview", link: "/en/reference/" },
        { text: "Spacing tokens", link: "/en/reference/spacing" },
        { text: "Breakpoints", link: "/en/reference/breakpoints" }
      ]
    }
  ]
};
