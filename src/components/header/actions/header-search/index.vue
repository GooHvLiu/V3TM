<template>
  <div class="page-wrap-header-search">
    <!-- 桌面：常驻搜索框 -->
    <search-desktop v-if="isDesktop" />
    <!-- 平板：图标 → 点击内联展开 -->
    <search-tablet v-else-if="isTablet" />
    <!-- 移动：图标 → 点击全屏搜索 -->
    <search-mobile v-else />
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "HeaderSearch" });

// 引入常量
import { IS_DESKTOP_KEY, IS_TABLET_KEY } from "@/constants";

// 引入 vue 方法
import { inject, ref } from "vue";
import type { Ref } from "vue";

// 引入子组件（三端形态各自独立封装）
import SearchDesktop from "./search-desktop.vue";
import SearchTablet from "./search-tablet.vue";
import SearchMobile from "./search-mobile.vue";

// 屏幕尺寸（layout 注入，分发渲染形态）
const isDesktop = inject<Ref<boolean>>(IS_DESKTOP_KEY, ref(false));
const isTablet = inject<Ref<boolean>>(IS_TABLET_KEY, ref(false));
</script>

<!-- 全局弹层样式：桌面/平板共用 popper-class -->
<style lang="less">
.menu-search-popper {
  .el-select-dropdown__item {
    display: flex;
    align-items: center;
    gap: @space-1-5;
    font-size: 0.8rem;
  }
}
</style>
