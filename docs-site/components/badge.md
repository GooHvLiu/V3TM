<script setup>
import AppBadge from "@/components/common/base/app-badge/index.vue";
import AppAvatar from "@/components/common/base/app-avatar/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";
</script>

# 徽标 AppBadge

挂在图标或头像右上角的计数与状态标记。数字型用于未读数，圆点型用于「有新内容」这类不需要具体数量的场景。

## 数字

<p class="demo-block">
  <AppBadge :value="5">
    <AppButton variant="outline">消息</AppButton>
  </AppBadge>
  <AppBadge :value="12" type="primary">
    <AppButton variant="outline">待办</AppButton>
  </AppBadge>
  <AppBadge :value="120" :max="99">
    <AppButton variant="outline">告警</AppButton>
  </AppBadge>
</p>

```vue
<AppBadge :value="5">
  <AppButton variant="outline">消息</AppButton>
</AppBadge>
<AppBadge :value="120" :max="99">…</AppBadge>
```

超过 `max` 时显示 `99+`。

## 圆点

<p class="demo-block">
  <AppBadge is-dot>
    <AppAvatar>管</AppAvatar>
  </AppBadge>
  <AppBadge is-dot type="success">
    <AppAvatar tone="success">运</AppAvatar>
  </AppBadge>
</p>

```vue
<AppBadge is-dot>
  <AppAvatar>管</AppAvatar>
</AppBadge>
```

## 两档尺寸

`sm` 压到 16 像素高、字号 10 号，适合表头与紧凑列表；`md` 是默认档。圆点不受尺寸影响，保持原生大小。

## Props

| 属性       | 类型                                              | 默认值   | 说明                  |
| ---------- | ------------------------------------------------- | -------- | --------------------- |
| `value`    | `string \| number`                                | `""`     | 显示的数字或文字      |
| `max`      | `number`                                          | `99`     | 上限，超出显示 `+`    |
| `isDot`    | `boolean`                                         | `false`  | 圆点模式              |
| `hidden`   | `boolean`                                         | `false`  | 隐藏徽标              |
| `type`     | `primary \| success \| warning \| info \| danger` | `danger` | 颜色                  |
| `tone`     | 语义色                                            | —        | 语义色，优先于 `type` |
| `size`     | `sm \| md`                                        | `md`     | 尺寸                  |
| `showZero` | `boolean`                                         | `true`   | 值为 0 时是否显示     |
| `color`    | `string`                                          | —        | 自定义底色            |
| `offset`   | `[number, number]`                                | `[0, 0]` | 位置偏移              |
