# 表格 ProTable

列配置驱动的表格。分页、加载、错误提示、批量选择、列显隐、密度切换、窄屏收窄都在组件内部，页面只关心「有哪些列、点行做什么」。

## 最小用法

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

不带工具栏、不带选择列时，这就是一块「列 + 分页」的表格。

## 和 useTable 配套

```ts
const columns: ProTableColumn<Role>[] = [
  { prop: "name", label: "角色名称", minWidth: 160, showOverflowTooltip: true },
  { prop: "code", label: "标识", minWidth: 140 },
  { prop: "createdAt", label: "创建时间", width: 170, fixed: "left" },
  { prop: "status", label: "状态", width: 90, align: "center" },
  { prop: "remark", label: "备注", minWidth: 160 },
  { prop: "actions", label: "操作", width: 160, fixed: "right", hideable: false }
];

const { list, loading, total, page, pageSize, error, changePage, changePageSize, setSelected, refresh } = useTable({
  fetcher: fetchRoleList,
  query: () => ({ ...query })
});
```

`useTable` 的返回值直接铺到组件的 props 上，不需要在中间再抄一层 ref。

## 列配置

| 字段                  | 类型                            | 说明                                           |
| --------------------- | ------------------------------- | ---------------------------------------------- |
| `prop`                | `string`                        | 字段名，同时是单元格插槽名                     |
| `label`               | `string`                        | 表头                                           |
| `width`               | `number`                        | 固定宽度，日期、状态、操作这类长度可预期的列用 |
| `minWidth`            | `number`                        | 最小宽度，长文本列用，剩余空间按比例分         |
| `align`               | `left \| center \| right`       | 对齐                                           |
| `fixed`               | `left \| right`                 | 固定列，窄屏会自动取消                         |
| `sortable`            | `boolean`                       | 服务端排序，抛出 `sort-change`                 |
| `showOverflowTooltip` | `boolean`                       | 溢出时省略并显示提示                           |
| `visible`             | `boolean`                       | 初始是否可见                                   |
| `hideable`            | `boolean`                       | 是否允许在列设置里隐藏，关键列设 `false`       |
| `formatter`           | `(row, value, index) => string` | 无插槽时的文本格式化                           |

**列宽先算再写。** 1280 窗口、侧栏展开时表格容器约 1018px，压到 1008 是给纵向滚动条留位。所有列的宽度加起来必须小于容器宽，否则固定列会与相邻列重叠——Element Plus 的固定列在没有纵向滚动条时会直接压在普通列上。

| 内容                  | 建议宽度                         |
| --------------------- | -------------------------------- |
| 主键                  | 64，固定左侧                     |
| `YYYY-MM-DD`          | 130                              |
| `YYYY-MM-DD HH:mm`    | 150                              |
| `YYYY-MM-DD HH:mm:ss` | 170，固定左侧                    |
| 状态                  | 80–90，配 `align: "center"`      |
| 长文本                | 160 起，配 `showOverflowTooltip` |
| 操作                  | 130–200，固定右侧                |

## 单元格插槽

插槽名是 `cell-{prop}`，拿到 `row` 与 `index`。没有插槽时按 `formatter`、再按字段值显示。

```vue
<template #cell-status="{ row }">
  <AppTag :tone="row.status === 'active' ? 'success' : 'neutral'">{{ row.statusText }}</AppTag>
</template>

<template #cell-actions="{ row }">
  <AppButton variant="link" @click="edit(row)">编辑</AppButton>
  <AppButton variant="link" tone="danger" @click="remove(row)">删除</AppButton>
</template>
```

## 工具栏与批量操作

`show-toolbar` 打开后右侧出现密度切换与列设置入口，左侧是 `#toolbar` 插槽：

```vue
<ProTable show-toolbar show-selection :columns="columns" … @selection-change="setSelected">
  <template #toolbar>
    <AppButton tone="primary" @click="openCreate">新建</AppButton>
    <AppButton variant="outline" :disabled="!selectedRows.length" @click="batchRemove">
      批量删除
    </AppButton>
  </template>
</ProTable>
```

批量操作完成后调用组件的 `clearSelection()` 清空勾选框——`useTable` 的 `clearSelection` 只清列表变量，勾选态在 `el-table` 内部。

## 列偏好持久化

`columnVisibility` 与 `density` 都是受控属性，配合 `use-table-preferences` 存到本地：

```ts
const { density, columnVisibility, bind } = useTablePreferences("role-list");
```

存储前缀是 `v3:table:`，同一条列表在刷新、换设备后保持上一次的列与密度。

## 内置骨架

`loading` 且 `skeleton` 为 `true` 时，用骨架屏替代 `v-loading` 遮罩。列的宽度跟随 `columns`，加载完成后不会出现宽度跳变。行数由 `skeletonRows` 控制，默认 5。

## 请求错误

`error` 传入后组件顶部渲染一条危险色提醒，页面不需要再自己弹层。`useTable` 已经在 `catch` 里把错误整理成 `Error`。

## Props

| 属性                 | 类型                      | 默认值         | 说明               |
| -------------------- | ------------------------- | -------------- | ------------------ |
| `columns`            | `ProTableColumn[]`        | 必填           | 列配置             |
| `data`               | `T[]`                     | 必填           | 数据               |
| `loading`            | `boolean`                 | 必填           | 加载中             |
| `total`              | `number`                  | 必填           | 总条数             |
| `page`               | `number`                  | 必填           | 当前页             |
| `pageSize`           | `number`                  | 必填           | 每页条数           |
| `showSelection`      | `boolean`                 | `false`        | 显示选择列         |
| `rowKey`             | `string`                  | `id`           | 行唯一键           |
| `pageSizes`          | `number[]`                | `[10, 20, 50]` | 每页条数选项       |
| `skeleton`           | `boolean`                 | `true`         | 加载时用骨架屏     |
| `skeletonRows`       | `number`                  | `5`            | 骨架行数           |
| `showToolbar`        | `boolean`                 | `false`        | 显示工具条         |
| `showColumnSettings` | `boolean`                 | `true`         | 显示列设置入口     |
| `density`            | `default \| compact`      | `default`      | 行密度             |
| `columnVisibility`   | `ColumnVisibility`        | —              | 列显隐，传入即受控 |
| `emptyText`          | `string`                  | `""`           | 空态文案           |
| `error`              | `Error \| string \| null` | `null`         | 请求错误           |
| `sort`               | `ProTableSort \| null`    | `null`         | 初始排序           |

## Events

| 事件                      | 参数                 | 说明                                 |
| ------------------------- | -------------------- | ------------------------------------ |
| `page-change`             | `page`               | 翻页                                 |
| `size-change`             | `size`               | 每页条数变化                         |
| `selection-change`        | `rows`               | 勾选变化                             |
| `sort-change`             | `{ prop, order }`    | 排序变化，`order` 为 `null` 表示取消 |
| `update:density`          | `default \| compact` | 密度切换                             |
| `update:columnVisibility` | `ColumnVisibility`   | 列显隐变化                           |

## Slots

| 插槽          | 说明                                |
| ------------- | ----------------------------------- |
| `cell-{prop}` | 单元格自定义，参数 `{ row, index }` |
| `toolbar`     | 工具条左侧动作区                    |
| `empty`       | 覆盖空态                            |

## 窄屏行为

宽度落进手机端时：分页只留「上一页 / 页码 / 下一页」，页码数量收窄到 5，分页器尺寸转小；固定列全部取消——窄屏下固定列会吃掉本就不多的可视宽度。这些不需要页面判断。
