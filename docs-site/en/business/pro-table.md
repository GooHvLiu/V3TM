# Table ProTable

A table driven by column configuration. Paging, loading, error notices, bulk selection, column visibility, density switching and narrow-screen narrowing all live inside the component; the page only cares which columns exist and what clicking a row does.

## Minimal usage

```vue
<ProTable
  :columns="columns"
  :data="list"
  :loading="loading"
  :total="total"
  :page="page"
  :page-size="pageSize"
  @page-change="changePage"
  @size-change="changePageSize"
/>
```

Without a toolbar and without a selection column, this is a plain "columns plus paging" table.

## Pairing with useTable

```ts
const columns: ProTableColumn<Role>[] = [
  { prop: "name", label: "Role name", minWidth: 160, showOverflowTooltip: true },
  { prop: "code", label: "Code", minWidth: 140 },
  { prop: "createdAt", label: "Created at", width: 170, fixed: "left" },
  { prop: "status", label: "Status", width: 90, align: "center" },
  { prop: "remark", label: "Notes", minWidth: 160 },
  { prop: "actions", label: "Actions", width: 160, fixed: "right", hideable: false }
];

const { list, loading, total, page, pageSize, error, changePage, changePageSize, setSelected, refresh } = useTable({
  fetcher: fetchRoleList,
  query: () => ({ ...query })
});
```

The values `useTable` returns go straight onto the component's props; no intermediate ref layer is needed.

## Column configuration

| Field                 | Type                            | Description                                                                      |
| --------------------- | ------------------------------- | -------------------------------------------------------------------------------- |
| `prop`                | `string`                        | Field name, also the cell slot name                                              |
| `label`               | `string`                        | Header                                                                           |
| `width`               | `number`                        | Fixed width, for columns of predictable length such as dates, status and actions |
| `minWidth`            | `number`                        | Minimum width for long text, with the remaining space shared proportionally      |
| `align`               | `left \| center \| right`       | Alignment                                                                        |
| `fixed`               | `left \| right`                 | Fixed column, dropped on narrow screens                                          |
| `sortable`            | `boolean`                       | Server-side sorting, emits `sort-change`                                         |
| `showOverflowTooltip` | `boolean`                       | Truncate on overflow and show a tooltip                                          |
| `visible`             | `boolean`                       | Visible on first render                                                          |
| `hideable`            | `boolean`                       | Whether column settings may hide it; key columns pass `false`                    |
| `formatter`           | `(row, value, index) => string` | Text formatting when there is no slot                                            |

**Work out column widths before writing them.** In a 1280 window with the sidebar open the table container is about 1018px, and 1008 leaves room for a vertical scrollbar. All column widths together must stay under the container width, or fixed columns overlap their neighbours — Element Plus paints a fixed column straight over a normal one when no vertical scrollbar is present.

| Content               | Suggested width                      |
| --------------------- | ------------------------------------ |
| Primary key           | 64, fixed left                       |
| `YYYY-MM-DD`          | 130                                  |
| `YYYY-MM-DD HH:mm`    | 150                                  |
| `YYYY-MM-DD HH:mm:ss` | 170, fixed left                      |
| Status                | 80–90, with `align: "center"`        |
| Long text             | from 160, with `showOverflowTooltip` |
| Actions               | 130–200, fixed right                 |

## Cell slots

The slot name is `cell-{prop}` and receives `row` and `index`. Without a slot the cell falls back to `formatter`, then to the raw field value.

```vue
<template #cell-status="{ row }">
  <AppTag :tone="row.status === 'active' ? 'success' : 'neutral'">{{ row.statusText }}</AppTag>
</template>

<template #cell-actions="{ row }">
  <AppButton variant="link" @click="edit(row)">Edit</AppButton>
  <AppButton variant="link" tone="danger" @click="remove(row)">Delete</AppButton>
</template>
```

## Toolbar and bulk actions

`show-toolbar` adds the density switch and the column settings entry on the right, with the `#toolbar` slot on the left:

```vue
<ProTable show-toolbar show-selection :columns="columns" … @selection-change="setSelected">
  <template #toolbar>
    <AppButton tone="primary" @click="openCreate">New</AppButton>
    <AppButton variant="outline" :disabled="!selectedRows.length" @click="batchRemove">
      Delete selected
    </AppButton>
  </template>
</ProTable>
```

After a bulk action, call the component's `clearSelection()` to uncheck the boxes — `useTable`'s `clearSelection` only clears the list variable, while the checked state lives inside `el-table`.

## Saving column preferences

`columnVisibility` and `density` are controlled props; pair them with `use-table-preferences` to persist locally:

```ts
const { density, columnVisibility, bind } = useTablePreferences("role-list");
```

The storage prefix is `v3:table:`, so one list keeps its columns and density across reloads and devices.

## Built-in skeleton

When `loading` is set and `skeleton` is `true`, a skeleton replaces the `v-loading` mask. Column widths follow `columns`, so nothing jumps when the data lands. Row count comes from `skeletonRows`, five by default.

## Request errors

Pass `error` and the component renders a danger-toned alert at the top; the page needs no popup of its own. `useTable` has already normalised the caught error into an `Error`.

## Props

| Prop                 | Type                      | Default        | Description                                       |
| -------------------- | ------------------------- | -------------- | ------------------------------------------------- |
| `columns`            | `ProTableColumn[]`        | required       | Column configuration                              |
| `data`               | `T[]`                     | required       | Data                                              |
| `loading`            | `boolean`                 | required       | Loading                                           |
| `total`              | `number`                  | required       | Total rows                                        |
| `page`               | `number`                  | required       | Current page                                      |
| `pageSize`           | `number`                  | required       | Rows per page                                     |
| `showSelection`      | `boolean`                 | `false`        | Show the selection column                         |
| `rowKey`             | `string`                  | `id`           | Row key                                           |
| `pageSizes`          | `number[]`                | `[10, 20, 50]` | Page size options                                 |
| `skeleton`           | `boolean`                 | `true`         | Skeleton while loading                            |
| `skeletonRows`       | `number`                  | `5`            | Skeleton row count                                |
| `showToolbar`        | `boolean`                 | `false`        | Show the toolbar                                  |
| `showColumnSettings` | `boolean`                 | `true`         | Show the column settings entry                    |
| `density`            | `default \| compact`      | `default`      | Row density                                       |
| `columnVisibility`   | `ColumnVisibility`        | —              | Column visibility; passing it makes it controlled |
| `emptyText`          | `string`                  | `""`           | Empty-state copy                                  |
| `error`              | `Error \| string \| null` | `null`         | Request error                                     |
| `sort`               | `ProTableSort \| null`    | `null`         | Initial sort                                      |

## Events

| Event                     | Payload              | Description                           |
| ------------------------- | -------------------- | ------------------------------------- |
| `page-change`             | `page`               | Page changed                          |
| `size-change`             | `size`               | Page size changed                     |
| `selection-change`        | `rows`               | Selection changed                     |
| `sort-change`             | `{ prop, order }`    | Sort changed; `order: null` clears it |
| `update:density`          | `default \| compact` | Density switched                      |
| `update:columnVisibility` | `ColumnVisibility`   | Column visibility changed             |

## Slots

| Slot          | Description                            |
| ------------- | -------------------------------------- |
| `cell-{prop}` | Custom cell; receives `{ row, index }` |
| `toolbar`     | Action area at the left of the toolbar |
| `empty`       | Replaces the empty state               |

## Narrow-screen behaviour

Once the width falls into the phone range: paging keeps only previous / page numbers / next, the page number count narrows to five, and the pager switches to the small size. Every fixed column is dropped — on a narrow screen a fixed column eats width the table cannot spare. None of this needs a decision on the page.
