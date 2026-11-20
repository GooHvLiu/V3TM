# Business components overview

Atoms answer "what does a single control look like"; business components answer "how is a screen of rows organised". Nine out of ten back-office pages repeat the same structure: conditions on top, a toolbar in the middle, a paginated table below. Three composites freeze that structure in place, leaving only the business fields and business actions to the page.

## The four layers of a list screen

| Layer   | Component           | Carries                                                         |
| ------- | ------------------- | --------------------------------------------------------------- |
| Filters | ProSearch           | Configuration-driven condition area, folded in three sections   |
| Toolbar | Drawn by the page   | Actions such as create, bulk delete, export                     |
| Table   | ProTable            | Columns, selection, sorting, column settings, density, skeleton |
| Paging  | Built into ProTable | Page number, page size, narrowed on small screens               |

## State belongs to useTable

ProTable fetches nothing itself. Paging, loading, errors, selection and query linkage all live in the `useTable` state machine, and the component only receives five values: `data / loading / page / pageSize / total`. The payoff is that page switching, running past the last page and request races are handled in exactly one place.

```ts
const query = reactive({ keyword: "", status: "" });

const { list, loading, page, pageSize, total, error, search, changePage, changePageSize, refresh } = useTable({
  fetcher: fetchRoleList,
  query: () => ({ ...query })
});
```

Any change to `query` returns to the first page and refetches on its own — do not write a `watch` on the page that calls `search()`.

## A typical page

```vue
<template>
  <BasicPage title="Role management">
    <ProSearch v-model="query" :fields="searchFields" :loading="loading" @search="search" @reset="onReset" />

    <ProTable
      :columns="columns"
      :data="list"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      show-toolbar
      show-selection
      @page-change="changePage"
      @size-change="changePageSize"
      @selection-change="setSelected"
    >
      <template #toolbar>
        <AppButton tone="primary" @click="openCreate">New role</AppButton>
      </template>
      <template #cell-status="{ row }">
        <AppTag :tone="row.status === 'active' ? 'success' : 'neutral'">
          {{ row.status === "active" ? "Active" : "Disabled" }}
        </AppTag>
      </template>
    </ProTable>
  </BasicPage>
</template>
```

No paging logic, no column width arithmetic, no loading overlay on the page — all of it sits in the components.

## What the three share

**Fields and columns are configuration, not templates.** `fields` describes the inputs in the filter area, `columns` describes the table's columns. The same configuration holds in both themes and at every width, with no second set written for responsiveness.

**Controlled mode.** `v-model` only emits `update:modelValue`; the component never writes back into the parent's value. Filters, form models and column visibility all follow this.

**i18n through keys only.** Button labels, empty-state copy and density labels come from the language packs, so pages never pass Chinese in.
