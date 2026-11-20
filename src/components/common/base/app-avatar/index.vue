<template>
  <el-avatar
    :size="resolvedSize"
    :shape="shape"
    :src="src"
    :alt="alt"
    :src-set="srcSet"
    :fit="fit"
    :icon="icon"
    class="app-avatar"
    :class="avatarClass"
  >
    <slot />
  </el-avatar>
</template>

<script setup lang="ts">
defineOptions({ name: "AppAvatar" });

import { computed, type Component } from "vue";
import type { SemanticTone } from "../shared/tone";

type AvatarSize = "sm" | "md" | "lg" | "small" | "default" | "large" | number;
type AvatarShape = "circle" | "square";
type AvatarFit = "fill" | "contain" | "cover" | "none" | "scale-down";

const SIZE_MAP: Record<Exclude<AvatarSize, number>, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  small: 24,
  default: 40,
  large: 56
};

// 语义尺寸和 Element Plus 旧档位并存，数字尺寸原样透传。

const props = withDefaults(
  defineProps<{
    size?: AvatarSize;
    shape?: AvatarShape;
    src?: string;
    alt?: string;
    srcSet?: string;
    fit?: AvatarFit;
    icon?: Component;
    tone?: SemanticTone;
  }>(),
  {
    size: "md",
    shape: "circle",
    src: "",
    alt: undefined,
    srcSet: undefined,
    fit: "cover",
    icon: undefined,
    tone: undefined
  }
);

const resolvedSize = computed(() => (typeof props.size === "number" ? props.size : SIZE_MAP[props.size]));

const avatarClass = computed(() => (props.tone ? `app-avatar--${props.tone}` : undefined));
</script>

<style scoped lang="less">
.app-avatar--neutral {
  --el-avatar-bg-color: @color-bg-hover;
  --el-avatar-text-color: @color-text-regular;
}

.app-avatar--primary {
  --el-avatar-bg-color: color-mix(in srgb, @color-primary 16%, transparent);
  --el-avatar-text-color: @color-primary-text;
}

.app-avatar--success {
  --el-avatar-bg-color: color-mix(in srgb, @color-success 16%, transparent);
  --el-avatar-text-color: @color-success-text;
}

.app-avatar--warning {
  --el-avatar-bg-color: color-mix(in srgb, @color-warning 16%, transparent);
  --el-avatar-text-color: @color-warning-text;
}

.app-avatar--danger {
  --el-avatar-bg-color: color-mix(in srgb, @color-danger 16%, transparent);
  --el-avatar-text-color: @color-danger-text;
}

.app-avatar--info {
  --el-avatar-bg-color: color-mix(in srgb, @color-info 16%, transparent);
  --el-avatar-text-color: @color-info-text;
}
</style>
