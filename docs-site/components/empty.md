<script setup>
import AppEmpty from "@/components/common/base/app-empty/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";
</script>

# 空态 AppEmpty

列表没有数据、搜索没有结果、筛选条件过窄时的占位。默认文案取语言包 `common.empty`，需要更具体时传 `description`。

## 基础

<div class="demo-grid">
  <AppEmpty />
</div>

```vue
<AppEmpty />
```

## 带下一步动作

<div class="demo-grid">
  <AppEmpty description="还没有项目">
    <template #action>
      <AppButton tone="primary">新建项目</AppButton>
    </template>
  </AppEmpty>
</div>

```vue
<AppEmpty description="还没有项目">
  <template #action>
    <AppButton tone="primary">新建项目</AppButton>
  </template>
</AppEmpty>
```

`action` 插槽放在插画下方、文案之上，动作与说明分成两个视觉层，不会挤成一行。

## 只保留插画

传空字符串给 `description`，文案区整体不渲染。紧凑卡片里空间有限时用这一档。

```vue
<AppEmpty description="" :image-size="72" />
```

## Props

| 属性          | 类型     | 默认值 | 说明                                 |
| ------------- | -------- | ------ | ------------------------------------ |
| `description` | `string` | —      | 文案，传 `""` 隐藏；不传取语言包     |
| `image`       | `string` | —      | 自定义插画                           |
| `imageSize`   | `number` | —      | 插画边长，不传沿用 Element Plus 变量 |

## Slots

| 插槽      | 说明                                  |
| --------- | ------------------------------------- |
| `action`  | 插画下方的操作区                      |
| `default` | 任意自定义内容，`action` 不存在时生效 |
