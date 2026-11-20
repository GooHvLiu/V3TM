<script setup>
import AppSkeleton from "@/components/common/base/app-skeleton/index.vue";
</script>

# 骨架 AppSkeleton

数据到达之前先占住位置，避免内容出现时页面跳动。五种形态对应五类容器：文本段、列表、表格、整页、图表。

## 文本

<div class="demo-grid">
  <AppSkeleton variant="text" :rows="3" />
</div>

```vue
<AppSkeleton variant="text" :rows="3" />
```

## 列表

<div class="demo-grid">
  <AppSkeleton variant="list" :rows="3" />
</div>

```vue
<AppSkeleton variant="list" :rows="3" />
```

每行是「圆形头像 + 两行文本」，行间距与真实列表一致。

## 表格

<div class="demo-grid">
  <AppSkeleton variant="table" :rows="4" />
</div>

```vue
<AppSkeleton variant="table" :rows="4" />
```

四列表头加 `rows` 行数据。ProTable 的加载态就是这一型。

## 图表

<div class="demo-grid">
  <AppSkeleton variant="chart" :rows="6" />
</div>

```vue
<AppSkeleton variant="chart" :rows="6" />
```

上方一块矩形画布、下方一排坐标占位。

## 整页

<div class="demo-grid">
  <AppSkeleton variant="page" :rows="4" />
</div>

```vue
<AppSkeleton variant="page" :rows="4" />
```

## 切换真实内容

`loading` 为 `true` 时显示骨架，为 `false` 时渲染默认插槽。`throttle` 固定为 0：后台请求通常几百毫秒内返回，加节流会让骨架闪一下就不见，反而更乱。

```vue
<AppSkeleton :loading="pending" variant="table" :rows="6">
  <ProTable … />
</AppSkeleton>
```

## Props

| 属性       | 类型                                     | 默认值 | 说明               |
| ---------- | ---------------------------------------- | ------ | ------------------ |
| `loading`  | `boolean`                                | `true` | 是否显示骨架       |
| `variant`  | `text \| list \| table \| page \| chart` | `text` | 形态               |
| `rows`     | `number`                                 | `3`    | 行数（图表为柱数） |
| `animated` | `boolean`                                | `true` | 呼吸动画           |
