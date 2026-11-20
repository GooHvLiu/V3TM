<template>
  <div class="app-error-state" :class="{ 'is-compact': compact }" role="alert">
    <div class="app-error-state__icon">
      <el-icon><warning-filled /></el-icon>
    </div>
    <h3 v-if="titleLabel" class="app-error-state__title">{{ titleLabel }}</h3>
    <p v-if="descriptionLabel" class="app-error-state__description">{{ descriptionLabel }}</p>
    <p v-if="code !== undefined" class="app-error-state__code">{{ codeLabel }} {{ code }}</p>
    <div class="app-error-state__actions">
      <slot name="actions">
        <app-button v-if="showRetry" tone="primary" :loading="retryLoading" @click="emit('retry')">
          {{ retryLabel }}
        </app-button>
        <app-button v-if="showHome" @click="emit('home')">{{ homeLabel }}</app-button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "AppErrorState" });

import { computed } from "vue";
import { WarningFilled } from "@element-plus/icons-vue";
import AppButton from "../app-button/index.vue";
import { useLabel } from "../shared/label";

const props = withDefaults(
  defineProps<{
    /** 传空字符串可以隐藏标题 */
    title?: string;
    description?: string;
    code?: string | number;
    compact?: boolean;
    showRetry?: boolean;
    showHome?: boolean;
    retryLoading?: boolean;
    retryText?: string;
    homeText?: string;
  }>(),
  {
    title: undefined,
    description: undefined,
    code: undefined,
    compact: false,
    showRetry: true,
    showHome: false,
    retryLoading: false,
    retryText: undefined,
    homeText: undefined
  }
);

const emit = defineEmits<{ retry: []; home: [] }>();

const label = useLabel();

const titleLabel = computed<string>(() => props.title ?? label("loadFailed"));
const descriptionLabel = computed<string>(() => props.description ?? label("loadFailedHint"));
const codeLabel = computed<string>(() => label("errorCode"));
const retryLabel = computed<string>(() => props.retryText || label("retry"));
const homeLabel = computed<string>(() => props.homeText || label("backHome"));
</script>

<style scoped lang="less">
.app-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: @space-12 @space-6;
  text-align: center;

  &.is-compact {
    padding: @space-6 @space-4;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-bottom: @space-3;
    border-radius: 50%;
    background: @color-bg-page;
    color: @color-danger;
    font-size: 26px;
  }

  &__title {
    margin: 0;
    color: @color-text-primary;
    font-size: @font-size-lg;
    font-weight: @font-weight-semibold;
  }

  &__description {
    max-width: 460px;
    margin: @space-2 0 0;
    color: @color-text-secondary;
    font-size: @font-size-sm;
    line-height: 1.7;
  }

  &__code {
    margin: @space-1-5 0 0;
    color: @color-text-placeholder;
    font-size: @font-size-xs;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: @space-2-5;
    margin-top: @space-4;
  }
}
</style>
