<template>
  <div class="page-wrap-sidebar-menu" :class="{ collapsed: isCollapsed }">
    <template v-for="group in menus" :key="group.title">
      <div v-show="!isCollapsed || group.items.length" class="group">
        <!-- 分组标签（title 是 i18n key：General/Tasks/Settings/misc） -->
        <div v-show="!isCollapsed" class="label-line">
          <span class="label">{{ t(group.title) }}</span>
          <div class="line" />
        </div>
        <!-- 组内菜单（menu-item 递归处理 DIR/MENU/BUTTON） -->
        <MenuItem v-for="menu in group.items" :key="menu.id" :menu="menu" /></div></template>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "SidebarMenu" });

// 引入常量
import { OPEN_PATHS_KEY, TOGGLE_MENU_KEY, ISCOLLAPSED_KEY, GROUP_MENU_KEY } from "@/constants";

// 引入工具
import { toggleOpenPath, findParentDirChain } from "@/utils";

// 引入数据类型
import type { NavGroup } from "@/types";

// 引入子组件
import MenuItem from "./menu-item.vue";

// 导入国际化配置
import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { ref, inject, provide, watch, computed } from "vue";
import type { Ref } from "vue";

import { useRoute } from "vue-router";
const route = useRoute();

const isCollapsed = inject<Ref<boolean>>(ISCOLLAPSED_KEY, ref(false));
const menus = inject<Ref<NavGroup[]>>(GROUP_MENU_KEY, ref<NavGroup[]>([]));

// 手风琴状态：当前展开的 DIR path（null = 全收起）—— 只属于侧边栏 UI
const openPaths = ref<string[]>([]);

// 顶层菜单数组（拍平分组，供查找 DIR 链）—— computed 缓存，避免重复重建
const topMenus = computed(() => menus.value.flatMap((g) => g.items));

watch(
  () => route.path,
  (path) => {
    openPaths.value = findParentDirChain(topMenus.value, path);
  },
  { immediate: true }
);

// onMounted(() => {});

/**
 * 展开/收起（每层手风琴）
 * 点已展开 → 收起自己及以下
 * 点未展开 → 收起同层兄弟（同父路径），保留父层，展开自己
 */
const toggleMenu = (path: string): void => {
  openPaths.value = toggleOpenPath(openPaths.value, path);
};

// 注入给所有后代组件（递归组件自动继承，不用层层传 props）
provide(OPEN_PATHS_KEY, openPaths);
provide(TOGGLE_MENU_KEY, toggleMenu);
</script>

<style scoped lang="less">
.page-wrap-sidebar-menu {
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: @space-2-5;
  margin: @space-2-5;
  .group {
    .label-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: @space-3;
      .label {
        color: @color-text-secondary;
        margin-bottom: @space-2;
        white-space: nowrap;
        line-height: 2;
      }
      /* 分组标签右侧不绘制横线 */
      /* .line {
        background-color: @color-text-placeholder;
        height: 1px;
        width: 100%;
      } */
    }
  }
}
.page-wrap-sidebar-menu.collapsed {
  gap: 0;
}
</style>
