# 图表 BaseChart

ECharts 的容器封装。组件不负责任何业务图形，只解决三件事：容器尺寸、主题跟随、实例生命周期。

## 用法

```vue
<script setup>
const option = computed(() => ({
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", data: ["周一", "周二", "周三", "周四", "周五"] },
  yAxis: { type: "value" },
  series: [{ type: "bar", data: [12, 18, 9, 22, 15], name: "任务量" }]
}));
</script>

<BaseChart :option="option" height="260px" label="近五日任务量" />
```

`option` 由页面组装，组件 `watch` 深度变化后 `setOption(notMerge: true)` 重灌数据——切换筛选条件时保留过渡动画，不会重建实例。

## 主题联动

图表主题跟着界面的亮暗切换走，不需要在页面里判断。`useChartTheme()` 在主题变化时重建实例：旧实例带着上一套配色，只改 option 的色值会残留坐标轴与背景色。

```ts
const { themeName, ensureThemes } = useChartTheme();
```

换主题后 ECharts 的 `backgroundColor`、轴线、文字色一起换，图表不会在深色底上留一块白。

## 无数据

`empty` 为 `true` 时不创建实例，直接渲染空态。比渲染一张空图更干净——空图会留下坐标轴和网格线，看起来像加载失败。

```vue
<BaseChart :option="option" :empty="!points.length" />
```

## 只注册了两种图

`chart/echarts.ts` 里按需登记，目前是折线与柱状，配套 tooltip、legend、grid、title 四个组件与 Canvas 渲染器。这个集合是为看板选的——首屏体积预算 920 kB，全量引入 ECharts 会直接吃掉三分之一。

要加图种（饼图、散点、仪表盘）在这个文件里追加 `use([...])`，不要在页面里单独 `import "echarts"`，否则会被打进业务 chunk 且与已注册实例冲突。

## 无障碍

容器带 `role="img"` 与 `aria-label`。`label` 不传时取语言包里的通用文案；图表承载结论时把结论写进 `label`，例如「近七日成功率 98.2%」——读屏用户拿不到视觉趋势，只能靠这句话。

## Props

| 属性     | 类型            | 默认值  | 说明                   |
| -------- | --------------- | ------- | ---------------------- |
| `option` | `EChartsOption` | 必填    | 图表配置               |
| `height` | `string`        | `300px` | 容器高度，宽度跟随父级 |
| `empty`  | `boolean`       | `false` | 无数据占位             |
| `label`  | `string`        | —       | 无障碍描述             |

## 尺寸与自适应

宽度永远取父容器，组件内部用 `ResizeObserver` 监听：侧边栏折叠、窗口缩放、抽屉撑开都不需要手动 `resize()`。高度只接受显式值——靠内容撑高的图表在切换图种时会跳动。
