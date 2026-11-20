<template>
  <el-divider
    :direction="resolvedDirection"
    :border-style="resolvedBorderStyle"
    :content-position="contentPosition"
    class="app-separator"
    :class="`app-separator--${spacing}`"
  >
    <slot />
  </el-divider>
</template>

<script setup lang="ts">
defineOptions({ name: "AppSeparator" });

import { computed } from "vue";

type SeparatorDirection = "horizontal" | "vertical";
type SeparatorStyle = "solid" | "dashed" | "dotted";
type SeparatorSpacing = "none" | "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    orientation?: SeparatorDirection;
    variant?: SeparatorStyle;
    spacing?: SeparatorSpacing;
    contentPosition?: "left" | "center" | "right";
    direction?: SeparatorDirection;
    borderStyle?: SeparatorStyle;
  }>(),
  {
    orientation: undefined,
    variant: undefined,
    spacing: "none",
    contentPosition: "center",
    direction: "horizontal",
    borderStyle: "solid"
  }
);

const resolvedDirection = computed<SeparatorDirection>(() => props.orientation ?? props.direction);
const resolvedBorderStyle = computed<SeparatorStyle>(() => props.variant ?? props.borderStyle);

// spacing 为 none 时不覆盖 Element Plus 默认的 24px 外边距，旧分割线迁移后间距不变。
</script>

<style scoped lang="less">
.app-separator--sm.el-divider--horizontal {
  margin: @space-2 0;
}

.app-separator--md.el-divider--horizontal {
  margin: @space-4 0;
}

.app-separator--lg.el-divider--horizontal {
  margin: @space-6 0;
}

.app-separator--sm.el-divider--vertical {
  margin: 0 @space-2;
}

.app-separator--md.el-divider--vertical {
  margin: 0 @space-4;
}

.app-separator--lg.el-divider--vertical {
  margin: 0 @space-6;
}
</style>
