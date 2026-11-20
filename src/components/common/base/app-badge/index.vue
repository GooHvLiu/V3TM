<template>
  <el-badge
    :value="value"
    :max="max"
    :is-dot="isDot"
    :hidden="hidden"
    :type="resolvedType"
    :show-zero="showZero"
    :color="color"
    :offset="offset"
    class="app-badge"
    :class="`app-badge--${size}`"
  >
    <slot />
  </el-badge>
</template>

<script setup lang="ts">
defineOptions({ name: "AppBadge" });

import { computed } from "vue";
import type { SemanticTone } from "../shared/tone";

type BadgeType = "primary" | "success" | "warning" | "info" | "danger";
type BadgeSize = "sm" | "md";

const props = withDefaults(
  defineProps<{
    value?: string | number;
    max?: number;
    isDot?: boolean;
    hidden?: boolean;
    type?: BadgeType;
    tone?: SemanticTone;
    size?: BadgeSize;
    showZero?: boolean;
    color?: string;
    offset?: [number, number];
  }>(),
  {
    value: "",
    max: 99,
    isDot: false,
    hidden: false,
    type: "danger",
    tone: undefined,
    size: "md",
    showZero: true,
    color: undefined,
    offset: () => [0, 0] as [number, number]
  }
);

const resolvedType = computed<BadgeType>(() => {
  if (!props.tone) return props.type;
  return props.tone === "neutral" ? "info" : props.tone;
});

// 尺寸只压缩非 dot 状态的数字徽标；小圆点保持 Element Plus 的原始尺寸。
</script>

<style scoped lang="less">
.app-badge--sm :deep(.el-badge__content:not(.is-dot)) {
  height: 16px;
  padding: 0 @space-1;
  font-size: @font-size-2xs;
  line-height: 16px;
}

.app-badge--md :deep(.el-badge__content:not(.is-dot)) {
  height: 18px;
  padding: 0 @space-1-5;
  font-size: @font-size-xs;
  line-height: 18px;
}
</style>
