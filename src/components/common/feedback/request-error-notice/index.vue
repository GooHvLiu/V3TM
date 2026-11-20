<template>
  <div class="request-error-notice">
    <span class="request-error-notice__text">{{ error.translated || error.msg }}</span>
    <button type="button" class="request-error-notice__copy" @click="handleCopy">
      {{ copied ? t("common.diagnostic.copied") : t("common.diagnostic.copy") }}
    </button>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "RequestErrorNotice" });

import { useI18n } from "vue-i18n";
const { t } = useI18n();

// 引入响应式状态
import { ref } from "vue";

// 错误类型
import type { PublicRequestError } from "@/types";

// 引入时间格式化
import dayjs from "dayjs";

// 全局错误提示携带的最小诊断信息，供用户复制后交给运维定位服务端日志
const props = defineProps<{ error: PublicRequestError }>();
const copied = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | undefined;

/** 降级写入：非安全上下文或旧浏览器没有 clipboard API */
const writeText = async (text: string): Promise<void> => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

const handleCopy = async (): Promise<void> => {
  const payload = {
    requestId: props.error.requestId ?? "-",
    code: props.error.code ?? null,
    msg: props.error.msg ?? null,
    httpStatus: props.error.httpStatus ?? null,
    params: props.error.params ?? null,
    time: dayjs().format("YYYY-MM-DD HH:mm:ss")
  };
  try {
    await writeText(JSON.stringify(payload, null, 2));
    copied.value = true;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => (copied.value = false), 2000);
  } catch {
    copied.value = false;
  }
};
</script>

<style scoped lang="less">
.request-error-notice {
  display: flex;
  align-items: center;
  gap: @space-2;
  max-width: 420px;
  line-height: @line-height-base;

  &__text {
    flex: 1;
    min-width: 0;
  }

  &__copy {
    flex-shrink: 0;
    padding: 0 @space-0-5;
    border: none;
    background: transparent;
    color: @color-primary;
    font-size: @font-size-xs;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
