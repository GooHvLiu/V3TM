<template>
  <div class="pro-layout" :class="{ 'is-mobile': mobile }" :style="layoutStyle">
    <aside v-if="!mobile" class="pro-layout__aside" :class="{ 'is-collapsed': collapsed }">
      <slot name="sidebar" :collapsed="collapsed" :toggle="toggleCollapse" />
    </aside>

    <app-drawer
      v-if="mobile"
      v-model="drawerVisible"
      class="pro-layout__drawer"
      direction="ltr"
      :size="sidebarWidth"
      :with-header="false"
    >
      <slot name="sidebar" :collapsed="collapsed" :toggle="toggleCollapse" />
    </app-drawer>

    <div class="pro-layout__main">
      <header v-if="showHeader" class="pro-layout__header">
        <slot name="header" :collapsed="collapsed" :mobile="mobile" :toggle="toggleCollapse" />
      </header>
      <main class="pro-layout__content">
        <slot />
      </main>
      <footer v-if="$slots.footer" class="pro-layout__footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "ProLayout" });

import { computed } from "vue";

const collapsed = defineModel<boolean>("collapsed", { default: false });
const drawerVisible = defineModel<boolean>("drawerVisible", { default: false });

const props = withDefaults(
  defineProps<{
    mobile?: boolean;
    showHeader?: boolean;
    height?: string;
    sidebarWidth?: string;
    collapsedWidth?: string;
    headerHeight?: string;
    contentMaxWidth?: string;
  }>(),
  {
    mobile: false,
    showHeader: true,
    height: "100vh",
    sidebarWidth: "var(--sidebar-width)",
    collapsedWidth: "var(--sidebar-width-collapsed)",
    headerHeight: "56px",
    contentMaxWidth: "var(--content-max-width)"
  }
);

const layoutStyle = computed<Record<string, string>>(() => ({
  "--pro-layout-height": props.height,
  "--pro-sidebar-width": props.sidebarWidth,
  "--pro-sidebar-collapsed-width": props.collapsedWidth,
  "--pro-header-height": props.headerHeight,
  "--pro-content-max-width": props.contentMaxWidth
}));

const toggleCollapse = (): void => {
  if (props.mobile) {
    drawerVisible.value = true;
    return;
  }
  collapsed.value = !collapsed.value;
};

defineExpose({ toggleCollapse });
</script>

<style scoped lang="less">
.pro-layout {
  display: flex;
  width: 100%;
  height: var(--pro-layout-height);
  overflow: hidden;

  &__aside {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    width: var(--pro-sidebar-width);
    height: 100%;
    overflow: hidden;
    background: @color-bg-menu;
    transition: width 0.3s;

    &.is-collapsed {
      width: var(--pro-sidebar-collapsed-width);
    }
  }

  &__drawer {
    :deep(.el-drawer__body) {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 0;
      background: @color-bg-menu;
    }
  }

  &__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  &__header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: var(--pro-header-height);
    overflow: hidden;
    border-bottom: 1px solid @color-border;
  }

  &__content {
    flex: 1;
    width: 100%;
    max-width: var(--pro-content-max-width);
    margin: 0 auto;
    overflow-y: auto;
  }

  &__footer {
    flex-shrink: 0;
    border-top: 1px solid @color-border-lighter;
  }

  &.is-mobile &__main {
    width: 100%;
  }
}
</style>
