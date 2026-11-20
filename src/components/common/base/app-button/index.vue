<template>
  <el-button
    v-if="permissionVisible"
    :type="resolvedType"
    :size="resolvedSize"
    :plain="resolvedVariant === 'outline'"
    :round="round"
    :circle="circle"
    :text="resolvedVariant === 'ghost'"
    :link="resolvedVariant === 'link'"
    :loading="loading"
    :disabled="disabled || loading"
    :native-type="htmlType"
    :class="buttonClass"
    :style="iconOnlyStyle"
    :aria-label="ariaLabel"
    @click="emit('click', $event)"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
    <slot />
  </el-button>
</template>

<script setup lang="ts">
defineOptions({ name: "AppButton" });

import { computed } from "vue";
import { useUserStore } from "@/stores/modules/user";
import { hasPermission } from "@/utils";
import { resolveControlSize, type ControlSize, type ElementSize } from "../shared/control-size";
import type { SemanticTone } from "../shared/tone";

type ElementButtonType = "default" | "primary" | "success" | "warning" | "danger" | "info";
type ButtonVariant = "solid" | "outline" | "ghost" | "link";

/* 方形按钮的宽度跟 Element Plus 同尺寸控件对齐，改尺寸只需改组件库变量 */
const ICON_WIDTH: Record<ElementSize, string> = {
  small: "var(--el-component-size-small)",
  default: "var(--el-component-size)",
  large: "var(--el-component-size-large)"
};

const props = withDefaults(
  defineProps<{
    /** 语义色，新代码优先用它；旧写法仍可用 type */
    tone?: SemanticTone;
    /** 视觉层级；不传时按旧的 plain / text / link 推导 */
    variant?: ButtonVariant;
    size?: ControlSize;
    /** 占满可用宽度，表单或抽屉底部常用 */
    block?: boolean;
    /** 只放图标时保持方形，需同时传 ariaLabel */
    iconOnly?: boolean;
    ariaLabel?: string;
    /** Element Plus 视觉类型，保留给旧调用 */
    type?: ElementButtonType;
    plain?: boolean;
    round?: boolean;
    circle?: boolean;
    text?: boolean;
    link?: boolean;
    loading?: boolean;
    disabled?: boolean;
    /** 原生 button type，表单提交场景用 submit */
    htmlType?: "button" | "submit" | "reset";
    /** 权限码；不传则不校验，传空数组时先隐藏 */
    permission?: string | string[];
  }>(),
  {
    tone: undefined,
    variant: undefined,
    size: "default",
    block: false,
    iconOnly: false,
    ariaLabel: undefined,
    type: "default",
    plain: false,
    round: false,
    circle: false,
    text: false,
    link: false,
    loading: false,
    disabled: false,
    htmlType: "button",
    permission: undefined
  }
);

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const resolvedSize = computed(() => resolveControlSize(props.size));

/* type 只作为旧入口，统一折算成语义色档位，色与样式都从这一处出 */
const resolvedTone = computed<SemanticTone>(() => {
  if (props.tone) return props.tone;
  return props.type === "default" ? "neutral" : props.type;
});

const resolvedType = computed<ElementButtonType>(() =>
  resolvedTone.value === "neutral" ? "default" : resolvedTone.value
);

/* 旧写法优先兼容，新代码统一用 variant */
const resolvedVariant = computed<ButtonVariant>(() => {
  if (props.variant) return props.variant;
  if (props.link) return "link";
  if (props.text) return "ghost";
  if (props.plain) return "outline";
  return "solid";
});

const buttonClass = computed(() => [
  "app-button",
  `app-button--${resolvedVariant.value}`,
  `app-button--tone-${resolvedTone.value}`,
  {
    "app-button--block": props.block,
    "app-button--icon-only": props.iconOnly
  }
]);

/* 方形按钮给固定宽度并清掉左右内边距，否则图标会被 15px 内边距挤扁 */
const iconOnlyStyle = computed(() => {
  if (!props.iconOnly || props.block) return undefined;
  return { width: ICON_WIDTH[resolvedSize.value], paddingInline: "0" };
});

/** 只有传了 permission 才读取用户态，文档示例无需挂 Pinia */
const permissionVisible = computed<boolean>(() => {
  if (!props.permission) return true;
  const userStore = useUserStore();
  if (!userStore.permissions.length) return false;
  return hasPermission(userStore.permissions, props.permission);
});
</script>

<style scoped lang="less">
.app-button {
  /* 键盘聚焦统一走令牌描边，鼠标点击不会触发 */
  &:focus-visible {
    outline: @focus-ring-width solid @focus-ring-color;
    outline-offset: @focus-ring-offset;
  }
}

.app-button--block {
  width: 100%;
}

.app-button--icon-only {
  flex-shrink: 0;
}

/* 无彩色档位的实心按钮：Element Plus 的 default 本身就是描边样式，
   这里补一层浅底把它和描边区分开，hover / active 沿同一灰阶推进。
   深色主题下 --color-text-primary 变亮，混色方向自动反过来。 */
.app-button.app-button--solid.app-button--tone-neutral {
  --el-button-bg-color: @color-bg-hover;
  --el-button-text-color: @color-text-primary;
  --el-button-border-color: @color-bg-hover;
  --el-button-hover-bg-color: color-mix(in srgb, @color-bg-hover 92%, @color-text-primary);
  --el-button-hover-text-color: @color-text-primary;
  --el-button-hover-border-color: color-mix(in srgb, @color-bg-hover 92%, @color-text-primary);
  --el-button-active-bg-color: color-mix(in srgb, @color-bg-hover 86%, @color-text-primary);
  --el-button-active-border-color: color-mix(in srgb, @color-bg-hover 86%, @color-text-primary);
  --el-button-disabled-bg-color: @color-bg-hover;
  --el-button-disabled-text-color: @color-text-disabled;
  --el-button-disabled-border-color: @color-bg-hover;
}

/* 无彩色档位的描边按钮：hover 不再泛蓝，保持中性灰 */
.app-button.app-button--outline.app-button--tone-neutral {
  --el-button-border-color: @color-border-light;
  --el-button-hover-bg-color: @color-bg-container;
  --el-button-hover-text-color: @color-text-primary;
  --el-button-hover-border-color: @color-text-disabled;
  --el-button-active-bg-color: @color-bg-hover;
  --el-button-active-border-color: @color-text-disabled;
}
</style>
