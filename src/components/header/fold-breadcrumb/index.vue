<template>
  <div class="page-wrap-header-fold-breadcrumb">
    <div
      class="left-fold"
      role="button"
      tabindex="0"
      :aria-label="t('sidebar.toggle')"
      @click="handleFoldClick"
      @keydown.enter.prevent="handleFoldClick"
      @keydown.space.prevent="handleFoldClick"
    >
      <!-- 移动端：打开抽屉图标 -->
      <el-icon v-if="isMobile" size="18"><i-carbon-menu /></el-icon>
      <!-- 桌面/平板：折叠状态切换 -->
      <el-icon v-else-if="!isCollapsed" size="18"><i-carbon-side-panel-close /></el-icon>
      <el-icon v-else size="18"><i-carbon-side-panel-open /></el-icon>
    </div>
    <div class="middle-line" :class="{ 'not-desktop-hide': !isDesktop }" />
    <div class="right-Breadcrumb" :class="{ 'not-desktop-hide': !isDesktop }">
      <BreadcrumbNav />
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "HeaderFoldBreadcrumb" });

// 引入常量
import { IS_DESKTOP_KEY, IS_MOBILE_KEY, ISCOLLAPSED_KEY, HANDLE_FOLD_CLICK_KEY } from "@/constants";

// 引入子组件 面包屑 组件
import BreadcrumbNav from "@/components/breadcrumb/nav/index.vue";

import { ref, inject } from "vue";
import { useI18n } from "vue-i18n";

import type { Ref } from "vue";

const { t } = useI18n();

// 接收父组件传递进来的菜单是否折叠的变量
const isCollapsed = inject<Ref<boolean>>(ISCOLLAPSED_KEY, ref(false));

// 接收父组件传递进来的是否为移动端的变量
const isMobile = inject<Ref<boolean>>(IS_MOBILE_KEY, ref(false));

// 接收父组件传递进来的是否为桌面端的变量
const isDesktop = inject<Ref<boolean>>(IS_DESKTOP_KEY, ref(true));

// 接收父组件传递进来的 点击菜单折叠按钮 后的回调函数
const handleFoldClick = inject<() => void>(HANDLE_FOLD_CLICK_KEY, () => {});

</script>

<style scoped lang="less">
.page-wrap-header-fold-breadcrumb {
  /* 字体颜色 */
  color: @color-text-primary;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: @space-4;
  .left-fold {
    margin-left: @space-4;
  }
  .middle-line {
    border-left: 1px solid @color-border-light;
    height: 20px;
  }
  .not-desktop-hide {
    display: none;
  }
  /* 折叠按钮图标三端尺寸（替代原 @media 块） */
  .responsive-icon-size();
}
</style>
