<template>
  <div class="page-wrap-user-skeleton">
    <el-skeleton animated class="user-circle">
      <template #template>
        <el-skeleton-item variant="circle" class="name-role" />
      </template>
    </el-skeleton>
    <el-skeleton v-if="isShow" animated class="user-info">
      <template #template>
        <el-skeleton-item variant="rect" class="info" />
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "UserInfoSkeleton" });

// 移动端和桌面、平板端是否展示的变量
withDefaults(
  defineProps<{
    isShow?: boolean;
  }>(),
  {
    isShow: true
  }
);

</script>

<style scoped lang="less">
.page-wrap-user-skeleton {
  display: flex;
  align-items: center;
  gap: @space-2;
  .user-circle {
    .name-role {
      margin-left: @space-1;
      width: 30px;
      height: 30px;
    }
  }
  .user-info {
    .info {
      width: 100px;
    }
  }
}
</style>
