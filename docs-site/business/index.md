# 业务组件总览

原子组件解决「单个控件长什么样」，业务组件解决「一屏列表怎么组织」。后台里九成的页面都是同一套结构：上方查询条件、中间工具条、下方分页表格。三个复合件把这段结构固化下来，页面里只剩业务字段和业务动作。

## 一屏列表的四层

| 层     | 组件          | 承载                                   |
| ------ | ------------- | -------------------------------------- |
| 查询   | ProSearch     | 字段配置驱动的条件区，三段折叠         |
| 工具条 | 页面自绘      | 新建、批量删除、导出这类动作           |
| 表格   | ProTable      | 列配置、选择、排序、列设置、密度、骨架 |
| 分页   | ProTable 内置 | 页码、每页条数、窄屏收窄               |

## 状态交给 useTable

ProTable 不自己取数。分页、加载、错误、选择、查询联动全部由 `useTable` 这层状态机负责，组件只接收 `data / loading / page / pageSize / total` 五个值。好处是切页速度、末页越界、请求竞态这些边界只在一处处理。

```ts
const query = reactive({ keyword: "", status: "" });

const { list, loading, page, pageSize, total, error, search, changePage, changePageSize, refresh } = useTable({
  fetcher: fetchRoleList,
  query: () => ({ ...query })
});
```

`query` 一变就自动回到第一页重新拉取——不要在页面上再手写 `watch` 去调 `search()`。

## 一个页面的典型写法

```vue
<template>
  <BasicPage title="角色管理">
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
        <AppButton tone="primary" @click="openCreate">新建角色</AppButton>
      </template>
      <template #cell-status="{ row }">
        <AppTag :tone="row.status === 'active' ? 'success' : 'neutral'">
          {{ row.status === "active" ? "启用" : "停用" }}
        </AppTag>
      </template>
    </ProTable>
  </BasicPage>
</template>
```

页面里没有一句分页、没有一处列宽计算、没有一层 loading 遮罩——这些都在组件里。

## 三者共用的约定

**字段与列都是配置，不是模板。** `fields` 描述查询区有哪些输入，`columns` 描述表格有哪些列。同一份配置在亮暗主题、宽窄屏下都成立，不需要为响应式另写一套。

**受控模式。** `v-model` 只向上抛 `update:modelValue`，组件内部不改父组件的值。查询条件、表单模型、列显隐都遵守这条。

**i18n 只取 key。** 组件里的按钮文案、空态文案、密度标签都走语言包，页面不需要传中文进来。
