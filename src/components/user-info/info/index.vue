<template>
  <UserInfoSkeleton v-if="userLoading" :is-show="isShow" />
  <div v-else class="page-wrap-user-info">
    <div class="avatar">
      <UserAvatar :name="user?.realName" :role="avatarRole" />
    </div>
    <div v-if="isShow" class="userInfo">
      <div class="top-name">{{ user?.realName }}</div>
      <div class="bottom-email">{{ user?.email }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "UserInfo" });

// 引入子组件
import UserAvatar from "@/components/user-info/avatar/index.vue";
import UserInfoSkeleton from "../user-skeleton/index.vue";

// 引入常量
import { ISCOLLAPSED_KEY, USER_INFO_KEY, USER_LOADING_KEY } from "@/constants";
import type { AuthProfile } from "@/types";

import type { Ref } from "vue";

// 引入子组件

import { ref, inject, computed } from "vue";
import type { ComputedRef } from "vue";

// 传入折叠变量 isCollapsedEnable 是否启用的开关 默认生效
const props = withDefaults(defineProps<{ isCollapsedEnable?: boolean }>(), {
  isCollapsedEnable: true
});

/* const isShow = computed(() => {
  return props.isCollapsedEnable === true ? !isCollapsed.value : true;
}); */

// 从父组件获取数据并计算数据
const user = inject<ComputedRef<Partial<AuthProfile> | null>>(
  USER_INFO_KEY,
  computed(() => null)
);

// 从父组件注入共享状态
const isCollapsed = inject<Ref<boolean>>(ISCOLLAPSED_KEY, ref(false));

// 注入加载态（放在 user 注入旁边）
const userLoading = inject<Ref<boolean>>(USER_LOADING_KEY, ref(false));

// 计算是否需要显示
const isShow = computed(() => {
  if (!props.isCollapsedEnable) return true;
  return !isCollapsed.value;
});

// 头像按后端下发的角色渲染；缺失时交给头像回退，不在调用点猜某一档
const avatarRole = computed<string | null>(() => user.value?.role ?? null);

/* watch(() => test,() => {},{}); */

/* onMounted(() => {}); */

</script>

<style scoped lang="less">
.page-wrap-user-info {
  width: 100%;
  display: flex;
  align-items: center;
  gap: @space-2;
  min-width: 0;
  .avatar {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
  }
  .userInfo {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    font-size: 0.6rem;
    gap: @space-0-5;
    min-width: 0;
    max-width: 120px;
    color: @color-text-regular;
    .top-name {
      line-height: 1.2rem;
      font-weight: 900;
    }
    .top-name,
    .bottom-email {
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
