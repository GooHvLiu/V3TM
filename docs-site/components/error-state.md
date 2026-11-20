<script setup>
import AppErrorState from "@/components/common/base/app-error-state/index.vue";
</script>

# 错误态 AppErrorState

请求失败、页面不存在、权限不足时的整块占位。与空态的区别是它必须给出下一步：重试或返回。

## 基础

<div class="demo-grid">
  <AppErrorState />
</div>

```vue
<AppErrorState @retry="reload" />
```

默认标题与说明取自语言包 `common.loadFailed / common.loadFailedHint`，右侧给一个重试按钮。`role="alert"` 让读屏软件立即播报。

## 带错误码与返回

<div class="demo-grid">
  <AppErrorState
    title="页面不存在"
    description="链接可能已失效，或者你没有访问权限。"
    code="404"
    show-home
  />
</div>

```vue
<AppErrorState title="页面不存在" description="链接可能已失效，或者你没有访问权限。" code="404" show-home />
```

## 紧凑形态

放在卡片或抽屉里时用 `compact`：图标与字号压小、上下留白收紧，不占满整块。

<div class="demo-grid">
  <AppErrorState compact :show-retry="false" description="这一段数据加载失败。" />
</div>

## Props

| 属性                     | 类型               | 默认值  | 说明                         |
| ------------------------ | ------------------ | ------- | ---------------------------- |
| `title`                  | `string`           | —       | 标题，不传取语言包           |
| `description`            | `string`           | —       | 说明，不传取语言包           |
| `code`                   | `string \| number` | —       | 错误码，显示为「错误码 404」 |
| `compact`                | `boolean`          | `false` | 紧凑形态                     |
| `showRetry`              | `boolean`          | `true`  | 显示重试按钮                 |
| `showHome`               | `boolean`          | `false` | 显示返回按钮                 |
| `retryLoading`           | `boolean`          | `false` | 重试按钮 loading             |
| `retryText` / `homeText` | `string`           | —       | 按钮文案                     |

## Events

| 事件    | 说明     |
| ------- | -------- |
| `retry` | 点击重试 |
| `home`  | 点击返回 |

## Slots

`actions` 插槽整体替换默认按钮组。
