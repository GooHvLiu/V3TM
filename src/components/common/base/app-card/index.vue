<template>
  <el-card
    :shadow="resolvedShadow"
    :body-style="bodyStyle"
    class="app-card"
    :class="cardClass"
    :style="{ '--el-card-padding': cardPadding }"
  >
    <template v-if="title || $slots.header || $slots.extra" #header>
      <div class="app-card__header">
        <div class="app-card__title">
          <slot name="header">{{ title }}</slot>
        </div>
        <div v-if="$slots.extra" class="app-card__extra">
          <slot name="extra" />
        </div>
      </div>
    </template>

    <slot />

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </el-card>
</template>

<script setup lang="ts">
defineOptions({ name: "AppCard" });

import { computed, type CSSProperties } from "vue";

type CardShadow = "always" | "hover" | "never";
type CardPadding = "none" | "sm" | "md" | "lg" | "xl";

const PADDING_MAP: Record<CardPadding, string> = {
  none: "0",
  sm: "var(--space-3)",
  md: "var(--card-padding)",
  lg: "var(--space-6)",
  xl: "var(--space-5)"
};

// 卡片沿用 el-card 的 header/body/footer 结构，内外边距统一由 --el-card-padding 控制。
// 这样旧页面里的 :deep(.el-card__body) 定制仍然有效，不需要为了换组件再改一遍。

const props = withDefaults(
  defineProps<{
    title?: string;
    shadow?: CardShadow;
    padding?: CardPadding;
    bordered?: boolean;
    hoverable?: boolean;
    bodyStyle?: CSSProperties;
  }>(),
  {
    title: "",
    shadow: undefined,
    padding: "md",
    bordered: true,
    hoverable: false,
    bodyStyle: undefined
  }
);

const resolvedShadow = computed<CardShadow>(() => {
  if (props.shadow) return props.shadow;
  return props.hoverable ? "hover" : "never";
});

const cardPadding = computed(() => PADDING_MAP[props.padding]);

const cardClass = computed(() => [
  {
    "app-card--borderless": !props.bordered,
    "app-card--flush": props.padding === "none"
  }
]);
</script>

<style scoped lang="less">
.app-card {
  --el-card-border-radius: @radius-card;

  &--borderless {
    --el-card-border-color: transparent;
  }

  &--flush {
    :deep(.el-card__header),
    :deep(.el-card__footer) {
      padding: 0;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: @space-3;
    min-width: 0;
  }

  &__title {
    min-width: 0;
    font-size: @font-size-base;
    font-weight: @font-weight-semibold;
    line-height: @line-height-tight;
  }

  &__extra {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: @space-2;
  }
}
</style>
