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
  { prop: "name", label: "Name", type: "input", placeholder: "Enter a name", span: 12, required: true },
  {
    prop: "status",
    label: "Status",
    type: "select",
    span: 12,
    options: [
      { label: "Active", value: "active" },
      { label: "Disabled", value: "disabled" }
    ]
  },
  {
    prop: "range",
    label: "Validity",
    type: "daterange",
    span: 12,
    startPlaceholder: "Start date",
    endPlaceholder: "End date"
  },
  { prop: "count", label: "Quantity", type: "number", span: 12, min: 1, max: 99 },
  { prop: "enabled", label: "Enabled", type: "switch", span: 12 },
  { prop: "remark", label: "Notes", type: "textarea", span: 24, rows: 3, tip: "Up to 200 characters" }
];
</script>

# Form ProForm

A form driven by field configuration. Seven control types cover the overwhelming majority of back-office input, and pages stop writing `el-form-item` plus `el-input` one pair at a time.

## Grid layout

<div class="demo-block demo-block--column">
  <ProForm v-model="model" :fields="fields">
    <template #actions>
      <AppButton tone="primary">Save</AppButton>
      <AppButton variant="outline">Cancel</AppButton>
    </template>
  </ProForm>
</div>

```vue
<script setup>
const model = reactive({ name: "", status: "", range: null, enabled: true, count: 1, remark: "" });

const fields = [
  { prop: "name", label: "Name", type: "input", span: 12, required: true },
  { prop: "status", label: "Status", type: "select", span: 12, options: […] },
  { prop: "range", label: "Validity", type: "daterange", span: 12 },
  { prop: "count", label: "Quantity", type: "number", span: 12, min: 1, max: 99 },
  { prop: "enabled", label: "Enabled", type: "switch", span: 12 },
  { prop: "remark", label: "Notes", type: "textarea", span: 24, rows: 3, tip: "Up to 200 characters" }
];
</script>

<ProForm v-model="model" :fields="fields">
  <template #actions>
    <AppButton tone="primary">Save</AppButton>
  </template>
</ProForm>
```

`span` counts on a 24-column grid: two fields at 12 sit side by side, one field at 24 takes the row. On narrow screens the grid steps down to two columns and then one, with no extra configuration.

## Seven control types

| `type`      | Control          | Common companion fields                                      |
| ----------- | ---------------- | ------------------------------------------------------------ |
| `input`     | Single-line text | `placeholder`, `clearable`                                   |
| `password`  | Password         | `placeholder`                                                |
| `textarea`  | Multi-line text  | `rows`                                                       |
| `select`    | Dropdown         | `options`, `multiple`                                        |
| `switch`    | Toggle           | `activeValue`, `inactiveValue`, `activeText`, `inactiveText` |
| `number`    | Number           | `min`, `max`, `step`                                         |
| `daterange` | Date range       | `startPlaceholder`, `endPlaceholder`                         |

Omitting `type` is treated as `input`.

## Conditional visibility and disabling

`hidden` and `disabled` accept a function as well as a boolean, evaluated against the current model. That covers linkage such as "show the ID field only when the subject is a person" without a `v-if` in the page:

```ts
{ prop: "idCard", label: "ID number", hidden: (model) => model.subjectType !== "person" }
```

## Validation

Field-level `rules` merge with form-level `rules`, and the rules rebuild whenever the field configuration changes — no manual cache clearing. Field errors returned by the server come in through `errors`:

```ts
const errors = ref<Record<string, string>>({});
// { code: "ROLE_NAME_TAKEN", field: "name" } → errors.value.name = "Role name already exists"
<ProForm v-model="model" :fields="fields" :errors="errors" />
```

`useFormServerErrors` flattens the backend's field-level errors into that shape.

## The filter shape

`layout="inline"` drops the labels and fixes field width at 200px, fitting three or four on a row. ProSearch uses this shape internally; pages should not reach for it directly when building a filter bar.

## Props

| Prop            | Type                     | Default  | Description                             |
| --------------- | ------------------------ | -------- | --------------------------------------- |
| `modelValue`    | `ProFormModel`           | required | Form model, `v-model`                   |
| `fields`        | `ProFormField[]`         | required | Field configuration                     |
| `rules`         | `FormRules`              | `{}`     | Form-level validation                   |
| `errors`        | `Record<string, string>` | `{}`     | Field errors from the server            |
| `labelWidth`    | `string`                 | `90px`   | Label width; inline layout pins it to 0 |
| `labelPosition` | `left \| right \| top`   | `right`  | Label position                          |
| `layout`        | `grid \| inline`         | `grid`   | Layout shape                            |
| `columns`       | `number`                 | `24`     | Total grid columns                      |
| `disabled`      | `boolean`                | `false`  | Disable the whole form                  |

## Events

| Event               | Payload        | Description                           |
| ------------------- | -------------- | ------------------------------------- |
| `update:modelValue` | `ProFormModel` | The full model after any field change |
| `field-change`      | `prop, value`  | A single field changed                |
| `submit`            | —              | Enter pressed inside an input         |

## Slots

| Slot           | Description                                                         |
| -------------- | ------------------------------------------------------------------- |
| `field-{prop}` | Replace a field's control; receives `{ field, modelValue, update }` |
| `actions`      | Button area at the bottom of the form                               |

## Companion helper

```ts
// Clears the model: text back to "", date ranges to null, everything else to undefined
clearFormModel(model, fields);
```

Do not assign field by field in a reset handler. `clearFormModel` already picks the correct empty value per control type — empty string for text, `null` for a date range — which avoids putting `""` into a date control.
