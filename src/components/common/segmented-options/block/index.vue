<template>
  <div class="segmented-options-block">
    <div class="block-title">
      <span>{{ t(titleKey) }}</span>
    </div>
    <div class="block-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "SegmentedOptionsBlock" });

// 引入子组件

import { useI18n } from "vue-i18n";
const { t } = useI18n();

// 定制块标题
defineProps<{ titleKey: string }>();

</script>

<style scoped lang="less">
.segmented-options-block {
  display: flex;
  flex-direction: column;

  .block-title {
    margin: @space-2 0;
    font-size: @font-size-xs;
    font-weight: @font-weight-semibold;
  }
}
</style>
