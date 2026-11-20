<template>
  <button
    type="button"
    class="captcha-image"
    :class="{ 'is-disabled': disabled }"
    :disabled="disabled"
    :aria-label="t('auth.forgot.captchaRefresh')"
    @click="handleRefresh"
  >
    <img v-if="imageSource" class="image" :src="imageSource" alt="">
    <span v-else class="placeholder" aria-hidden="true">{{ t("auth.forgot.captchaLoadFail") }}</span>
  </button>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "CaptchaImage" });

import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { CaptchaInfo } from "@/types";

// 点击即换图，数据与请求由调用方持有
const props = defineProps<{
  captcha?: CaptchaInfo | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{ refresh: [] }>();

const { t } = useI18n();

// 后端可能回内联 svg 文本，也可能回 data:image 前缀，两种都收进 img
// 内联 svg 转成 data URI 后，图里的字符不再进无障碍树，操作说明由外层 aria-label 承担
const imageSource = computed<string>(() => {
  const img = (props.captcha?.img ?? "").trim();
  if (!img) return "";
  return img.startsWith("<svg") ? `data:image/svg+xml;utf8,${encodeURIComponent(img)}` : img;
});

const handleRefresh = (): void => {
  if (props.disabled) return;
  emit("refresh");
};
</script>

<style scoped lang="less">
.captcha-image {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-width: 100px;
  height: 34px;
  padding: 0 @space-2;
  appearance: none;
  font: inherit;
  color: inherit;
  /* 验证码固定浅底：图形不随主题反转，保证深色字符可读 */
  background: #fff;
  border: 1px solid @color-border;
  border-radius: @radius-base;
  cursor: pointer;
  user-select: none;

  .image {
    height: 32px;
    width: auto;
    display: block;
  }

  .placeholder {
    font-size: 0.75rem;
    color: @color-text-placeholder;
  }

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid @color-primary;
    outline-offset: 2px;
  }
}
</style>
