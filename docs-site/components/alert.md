<script setup>
import AppAlert from "@/components/common/base/app-alert/index.vue";
</script>

# 提醒 AppAlert

页内的常驻提示，区别于全局弹出：它不打断操作，也不需要用户关闭。用在表单顶部、列表上方、配置页的说明区。

## 四个语义色

<p class="demo-block demo-block--column">
  <AppAlert tone="info" title="提示" description="这里的改动会在保存后立即生效。" />
  <AppAlert tone="success" title="连接正常" description="最近一次同步发生在两分钟前。" />
  <AppAlert tone="warning" title="配置待确认" description="还有三项参数没有填写。" />
  <AppAlert tone="danger" title="服务不可用" description="上游接口返回 503，请稍后重试。" />
</p>

```vue
<AppAlert tone="info" title="提示" description="这里的改动会在保存后立即生效。" />
<AppAlert tone="danger" title="服务不可用" description="上游接口返回 503，请稍后重试。" />
```

边框跟随语义色，底色沿用 Element Plus 的浅色档位，所以亮暗两套主题下都不会出现刺眼的饱和块。

## 可关闭

<p class="demo-block demo-block--column">
  <AppAlert tone="warning" title="磁盘空间不足" description="剩余 8%，建议先清理日志。" closable />
</p>

```vue
<AppAlert tone="warning" title="磁盘空间不足" description="剩余 8%，建议先清理日志。" closable @close="onClose" />
```

## 提示与说明的两级字号

`title` 用正文号，`description` 小一号、行高更松。这一档差异是为了让长说明不抢标题的注意力——两者都用同一号字体时，提醒会读成一整段正文。

## Props

| 属性          | 类型                                                         | 默认值  | 说明         |
| ------------- | ------------------------------------------------------------ | ------- | ------------ |
| `tone`        | `info \| success \| warning \| danger \| primary \| neutral` | `info`  | 语义色       |
| `title`       | `string`                                                     | `""`    | 标题         |
| `description` | `string`                                                     | —       | 说明文字     |
| `showIcon`    | `boolean`                                                    | `true`  | 显示图标     |
| `closable`    | `boolean`                                                    | `false` | 显示关闭按钮 |
| `center`      | `boolean`                                                    | `false` | 内容居中     |

## Events

| 事件    | 参数 | 说明     |
| ------- | ---- | -------- |
| `close` | —    | 点击关闭 |

`danger` 内部映射到 Element Plus 的 `error`；`primary` 与 `neutral` 都落到 `info`，提醒没有主色档。
