<script setup>
import AppSeparator from "@/components/common/base/app-separator/index.vue";
</script>

# Separator AppSeparator

A rule drawn between two blocks of content. Horizontal divides paragraphs; vertical splits two pieces of text sharing a line.

## Horizontal

<p class="demo-block demo-block--column">
  <span>First group</span>
  <AppSeparator spacing="sm" />
  <span>Second group</span>
</p>

```vue
<AppSeparator spacing="sm" />
```

## With a label

<p class="demo-block demo-block--column">
  <span>Previous section</span>
  <AppSeparator>Group</AppSeparator>
  <span>Next section</span>
</p>

```vue
<AppSeparator>Group</AppSeparator>
```

`contentPosition` places the label: `left`, `center` or `right`.

## Vertical and line styles

<p class="demo-block">
  <span>Elapsed</span>
  <AppSeparator direction="vertical" />
  <span>2 min 14 s</span>
  <AppSeparator direction="vertical" variant="dashed" />
  <span>Passed</span>
</p>

```vue
<AppSeparator direction="vertical" />
<AppSeparator direction="vertical" variant="dashed" />
```

## Three spacing steps

`spacing: none` leaves Element Plus's default 24px margin untouched, so an old divider migrated onto this component keeps the layout it had. Pass `sm`, `md` or `lg` when the gap needs to tighten or open up.

## Props

| Prop              | Type                        | Default      | Description                          |
| ----------------- | --------------------------- | ------------ | ------------------------------------ |
| `orientation`     | `horizontal \| vertical`    | —            | Direction, wins over `direction`     |
| `variant`         | `solid \| dashed \| dotted` | —            | Line style, wins over `borderStyle`  |
| `spacing`         | `none \| sm \| md \| lg`    | `none`       | Outer margin                         |
| `contentPosition` | `left \| center \| right`   | `center`     | Label position                       |
| `direction`       | `horizontal \| vertical`    | `horizontal` | Legacy field, kept for compatibility |
| `borderStyle`     | `solid \| dashed \| dotted` | `solid`      | Legacy field, kept for compatibility |
