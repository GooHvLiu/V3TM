<script setup lang="ts">
/**
 * 字段说明气泡
 * 挂在表单项标题后，鼠标移上去说明这个字段是什么、怎么填
 */
import { QuestionFilled } from "@element-plus/icons-vue";

defineProps<{ text: string }>();
</script>

<template>
  <app-tooltip :content="text" :show-after="80" :max-width="280">
    <el-icon class="help-tip"><QuestionFilled /></el-icon>
  </app-tooltip>
</template>

<style scoped lang="less">
.help-tip {
  margin-left: @space-1;
  padding: @space-0-5;
  font-size: 13px;
  color: @color-text-placeholder;
  cursor: help;
  vertical-align: -2px;
  transition: color 0.2s;

  &:hover {
    color: @color-primary;
  }
}
</style>
