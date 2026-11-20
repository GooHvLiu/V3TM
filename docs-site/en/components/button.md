<script setup>
import AppButton from "@/components/common/base/app-button/index.vue";
</script>

# Button AppButton

The entry point for every clickable action in the product. Four visual levels carry emphasis, six semantic tones carry meaning, and a permission code decides whether it renders at all.

## Four levels

<p class="demo-block">
  <AppButton tone="primary">Primary</AppButton>
  <AppButton variant="outline">Outline</AppButton>
  <AppButton variant="ghost">Ghost</AppButton>
  <AppButton variant="link">Link</AppButton>
</p>

```vue
<AppButton tone="primary">Primary</AppButton>
<AppButton variant="outline">Outline</AppButton>
<AppButton variant="ghost">Ghost</AppButton>
<AppButton variant="link">Link</AppButton>
```

`solid` is the default level but needs a tone to mean anything: `tone="primary"` marks the main action, and without a tone the button falls back to a neutral grey fill for secondary actions that still deserve a block. One toolbar holds at most one primary button — two of them at the same level leave the user unsure which to press.

## Tones

<p class="demo-block">
  <AppButton tone="primary">Primary</AppButton>
  <AppButton tone="success">Success</AppButton>
  <AppButton tone="warning">Warning</AppButton>
  <AppButton tone="danger">Danger</AppButton>
  <AppButton tone="info">Info</AppButton>
  <AppButton tone="neutral">Neutral</AppButton>
</p>

```vue
<AppButton tone="danger">Delete</AppButton>
```

Never leave a destructive action to colour alone: the label carries a verb, `Delete`, `Disable`, `Clear`, rather than a uniform "OK".

## Sizes

<p class="demo-block">
  <AppButton size="sm">Small</AppButton>
  <AppButton>Default</AppButton>
  <AppButton size="lg">Large</AppButton>
</p>

```vue
<AppButton size="sm">Small</AppButton>
```

`sm`, `default` and `lg` map onto Element Plus's three heights; row-level table actions use `sm` throughout.

## Icons and square buttons

<p class="demo-block">
  <AppButton tone="primary">
    <template #icon>
      <span aria-hidden="true">＋</span>
    </template>
    New
  </AppButton>
  <AppButton icon-only aria-label="Refresh">
    <template #icon>
      <span aria-hidden="true">↻</span>
    </template>
  </AppButton>
  <AppButton block tone="primary">Fill the row</AppButton>
</p>

```vue
<AppButton icon-only aria-label="Refresh">…</AppButton>
<AppButton block tone="primary">Fill the row</AppButton>
```

With `icon-only` the width takes the control height of the current size, keeping the button square; `aria-label` is then required, or a screen reader announces a button with no name. `block` suits drawer and form footers.

## Loading and disabled

<p class="demo-block">
  <AppButton tone="primary" loading>Saving</AppButton>
  <AppButton disabled>Unavailable</AppButton>
</p>

```vue
<AppButton tone="primary" :loading="saving">Save</AppButton>
```

`loading` also greys the button out, which blocks a double submit.

## Permission codes

Pass `permission` and the component decides whether to render:

```vue
<AppButton permission="systemSettings:config:update" tone="primary">Save</AppButton>
<AppButton :permission="['role:create', 'role:update']">Edit</AppButton>
```

A user without the code does not see the button at all, so nobody presses it only to be refused. An array means any one of the codes suffices. Without `permission` the component never reads user state, which keeps unit tests and the docs site free of a Pinia setup.

## Props

| Prop                                           | Type                                                         | Default   | Description                               |
| ---------------------------------------------- | ------------------------------------------------------------ | --------- | ----------------------------------------- |
| `tone`                                         | `primary \| success \| warning \| danger \| info \| neutral` | —         | Semantic tone                             |
| `variant`                                      | `solid \| outline \| ghost \| link`                          | `solid`   | Visual level                              |
| `size`                                         | `sm \| default \| lg`                                        | `default` | Size                                      |
| `block`                                        | `boolean`                                                    | `false`   | Fill the available width                  |
| `iconOnly`                                     | `boolean`                                                    | `false`   | Square icon button                        |
| `ariaLabel`                                    | `string`                                                     | —         | Accessible name, required with `iconOnly` |
| `type`                                         | `default \| primary \| success \| warning \| danger \| info` | `default` | Legacy Element Plus type                  |
| `plain` / `round` / `circle` / `text` / `link` | `boolean`                                                    | `false`   | Legacy flags, mapped onto `variant`       |
| `loading`                                      | `boolean`                                                    | `false`   | Loading state                             |
| `disabled`                                     | `boolean`                                                    | `false`   | Disabled                                  |
| `htmlType`                                     | `button \| submit \| reset`                                  | `button`  | Native type                               |
| `permission`                                   | `string \| string[]`                                         | —         | Permission code                           |

## Events

| Event   | Payload      | Description |
| ------- | ------------ | ----------- |
| `click` | `MouseEvent` | Clicked     |

## Slots

| Slot      | Description  |
| --------- | ------------ |
| `default` | Label        |
| `icon`    | Leading icon |
