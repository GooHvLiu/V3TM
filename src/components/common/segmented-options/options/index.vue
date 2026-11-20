<template>
  <div class="segmented-options" :class="{ 'is-grid': grid }">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="segmented-item"
      :class="{ 'is-active': opt.value === modelValue }"
      @click="$emit('update:modelValue', opt.value)"
    >
      <slot name="item" :opt="opt">{{ opt.label }}</slot>
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
// 定义组件名字
defineOptions({ name: "SegmentedOptions" });

// 本项目专用：面板层已把数据转成 { value, label }
// 泛型 T 跟随使用方 modelValue 类型自动推断（主题色/圆角/明暗/宽度各自精确，emit 类型同步收窄）
defineProps<{
  options: Array<{ value: T; label: string; primaryColor?: string }>;
  modelValue: T;
  grid?: boolean;
}>();

defineEmits<{
  "update:modelValue": [v: T];
}>();
</script>

<style scoped lang="less">
.segmented-options {
  display: flex;
  gap: @space-2;

  &.is-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .segmented-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: @space-2;
    padding: @space-1-5 @space-2;
    font-size: @font-size-xs;
    border: 1px solid @color-border-light;
    border-radius: @radius-lg;
    background-color: @color-bg-container;
    transition: border-color 0.2s;

    &:hover {
      background-color: @color-bg-page;
    }

    &.is-active {
      border: 2px solid @color-primary;
    }
  }
}
</style>
