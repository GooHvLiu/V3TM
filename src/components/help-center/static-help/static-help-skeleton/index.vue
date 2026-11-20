<template>
  <div class="page-wrap-static-help-skeleton">
    <!-- 左：目录树占位 -->
    <div class="static-help-skeleton-aside">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="rect" class="s-section" />
          <el-skeleton-item variant="rect" class="s-item" />
          <el-skeleton-item variant="rect" class="s-item" />
          <el-skeleton-item variant="rect" class="s-item" />
          <el-skeleton-item variant="rect" class="s-item" />
        </template>
      </el-skeleton>
    </div>
    <!-- 右：文章占位 -->
    <div class="static-help-skeleton-main">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="rect" class="s-title" />
          <el-skeleton-item variant="text" class="s-summary" />
          <el-skeleton-item variant="text" class="s-line" />
          <el-skeleton-item variant="text" class="s-line" />
          <el-skeleton-item variant="text" class="s-line s-line-short" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "StaticHelpSkeleton" });
</script>

<style scoped lang="less">
.page-wrap-static-help-skeleton {
  display: flex;
  gap: @space-4;
  min-height: 480px;
  flex: 1;

  .static-help-skeleton-aside {
    width: 240px;
    flex-shrink: 0;
    border: 1px solid var(--el-border-color);
    border-radius: var(--radius-lg);
    padding: @space-3;

    .el-skeleton {
      display: flex;
      flex-direction: column;
      gap: @space-3;
    }
    .s-section {
      width: 90px;
      height: 18px;
      margin-bottom: @space-1;
    }
    .s-item {
      width: 100%;
      height: 14px;
    }
  }

  .static-help-skeleton-main {
    flex: 1;
    min-width: 0;
    border: 1px solid var(--el-border-color);
    border-radius: var(--radius-lg);
    padding: @space-4 @space-5;

    .el-skeleton {
      display: flex;
      flex-direction: column;
      gap: @space-3;
    }
    .s-title {
      width: 40%;
      height: 24px;
    }
    .s-summary {
      width: 70%;
    }
    .s-line {
      width: 100%;
    }
    .s-line-short {
      width: 60%;
    }
  }
}
</style>
