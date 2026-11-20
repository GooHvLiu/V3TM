<script setup>
import { ref } from "vue";
import AppTabs from "@/components/common/base/app-tabs/index.vue";

const active = ref("all");
const items = [
  { label: "全部", value: "all", badge: 128 },
  { label: "进行中", value: "running", badge: 6 },
  { label: "已完成", value: "done" },
  { label: "已归档", value: "archived", disabled: true }
];
</script>

# 页签 AppTabs

同一块区域里切换几组平级内容。数据驱动：`items` 描述有哪些页签，`v-model` 记住当前选中，内容通过 `content` 插槽按项渲染。

## 基础

<p class="demo-block demo-block--column">
  <AppTabs v-model="active" :items="items">
    <template #content="{ item }">
      <p>{{ item.label }} 的内容区</p>
    </template>
  </AppTabs>
</p>

```vue
<script setup>
import { ref } from "vue";
const active = ref("all");
const items = [
  { label: "全部", value: "all", badge: 128 },
  { label: "进行中", value: "running", badge: 6 },
  { label: "已完成", value: "done" },
  { label: "已归档", value: "archived", disabled: true }
];
</script>

<AppTabs v-model="active" :items="items">
  <template #content="{ item }">
    <p>{{ item.label }} 的内容区</p>
  </template>
</AppTabs>
```

不传 `v-model` 时默认选中第一项，此时组件只做展示。

## 标签上的计数与图标

`badge` 是标题右侧的小胶囊，用来放条数；`icon` 接一个图标组件。两者都渲染在自定义的 `label` 插槽下，也可以用 `#label` 整体接管。

胶囊默认走主色，未读提醒这类需要警示的计数传 `tone: "danger"`。胶囊本身在文字流里，不靠绝对定位，页签被压缩或换行时也不会压住标题。

```vue
<AppTabs :items="[{ label: '告警', value: 'alert', icon: WarningFilled, badge: 3 }]" />
<AppTabs :items="[{ label: '我的通知', value: 'mine', badge: '99+', tone: 'danger' }]" />
```

## 卡片形态

`type` 传给 Element Plus：`card` 带边框的卡片页签，`border-card` 整块带边框。后台里筛选条常用 `card`。

## Props

| 属性       | 类型                        | 默认值  | 说明     |
| ---------- | --------------------------- | ------- | -------- |
| `items`    | `TabItem[]`                 | 必填    | 页签数据 |
| `type`     | `"" \| card \| border-card` | `""`    | 外观     |
| `stretch`  | `boolean`                   | `false` | 均分宽度 |
| `closable` | `boolean`                   | `false` | 可关闭   |

`TabItem` 的字段：`label`、`value`、`icon?`、`badge?`、`tone?`、`disabled?`。

## Events

| 事件         | 参数              | 说明       |
| ------------ | ----------------- | ---------- |
| `tab-click`  | `TabsPaneContext` | 点击页签   |
| `tab-change` | `value`           | 选中项变化 |
| `tab-remove` | `value`           | 移除页签   |

## Slots

| 插槽      | 说明                        |
| --------- | --------------------------- |
| `label`   | 自定义标题，参数 `{ item }` |
| `content` | 内容区，参数 `{ item }`     |
