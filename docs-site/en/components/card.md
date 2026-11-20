<script setup>
import AppCard from "@/components/common/base/app-card/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";
import AppTag from "@/components/common/base/app-tag/index.vue";
</script>

# Card AppCard

Frames a group of related information. No shadow by default, a border instead — on a back-office screen that is the quietest option available; stacking shadows on every card makes the page look dirty.

## Basic

<div class="demo-grid">
  <AppCard title="Overview">
    <p>Card body. The default padding sits level with page containers.</p>
  </AppCard>
</div>

```vue
<AppCard title="Overview">Card body.</AppCard>
```

## Title with actions

The `extra` slot sits at the right end of the title row. The two share one line; an overlong title truncates on the left while the right side never wraps.

<div class="demo-grid">
  <AppCard title="Recent tasks">
    <template #extra>
      <AppButton variant="link">All</AppButton>
    </template>
    <p>Task list body.</p>
  </AppCard>
</div>

```vue
<AppCard title="Recent tasks">
  <template #extra>
    <AppButton variant="link">All</AppButton>
  </template>
  Task list body.
</AppCard>
```

## Five padding steps

`padding` controls the whitespace inside the body: `none` for content that brings its own margins, such as tables and lists; `sm`, `md`, `lg` and `xl` widen from there. `none` also zeroes the header and footer margins, leaving the card as a pure frame.

<div class="demo-grid">
  <AppCard title="No padding" padding="none">
    <div style="padding: 12px 16px">Use this step when the content carries its own padding.</div>
  </AppCard>
</div>

## Hover lift

<div class="demo-grid">
  <AppCard title="Clickable" hoverable>
    <p>The shadow appears on hover.</p>
  </AppCard>
</div>

## Props

| Prop        | Type                           | Default                                   | Description                        |
| ----------- | ------------------------------ | ----------------------------------------- | ---------------------------------- |
| `title`     | `string`                       | `""`                                      | Title; the `header` slot works too |
| `shadow`    | `always \| hover \| never`     | `never` (`hover` when `hoverable` is set) | When the shadow shows              |
| `padding`   | `none \| sm \| md \| lg \| xl` | `md`                                      | Body padding                       |
| `bordered`  | `boolean`                      | `true`                                    | Draw a border                      |
| `hoverable` | `boolean`                      | `false`                                   | Lift on hover                      |
| `bodyStyle` | `CSSProperties`                | —                                         | Override the body style            |

## Slots

| Slot      | Description                           |
| --------- | ------------------------------------- |
| `default` | Body                                  |
| `header`  | Custom header area                    |
| `extra`   | Actions at the right of the title row |
| `footer`  | Footer                                |
