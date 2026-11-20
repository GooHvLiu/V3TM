<script setup>
import AppBadge from "@/components/common/base/app-badge/index.vue";
import AppAvatar from "@/components/common/base/app-avatar/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";
</script>

# Badge AppBadge

A count or a status marker hung on the corner of an icon or avatar. Numbers cover unread totals; the dot form covers "there is something new" where the exact count does not matter.

## Numbers

<p class="demo-block">
  <AppBadge :value="5">
    <AppButton variant="outline">Messages</AppButton>
  </AppBadge>
  <AppBadge :value="12" type="primary">
    <AppButton variant="outline">Tasks</AppButton>
  </AppBadge>
  <AppBadge :value="120" :max="99">
    <AppButton variant="outline">Alerts</AppButton>
  </AppBadge>
</p>

```vue
<AppBadge :value="5">
  <AppButton variant="outline">Messages</AppButton>
</AppBadge>
<AppBadge :value="120" :max="99">…</AppBadge>
```

Values above `max` render as `99+`.

## Dots

<p class="demo-block">
  <AppBadge is-dot>
    <AppAvatar>AD</AppAvatar>
  </AppBadge>
  <AppBadge is-dot type="success">
    <AppAvatar tone="success">OP</AppAvatar>
  </AppBadge>
</p>

```vue
<AppBadge is-dot>
  <AppAvatar>AD</AppAvatar>
</AppBadge>
```

## Two sizes

`sm` shrinks to 16 pixels tall at a 10-point font, which suits table headers and dense lists; `md` is the default. Dots ignore the size and keep their native dimensions.

## Props

| Prop       | Type                                              | Default  | Description                        |
| ---------- | ------------------------------------------------- | -------- | ---------------------------------- |
| `value`    | `string \| number`                                | `""`     | Number or text to display          |
| `max`      | `number`                                          | `99`     | Ceiling; anything above shows `+`  |
| `isDot`    | `boolean`                                         | `false`  | Dot mode                           |
| `hidden`   | `boolean`                                         | `false`  | Hide the badge                     |
| `type`     | `primary \| success \| warning \| info \| danger` | `danger` | Colour                             |
| `tone`     | semantic tone                                     | —        | Semantic tone, wins over `type`    |
| `size`     | `sm \| md`                                        | `md`     | Size                               |
| `showZero` | `boolean`                                         | `true`   | Show the badge when the value is 0 |
| `color`    | `string`                                          | —        | Custom fill                        |
| `offset`   | `[number, number]`                                | `[0, 0]` | Position offset                    |
