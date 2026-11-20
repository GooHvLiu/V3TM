<script setup>
import AppTooltip from "@/components/common/base/app-tooltip/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";
</script>

# Tooltip AppTooltip

A supplementary note that appears on hover. Light surface everywhere — a dark bubble reads as a patch pasted onto a light theme, and the eye spots it as a different visual language immediately.

## Basic

<p class="demo-block">
  <AppTooltip content="The full explanation goes here">
    <AppButton variant="outline">Hover to see</AppButton>
  </AppTooltip>
</p>

```vue
<AppTooltip content="The full explanation goes here">
  <AppButton variant="outline">Hover to see</AppButton>
</AppTooltip>
```

`showAfter` defaults to 200 milliseconds: opening instantly makes tooltips flicker as the pointer sweeps across a toolbar, and a long delay feels broken.

## Width cap for long text

`maxWidth` defaults to 320px. Overlong copy wraps instead of turning into a bar stretching across the layout.

<p class="demo-block">
  <AppTooltip
    content="This note is deliberately long, to confirm the bubble wraps once it reaches its maximum width instead of continuing to grow to the right."
  >
    <AppButton variant="ghost">Long copy</AppButton>
  </AppTooltip>
</p>

```vue
<AppTooltip :max-width="320" content="……">
  <AppButton>Long copy</AppButton>
</AppTooltip>
```

When `popperStyle` is passed it takes precedence and `maxWidth` no longer applies — pass styles directly when the exact result matters.

## Rich content

For several lines, icons or line breaks, use the `content` slot with `rawContent` on:

```vue
<AppTooltip raw-content>
  <template #content>
    <strong>Service address</strong><br />
    api.example.com:3000
  </template>
  <AppButton variant="link">View</AppButton>
</AppTooltip>
```

## Props

| Prop          | Type                                                              | Default | Description                                                 |
| ------------- | ----------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| `content`     | `string`                                                          | `""`    | Tooltip text                                                |
| `placement`   | `top \| bottom \| left \| right`, plus `-start` / `-end` variants | `top`   | Placement                                                   |
| `effect`      | `light \| dark`                                                   | `light` | Surface; dark is only for warning about destructive actions |
| `showAfter`   | `number`                                                          | `200`   | Delay before showing, in milliseconds                       |
| `hideAfter`   | `number`                                                          | `0`     | Delay before hiding, in milliseconds                        |
| `maxWidth`    | `number`                                                          | `320`   | Maximum width in pixels                                     |
| `offset`      | `number`                                                          | `8`     | Distance from the trigger                                   |
| `disabled`    | `boolean`                                                         | `false` | Turn the tooltip off                                        |
| `rawContent`  | `boolean`                                                         | `false` | Render the content as HTML                                  |
| `popperStyle` | `Record<string, string>`                                          | —       | Override the popper style directly                          |

## Slots

| Slot      | Description       |
| --------- | ----------------- |
| `default` | Trigger element   |
| `content` | Rich tooltip body |
