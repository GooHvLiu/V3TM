<template>
  <el-tag
    :type="resolvedType"
    :size="resolvedSize"
    :effect="resolvedEffect"
    :round="round"
    :closable="closable"
    :disable-transitions="disableTransitions"
    class="app-tag"
    @close="emit('close')"
    @click="emit('click', $event)"
  >
    <span v-if="dot" class="app-tag__dot" aria-hidden="true" />
    <slot />
  </el-tag>
</template>

<script setup lang="ts">
defineOptions({ name: "AppTag" });

import { computed } from "vue";
import { resolveControlSize, type ControlSize } from "../shared/control-size";
import type { SemanticTone } from "../shared/tone";

type ElementTagType = "primary" | "success" | "info" | "warning" | "danger";
type TagEffect = "dark" | "light" | "plain";
type TagVariant = "soft" | "outline" | "solid";

const props = withDefaults(
  defineProps<{
    /** 语义色，新代码优先用它；旧写法仍可用 type */
    tone?: SemanticTone;
    /** 视觉层级；不传时按旧的 effect 推导 */
    variant?: TagVariant;
    size?: ControlSize;
    /** 标签前加一个状态圆点，颜色跟随文字色 */
    dot?: boolean;
    /** Element Plus 视觉强度，保留给旧调用 */
    effect?: TagEffect;
    type?: ElementTagType;
    round?: boolean;
    closable?: boolean;
    disableTransitions?: boolean;
  }>(),
  {
    tone: undefined,
    variant: undefined,
    size: "default",
    dot: false,
    effect: "light",
    type: "primary",
    round: false,
    closable: false,
    disableTransitions: false
  }
);

const emit = defineEmits<{ close: []; click: [event: MouseEvent] }>();

const resolvedSize = computed(() => resolveControlSize(props.size));

/* 标签没有“默认灰”这一档，neutral 落到 Element Plus 的 info */
const resolvedTone = computed<SemanticTone>(() => props.tone ?? props.type);

const resolvedType = computed<ElementTagType>(() =>
  resolvedTone.value === "neutral" ? "info" : resolvedTone.value
);

/* 旧 effect 继续可用；新代码统一用 variant */
const resolvedVariant = computed<TagVariant>(() => {
  if (props.variant) return props.variant;
  if (props.effect === "plain") return "outline";
  if (props.effect === "dark") return "solid";
  return "soft";
});

const resolvedEffect = computed<TagEffect>(() => {
  if (resolvedVariant.value === "solid") return "dark";
  if (resolvedVariant.value === "outline") return "plain";
  return "light";
});
</script>

<style scoped lang="less">
/* 状态点跟着文字色走，软底、描边、实心三种层级都不用单独配色 */
.app-tag__dot {
  display: inline-block;
  flex-shrink: 0;
  width: @space-1-5;
  height: @space-1-5;
  margin-right: @space-1;
  border-radius: @radius-pill;
  background: currentColor;
  vertical-align: middle;
}
</style>
