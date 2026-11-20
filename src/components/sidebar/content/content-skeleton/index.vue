<template>
  <div class="page-wrap-sidebar-content-skeleton">
    <!-- 常规菜单 -->
    <div class="group-no-arrow">
      <el-skeleton animated class="group-name">
        <template #template>
          <el-skeleton-item variant="rect" class="group-title" />
        </template>
      </el-skeleton>
      <div v-for="i in 2" :key="i" class="menu-name-no-arrow">
        <el-skeleton animated class="menu-name">
          <template #template>
            <el-skeleton-item variant="rect" class="menu-title" />
          </template>
        </el-skeleton>
      </div>
    </div>
    <!-- 项目任务 -->
    <div class="group-arrow">
      <el-skeleton animated class="group-name">
        <template #template>
          <el-skeleton-item variant="rect" class="group-title" />
        </template>
      </el-skeleton>
      <div v-for="i in 2" :key="i" class="menu-name-arrow">
        <el-skeleton animated class="menu-name">
          <template #template>
            <el-skeleton-item variant="rect" class="menu-title" />
          </template>
        </el-skeleton>
      </div>
    </div>
    <!-- 系统设置 -->
    <div class="group-arrow">
      <el-skeleton animated class="group-name">
        <template #template>
          <el-skeleton-item variant="rect" class="group-title" />
        </template>
      </el-skeleton>
      <div v-for="i in 6" :key="i" class="menu-name-arrow">
        <el-skeleton animated class="menu-name">
          <template #template>
            <el-skeleton-item variant="rect" class="menu-title" />
          </template>
        </el-skeleton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "MenuContentSkeleton" });

// 引入子组件

</script>

<style scoped lang="less">
.page-wrap-sidebar-content-skeleton {
  .group-no-arrow,
  .group-arrow {
    margin: @space-5 0;
    .group-name {
      margin: @space-5 0;
      width: 60px;
    }
    .menu-name-no-arrow {
      width: 120px;
      margin: @space-4 0;
    }
    .menu-name-arrow {
      width: 90%;
      margin: @space-4 0;
    }
  }
  .group-arrow {
    margin: @space-10 0;
  }
}
</style>
