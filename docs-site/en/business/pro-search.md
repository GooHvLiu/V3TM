# Search ProSearch

The condition area at the top of a list page. Field configuration reuses `ProFormField` from ProForm; past three fields it folds automatically, with the toggle at the end of the button group.

## Usage

```vue
<script setup>
const query = reactive({ keyword: "", status: "", createdAt: null, owner: "" });

const fields = [
  { prop: "keyword", placeholder: "Name / identifier", width: 200 },
  { prop: "status", type: "select", width: 160, ariaLabel: "Status", options: statusOptions },
  { prop: "owner", placeholder: "Owner", width: 160 },
  { prop: "createdAt", type: "daterange", width: 260, ariaLabel: "Created at" }
];
</script>

<ProSearch v-model="query" :fields="fields" :loading="loading" @search="search" @reset="onReset" />
```

`width` in `fields` is the control's width; the common values are 160, 200 and 260 for a date range. The filter area shows no visible labels, so `ariaLabel` names the control for screen readers and falls back to the placeholder when omitted.

## Folding in three

`defaultVisibleCount` defaults to 3: the first three fields stay put and the rest go behind "More". Fewer than four fields means no toggle at all. `collapsible: false` forces everything open.

Three is not arbitrary: in a 1280 window with the sidebar open, one row holds three 200px inputs plus a button group; a fourth field wraps and wastes a row of height.

## How reset clears

The `reset` event goes to the page, and the page restores `query`. Do not run `Object.keys(query).forEach(k => query[k] = "")` — a date range must be `null`, and an empty string puts the control into an invalid state. Use `clearFormModel`:

```ts
import { clearFormModel } from "@/components/common/form/pro-form/helpers";

const onReset = (): void => {
  clearFormModel(query, fields);
  search();
};
```

## Pages already using it

Log center, role center, user center, dictionary types, dictionary data, data search (logs and messages), notification center bulk tables. Those eight share one filter bar shape; a new list page reuses it rather than drawing another.

## Props

| Prop                  | Type             | Default  | Description                                    |
| --------------------- | ---------------- | -------- | ---------------------------------------------- |
| `modelValue`          | `ProFormModel`   | required | Query model, `v-model`                         |
| `fields`              | `ProFormField[]` | required | Field configuration                            |
| `loading`             | `boolean`        | `false`  | Loading on the search button                   |
| `labelWidth`          | `string`         | `0px`    | Label width; the filter area normally has none |
| `defaultVisibleCount` | `number`         | `3`      | Fields kept visible                            |
| `collapsible`         | `boolean`        | `true`   | Whether it can fold                            |

## Events

| Event               | Description                          |
| ------------------- | ------------------------------------ |
| `update:modelValue` | A condition changed                  |
| `search`            | Search clicked, or Enter in an input |
| `reset`             | Reset clicked                        |

## One detail

The expand / collapse button has a 46×32 hit area, wider than the text itself. A text-only button sized to its type needs a precise pointer, which is especially obvious on small screens.
