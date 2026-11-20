<template>
  <div ref="rootRef" class="base-chart" :style="rootStyle">
    <app-empty v-if="empty" class="base-chart__empty" />
    <div v-else ref="canvasRef" class="base-chart__canvas" role="img" :aria-label="resolvedLabel" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "BaseChart" });

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import AppEmpty from "@/components/common/base/app-empty/index.vue";
import { useLabel } from "@/components/common/base/shared/label";

import { init, type EChartsOption, type EChartsType } from "../echarts";
import { useChartTheme } from "../use-chart-theme";

const props = withDefaults(
  defineProps<{
    /** 图表配置，由使用方组装；组件只负责渲染、尺寸与主题 */
    option: EChartsOption;
    /** 容器高度，宽度始终跟随父级 */
    height?: string;
    /** 无数据：交给空态占位，不创建实例 */
    empty?: boolean;
    /** 无障碍描述，缺省用通用文案 */
    label?: string;
  }>(),
  {
    height: "300px",
    empty: false,
    label: undefined
  }
);

const label = useLabel();
const { themeName, ensureThemes } = useChartTheme();

const rootRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLElement | null>(null);
let chart: EChartsType | null = null;
let observer: ResizeObserver | null = null;

const rootStyle = computed(() => ({ height: props.height }));
const resolvedLabel = computed(() => props.label ?? label("chartAriaLabel"));

/** 建实例：先登记主题，再按当前明暗初始化，最后灌配置 */
const create = (): void => {
  if (props.empty || !canvasRef.value) return;
  ensureThemes();
  chart = init(canvasRef.value, themeName.value, { renderer: "canvas" });
  chart.setOption(props.option, { notMerge: true });
};

const destroy = (): void => {
  chart?.dispose();
  chart = null;
};

/** 主题或空态变化后整体重建，避免旧实例残留上一套配色 */
const rebuild = (): void => {
  destroy();
  create();
};

onMounted(() => {
  rebuild();
  // 父容器宽度变化（折叠侧边栏、拖拽窗口）时补一次重算
  if (rootRef.value && typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(() => chart?.resize());
    observer.observe(rootRef.value);
  }
});

// 配置变化只重灌数据，不重建实例，保住过渡动画
watch(
  () => props.option,
  (next) => chart?.setOption(next, { notMerge: true }),
  { deep: true }
);

watch(themeName, rebuild);

watch(
  () => props.empty,
  (isEmpty) => {
    if (isEmpty) {
      destroy();
      return;
    nextTick(create);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  destroy();
});
</script>

<style scoped lang="less">
.base-chart {
  position: relative;
  width: 100%;
  min-width: 0;
}

.base-chart__canvas {
  width: 100%;
  height: 100%;
}

.base-chart__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
