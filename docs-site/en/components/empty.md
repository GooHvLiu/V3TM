<script setup>
import AppEmpty from "@/components/common/base/app-empty/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";
</script>

# Empty AppEmpty

The placeholder for a list without rows, a search without results, or a filter set too narrow. Default copy comes from `common.empty` in the language packs; pass `description` when the wording needs to be specific.

## Basic

<div class="demo-grid">
  <AppEmpty />
</div>

```vue
<AppEmpty />
```

## With a next step

<div class="demo-grid">
  <AppEmpty description="No projects yet">
    <template #action>
      <AppButton tone="primary">New project</AppButton>
    </template>
  </AppEmpty>
</div>

```vue
<AppEmpty description="No projects yet">
  <template #action>
    <AppButton tone="primary">New project</AppButton>
  </template>
</AppEmpty>
```

The `action` slot sits below the illustration and above the copy, so the action and the explanation stay on separate visual levels instead of crowding one line.

## Illustration only

Pass an empty string to `description` and the copy area disappears entirely. Use it where a compact card leaves little room.

```vue
<AppEmpty description="" :image-size="72" />
```

## Props

| Prop          | Type     | Default | Description                                                        |
| ------------- | -------- | ------- | ------------------------------------------------------------------ |
| `description` | `string` | —       | Copy; `""` hides it, omitted reads the language pack               |
| `image`       | `string` | —       | Custom illustration                                                |
| `imageSize`   | `number` | —       | Illustration side length; omitted follows an Element Plus variable |

## Slots

| Slot      | Description                                       |
| --------- | ------------------------------------------------- |
| `action`  | Action area under the illustration                |
| `default` | Any custom content; shown when `action` is absent |
