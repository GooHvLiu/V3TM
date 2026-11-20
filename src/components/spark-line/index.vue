<template>
  <svg v-if="points" class="spark-line" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
    <polyline :points="points" :class="`is-${tone}`" />
  </svg>
</template>

<script setup lang="ts">
defineOptions({ name: "SparkLine" });

import { computed } from "vue";

const props = withDefaults(
  defineProps<{ values: number[]; tone?: "success" | "warning" | "danger" | "info" | "muted" }>(),
  { tone: "info" }
);

/** 一条贴近底部的直线看起来像故障，全 0 时直接不画 */
const points = computed(() => {
  if (props.values.length < 2) return "";
  const max = Math.max(...props.values);
  if (max <= 0) return "";
  const step = 100 / (props.values.length - 1);
  /* 基线留 2px：贴到画布底边的线看起来像被裁掉 */
  return props.values
    .map((value, index) => `${(index * step).toFixed(2)},${(22 - (value / max) * 20).toFixed(2)}`)
    .join(" ");
});
</script>

<style scoped lang="less">
.spark-line {
  width: 100%;
  height: 24px;
  display: block;
}
.spark-line polyline {
  fill: none;
  stroke-width: 1.4;
  stroke: @color-info;
}
.spark-line polyline.is-success {
  stroke: @color-success;
}
.spark-line polyline.is-warning {
  stroke: @color-warning;
}
.spark-line polyline.is-danger {
  stroke: @color-danger;
}
.spark-line polyline.is-muted {
  stroke: @color-text-placeholder;
}
</style>
