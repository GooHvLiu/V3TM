# 查询 ProSearch

列表页顶部的条件区。字段配置复用 ProForm 的 `ProFormField`，超过三个字段时自动折叠，展开按钮放在按钮组末尾。

## 用法

```vue
<script setup>
const query = reactive({ keyword: "", status: "", createdAt: null, owner: "" });

const fields = [
  { prop: "keyword", placeholder: "名称 / 标识", width: 200 },
  { prop: "status", type: "select", width: 160, ariaLabel: "状态", options: statusOptions },
  { prop: "owner", placeholder: "负责人", width: 160 },
  { prop: "createdAt", type: "daterange", width: 260, ariaLabel: "创建时间" }
];
</script>

<ProSearch v-model="query" :fields="fields" :loading="loading" @search="search" @reset="onReset" />
```

`fields` 里的 `width` 是控件宽度，常见值 160 / 200 / 260（日期区间）。查询区没有可见标签，`ariaLabel` 用来给读屏软件命名——不填时按占位文案兜底。

## 三段折叠

`defaultVisibleCount` 默认 3：前三个字段常驻，其余收进「展开」。字段总数不超过 3 时不显示展开按钮。`collapsible` 设为 `false` 可强制全展开。

选择 3 这个数是有依据的：1280 窗口、侧栏展开时查询区一行能放三个 200px 输入加一组按钮，第四个字段会换行并浪费一行高度。

## 重置怎么清

`reset` 事件抛给页面，页面负责把 `query` 恢复成初始值。别直接 `Object.keys(query).forEach(k => query[k] = "")`——日期区间必须是 `null`，赋空串会让控件进入非法状态。用 `clearFormModel`：

```ts
import { clearFormModel } from "@/components/common/form/pro-form/helpers";

const onReset = (): void => {
  clearFormModel(query, fields);
  search();
};
```

## 已接入的页面

日志中心、角色中心、用户中心、字典类型、字典数据、数据检索（日志与消息两栏）、通知中心批量表格。这八处的查询条形态一致，新增列表页直接复用，不要另画一套。

## Props

| 属性                  | 类型             | 默认值  | 说明                         |
| --------------------- | ---------------- | ------- | ---------------------------- |
| `modelValue`          | `ProFormModel`   | 必填    | 查询模型，`v-model`          |
| `fields`              | `ProFormField[]` | 必填    | 字段配置                     |
| `loading`             | `boolean`        | `false` | 搜索按钮 loading             |
| `labelWidth`          | `string`         | `0px`   | 标签宽度，查询区通常不要标签 |
| `defaultVisibleCount` | `number`         | `3`     | 常驻字段数量                 |
| `collapsible`         | `boolean`        | `true`  | 是否可折叠                   |

## Events

| 事件                | 说明                   |
| ------------------- | ---------------------- |
| `update:modelValue` | 条件变化               |
| `search`            | 点击搜索或在输入框回车 |
| `reset`             | 点击重置               |

## 一个细节

展开 / 收起按钮的热区做到了 46×32，比文字本身宽。文字型按钮如果只按字号给热区，鼠标要很准才能点中——这在小屏上尤其明显。
