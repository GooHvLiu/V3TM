<script setup>
import { reactive } from "vue";
import ProForm from "@/components/common/form/pro-form/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";

const model = reactive({
  name: "",
  status: "",
  range: null,
  enabled: true,
  count: 1,
  remark: ""
});

const fields = [
  { prop: "name", label: "名称", type: "input", placeholder: "请输入名称", span: 12, required: true },
  {
    prop: "status",
    label: "状态",
    type: "select",
    span: 12,
    options: [
      { label: "启用", value: "active" },
      { label: "停用", value: "disabled" }
    ]
  },
  {
    prop: "range",
    label: "有效期",
    type: "daterange",
    span: 12,
    startPlaceholder: "开始日期",
    endPlaceholder: "结束日期"
  },
  { prop: "count", label: "数量", type: "number", span: 12, min: 1, max: 99 },
  { prop: "enabled", label: "启用", type: "switch", span: 12 },
  { prop: "remark", label: "备注", type: "textarea", span: 24, rows: 3, tip: "最多 200 字" }
];
</script>

# 表单 ProForm

字段配置驱动的表单。七类控件覆盖后台的绝大多数输入，页面上不再逐个写 `el-form-item` 加 `el-input`。

## 栅格布局

<div class="demo-block demo-block--column">
  <ProForm v-model="model" :fields="fields">
    <template #actions>
      <AppButton tone="primary">保存</AppButton>
      <AppButton variant="outline">取消</AppButton>
    </template>
  </ProForm>
</div>

```vue
<script setup>
const model = reactive({ name: "", status: "", range: null, enabled: true, count: 1, remark: "" });

const fields = [
  { prop: "name", label: "名称", type: "input", span: 12, required: true },
  { prop: "status", label: "状态", type: "select", span: 12, options: […] },
  { prop: "range", label: "有效期", type: "daterange", span: 12 },
  { prop: "count", label: "数量", type: "number", span: 12, min: 1, max: 99 },
  { prop: "enabled", label: "启用", type: "switch", span: 12 },
  { prop: "remark", label: "备注", type: "textarea", span: 24, rows: 3, tip: "最多 200 字" }
];
</script>

<ProForm v-model="model" :fields="fields">
  <template #actions>
    <AppButton tone="primary">保存</AppButton>
  </template>
</ProForm>
```

`span` 是 24 栅格：两个字段各占 12 并排，占 24 独占一行。窄屏下栅格自动降到两列、一列，不需要额外配置。

## 七类控件

| `type`      | 控件     | 常用配套字段                                                 |
| ----------- | -------- | ------------------------------------------------------------ |
| `input`     | 单行文本 | `placeholder`、`clearable`                                   |
| `password`  | 密码     | `placeholder`                                                |
| `textarea`  | 多行文本 | `rows`                                                       |
| `select`    | 下拉     | `options`、`multiple`                                        |
| `switch`    | 开关     | `activeValue`、`inactiveValue`、`activeText`、`inactiveText` |
| `number`    | 数字     | `min`、`max`、`step`                                         |
| `daterange` | 日期区间 | `startPlaceholder`、`endPlaceholder`                         |

不填 `type` 时按 `input` 处理。

## 条件显隐与禁用

`hidden` 与 `disabled` 除了布尔值，还可以传函数，按当前模型计算。用于「主体类型选了个人才显示证件号」这类联动，不必在页面里写 `v-if`：

```ts
{ prop: "idCard", label: "证件号", hidden: (model) => model.subjectType !== "person" }
```

## 校验

字段级 `rules` 与表单级 `rules` 会合并，字段配置一改自动重建，不需要手动清缓存。服务端返回的字段错误通过 `errors` 灌进来：

```ts
const errors = ref<Record<string, string>>({});
// { code: "ROLE_NAME_TAKEN", field: "name" } → errors.value.name = "角色名已存在"
<ProForm v-model="model" :fields="fields" :errors="errors" />
```

`useFormServerErrors` 负责把后端的字段级错误摊平成这个结构。

## 查询区形态

`layout="inline"` 把标签去掉、字段宽度固定成 200px，一行排三四个。ProSearch 内部用的就是这个形态，页面不要直接用它写查询条。

## Props

| 属性            | 类型                     | 默认值  | 说明                          |
| --------------- | ------------------------ | ------- | ----------------------------- |
| `modelValue`    | `ProFormModel`           | 必填    | 表单模型，`v-model`           |
| `fields`        | `ProFormField[]`         | 必填    | 字段配置                      |
| `rules`         | `FormRules`              | `{}`    | 表单级校验                    |
| `errors`        | `Record<string, string>` | `{}`    | 服务端字段错误                |
| `labelWidth`    | `string`                 | `90px`  | 标签宽度，inline 布局固定为 0 |
| `labelPosition` | `left \| right \| top`   | `right` | 标签位置                      |
| `layout`        | `grid \| inline`         | `grid`  | 布局形态                      |
| `columns`       | `number`                 | `24`    | 栅格总数                      |
| `disabled`      | `boolean`                | `false` | 整体禁用                      |

## Events

| 事件                | 参数           | 说明                     |
| ------------------- | -------------- | ------------------------ |
| `update:modelValue` | `ProFormModel` | 任一字段变化后的完整模型 |
| `field-change`      | `prop, value`  | 单字段变化               |
| `submit`            | —              | 在输入框回车             |

## Slots

| 插槽           | 说明                                                     |
| -------------- | -------------------------------------------------------- |
| `field-{prop}` | 替换某个字段的控件，参数 `{ field, modelValue, update }` |
| `actions`      | 表单底部按钮区                                           |

## 配套方法

```ts
// 清空模型：文本类回 "", 日期区间回 null, 其余回 undefined
clearFormModel(model, fields);
```

重置按钮不要自己逐个字段赋值，`clearFormModel` 已经按控件类型给了正确的空值——文本清成空串、日期区间清成 `null`，避免把 `""` 塞进日期控件。
