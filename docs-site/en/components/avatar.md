<script setup>
import AppAvatar from "@/components/common/base/app-avatar/index.vue";
</script>

# Avatar AppAvatar

A stand-in for a person, account or organisation. Without an image it shows initials or an icon, on the light step of a semantic tone.

## Three sizes

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

`sm`, `md` and `lg` are 32, 40 and 48 pixels; pass a number for anything else, for example `:size="36"`.

## Tones

<p class="demo-block">
  <AppAvatar tone="primary">AD</AppAvatar>
  <AppAvatar tone="success">OP</AppAvatar>
  <AppAvatar tone="warning">RV</AppAvatar>
  <AppAvatar tone="danger">SP</AppAvatar>
  <AppAvatar tone="neutral">GU</AppAvatar>
</p>

```vue
<AppAvatar tone="primary">AD</AppAvatar>
```

The fill is a 16% mix of the tone and the text sits on its darker step, so the contrast holds in both themes.

## Square and image

<p class="demo-block">
  <AppAvatar shape="square" tone="info">SQ</AppAvatar>
</p>

```vue
<AppAvatar shape="square" :size="48" src="/avatar.png" alt="User avatar" />
```

Image mode uses `fit="cover"`; pair a square avatar with `shape="square"`.

## Props

| Prop     | Type                                                    | Default  | Description                 |
| -------- | ------------------------------------------------------- | -------- | --------------------------- |
| `size`   | `sm \| md \| lg \| small \| default \| large \| number` | `md`     | Size                        |
| `shape`  | `circle \| square`                                      | `circle` | Shape                       |
| `src`    | `string`                                                | `""`     | Image URL                   |
| `alt`    | `string`                                                | —        | Image alt text              |
| `srcSet` | `string`                                                | —        | Responsive image set        |
| `fit`    | `fill \| contain \| cover \| none \| scale-down`        | `cover`  | Image fit                   |
| `icon`   | `Component`                                             | —        | Icon when there is no image |
| `tone`   | semantic tone                                           | —        | Fill step                   |

`small`, `default` and `large` are the older Element Plus steps, kept alongside `sm`, `md` and `lg` so a migration can replace them one call site at a time.
