<template>
  <div class="page-wrap-ai-help-page-skeleton">
    <el-skeleton animated>
      <template #template>
        <div class="ai-help-page-skeleton-welcome">
          <el-skeleton-item variant="circle" class="ai-help-page-skeleton-avatar" />
          <el-skeleton-item variant="text" class="ai-help-page-skeleton-line" style="width: 55%" />
        </div>
        <div class="ai-help-page-skeleton-list">
          <div class="ai-help-page-skeleton-msg">
            <el-skeleton-item variant="circle" class="ai-help-page-skeleton-avatar" />
            <el-skeleton-item variant="text" class="ai-help-page-skeleton-bubble" style="width: 68%" />
          </div>
          <div class="ai-help-page-skeleton-msg is-right">
            <el-skeleton-item variant="circle" class="ai-help-page-skeleton-avatar" />
            <el-skeleton-item variant="text" class="ai-help-page-skeleton-bubble" style="width: 52%" />
          </div>
          <div class="ai-help-page-skeleton-msg">
            <el-skeleton-item variant="circle" class="ai-help-page-skeleton-avatar" />
            <el-skeleton-item variant="text" class="ai-help-page-skeleton-bubble" style="width: 40%" />
          </div>
        </div>
        <div class="ai-help-page-skeleton-input">
          <el-skeleton-item variant="rect" class="ai-help-page-skeleton-input-box" />
          <el-skeleton-item variant="rect" class="ai-help-page-skeleton-input-btn" />
        </div>
      </template>
      <template #default>
        <div class="ai-help-page-skeleton-content" />
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "AiHelpPageSkeleton" });
</script>

<style scoped lang="less">
.page-wrap-ai-help-page-skeleton {
  min-height: 480px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--radius-lg);
  padding: @space-4;
  box-sizing: border-box;

  .ai-help-page-skeleton-welcome {
    display: flex;
    align-items: center;
    gap: @space-2-5;
    margin-bottom: @space-4;
  }

  .ai-help-page-skeleton-avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .ai-help-page-skeleton-line {
    height: 14px;
  }

  .ai-help-page-skeleton-list {
    display: flex;
    flex-direction: column;
    gap: @space-3;
    margin-bottom: @space-4;
  }

  .ai-help-page-skeleton-msg {
    display: flex;
    align-items: flex-start;
    gap: @space-2-5;

    &.is-right {
      justify-content: flex-end;
      .ai-help-page-skeleton-avatar {
        order: 2;
      }
    }
  }

  .ai-help-page-skeleton-bubble {
    height: 40px;
    border-radius: var(--radius-sm);
    background: var(--el-fill-color-light);
  }

  .ai-help-page-skeleton-input {
    display: flex;
    gap: @space-2-5;
    align-items: center;
  }

  .ai-help-page-skeleton-input-box {
    flex: 1;
    height: 38px;
    border-radius: var(--radius-sm);
  }

  .ai-help-page-skeleton-input-btn {
    width: 72px;
    height: 38px;
    border-radius: var(--radius-sm);
  }
}
</style>
