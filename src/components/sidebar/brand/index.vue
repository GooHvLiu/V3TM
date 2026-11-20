<template>
  <div class="page-wrap-sidebar-brand">
    <div class="left-logo">
      <BrandLogo :text="APP_SVG" />
    </div>
    <div class="right-infoArea">
      <div class="top-name" :class="{ hidden: isCollapsed }">{{ configStore.siteName }}</div>
      <div class="bottom-description" :class="{ hidden: isCollapsed }">{{ configStore.siteDescription }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "SidebarBrand" });

// 引入常量
import { APP_SVG, ISCOLLAPSED_KEY } from "@/constants/index";

// 引入store
import { useConfigStore } from "@/stores/modules/config";

import type { Ref } from "vue";

// 引入子组件
import BrandLogo from "@/components/brand/logo/index.vue";

import { ref, inject } from "vue";

// 从父组件注入共享状态（带默认值防御：万一组件被用在没 provide 的地方不报错）
const isCollapsed = inject<Ref<boolean>>(ISCOLLAPSED_KEY, ref(false));

// 系统配置 store（站点名称运行时可配，未加载回退常量）
const configStore = useConfigStore();
</script>

<style scoped lang="less">
.page-wrap-sidebar-brand {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: @space-2-5;
  gap: @space-2-5;
  .left-logo {
    width: 40px;
    height: 40px;
    .brand-logo {
      width: 100%;
      height: 100%;
    }
  }
  .right-infoArea {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: @space-1;
    white-space: nowrap;
    overflow: hidden;
    .top-name {
      color: @color-text-primary;
      font-weight: 900;
      font-size: 0.8rem;
    }
    .bottom-description {
      color: @color-text-primary;
      font-size: 0.75rem;
    }
  }
}
/* 折叠展开动画更顺畅 */
.hidden {
  display: none;
}
</style>
