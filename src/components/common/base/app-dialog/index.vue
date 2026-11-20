<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :top="top"
    :fullscreen="fullscreen"
    :draggable="draggable"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :destroy-on-close="destroyOnClose"
    append-to-body
    @open="emit('open')"
    @close="emit('close')"
    @closed="emit('closed')"
  >
    <slot />
    <template #footer>
      <slot v-if="$slots.footer" name="footer" />
      <div v-else-if="showFooter" class="app-dialog__footer">
        <app-button @click="handleCancel">{{ cancelLabel }}</app-button>
        <app-button tone="primary" :loading="confirmLoading" @click="emit('confirm')">
          {{ confirmLabel }}
        </app-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: "AppDialog" });

import { computed } from "vue";
import AppButton from "../app-button/index.vue";
import { useLabel } from "../shared/label";

const visible = defineModel<boolean>({ default: false });

const props = withDefaults(
  defineProps<{
    title?: string;
    width?: string | number;
    top?: string;
    fullscreen?: boolean;
    draggable?: boolean;
    closeOnClickModal?: boolean;
    closeOnPressEscape?: boolean;
    showClose?: boolean;
    destroyOnClose?: boolean;
    showFooter?: boolean;
    confirmLoading?: boolean;
    /** 不传时取语言包里的通用按钮文案 */
    confirmText?: string;
    cancelText?: string;
  }>(),
  {
    title: "",
    width: "520px",
    top: "15vh",
    fullscreen: false,
    draggable: false,
    closeOnClickModal: true,
    closeOnPressEscape: true,
    showClose: true,
    destroyOnClose: true,
    showFooter: true,
    confirmLoading: false,
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

const opened = computed<boolean>(() => visible.value);

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

defineExpose({ open, close, opened });
</script>

<style scoped lang="less">
.app-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: @space-2-5;
}
</style>
