<template>
  <div class="result-panel" role="status">
    <svg class="mark" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="none" stroke-width="2" />
      <path v-if="variant === 'success'" d="M14 24.5l7 7 13-14" fill="none" stroke-width="2.4" />
      <path v-else d="M24 15v12M24 32.5v.5" fill="none" stroke-width="2.4" />
    </svg>
    <h3 class="title">{{ t(`auth.forgot.${variant === "success" ? "successTitle" : "blockedTitle"}`) }}</h3>
    <p class="desc">{{ t(`auth.forgot.${variant === "success" ? "successDesc" : "blockedDesc"}`) }}</p>
    <app-button class="action" tone="primary" @click="emit('action')">
      {{ t(`auth.forgot.${variant === "success" ? "backToLogin" : "blockedAction"}`) }}
    </app-button>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "ForgotResultPanel" });

import { useI18n } from "vue-i18n";

// 成功态与锁定态共用一张面板，只换文案与按钮语义
defineProps<{ variant: "success" | "blocked" }>();

const emit = defineEmits<{ action: [] }>();

const { t } = useI18n();
</script>

<style scoped lang="less">
.result-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: @space-2-5;
  padding: @space-2-5 0 @space-1;

  .mark {
    width: 48px;
    height: 48px;
    stroke: @color-primary;
    margin-bottom: @space-1;
  }

  .title {
    font-size: 1.05rem;
    font-weight: 900;
    color: @color-text-primary;
  }

  .desc {
    font-size: 0.85rem;
    line-height: 1.7;
    color: @color-text-secondary;
    text-align: center;
  }

  .action {
    width: 100%;
    height: 44px;
    margin-top: @space-3;
  }
}
</style>
