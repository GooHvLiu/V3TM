<script setup>
import AppCard from "@/components/common/base/app-card/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";
import AppTag from "@/components/common/base/app-tag/index.vue";
</script>

# 卡片 AppCard

把一组相关的信息框在一起。默认无阴影、有边框，这是后台界面里最省视觉噪音的一档——卡片多了以后，每张都压一层阴影会让页面显得脏。

## 基础

<div class="demo-grid">
  <AppCard title="概览">
    <p>卡片正文。内边距默认中等档，与页面级容器对齐。</p>
  </AppCard>
</div>

```vue
<AppCard title="概览">卡片正文。</AppCard>
```

## 标题加操作

`extra` 插槽放在标题行右端，两者共用一行，标题过长时左端省略、右端不换行。

<div class="demo-grid">
  <AppCard title="最近任务">
    <template #extra>
      <AppButton variant="link">全部</AppButton>
    </template>
    <p>任务列表正文。</p>
  </AppCard>
</div>

```vue
<AppCard title="最近任务">
  <template #extra>
    <AppButton variant="link">全部</AppButton>
  </template>
  任务列表正文。
</AppCard>
```

## 内边距五档

`padding` 控制内容区留白：`none` 用于表格、列表这类自带边距的内容，`sm / md / lg / xl` 逐级放宽。`none` 同时会把页眉页脚的边距一起清零，让卡片变成纯粹的框。

<div class="demo-grid">
  <AppCard title="无内边距" padding="none">
    <div style="padding: 12px 16px">内容自己带边距时用这一档。</div>
  </AppCard>
</div>

## 悬停浮起

<div class="demo-grid">
  <AppCard title="可点击" hoverable>
    <p>鼠标移入时出现阴影。</p>
  </AppCard>
</div>

## Props

| 属性        | 类型                           | 默认值                              | 说明                       |
| ----------- | ------------------------------ | ----------------------------------- | -------------------------- |
| `title`     | `string`                       | `""`                                | 标题，也可用 `header` 插槽 |
| `shadow`    | `always \| hover \| never`     | `never`（`hoverable` 时为 `hover`） | 阴影时机                   |
| `padding`   | `none \| sm \| md \| lg \| xl` | `md`                                | 内容区内边距               |
| `bordered`  | `boolean`                      | `true`                              | 显示边框                   |
| `hoverable` | `boolean`                      | `false`                             | 悬停浮起                   |
| `bodyStyle` | `CSSProperties`                | —                                   | 直接覆盖内容区样式         |

## Slots

| 插槽      | 说明             |
| --------- | ---------------- |
| `default` | 正文             |
| `header`  | 自定义标题区     |
| `extra`   | 标题行右端操作区 |
| `footer`  | 页脚             |
