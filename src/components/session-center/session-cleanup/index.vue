<template>
  <app-dialog
    :model-value="visible"
    :title="t('sessionCenter.cleanupTitle')"
    width="420px"
    @update:model-value="handleVisible"
  >
    <p class="cleanup-tip">
      {{ t("sessionCenter.cleanupTip") }}
    </p>
    <div class="cleanup-field">
      <span>{{ t("sessionCenter.cleanupDays") }}</span>
      <el-input-number :model-value="days" :min="1" :max="365" :step="1" @update:model-value="handleDays" />
    </div>
    <template #footer>
      <app-button variant="outline" @click="handleVisible(false)">
        {{ t("common.cancel") }}
      </app-button>
      <app-button tone="primary" :loading="loading" @click="emit('confirm')">
        {{ t("sessionCenter.cleanup") }}
      </app-button>
    </template>
  </app-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: "SessionCleanupDialog" });

import { useI18n } from "vue-i18n";

defineProps<{
  visible: boolean;
  days: number;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "update:days", value: number): void;
  (e: "confirm"): void;
}>();

const { t } = useI18n();

const handleVisible = (value: boolean): void => {
  emit("update:visible", value);
};

const handleDays = (value: number | undefined): void => {
  emit("update:days", value ?? 1);
};
</script>

<style scoped lang="less">
.cleanup-tip {
  margin: 0 0 @space-3;
  font-size: 0.8rem;
  color: @color-text-regular;
}

.cleanup-field {
  display: flex;
  align-items: center;
  gap: @space-3;
  font-size: 0.85rem;
  color: @color-text-primary;
}
</style>
