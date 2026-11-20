# Chart BaseChart

A container around ECharts. It draws no business charts of its own; it solves three things: container size, theme following, and instance lifecycle.

## Usage

```vue
<script setup>
const option = computed(() => ({
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  yAxis: { type: "value" },
  series: [{ type: "bar", data: [12, 18, 9, 22, 15], name: "Tasks" }]
}));
</script>

<BaseChart :option="option" height="260px" label="Tasks over the last five days" />
```

The page assembles `option`; the component watches it deeply and pushes data back through `setOption(notMerge: true)`, which keeps the transition animation when filters change instead of rebuilding the instance.

## Theme linkage

The chart theme follows the interface between light and dark with no check on the page. `useChartTheme()` rebuilds the instance when the theme changes: an old instance carries the previous palette, and recolouring only the option leaves the axes and background behind.

```ts
const { themeName, ensureThemes } = useChartTheme();
```

After a theme switch ECharts's `backgroundColor`, axis lines and label colours all change together, so no white block is left sitting on a dark surface.

## Empty

With `empty: true` no instance is created and the empty state renders directly. That is cleaner than drawing a blank chart — an empty one leaves axes and grid lines behind and reads as a failed load.

```vue
<BaseChart :option="option" :empty="!points.length" />
```

## Only two chart types are registered

`chart/echarts.ts` registers on demand: line and bar today, plus the tooltip, legend, grid and title components and the Canvas renderer. The set was chosen for the dashboard — the first-screen budget is 920 kB, and pulling in all of ECharts would swallow a third of it.

To add another type (pie, scatter, gauge), append to `use([...])` in that file. Do not `import "echarts"` inside a page: it lands in the business chunk and collides with the registered instance.

## Accessibility

The container carries `role="img"` and `aria-label`. When `label` is omitted, a generic phrase from the language pack is used. If the chart carries a conclusion, put it in `label` — "98.2% success over the last seven days" — because a screen reader user cannot see the trend and has only that sentence.

## Props

| Prop     | Type            | Default  | Description                                |
| -------- | --------------- | -------- | ------------------------------------------ |
| `option` | `EChartsOption` | required | Chart configuration                        |
| `height` | `string`        | `300px`  | Container height; width follows the parent |
| `empty`  | `boolean`       | `false`  | Empty placeholder                          |
| `label`  | `string`        | —        | Accessible description                     |

## Size and adaptation

Width always comes from the parent container, watched internally with a `ResizeObserver`: collapsing the sidebar, resizing the window and opening a drawer all need no manual `resize()`. Height only accepts an explicit value — a chart sized by its content jumps when the chart type changes.
