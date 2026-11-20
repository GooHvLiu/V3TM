<template>
  <div class="page-wrap-brand-logo">
    <svg
      class="brand-svg"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="100%"
      height="100%"
    >
      <!-- 1. 外圈圆环：仅无角色时回退显示，6 段均分，段间留缝 -->
      <g v-if="!badge">
        <circle
          v-for="index in 6"
          :key="index"
          class="seg"
          cx="512"
          cy="512"
          r="408"
          fill="none"
          stroke-width="71"
          :stroke-dasharray="SEG_DASH"
          :transform="`rotate(${START_ANGLE + (index - 1) * 50} 512 512)`"
        />
      </g>
      <!-- 2. 中心：角色盾徽；无角色回退首字母 -->
      <svg
        v-if="badge"
        class="svg-badge"
        :x="BADGE_BOX.x"
        :y="BADGE_BOX.y"
        :width="BADGE_BOX.width"
        :height="BADGE_BOX.height"
        :viewBox="badge.viewBox"
      >
        <!-- 固定色盾形 -->
<path
  :d="badge.shield"
  class="svg-badge-shield"
  fill="none"
  stroke="currentColor"
  :stroke-width="BADGE_STROKE"
  stroke-linecap="round"
  stroke-linejoin="round"
/>

<!-- 随主题色变化的内部图形：对勾、齿轮等 -->
<path
  v-for="(d, index) in badge.paths ?? []"
  :key="`badge-inner-${index}`"
  class="svg-badge-inner"
  :d="d"
  fill="none"
  stroke="currentColor"
  :stroke-width="BADGE_STROKE"
  stroke-linecap="round"
  stroke-linejoin="round"
/>

        <text
          v-if="badge.glyph"
          class="svg-badge-inner"
          :x="badge.glyph.x"
          :y="badge.glyph.y"
          text-anchor="middle"
          dominant-baseline="central"
          :font-size="badge.glyph.fontSize"
          font-family="Arial, sans-serif"
          font-weight="bold"
          fill="currentColor"
        >
          {{ badge.glyph.text }}
        </text>
      </svg>
      <text
        v-else
        class="svg-text"
        x="512"
        y="540"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="400"
        font-family="Arial, sans-serif"
        font-weight="bold"
      >
        {{ initial }}
      </text>
      <!-- 3. 右上角的弧线：仅无角色时回退显示（单独类名，方便改色） -->
      <path
        v-if="!badge"
        class="svg-arc"
        d="M601.378133 77.277867a440.285867 440.285867 0 0 1 158.754134 66.798933 446.890667 446.890667 0 0 1 113.732266 111.0528l6.075734 8.772267-56.593067 38.1952c-13.482667-19.968-28.842667-38.587733-45.841067-55.586134a375.569067 375.569067 0 0 0-119.3472-80.4864 372.360533 372.360533 0 0 0-60.1088-19.592533l-10.325333-2.269867 13.653333-66.884266z"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "UserAvatar" });

import { computed, watch } from "vue";

// 引入角色视觉配置：有角色画盾徽，无角色回退首字母
import { BADGE_BOX, BADGE_STROKE, ROLE_BADGE, ROLE_VISUAL } from "@/constants";
import type { RoleBadgeShape } from "@/constants";

// 接收父组件传入的文字内容与角色标识
const props = withDefaults(defineProps<{ name?: string; role?: string | null }>(), {
  name: "?",
  role: null
});

/** 右上弧占 45°（335°），6 段平分剩余 315° → 每段 52.5°（段内留 2° 缝 → 弧长 50.5° = 359.72） */
const SEG_DASH = "359.72 2203.82";
/** 起始角：弧尖约335° */
const START_ANGLE = 335;

/** 中心盾徽：未登记的自定义角色与无角色都取不到图形，改画首字母 */
const badge = computed<RoleBadgeShape | null>(() => {
  const key = props.role ? ROLE_VISUAL[props.role] : undefined;
  return key ? ROLE_BADGE[key] : null;
});

/** 中间文字：取 name 首字符，英文转大写，中文取首字 */
const initial = computed(() => {
  const trimmed = props.name.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 1).toUpperCase();
});

// 缺角色时不再静默套用某一档：提示一次，避免把"没拿到"误读成"只读"
watch(
  () => props.role,
  (role) => {
    if (!role && import.meta.env.DEV) {
      console.warn("[UserAvatar] 缺少角色标识，已回退为首字母样式");
    }
  },
  { immediate: true }
);
</script>
<style scoped lang="less">
.page-wrap-brand-logo {
  .brand-svg {
    :deep(.seg) {
      stroke: var(--color-text-primary);
      transition: all 0.5s;
    }
    :deep(.svg-text) {
      fill: @color-text-primary;
      transition: all 0.5s;
    }
    :deep(.svg-badge-shield) {
  color: var(--color-text-primary);
  transition: color 0.5s;
}
:deep(.svg-badge-inner) {
  color: var(--color-primary);
  transition: color 0.5s;
}

    :deep(.svg-arc) {
      fill: @color-primary;
      transition: all 0.5s;
    }
    &:hover {
      :deep(.svg-text),
      :deep(.svg-arc) {
        fill: var(--color-logo-primary);
      }
      :deep(.svg-badge-inner) {
  color: var(--color-logo-primary);
}

    }
  }
}
</style>
