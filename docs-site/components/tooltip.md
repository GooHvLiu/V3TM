<script setup>
import AppTooltip from "@/components/common/base/app-tooltip/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";
</script>

# 提示 AppTooltip

悬停后出现的补充说明。全站统一浅底——深底提示在浅色主题里像一块补丁，视觉上一眼就能看出不是同一套语言。

## 基础用法

<p class="demo-block">
  <AppTooltip content="这里是完整说明文字">
    <AppButton variant="outline">悬停查看</AppButton>
  </AppTooltip>
</p>

```vue
<AppTooltip content="这里是完整说明文字">
  <AppButton variant="outline">悬停查看</AppButton>
</AppTooltip>
```

默认 `showAfter` 为 200 毫秒：立刻弹出会在鼠标扫过时频繁闪烁，时间太长又像没反应。

## 长文本限宽

`maxWidth` 默认 320px。超长文案会被折行，不会拉出一条横贯版面的提示条。

<p class="demo-block">
  <AppTooltip
    content="这一条说明故意写得很长，用来确认提示框在达到最大宽度之后会自动折行，而不是继续向右延伸。"
  >
    <AppButton variant="ghost">长文案</AppButton>
  </AppTooltip>
</p>

```vue
<AppTooltip :max-width="320" content="……">
  <AppButton>长文案</AppButton>
</AppTooltip>
```

传了 `popperStyle` 时以它为准，`maxWidth` 不再生效——需要精确控制时直接给样式。

## 富内容

需要多行、带图标或带换行时，用 `content` 插槽，并打开 `rawContent`：

```vue
<AppTooltip raw-content>
  <template #content>
    <strong>服务地址</strong><br />
    api.example.com:3000
  </template>
  <AppButton variant="link">查看</AppButton>
</AppTooltip>
```

## Props

| 属性          | 类型                                                     | 默认值  | 说明                         |
| ------------- | -------------------------------------------------------- | ------- | ---------------------------- |
| `content`     | `string`                                                 | `""`    | 提示文字                     |
| `placement`   | `top \| bottom \| left \| right` 及 `-start / -end` 变体 | `top`   | 出现方向                     |
| `effect`      | `light \| dark`                                          | `light` | 底色，深底仅用于强调危险操作 |
| `showAfter`   | `number`                                                 | `200`   | 出现延迟（毫秒）             |
| `hideAfter`   | `number`                                                 | `0`     | 消失延迟（毫秒）             |
| `maxWidth`    | `number`                                                 | `320`   | 最大宽度（px）               |
| `offset`      | `number`                                                 | `8`     | 与触发元素的距离             |
| `disabled`    | `boolean`                                                | `false` | 关闭提示                     |
| `rawContent`  | `boolean`                                                | `false` | 把内容按 HTML 渲染           |
| `popperStyle` | `Record<string, string>`                                 | —       | 直接覆盖浮层样式             |

## Slots

| 插槽      | 说明           |
| --------- | -------------- |
| `default` | 触发元素       |
| `content` | 富文本提示内容 |
