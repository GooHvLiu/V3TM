<script setup>
import AppSeparator from "@/components/common/base/app-separator/index.vue";
</script>

# 分隔 AppSeparator

在两组内容之间划一道线。横向用于段落分组，竖向用于同一行里的两个文本块。

## 横向

<p class="demo-block demo-block--column">
  <span>第一组</span>
  <AppSeparator spacing="sm" />
  <span>第二组</span>
</p>

```vue
<AppSeparator spacing="sm" />
```

## 带文字

<p class="demo-block demo-block--column">
  <span>上一节</span>
  <AppSeparator>分组</AppSeparator>
  <span>下一节</span>
</p>

```vue
<AppSeparator>分组</AppSeparator>
```

`contentPosition` 控制文字位置：`left / center / right`。

## 竖向与线型

<p class="demo-block">
  <span>用时</span>
  <AppSeparator direction="vertical" />
  <span>2 分 14 秒</span>
  <AppSeparator direction="vertical" variant="dashed" />
  <span>成功</span>
</p>

```vue
<AppSeparator direction="vertical" />
<AppSeparator direction="vertical" variant="dashed" />
```

## 三档间距

`spacing` 为 `none` 时不覆盖 Element Plus 的默认 24px 外边距——这是为了旧分割线迁移过来后布局不变。需要收紧或放宽时显式给 `sm / md / lg`。

## Props

| 属性              | 类型                        | 默认值       | 说明                       |
| ----------------- | --------------------------- | ------------ | -------------------------- |
| `orientation`     | `horizontal \| vertical`    | —            | 方向，优先于 `direction`   |
| `variant`         | `solid \| dashed \| dotted` | —            | 线型，优先于 `borderStyle` |
| `spacing`         | `none \| sm \| md \| lg`    | `none`       | 外边距                     |
| `contentPosition` | `left \| center \| right`   | `center`     | 文字位置                   |
| `direction`       | `horizontal \| vertical`    | `horizontal` | 旧字段，保留兼容           |
| `borderStyle`     | `solid \| dashed \| dotted` | `solid`      | 旧字段，保留兼容           |
