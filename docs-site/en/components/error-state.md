<script setup>
import AppErrorState from "@/components/common/base/app-error-state/index.vue";
</script>

# Error state AppErrorState

The block that stands in for a failed request, a page that does not exist, or a missing permission. What separates it from the empty state is that it must offer a way out: retry, or go back.

## Basic

<div class="demo-grid">
  <AppErrorState />
</div>

```vue
<AppErrorState @retry="reload" />
```

The default title and description come from `common.loadFailed` and `common.loadFailedHint`, with a retry button on the right. `role="alert"` makes a screen reader announce it immediately.

## With an error code and a way back

<div class="demo-grid">
  <AppErrorState
    title="Page not found"
    description="The link may have expired, or you may not have access to it."
    code="404"
    show-home
  />
</div>

```vue
<AppErrorState
  title="Page not found"
  description="The link may have expired, or you may not have access to it."
  code="404"
  show-home
/>
```

## Compact form

Inside a card or drawer, use `compact`: smaller icon and type, tighter vertical padding, so it does not claim the whole area.

<div class="demo-grid">
  <AppErrorState compact :show-retry="false" description="This section failed to load." />
</div>

## Props

| Prop                     | Type               | Default | Description                                  |
| ------------------------ | ------------------ | ------- | -------------------------------------------- |
| `title`                  | `string`           | —       | Title; omitted reads the language pack       |
| `description`            | `string`           | —       | Description; omitted reads the language pack |
| `code`                   | `string \| number` | —       | Error code, rendered as "Error code 404"     |
| `compact`                | `boolean`          | `false` | Compact form                                 |
| `showRetry`              | `boolean`          | `true`  | Show the retry button                        |
| `showHome`               | `boolean`          | `false` | Show the back button                         |
| `retryLoading`           | `boolean`          | `false` | Loading on the retry button                  |
| `retryText` / `homeText` | `string`           | —       | Button labels                                |

## Events

| Event   | Description   |
| ------- | ------------- |
| `retry` | Retry clicked |
| `home`  | Back clicked  |

## Slots

The `actions` slot replaces the default button group wholesale.
