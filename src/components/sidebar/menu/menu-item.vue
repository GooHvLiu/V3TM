<template>
  <div class="menu">
    <!-- DIR：有子菜单，需要递归展示-->
    <div v-if="menu.type === 'DIR' && menu.children?.length" class="menu-group">
      <div
        class="icon-name-icon"
        role="button"
        tabindex="0"
        :aria-expanded="isOpen"
        @click="handleToggle"
        @keydown.enter.prevent="handleToggle"
        @keydown.space.prevent="handleToggle"
      >
        <div class="left-icon-name">
          <el-icon class="font-icon" size="18">
            <component :is="menuIcon" v-if="menuIcon" />
          </el-icon>
          <span class="name" :class="{ hidden: isCollapsed }">{{ t(menu.name) }}</span>
        </div>
        <el-icon v-if="!isCollapsed" class="right-arrow" :class="{ 'is-open': isOpen }" size="14">
          <i-carbon-chevron-right v-if="!isOpen" />
          <i-carbon-chevron-down v-else />
        </el-icon>
      </div>
      <!-- 子菜单：展开就显示，递归渲染 -->
      <div v-show="isOpen && !isCollapsed" class="menu-sub">
        <div class="tree-branch" />
        <MenuItem v-for="child in menu.children" :key="child.id" :menu="child" />
      </div>
    </div>
    <!-- MENU：无子项，单独的菜单   -->
    <div
      v-else-if="menu.type === 'MENU'"
      class="menu-item"
      role="button"
      tabindex="0"
      :class="{ 'is-active': isActive }"
      @click="handleMenuClick(menu)"
      @keydown.enter.prevent="handleMenuClick(menu)"
      @keydown.space.prevent="handleMenuClick(menu)"
    >
      <div class="left-icon-name">
        <el-icon class="font-icon" size="18" :class="{ 'is-placeholder': !menuIcon }">
          <component :is="menuIcon" v-if="menuIcon" />
        </el-icon>
        <span class="name" :class="{ hidden: isCollapsed }">{{ t(menu.name) }}</span>
      </div>
    </div>
    <!-- type === 'BUTTON' → 什么都不渲染 -->
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "MenuItem" });

// 引入常量
import { OPEN_PATHS_KEY, TOGGLE_MENU_KEY, ISCOLLAPSED_KEY, EXPAND_SIDEBAR_KEY } from "@/constants";

// 引入工具
import { isExternalUrl } from "@/utils";
import { resolveMenuIcon } from "@/utils/menu/icon";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import type { Ref } from "vue";
import type { Menu } from "@/types/index";

import { ref, computed, inject } from "vue";

import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();

// 从父组件注入共享状态（带默认值防御：万一组件被用在没 provide 的地方不报错）
const openPaths = inject<Ref<string[]>>(OPEN_PATHS_KEY, ref([]));
const toggleMenu = inject<(path: string) => void>(TOGGLE_MENU_KEY, () => {});
const isCollapsed = inject<Ref<boolean>>(ISCOLLAPSED_KEY, ref(false));
const expandSidebar = inject<() => void>(EXPAND_SIDEBAR_KEY, () => {});

// 递归渲染菜单使用的传递过来的变量 item
const props = withDefaults(defineProps<{ menu: Menu }>(), {});

// 图标按后端组件名解析，避免动态 :is 拿到字符串后渲染成空标签
const menuIcon = computed(() => resolveMenuIcon(props.menu.icon));

// 计算属性：叶子项是否高亮（当前路由命中）
const isActive = computed(() => route.path === props.menu.path);

// 是否展开：自己是否在展开链里
const isOpen = computed(() => openPaths.value.includes(props.menu.path));

// onMounted(() => {});

// DIR 点击：展开/收起子菜单；折叠态通知父组件
const handleToggle = (): void => {
  if (isCollapsed.value) expandSidebar();
  toggleMenu(props.menu.path);
};

// MENU 点击：跳转路由；折叠态通知父组件
const handleMenuClick = (menu: Menu): void => {
  if (isCollapsed.value) return expandSidebar();
  if (!menu.path) return;
  if (isExternalUrl(menu.path)) {
    window.open(menu.path, "_blank", "noopener,noreferrer");
  } else {
    router.push(menu.path);
  }
};
</script>

<style scoped lang="less">
.menu {
  color: @color-text-primary;
  .menu-group {
    .icon-name-icon {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .name {
        white-space: nowrap;
        overflow: hidden;
      }
      &:hover {
        cursor: pointer;
        background-color: @color-bg-hover;
        border-radius: @radius-lg;
      }
    }
    .menu-sub {
      position: relative;
      .tree-branch {
        position: absolute;
        left: 18px;
        top: 0px;
        bottom: 15px;
        width: 1px;
        border-left: 1px solid @color-text-placeholder;
      }
    }
  }
  .menu-item {
    border-radius: @radius-lg;
  }
  .menu-item.is-active {
    background-color: @color-bg-hover;
    font-weight: 900;
  }
}
</style>

<style scoped lang="less">
.menu-group > .icon-name-icon > .left-icon-name,
.menu-item > .left-icon-name {
  display: flex;
  align-items: center;
  height: 35px;
  padding: 1px 10px;
  gap: @space-1-5;
  min-width: 0;
  overflow: hidden;
  .font-icon {
    width: 18px;
    flex-shrink: 0;
  }
  .name {
    white-space: nowrap;
    overflow: hidden;
  }
  &:hover {
    cursor: pointer;
    background-color: @color-bg-hover;
    border-radius: @radius-base;
  }
}
/* 折叠展开动画更顺畅 */
.hidden {
  display: none;
}
</style>

<style scoped lang="less">
/* ===== 移动端触控 ===== */
@media (max-width: @mobile-max) {
  .menu-group > .icon-name-icon > .left-icon-name,
  .menu-item > .left-icon-name {
    height: 44px;
    margin: @space-0-5 0;
  }
}
@media (hover: none) {
  .icon-name-icon:hover,
  .left-icon-name:hover {
    background-color: transparent;
  }
}
</style>
