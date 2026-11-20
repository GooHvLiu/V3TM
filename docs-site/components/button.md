<script setup>
import AppButton from "@/components/common/base/app-button/index.vue";
</script>

# 按钮 AppButton

全站所有可点击动作的入口。四种视觉层级决定强调程度，六档语义色决定含义，权限码决定是否渲染。

## 四种层级

<p class="demo-block">
  <AppButton tone="primary">主按钮</AppButton>
  <AppButton variant="outline">描边</AppButton>
  <AppButton variant="ghost">轻底</AppButton>
  <AppButton variant="link">文字</AppButton>
</p>

```vue
<AppButton tone="primary">主按钮</AppButton>
<AppButton variant="outline">描边</AppButton>
<AppButton variant="ghost">轻底</AppButton>
<AppButton variant="link">文字</AppButton>
```

`solid` 是默认层级但需要配语义色：`tone="primary"` 是主操作，不传 `tone` 时落到中性灰实心，用于次要但需要块面的动作。同一条工具栏里最多出现一个主按钮——两个同级主色会让用户不知道点哪个。

## 语义色

<p class="demo-block">
  <AppButton tone="primary">主要</AppButton>
  <AppButton tone="success">成功</AppButton>
  <AppButton tone="warning">警告</AppButton>
  <AppButton tone="danger">危险</AppButton>
  <AppButton tone="info">信息</AppButton>
  <AppButton tone="neutral">中性</AppButton>
</p>

```vue
<AppButton tone="danger">删除</AppButton>
```

危险操作不要只靠颜色表达，文案里要有动词：`删除`、`停用`、`清空`，而不是统一的 `确定`。

## 尺寸

<p class="demo-block">
  <AppButton size="sm">小</AppButton>
  <AppButton>默认</AppButton>
  <AppButton size="lg">大</AppButton>
</p>

```vue
<AppButton size="sm">小</AppButton>
```

`sm / default / lg` 映射到 Element Plus 的三档高度，表格行内操作统一用 `sm`。

## 图标与方形按钮

<p class="demo-block">
  <AppButton tone="primary">
    <template #icon>
      <span aria-hidden="true">＋</span>
    </template>
    新建
  </AppButton>
  <AppButton icon-only aria-label="刷新">
    <template #icon>
      <span aria-hidden="true">↻</span>
    </template>
  </AppButton>
  <AppButton block tone="primary">占满一行</AppButton>
</p>

```vue
<AppButton icon-only aria-label="刷新">…</AppButton>
<AppButton block tone="primary">占满一行</AppButton>
```

`icon-only` 时宽度自动取当前尺寸的控件高度，保持正方形；此时 `aria-label` 是必填的，否则读屏软件只会读出一个没有名字的按钮。`block` 用于抽屉与表单底部。

## 加载与禁用

<p class="demo-block">
  <AppButton tone="primary" loading>保存中</AppButton>
  <AppButton disabled>不可用</AppButton>
</p>

```vue
<AppButton tone="primary" :loading="saving">保存</AppButton>
```

`loading` 同时会置灰，避免重复提交。

## 权限码

传 `permission` 时组件自行判断渲染：

```vue
<AppButton permission="systemSettings:config:update" tone="primary">保存</AppButton>
<AppButton :permission="['role:create', 'role:update']">编辑</AppButton>
```

用户没有对应权限点时整颗按钮不渲染，不会出现「点了才提示无权限」的尴尬。数组形式表示任一权限即可见。不传 `permission` 时不读用户态，单测与文档站无需挂 Pinia。

## Props

| 属性                                           | 类型                                                         | 默认值    | 说明                          |
| ---------------------------------------------- | ------------------------------------------------------------ | --------- | ----------------------------- |
| `tone`                                         | `primary \| success \| warning \| danger \| info \| neutral` | —         | 语义色                        |
| `variant`                                      | `solid \| outline \| ghost \| link`                          | `solid`   | 视觉层级                      |
| `size`                                         | `sm \| default \| lg`                                        | `default` | 尺寸                          |
| `block`                                        | `boolean`                                                    | `false`   | 占满宽度                      |
| `iconOnly`                                     | `boolean`                                                    | `false`   | 方形图标按钮                  |
| `ariaLabel`                                    | `string`                                                     | —         | 无障碍名称，`iconOnly` 时必填 |
| `type`                                         | `default \| primary \| success \| warning \| danger \| info` | `default` | Element Plus 旧类型           |
| `plain` / `round` / `circle` / `text` / `link` | `boolean`                                                    | `false`   | 旧写法，内部折算到 `variant`  |
| `loading`                                      | `boolean`                                                    | `false`   | 加载中                        |
| `disabled`                                     | `boolean`                                                    | `false`   | 禁用                          |
| `htmlType`                                     | `button \| submit \| reset`                                  | `button`  | 原生类型                      |
| `permission`                                   | `string \| string[]`                                         | —         | 权限码                        |

## Events

| 事件    | 参数         | 说明 |
| ------- | ------------ | ---- |
| `click` | `MouseEvent` | 点击 |

## Slots

| 插槽      | 说明     |
| --------- | -------- |
| `default` | 按钮文字 |
| `icon`    | 前置图标 |
