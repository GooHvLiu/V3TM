<script setup>
import AppTag from "@/components/common/base/app-tag/index.vue";
</script>

# 标签 AppTag

一行文字加一层底色，用来说明状态、分类或数量。三种视觉层级对应三种强调程度：软底最轻、描边次之、实心最重。

## 三种层级

<p class="demo-block">
  <AppTag>默认</AppTag>
  <AppTag variant="outline">描边</AppTag>
  <AppTag variant="solid">实心</AppTag>
</p>

```vue
<AppTag>默认</AppTag>
<AppTag variant="outline">描边</AppTag>
<AppTag variant="solid">实心</AppTag>
```

## 语义色

<p class="demo-block">
  <AppTag tone="primary">进行中</AppTag>
  <AppTag tone="success">已完成</AppTag>
  <AppTag tone="warning">待确认</AppTag>
  <AppTag tone="danger">已驳回</AppTag>
  <AppTag tone="info">已归档</AppTag>
  <AppTag tone="neutral">草稿</AppTag>
</p>

```vue
<AppTag tone="success">已完成</AppTag>
<AppTag tone="danger">已驳回</AppTag>
<AppTag tone="neutral">草稿</AppTag>
```

`neutral` 在标签里没有专门的灰档，内部落到 Element Plus 的 `info`。需要与表格里的状态列对齐时，统一用 `tone`，不要混用 `type`。

## 状态点

状态点跟着文字色走，不单独配色，所以三种层级都能直接加。

<p class="demo-block">
  <AppTag dot tone="success">在线</AppTag>
  <AppTag dot tone="warning">告警</AppTag>
  <AppTag dot tone="danger">离线</AppTag>
</p>

```vue
<AppTag dot tone="success">在线</AppTag>
```

## 长文本

标签在 flex 容器里容易被内容撑破。省略号必须落在 `.el-tag__content` 上，外层给 `min-width: 0`：

```vue
<div style="display: flex; min-width: 0">
  <AppTag>一段很长很长需要省略的标签文案</AppTag>
</div>
```

## Props

| 属性                 | 类型                                                         | 默认值    | 说明                          |
| -------------------- | ------------------------------------------------------------ | --------- | ----------------------------- |
| `tone`               | `primary \| success \| warning \| danger \| info \| neutral` | —         | 语义色，新代码优先使用        |
| `variant`            | `soft \| outline \| solid`                                   | `soft`    | 视觉层级                      |
| `size`               | `sm \| default \| lg`                                        | `default` | 尺寸                          |
| `dot`                | `boolean`                                                    | `false`   | 文字前加状态圆点              |
| `type`               | `primary \| success \| info \| warning \| danger`            | `primary` | Element Plus 旧类型，保留兼容 |
| `effect`             | `light \| dark \| plain`                                     | `light`   | Element Plus 旧强度，保留兼容 |
| `round`              | `boolean`                                                    | `false`   | 全圆角                        |
| `closable`           | `boolean`                                                    | `false`   | 显示关闭按钮                  |
| `disableTransitions` | `boolean`                                                    | `false`   | 关闭动画                      |

## Events

| 事件    | 参数         | 说明         |
| ------- | ------------ | ------------ |
| `close` | —            | 点击关闭按钮 |
| `click` | `MouseEvent` | 点击标签     |
