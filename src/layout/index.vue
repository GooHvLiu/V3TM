<template>
  <pro-layout
    v-model:collapsed="isCollapsed"
    v-model:drawer-visible="drawerVisible"
    :mobile="isMobile"
  >
    <template #sidebar>
      <SidebarContent :loading="menuLoading" />
    </template>

    <template #header>
      <HeaderFoldBreadcrumb />
      <HeaderActions />
    </template>

    <h1 v-if="pageTitle" class="sr-only">{{ pageTitle }}</h1>
    <router-view />
  </pro-layout>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "Layout" });

// 引入常量
import {
  IS_DESKTOP_KEY,
  IS_TABLET_KEY,
  IS_MOBILE_KEY,
  ISCOLLAPSED_KEY,
  HANDLE_FOLD_CLICK_KEY,
  BREADCRUMBS_KEY,
  MENU_ITEMS_KEY,
  GROUP_MENU_KEY,
  EXPAND_SIDEBAR_KEY,
  USER_INFO_KEY,
  USER_LOADING_KEY
} from "@/constants";

// 引入使用工具
import { useBreakpoint } from "@/composables";

// 用户Store
import { useUserStore } from "@/stores";
const userStore = useUserStore();

// 菜单Store
import { useMenuStore } from "@/stores";
const menuStore = useMenuStore();

// 引入子组件用于 操作 组件
import HeaderActions from "@/components/header/actions/index.vue";
// 引入子组件 侧边栏三段式共享内容（品牌 + 菜单 + 用户）
import SidebarContent from "@/components/sidebar/content/index.vue";
// 引入子组件 头部折叠与面包屑 组件
import HeaderFoldBreadcrumb from "@/components/header/fold-breadcrumb/index.vue";
// 布局骨架：侧栏 / 顶栏 / 内容三段固定结构
import ProLayout from "@/components/common/layout/pro-layout/index.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { ref, computed, watch, provide } from "vue";
import { unref } from "vue";

import { useRoute } from "vue-router";
const route = useRoute();

// 侧边栏折叠状态
const isCollapsed = ref<boolean>(false);

// 移动端抽屉
const drawerVisible = ref<boolean>(false);

// 统一 computed 直读 store
const menuDataArry = computed(() => unref(menuStore.menuDataArry));
const groupedMenus = computed(() => unref(menuStore.groupedMenus));
const menuLoading = computed(() => !!userStore.loading);
const userProfile = computed(() => unref(userStore.userProfile));

// 从 useBreakpoint 中解构出数据
const { breakpoint, isMobile, isTablet, isDesktop } = useBreakpoint();

// 去掉根目录'/' 并重新导出带有 title path 字段的对象 path 已是完整路径
const breadcrumbs = computed(() => {
  return route.matched
    .filter((r) => r.meta?.title && r.path !== "/")
    .map((r) => ({
      title: t(r.meta.title as string),
      path: r.path
    }));
});

// 页面主标题：交给读屏定位，视觉标题仍由各页头部呈现
const pageTitle = computed(() => breadcrumbs.value[breadcrumbs.value.length - 1]?.title ?? "");

// 监控响应式断点的值
watch(
  breakpoint,
  (v) => {
    if (v === "tablet") isCollapsed.value = true;
    if (v === "desktop") isCollapsed.value = false;
    if (v === "mobile") isCollapsed.value = false;
  },
  {
    immediate: true
  }
);

// 当路由跳转之后，自动关闭移动端抽离效果
watch(
  () => route.path,
  () => {
    drawerVisible.value = false;
  }
);

// 离开移动端断点时自动关闭抽屉（drawer 仅服务移动端，平板/桌面用 aside）
watch(isMobile, (mobile) => {
  if (!mobile) drawerVisible.value = false;
});

// 初始化拉取菜单
// onMounted(() => {});

// 折叠按钮：移动端开抽屉，其他切换折叠
const handleFoldClick = (): void => {
  if (isMobile.value) {
    drawerVisible.value = true;
  } else {
    isCollapsed.value = !isCollapsed.value;
  }
};

// 展开侧边栏：仅桌面/平板有效（移动端菜单在 drawer，不受影响）
const expandSidebar = (): void => {
  if (!isMobile.value) isCollapsed.value = false;
};

// 注入给所有后代组件 是否为折叠状态
provide(ISCOLLAPSED_KEY, isCollapsed);
// 注入给所有后代组件 屏幕尺寸是否为桌面端
provide(IS_DESKTOP_KEY, isDesktop);
// 注入给所有后代组件 屏幕尺寸是否为平板端
provide(IS_TABLET_KEY, isTablet);
// 注入给所有后代组件 屏幕尺寸是否为移动端
provide(IS_MOBILE_KEY, isMobile);
// 注入给所有后代组件 点击菜单折叠按钮的处理方法
provide(HANDLE_FOLD_CLICK_KEY, handleFoldClick);
// 注入给所有后代组件 面包屑数据
provide(BREADCRUMBS_KEY, breadcrumbs);
// 注入给所有后代组件 菜单完整数据，子组件自己处理数据格式
provide(MENU_ITEMS_KEY, menuDataArry);
// 注入给所有后代组件 菜单 分组后 数据，子组件自己处理数据格式
provide(GROUP_MENU_KEY, groupedMenus);
// 注入给所有后代组件 用于通知父组件 已退出折叠状态
provide(EXPAND_SIDEBAR_KEY, expandSidebar);
// 注入给后代组件 用户信息
provide(USER_INFO_KEY, userProfile);
// 注入给后代组件 用户信息加载态
provide(
  USER_LOADING_KEY,
  computed(() => unref(userStore.loading))
);
</script>
