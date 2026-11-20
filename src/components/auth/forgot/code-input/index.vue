<template>
  <div class="code-input" role="group" :aria-label="t('auth.forgot.codeLabel')">
    <input
      v-for="(digit, index) in slots"
      :key="index"
      :ref="(el) => setRef(el, index)"
      class="cell"
      type="text"
      inputmode="numeric"
      maxlength="1"
      :autocomplete="index === 0 ? 'one-time-code' : 'off'"
      :disabled="disabled"
      :value="digit"
      :aria-label="`${t('auth.forgot.codeLabel')} ${index + 1}`"
      @input="onInput(index, $event)"
      @keydown="onKeydown(index, $event)"
      @paste="onPaste"
      @focus="onFocus($event)"
    >
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "CodeInput" });

import { ref, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { FORGOT_CODE_LENGTH } from "@/constants";

// 六个格子对外只表现为一个字符串，父层按字符串受控
const props = withDefaults(
  defineProps<{
    modelValue: string;
    disabled?: boolean;
    length?: number;
  }>(),
  {
    disabled: false,
    length: FORGOT_CODE_LENGTH
  }
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const { t } = useI18n();

const inputs = ref<HTMLInputElement[]>([]);

const slots = ref<string[]>(Array.from({ length: props.length }, (_, i) => props.modelValue?.[i] ?? ""));

const setRef = (el: unknown, index: number): void => {
  if (el) inputs.value[index] = el as HTMLInputElement;
};

// 外部清空或整段写入时同步格子
watch(
  () => props.modelValue,
  (value) => {
    const digits = (value ?? "").replace(/\D/g, "").slice(0, props.length);
    const next = Array.from({ length: props.length }, (_, i) => digits[i] ?? "");
    if (next.join("") !== slots.value.join("")) slots.value = next;
  }
);

const sync = (): void => emit("update:modelValue", slots.value.join(""));

const focusAt = (index: number): void => {
  const target = Math.max(0, Math.min(index, props.length - 1));
  nextTick(() => {
    inputs.value[target]?.focus();
    inputs.value[target]?.select();
  });
};

const onFocus = (event: Event): void => {
  (event.target as HTMLInputElement | null)?.select();
};

// 输入：兼容输入法整段上屏，按字符依次铺到后续格子
const onInput = (index: number, event: Event): void => {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, "");
  if (!raw) {
    slots.value[index] = "";
    sync();
    return;
  }
  raw.split("").forEach((char, offset) => {
    const at = index + offset;
    if (at < props.length) slots.value[at] = char;
  });
  sync();
  focusAt(index + raw.length);
};

// 退格：本格为空时清前一格并回退
const onKeydown = (index: number, event: KeyboardEvent): void => {
  if (event.key === "Backspace") {
    event.preventDefault();
    if (slots.value[index]) {
      slots.value[index] = "";
      sync();
      return;
    }
    if (index > 0) {
      slots.value[index - 1] = "";
      sync();
      focusAt(index - 1);
    }
    return;
  }
  if (event.key === "ArrowLeft" && index > 0) {
    event.preventDefault();
    focusAt(index - 1);
  }
  if (event.key === "ArrowRight" && index < props.length - 1) {
    event.preventDefault();
    focusAt(index + 1);
  }
};

// 粘贴：整段数字一次铺满，非数字直接丢掉
const onPaste = (event: ClipboardEvent): void => {
  const digits = (event.clipboardData?.getData("text") ?? "").replace(/\D/g, "").slice(0, props.length);
  if (!digits) return;
  event.preventDefault();
  emit("update:modelValue", digits);
  focusAt(digits.length);
};

/** 校验失败时把光标送回第一格 */
defineExpose({ focusFirst: () => focusAt(0) });
</script>

<style scoped lang="less">
.code-input {
  display: flex;
  gap: @space-2;
  width: 100%;

  .cell {
    flex: 1 1 0;
    min-width: 0;
    height: 44px;
    padding: 0;
    text-align: center;
    font-family: inherit;
    /* 移动端输入框字号低于 1rem 会触发 iOS 聚焦缩放 */
    font-size: 1rem;
    color: @color-text-primary;
    background: @color-bg-page;
    border: 1px solid @color-border;
    border-radius: @radius-base;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: @color-primary;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
}
</style>
