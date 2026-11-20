<script setup>
import { ref } from "vue";
import AppDrawer from "@/components/common/base/app-drawer/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";
import AppAlert from "@/components/common/base/app-alert/index.vue";

const detail = ref(false);
const withFooter = ref(false);
</script>

# 抽屉 AppDrawer

从侧边滑出的详情面板。行点击后看详情、编辑一条记录、查看一段日志，都适合抽屉：它保留了主列表的上下文，比对话框更适合承载长内容。

## 基础

<p class="demo-block">
  <AppButton tone="primary" @click="detail = true">查看详情</AppButton>
</p>

<AppDrawer v-model="detail" title="任务详情" size="420px">
  <AppAlert tone="info" title="只读模式" description="当前账号没有编辑权限。" />
  <p>正文内容。抽屉默认不带底部按钮，需要时再打开。</p>
</AppDrawer>

```vue
<AppDrawer v-model="visible" title="任务详情" size="420px">
  正文内容
</AppDrawer>
```

## 带底部按钮

`showFooter` 打开后给一对默认按钮；也可以直接用 `footer` 插槽接管。

<p class="demo-block">
  <AppButton variant="outline" @click="withFooter = true">带底部按钮</AppButton>
</p>

<AppDrawer v-model="withFooter" title="编辑配置" show-footer @confirm="withFooter = false" @cancel="withFooter = false">
表单内容
</AppDrawer>

```vue
<AppDrawer v-model="visible" title="编辑配置" show-footer @confirm="save" @cancel="visible = false">
  表单内容
</AppDrawer>
```

## 关闭后保留状态

`destroyOnClose` 默认是 `false`。抽屉内容通常带滚动位置、筛选条件、已选行，关掉再打开如果全部重置，用户会以为数据丢了。需要重置的地方显式打开它。

```vue
<AppDrawer v-model="visible" destroy-on-close>
  <ProForm … />
</AppDrawer>
```

## 关闭前拦截

有未保存内容时，用 `beforeClose` 拦一道：

```ts
const beforeClose = (done: () => void): void => {
  if (!isDirty.value) return done();
  ElMessageBox.confirm("有未保存的改动，确认关闭？")
    .then(done)
    .catch(() => {});
};
```

## Props

| 属性                         | 类型                       | 默认值  | 说明                           |
| ---------------------------- | -------------------------- | ------- | ------------------------------ |
| `title`                      | `string`                   | `""`    | 标题                           |
| `size`                       | `string \| number`         | `420px` | 宽（左右方向）或高（上下方向） |
| `direction`                  | `rtl \| ltr \| ttb \| btt` | `rtl`   | 滑出方向                       |
| `withHeader`                 | `boolean`                  | `true`  | 显示页眉                       |
| `closeOnClickModal`          | `boolean`                  | `true`  | 点遮罩关闭                     |
| `destroyOnClose`             | `boolean`                  | `false` | 关闭后销毁内容                 |
| `appendToBody`               | `boolean`                  | `true`  | 挂到 body                      |
| `showFooter`                 | `boolean`                  | `false` | 显示默认底部按钮               |
| `confirmLoading`             | `boolean`                  | `false` | 确认按钮 loading               |
| `beforeClose`                | `(done) => void`           | —       | 关闭前拦截                     |
| `confirmText` / `cancelText` | `string`                   | —       | 按钮文案                       |

## 暴露方法

| 方法      | 说明 |
| --------- | ---- |
| `open()`  | 打开 |
| `close()` | 关闭 |
