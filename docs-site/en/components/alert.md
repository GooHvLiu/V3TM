<script setup>
import AppAlert from "@/components/common/base/app-alert/index.vue";
</script>

# Alert AppAlert

A message that stays put inside the page, unlike a global popup: it interrupts nothing and asks the user for nothing. Use it above a form, over a list, or in the notes area of a settings page.

## Four tones

<p class="demo-block demo-block--column">
  <AppAlert tone="info" title="Heads up" description="Changes here take effect as soon as you save." />
  <AppAlert tone="success" title="Connected" description="The last sync finished two minutes ago." />
  <AppAlert tone="warning" title="Configuration incomplete" description="Three settings still need a value." />
  <AppAlert tone="danger" title="Service unavailable" description="The upstream endpoint returned 503. Try again shortly." />
</p>

```vue
<AppAlert tone="info" title="Heads up" description="Changes here take effect as soon as you save." />
<AppAlert
  tone="danger"
  title="Service unavailable"
  description="The upstream endpoint returned 503. Try again shortly."
/>
```

The border follows the tone while the fill stays on Element Plus's light step, so neither the light nor the dark theme produces a saturated block that glares.

## Dismissible

<p class="demo-block demo-block--column">
  <AppAlert tone="warning" title="Disk space running low" description="8% left. Clearing logs first is the quickest fix." closable />
</p>

```vue
<AppAlert
  tone="warning"
  title="Disk space running low"
  description="8% left. Clearing logs first is the quickest fix."
  closable
  @close="onClose"
/>
```

## Two type sizes

`title` uses the body size; `description` drops one step with looser leading. The gap keeps a long explanation from competing with the headline — at the same size the two read as one undifferentiated paragraph.

## Props

| Prop          | Type                                                         | Default | Description         |
| ------------- | ------------------------------------------------------------ | ------- | ------------------- |
| `tone`        | `info \| success \| warning \| danger \| primary \| neutral` | `info`  | Semantic tone       |
| `title`       | `string`                                                     | `""`    | Title               |
| `description` | `string`                                                     | —       | Supporting text     |
| `showIcon`    | `boolean`                                                    | `true`  | Show the icon       |
| `closable`    | `boolean`                                                    | `false` | Show a close button |
| `center`      | `boolean`                                                    | `false` | Center the content  |

## Events

| Event   | Payload | Description   |
| ------- | ------- | ------------- |
| `close` | —       | Close clicked |

`danger` maps to Element Plus's `error`; `primary` and `neutral` both land on `info`, since an alert has no primary step.
