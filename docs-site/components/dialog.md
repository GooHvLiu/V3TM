<script setup>
import { ref } from "vue";
import AppDialog from "@/components/common/base/app-dialog/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";

const basic = ref(false);
const noFooter = ref(false);
</script>

# 对话框 AppDialog

需要用户在当前上下文里做一个决定时使用。遮罩挡住后面的页面，所以只放确实需要停顿确认的事；能就地完成的操作交给抽屉或行内编辑。

## 基础

<div class="demo-block">
  <AppButton tone="primary" @click="basic = true">打开对话框</AppButton>
</div>

<AppDialog v-model="basic" title="确认发布" @confirm="basic = false" @cancel="basic = false">
发布后这版配置会对所有租户生效，确认继续？
</AppDialog>

```vue
<script setup>
import { ref } from "vue";
const visible = ref(false);
</script>

<AppDialog v-model="visible" title="确认发布" @confirm="visible = false">
  发布后这版配置会对所有租户生效，确认继续？
</AppDialog>
```

`v-model` 是唯一的数据入口：子组件不持有开关状态，关闭动作通过 `update:modelValue` 上抛。

## 只要内容

`showFooter` 默认是 `true`，底部给一对确认 / 取消按钮。纯展示或自带操作区的场景关掉它：

<p class="demo-block">
  <AppButton variant="outline" @click="noFooter = true">无底部按钮</AppButton>
</p>

<AppDialog v-model="noFooter" title="说明" :show-footer="false" @close="noFooter = false">
这段内容自己处理关闭，不由组件代劳。
</AppDialog>

## 按钮文案

`confirmText` 与 `cancelText` 不传时取语言包 `common.confirm / common.cancel`。业务里需要「提交」「放弃」这类具体动词时传进来，不要在没有语言包的组件里硬编码中文。

```vue
<AppDialog v-model="visible" confirm-text="提交" cancel-text="放弃" />
```

## Props

| 属性                 | 类型               | 默认值  | 说明             |
| -------------------- | ------------------ | ------- | ---------------- |
| `title`              | `string`           | `""`    | 标题             |
| `width`              | `string \| number` | `520px` | 宽度             |
| `top`                | `string`           | `15vh`  | 距顶部距离       |
| `fullscreen`         | `boolean`          | `false` | 全屏             |
| `draggable`          | `boolean`          | `false` | 可拖拽           |
| `closeOnClickModal`  | `boolean`          | `true`  | 点遮罩关闭       |
| `closeOnPressEscape` | `boolean`          | `true`  | Esc 关闭         |
| `showClose`          | `boolean`          | `true`  | 显示右上角关闭   |
| `destroyOnClose`     | `boolean`          | `true`  | 关闭后销毁内容   |
| `showFooter`         | `boolean`          | `true`  | 显示默认底部按钮 |
| `confirmLoading`     | `boolean`          | `false` | 确认按钮 loading |
| `confirmText`        | `string`           | —       | 确认文案         |
| `cancelText`         | `string`           | —       | 取消文案         |

## Events

| 事件                        | 说明                     |
| --------------------------- | ------------------------ |
| `confirm`                   | 点击确认                 |
| `cancel`                    | 点击取消                 |
| `open` / `close` / `closed` | 打开、开始关闭、关闭完成 |

## Slots

| 插槽      | 说明             |
| --------- | ---------------- |
| `default` | 正文             |
| `footer`  | 覆盖默认底部按钮 |
