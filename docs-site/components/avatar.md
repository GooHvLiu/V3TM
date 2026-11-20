<script setup>
import AppAvatar from "@/components/common/base/app-avatar/index.vue";
</script>

# 头像 AppAvatar

人员、账号、组织的图形占位。没有图片时显示首字母或图标，底色按语义色取浅档。

## 三种尺寸

<p class="demo-block">
  <AppAvatar size="sm">A</AppAvatar>
  <AppAvatar size="md">B</AppAvatar>
  <AppAvatar size="lg">C</AppAvatar>
</p>

```vue
<AppAvatar size="sm">A</AppAvatar>
<AppAvatar size="md">B</AppAvatar>
<AppAvatar size="lg">C</AppAvatar>
```

`sm / md / lg` 对应 32 / 40 / 48 像素；需要别的值时直接传数字，例如 `:size="36"`。

## 语义色

<p class="demo-block">
  <AppAvatar tone="primary">管</AppAvatar>
  <AppAvatar tone="success">运</AppAvatar>
  <AppAvatar tone="warning">审</AppAvatar>
  <AppAvatar tone="danger">停</AppAvatar>
  <AppAvatar tone="neutral">访</AppAvatar>
</p>

```vue
<AppAvatar tone="primary">管</AppAvatar>
```

底色取语义色的 16% 混色，文字取对应的深色档，因此亮暗主题下都保持可读对比。

## 方形与图片

<p class="demo-block">
  <AppAvatar shape="square" tone="info">方</AppAvatar>
</p>

```vue
<AppAvatar shape="square" :size="48" src="/avatar.png" alt="用户头像" />
```

图片模式走 `fit="cover"`，方形头像配合 `shape="square"` 使用。

## Props

| 属性     | 类型                                                    | 默认值   | 说明         |
| -------- | ------------------------------------------------------- | -------- | ------------ |
| `size`   | `sm \| md \| lg \| small \| default \| large \| number` | `md`     | 尺寸         |
| `shape`  | `circle \| square`                                      | `circle` | 形状         |
| `src`    | `string`                                                | `""`     | 图片地址     |
| `alt`    | `string`                                                | —        | 图片替代文本 |
| `srcSet` | `string`                                                | —        | 响应式图片集 |
| `fit`    | `fill \| contain \| cover \| none \| scale-down`        | `cover`  | 图片填充方式 |
| `icon`   | `Component`                                             | —        | 无图时的图标 |
| `tone`   | 语义色                                                  | —        | 底色档位     |

`small / default / large` 是 Element Plus 的旧档位，与 `sm / md / lg` 并存，迁移时可以逐处替换。
