<template>
  <div class="page-wrap-ai-help-skeleton">
    <!-- AI 头像占位 -->
    <el-skeleton animated class="ai-help-skeleton-avatar">
      <template #template>
        <el-skeleton-item variant="circle" class="s-avatar" />
      </template>
    </el-skeleton>
    <!-- 回复气泡占位 -->
    <div class="ai-help-skeleton-bubble">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="rect" class="s-line" />
          <el-skeleton-item variant="rect" class="s-line s-line-short" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "AiHelpReplySkeleton" });
</script>

<style scoped lang="less">
.page-wrap-ai-help-skeleton {
  display: flex;
  align-items: flex-start;
  gap: @space-2-5;

  .ai-help-skeleton-avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    .s-avatar {
      width: 36px;
      height: 36px;
    }
  }

  .ai-help-skeleton-bubble {
    width: 150px;
    padding: @space-2-5 @space-3;
    background: var(--el-fill-color-light);
    border-radius: var(--radius-lg);
    border-top-left-radius: var(--radius-sm);

    .el-skeleton {
      display: flex;
      flex-direction: column;
      gap: @space-2;
    }
    .s-line {
      height: 14px;
      border-radius: var(--radius-sm);
    }
    .s-line-short {
      width: 60%;
    }
  }
}
</style>
