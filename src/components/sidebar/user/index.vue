<template>
  <div class="page-wrap-siderbar-user">
    <el-dropdown
      :teleported="true"
      :trigger="isCollapsed ? 'hover' : 'click'"
      placement="top-start"
      @command="handleCommand"
      ><div class="user-trigger" :aria-label="isCollapsed ? userLabel : undefined">
        <UserInfo class="user-info-wrapper" :is-collapsed-enable="true" />
        <div v-if="!isCollapsed && !userLoading" class="right-more-icon">
          <el-icon v-if="!userLoading">
            <i-carbon-chevron-sort />
          </el-icon>
        </div>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item class="menu-user-item" :command="LAYOUT.PROFILE"><UserInfo :is-collapsed-enable="false" class="menu-user-info" /></el-dropdown-item>
          <el-dropdown-item
            :icon="Bell"
            :command="LAYOUT.ADMIN_CENTER.ROOT + '/' + LAYOUT.ADMIN_CENTER.NOTICE_CENTER"
            >{{ t("sidebar.user.notice_center") }}</el-dropdown-item>
          <el-dropdown-item :icon="User" :command="LAYOUT.PROFILE">{{ t("sidebar.user.profile") }}</el-dropdown-item>
          <el-dropdown-item :icon="Setting" :command="LAYOUT.SYSTEM_SETTINGS">{{
            t("sidebar.user.system_settings")
          }}</el-dropdown-item>
          <el-dropdown-item :icon="Warning" :command="LAYOUT.ABOUT.ROOT + '/' + LAYOUT.ABOUT.HELP">{{
            t("sidebar.user.help")
          }}</el-dropdown-item>
          <el-dropdown-item :icon="SwitchButton" command="logout">{{ t("sidebar.user.logout") }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "SidebarUser" });

// 引入子组件
import UserInfo from "@/components/user-info/info/index.vue";

// 引入常量
import { ISCOLLAPSED_KEY, USER_LOADING_KEY, LAYOUT, AUTH } from "@/constants";

import type { Ref } from "vue";

// 引入element plus实际使用图标
import { Bell, User, Setting, Warning, SwitchButton } from "@element-plus/icons-vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { ref, inject, computed } from "vue";

// 引入Store
import { useUserStore, useMenuStore } from "@/stores";
const userStore = useUserStore();
const menuStore = useMenuStore();

/** 折叠态只剩头像，名称要补到可读标签；展开态由可见文本充当名称，避免与真实文本冲突 */
const userLabel = computed<string>(() => userStore.userProfile?.realName || t("sidebar.user.profile"));

import { useRouter } from "vue-router";
const router = useRouter();

// onMounted(() => {});

// 从父组件注入共享状态
const isCollapsed = inject<Ref<boolean>>(ISCOLLAPSED_KEY, ref(false));

// 注入加载态（放在 user 注入旁边）
const userLoading = inject<Ref<boolean>>(USER_LOADING_KEY, ref(false));

// 处理下拉菜单的点击触发事件
const handleCommand = async (command: string) => {
  if (command != "logout") {
    router.push(`/${command}`);
    return;
  }
  // 用户登出：先通知服务端吊销会话（内部失败也清本地），再清菜单并回登录页
  await userStore.logout();
  menuStore.setMenus([]);
  router.push(`${AUTH.ROOT}/${AUTH.LOGIN}`);
};
</script>

<style scoped lang="less">
.page-wrap-siderbar-user {
  width: 100%;
  .el-dropdown {
    width: 100%;
    .user-trigger {
      margin-left: @space-3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      cursor: pointer;
    }
    .right-more-icon {
      margin-right: @space-3;
      flex-shrink: 0;
    }
  } // 去掉 Element Plus 自带的聚焦黑框
  :deep(.el-tooltip__trigger:focus-visible) {
    outline: none;
  }
}
</style>

<style lang="less">
.menu-user-item .menu-user-info .userInfo {
  gap: 0;
}
</style>
