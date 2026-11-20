<template>
  <div class="config-row">
    <!-- 标签 + 悬浮说明 -->
    <div class="config-row-label">
      <span class="config-row-text">{{ label }}</span>
      <app-tooltip v-if="tip && tip !== label" :content="tip" :show-after="200">
        <el-icon class="config-row-tip"><HelpFilled /></el-icon>
      </app-tooltip>
    </div>
    <!-- 值控件：由父组件通过默认插槽传入 -->
    <div class="config-row-control">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "ConfigRow" });

// Props：标签文案 + 悬浮提示文案（控件由插槽注入，本组件仅承载展示布局）
defineProps<{
  label: string;
  tip: string;
}>();
</script>

<style scoped lang="less">
.config-row {
  display: flex;
  align-items: center;
  gap: @space-4;
  padding: @space-3 0;

  & + & {
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.config-row-label {
  display: flex;
  align-items: center;
  gap: @space-1-5;
  flex: 0 0 160px;
}

.config-row-text {
  font-size: 14px;
  color: var(--color-text-primary, #1f2329);
}

.config-row-tip {
  font-size: 14px;
  color: var(--color-text-secondary, #646a73);
  cursor: help;
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary, #3370ff);
  }
}

.config-row-control {
  flex: 1;
  max-width: 300px;

  :deep(.el-input),
  :deep(.el-input-number),
  :deep(.el-select) {
    width: 100%;
  }
}

/* 窄屏下标签与控件换行：标签固定宽度会挤压控件 */
@media (max-width: @mobile-max) {
  .config-row {
    flex-direction: column;
    align-items: stretch;
    gap: @space-2;
  }

  .config-row-label {
    flex: 0 0 auto;
  }

  .config-row-control {
    max-width: none;
  }
}
</style>
