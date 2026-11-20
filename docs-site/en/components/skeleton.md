<script setup>
import AppSkeleton from "@/components/common/base/app-skeleton/index.vue";
</script>

# Skeleton AppSkeleton

Holds the space before data arrives so the page does not jump when content lands. Five shapes cover five containers: paragraph, list, table, whole page and chart.

## Text

<div class="demo-grid">
  <AppSkeleton variant="text" :rows="3" />
</div>

```vue
<AppSkeleton variant="text" :rows="3" />
```

## List

<div class="demo-grid">
  <AppSkeleton variant="list" :rows="3" />
</div>

```vue
<AppSkeleton variant="list" :rows="3" />
```

Each row is a round avatar plus two lines of text, with the same row rhythm as the real list.

## Table

<div class="demo-grid">
  <AppSkeleton variant="table" :rows="4" />
</div>

```vue
<AppSkeleton variant="table" :rows="4" />
```

Four columns of header plus `rows` data rows. This is the shape ProTable uses while loading.

## Chart

<div class="demo-grid">
  <AppSkeleton variant="chart" :rows="6" />
</div>

```vue
<AppSkeleton variant="chart" :rows="6" />
```

A rectangular canvas above, a row of axis placeholders below.

## Page

<div class="demo-grid">
  <AppSkeleton variant="page" :rows="4" />
</div>

```vue
<AppSkeleton variant="page" :rows="4" />
```

## Swapping in real content

`loading: true` shows the skeleton; `false` renders the default slot. `throttle` is pinned at 0: back-office requests usually answer within a few hundred milliseconds, and a throttle just makes the skeleton flash once before disappearing, which reads as noise.

```vue
<AppSkeleton :loading="pending" variant="table" :rows="6">
  <ProTable … />
</AppSkeleton>
```

## Props

| Prop       | Type                                     | Default | Description                     |
| ---------- | ---------------------------------------- | ------- | ------------------------------- |
| `loading`  | `boolean`                                | `true`  | Show the skeleton               |
| `variant`  | `text \| list \| table \| page \| chart` | `text`  | Shape                           |
| `rows`     | `number`                                 | `3`     | Row count (bars, for the chart) |
| `animated` | `boolean`                                | `true`  | Breathing animation             |
