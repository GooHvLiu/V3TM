<script setup>
import { ref } from "vue";
import AppDrawer from "@/components/common/base/app-drawer/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";
import AppAlert from "@/components/common/base/app-alert/index.vue";

const detail = ref(false);
const withFooter = ref(false);
</script>

# Drawer AppDrawer

A detail panel that slides in from the side. Clicking a row to inspect a record, editing one entry, reading a stretch of logs — all suit a drawer: it keeps the list context in view and handles long content better than a dialog.

## Basic

<p class="demo-block">
  <AppButton tone="primary" @click="detail = true">View details</AppButton>
</p>

<AppDrawer v-model="detail" title="Task detail" size="420px">
  <AppAlert tone="info" title="Read only" description="This account has no edit permission." />
  <p>Body content. Drawers carry no footer by default; turn it on when needed.</p>
</AppDrawer>

```vue
<AppDrawer v-model="visible" title="Task detail" size="420px">
  Body content
</AppDrawer>
```

## With a footer

`showFooter` brings in a default button pair, or take over with the `footer` slot.

<p class="demo-block">
  <AppButton variant="outline" @click="withFooter = true">With footer</AppButton>
</p>

<AppDrawer v-model="withFooter" title="Edit configuration" show-footer @confirm="withFooter = false" @cancel="withFooter = false">
Form content
</AppDrawer>

```vue
<AppDrawer v-model="visible" title="Edit configuration" show-footer @confirm="save" @cancel="visible = false">
  Form content
</AppDrawer>
```

## State survives closing

`destroyOnClose` defaults to `false`. Drawer content usually carries a scroll position, filter conditions and selected rows; resetting all of it on close and reopen makes users think the data was lost. Turn it on explicitly where a reset is wanted.

```vue
<AppDrawer v-model="visible" destroy-on-close>
  <ProForm … />
</AppDrawer>
```

## Intercepting close

With unsaved content, guard the exit through `beforeClose`:

```ts
const beforeClose = (done: () => void): void => {
  if (!isDirty.value) return done();
  ElMessageBox.confirm("You have unsaved changes. Close anyway?")
    .then(done)
    .catch(() => {});
};
```

## Props

| Prop                         | Type                       | Default | Description                               |
| ---------------------------- | -------------------------- | ------- | ----------------------------------------- |
| `title`                      | `string`                   | `""`    | Title                                     |
| `size`                       | `string \| number`         | `420px` | Width (side opening) or height (vertical) |
| `direction`                  | `rtl \| ltr \| ttb \| btt` | `rtl`   | Slide direction                           |
| `withHeader`                 | `boolean`                  | `true`  | Show the header                           |
| `closeOnClickModal`          | `boolean`                  | `true`  | Close on mask click                       |
| `destroyOnClose`             | `boolean`                  | `false` | Destroy content on close                  |
| `appendToBody`               | `boolean`                  | `true`  | Append to body                            |
| `showFooter`                 | `boolean`                  | `false` | Show the default footer buttons           |
| `confirmLoading`             | `boolean`                  | `false` | Loading on the confirm button             |
| `beforeClose`                | `(done) => void`           | —       | Intercept closing                         |
| `confirmText` / `cancelText` | `string`                   | —       | Button labels                             |

## Exposed methods

| Method    | Description |
| --------- | ----------- |
| `open()`  | Open        |
| `close()` | Close       |
