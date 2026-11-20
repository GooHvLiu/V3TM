<template>
  <el-tooltip
    :content="content"
    :placement="placement"
    :effect="effect"
    :show-after="showAfter"
    :hide-after="hideAfter"
    :disabled="disabled"
    :popper-style="resolvedPopperStyle"
    :raw-content="rawContent"
    :offset="offset"
  >
    <template v-if="$slots.content" #content>
      <slot name="content" />
    </template>
    <slot />
  </el-tooltip>
</template>

<script setup lang="ts">
defineOptions({ name: "AppTooltip" });

import { computed } from "vue";

type TooltipPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

const props = withDefaults(
  defineProps<{
    content?: string;
    placement?: TooltipPlacement;
    /** 统一浅底样式，深色只在强调危险操作时单独指定 */
    effect?: "light" | "dark";
    showAfter?: number;
    hideAfter?: number;
    maxWidth?: number;
    disabled?: boolean;
    rawContent?: boolean;
    offset?: number;
    popperStyle?: Record<string, string>;
  }>(),
  {
    content: "",
    placement: "top",
    effect: "light",
    showAfter: 200,
    hideAfter: 0,
    maxWidth: 320,
    disabled: false,
    rawContent: false,
    offset: 8,
    popperStyle: undefined
  }
);

/* 长文本默认限宽，避免一行拉穿版面；调用方给了 popperStyle 时以其为准 */
const resolvedPopperStyle = computed<Record<string, string>>(() => ({
  maxWidth: `${props.maxWidth}px`,
  ...props.popperStyle
}));
</script>
