<template>
  <el-drawer
    v-model="visible"
    :title="title"
    :size="size"
    :direction="direction"
    :with-header="withHeader"
    :close-on-click-modal="closeOnClickModal"
    :destroy-on-close="destroyOnClose"
    :append-to-body="appendToBody"
    :before-close="beforeClose"
    @open="emit('open')"
    @close="emit('close')"
    @closed="emit('closed')"
  >
    <slot />
    <template v-if="$slots.footer || showFooter" #footer>
      <slot v-if="$slots.footer" name="footer" />
      <div v-else class="app-drawer__footer">
        <app-button @click="handleCancel">{{ cancelLabel }}</app-button>
        <app-button tone="primary" :loading="confirmLoading" @click="emit('confirm')">
          {{ confirmLabel }}
        </app-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
defineOptions({ name: "AppDrawer" });

import { computed } from "vue";
import AppButton from "../app-button/index.vue";
import { useLabel } from "../shared/label";

const visible = defineModel<boolean>({ default: false });

const props = withDefaults(
  defineProps<{
    title?: string;
    size?: string | number;
    direction?: "rtl" | "ltr" | "ttb" | "btt";
    withHeader?: boolean;
    closeOnClickModal?: boolean;
    destroyOnClose?: boolean;
    appendToBody?: boolean;
    /** 抽屉默认只有内容区，需要底部按钮时给 #footer 或打开它 */
    showFooter?: boolean;
    confirmLoading?: boolean;
    /** 关闭前的拦截，用于有未保存内容时二次确认 */
    beforeClose?: (done: () => void) => void;
    /** 不传时取语言包里的通用按钮文案 */
    confirmText?: string;
    cancelText?: string;
  }>(),
  {
    title: "",
    size: "420px",
    direction: "rtl",
    withHeader: true,
    closeOnClickModal: true,
    // 抽屉内容通常带滚动位置与筛选状态，关闭默认保留，需要重置的地方显式打开
    destroyOnClose: false,
    appendToBody: true,
    showFooter: false,
    confirmLoading: false,
    beforeClose: undefined,
    confirmText: undefined,
    cancelText: undefined
  }
);

const emit = defineEmits<{
  confirm: [];
  cancel: [];
  open: [];
  close: [];
  closed: [];
}>();

const label = useLabel();

const confirmLabel = computed<string>(() => props.confirmText || label("confirm"));
const cancelLabel = computed<string>(() => props.cancelText || label("cancel"));

const handleCancel = (): void => {
  emit("cancel");
  visible.value = false;
};

const open = (): void => {
  visible.value = true;
};

const close = (): void => {
  visible.value = false;
};

defineExpose({ open, close });
</script>

<style scoped lang="less">
.app-drawer__footer {
  display: flex;
  justify-content: flex-end;
  gap: @space-2-5;
}
</style>
