<script setup>
import AppTag from "@/components/common/base/app-tag/index.vue";
</script>

# Tag AppTag

A line of text on a fill, naming a state, a category or a count. Three visual levels carry three degrees of emphasis: soft is the lightest, outline next, solid the heaviest.

## Three levels

<p class="demo-block">
  <AppTag>Default</AppTag>
  <AppTag variant="outline">Outline</AppTag>
  <AppTag variant="solid">Solid</AppTag>
</p>

```vue
<AppTag>Default</AppTag>
<AppTag variant="outline">Outline</AppTag>
<AppTag variant="solid">Solid</AppTag>
```

## Tones

<p class="demo-block">
  <AppTag tone="primary">Running</AppTag>
  <AppTag tone="success">Done</AppTag>
  <AppTag tone="warning">Pending</AppTag>
  <AppTag tone="danger">Rejected</AppTag>
  <AppTag tone="info">Archived</AppTag>
  <AppTag tone="neutral">Draft</AppTag>
</p>

```vue
<AppTag tone="success">Done</AppTag>
<AppTag tone="danger">Rejected</AppTag>
<AppTag tone="neutral">Draft</AppTag>
```

`neutral` has no dedicated grey step here; it lands on Element Plus's `info` internally. To stay aligned with the status column in a table, use `tone` throughout and do not mix in `type`.

## Status dot

The dot follows the text colour rather than taking one of its own, so it works on all three levels.

<p class="demo-block">
  <AppTag dot tone="success">Online</AppTag>
  <AppTag dot tone="warning">Warning</AppTag>
  <AppTag dot tone="danger">Offline</AppTag>
</p>

```vue
<AppTag dot tone="success">Online</AppTag>
```

## Long text

A tag inside a flex container is easily stretched by its content. The ellipsis has to land on `.el-tag__content`, with `min-width: 0` on the wrapper:

```vue
<div style="display: flex; min-width: 0">
  <AppTag>a label long enough that it has to be truncated somewhere</AppTag>
</div>
```

## Props

| Prop                 | Type                                                         | Default   | Description                                        |
| -------------------- | ------------------------------------------------------------ | --------- | -------------------------------------------------- |
| `tone`               | `primary \| success \| warning \| danger \| info \| neutral` | —         | Semantic tone, preferred for new code              |
| `variant`            | `soft \| outline \| solid`                                   | `soft`    | Visual level                                       |
| `size`               | `sm \| default \| lg`                                        | `default` | Size                                               |
| `dot`                | `boolean`                                                    | `false`   | Status dot before the text                         |
| `type`               | `primary \| success \| info \| warning \| danger`            | `primary` | Legacy Element Plus type, kept for compatibility   |
| `effect`             | `light \| dark \| plain`                                     | `light`   | Legacy Element Plus weight, kept for compatibility |
| `round`              | `boolean`                                                    | `false`   | Fully rounded                                      |
| `closable`           | `boolean`                                                    | `false`   | Show a close button                                |
| `disableTransitions` | `boolean`                                                    | `false`   | Disable transitions                                |

## Events

| Event   | Payload      | Description          |
| ------- | ------------ | -------------------- |
| `close` | —            | Close button clicked |
| `click` | `MouseEvent` | Tag clicked          |
