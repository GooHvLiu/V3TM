<script setup>
import { ref } from "vue";
import AppDialog from "@/components/common/base/app-dialog/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";

const basic = ref(false);
const noFooter = ref(false);
</script>

# Dialog AppDialog

For a decision the user has to make inside the current context. The mask blocks the page behind it, so save it for things that genuinely need a pause; work that can be done in place belongs in a drawer or inline editing.

## Basic

<div class="demo-block">
  <AppButton tone="primary" @click="basic = true">Open dialog</AppButton>
</div>

<AppDialog v-model="basic" title="Confirm publish" @confirm="basic = false" @cancel="basic = false">
Once published, this configuration applies to every tenant. Continue?
</AppDialog>

```vue
<script setup>
import { ref } from "vue";
const visible = ref(false);
</script>

<AppDialog v-model="visible" title="Confirm publish" @confirm="visible = false">
  Once published, this configuration applies to every tenant. Continue?
</AppDialog>
```

`v-model` is the only entry point for state: the child holds no open flag of its own and reports closing through `update:modelValue`.

## Content only

`showFooter` defaults to `true` and renders a confirm / cancel pair. Turn it off for display-only content or for a view that manages its own actions:

<p class="demo-block">
  <AppButton variant="outline" @click="noFooter = true">No footer</AppButton>
</p>

<AppDialog v-model="noFooter" title="Note" :show-footer="false" @close="noFooter = false">
This content closes itself; the component stays out of it.
</AppDialog>

## Button labels

Without `confirmText` and `cancelText` the labels come from `common.confirm` and `common.cancel`. Pass concrete verbs such as "Submit" or "Discard" when the action is specific, and never hard-code text in a component that has no language pack.

```vue
<AppDialog v-model="visible" confirm-text="Submit" cancel-text="Discard" />
```

## Props

| Prop                 | Type               | Default | Description                     |
| -------------------- | ------------------ | ------- | ------------------------------- |
| `title`              | `string`           | `""`    | Title                           |
| `width`              | `string \| number` | `520px` | Width                           |
| `top`                | `string`           | `15vh`  | Distance from the top           |
| `fullscreen`         | `boolean`          | `false` | Full screen                     |
| `draggable`          | `boolean`          | `false` | Draggable                       |
| `closeOnClickModal`  | `boolean`          | `true`  | Close on mask click             |
| `closeOnPressEscape` | `boolean`          | `true`  | Close on Esc                    |
| `showClose`          | `boolean`          | `true`  | Show the close button           |
| `destroyOnClose`     | `boolean`          | `true`  | Destroy content on close        |
| `showFooter`         | `boolean`          | `true`  | Show the default footer buttons |
| `confirmLoading`     | `boolean`          | `false` | Loading on the confirm button   |
| `confirmText`        | `string`           | —       | Confirm label                   |
| `cancelText`         | `string`           | —       | Cancel label                    |

## Events

| Event                       | Description                   |
| --------------------------- | ----------------------------- |
| `confirm`                   | Confirm clicked               |
| `cancel`                    | Cancel clicked                |
| `open` / `close` / `closed` | Opened, closing, fully closed |

## Slots

| Slot      | Description                 |
| --------- | --------------------------- |
| `default` | Body                        |
| `footer`  | Replaces the default footer |
