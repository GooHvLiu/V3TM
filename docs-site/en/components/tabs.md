<script setup>
import { ref } from "vue";
import AppTabs from "@/components/common/base/app-tabs/index.vue";

const active = ref("all");
const items = [
  { label: "All", value: "all", badge: 128 },
  { label: "Running", value: "running", badge: 6 },
  { label: "Done", value: "done" },
  { label: "Archived", value: "archived", disabled: true }
];
</script>

# Tabs AppTabs

Switches between peers within one area. Data driven: `items` describes the tabs, `v-model` remembers the selection, and content renders per item through the `content` slot.

## Basic

<p class="demo-block demo-block--column">
  <AppTabs v-model="active" :items="items">
    <template #content="{ item }">
      <p>Content for {{ item.label }}</p>
    </template>
  </AppTabs>
</p>

```vue
<script setup>
import { ref } from "vue";
const active = ref("all");
const items = [
  { label: "All", value: "all", badge: 128 },
  { label: "Running", value: "running", badge: 6 },
  { label: "Done", value: "done" },
  { label: "Archived", value: "archived", disabled: true }
];
</script>

<AppTabs v-model="active" :items="items">
  <template #content="{ item }">
    <p>Content for {{ item.label }}</p>
  </template>
</AppTabs>
```

Without `v-model` the first item is selected and the component only displays.

## Counts and icons on the label

`badge` is the small pill to the right of the title, holding a count; `icon` takes an icon component. Both render under the label, and `#label` can take over the whole thing.

The pill uses the primary tone by default; counts that need to warn, such as unread alerts, pass `tone: "danger"`. The pill sits in the text flow rather than being absolutely positioned, so a compressed or wrapped tab strip never lets it cover the title.

```vue
<AppTabs :items="[{ label: 'Alerts', value: 'alert', icon: WarningFilled, badge: 3 }]" />
<AppTabs :items="[{ label: 'My notifications', value: 'mine', badge: '99+', tone: 'danger' }]" />
```

## Card shapes

`type` goes straight to Element Plus: `card` gives bordered card tabs, `border-card` wraps the whole strip in a border. Filter bars in back-office screens usually take `card`.

## Props

| Prop       | Type                        | Default  | Description        |
| ---------- | --------------------------- | -------- | ------------------ |
| `items`    | `TabItem[]`                 | required | Tab data           |
| `type`     | `"" \| card \| border-card` | `""`     | Appearance         |
| `stretch`  | `boolean`                   | `false`  | Split width evenly |
| `closable` | `boolean`                   | `false`  | Closable           |

`TabItem` fields: `label`, `value`, `icon?`, `badge?`, `tone?`, `disabled?`.

## Events

| Event        | Payload           | Description       |
| ------------ | ----------------- | ----------------- |
| `tab-click`  | `TabsPaneContext` | A tab was clicked |
| `tab-change` | `value`           | Selection changed |
| `tab-remove` | `value`           | A tab was removed |

## Slots

| Slot      | Description                       |
| --------- | --------------------------------- |
| `label`   | Custom label, receives `{ item }` |
| `content` | Content area, receives `{ item }` |
