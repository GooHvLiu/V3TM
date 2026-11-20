<template>
  <!-- 三段式共享内容：桌面/平板 aside 与 移动端 drawer 共用 -->
  <div class="sidebar-content">
    <div class="top-logoTips-menu" tabindex="0">
      <!-- 品牌展示区 -->
      <div class="top-logo-tips">
        <SidebarBrand />
      </div>
      <!-- 菜单展示区 -->
      <div class="bottom-menu">
        <MenuContentSkeleton v-if="loading" />
        <SidebarMenu v-else />
      </div>
    </div>
    <!-- 登录用户区 -->
    <div class="bottom-user-setting">
      <SidebarUser />
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "SidebarContent" });

// 菜单加载态（外壳传值，遮罩只盖菜单滚动区，还原原行为）
defineProps<{ loading?: boolean }>();

// 引入子组件（三段式部件，同域组件）
import SidebarBrand from "@/components/sidebar/brand/index.vue";
import SidebarMenu from "@/components/sidebar/menu/index.vue";
import SidebarUser from "@/components/sidebar/user/index.vue";

// 引入骨架屏
import MenuContentSkeleton from "./content-skeleton/index.vue";
</script>

<style scoped lang="less">
.sidebar-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  .top-logoTips-menu {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    .top-logo-tips {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      height: @header-height;
      border-bottom: 1px solid @color-border;
    }
  }
  .bottom-user-setting {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: @user-setting-height;
    border-top: 1px solid @color-border;
  }
}
</style>
