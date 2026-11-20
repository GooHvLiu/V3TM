<template>
  <div class="session-batch-bar">
    <span>{{ t("sessionCenter.selected", { n: count }) }}</span>
    <div class="batch-actions">
      <app-button v-permission="'superAdmin:session:revoke'" variant="link" tone="primary" @click="emit('revoke')">
        {{ t("sessionCenter.batchRevoke") }}
      </app-button>
      <app-button v-permission="'superAdmin:session:revoke'" variant="link" tone="danger" @click="emit('force')">
        {{ t("sessionCenter.batchForce") }}
      </app-button>
      <app-button variant="link" @click="emit('cancel')">
        {{ t("sessionCenter.cancelSelection") }}
      </app-button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "SessionBatchBar" });

import { useI18n } from "vue-i18n";

defineProps<{
  count: number;
}>();

const emit = defineEmits<{
  (e: "revoke"): void;
  (e: "force"): void;
  (e: "cancel"): void;
}>();

const { t } = useI18n();
</script>

<style scoped lang="less">
.session-batch-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: @space-3;
  padding: @space-2 @space-3;
  border: 1px solid @color-border-light;
  border-radius: @radius-lg;
  font-size: 0.8rem;
  color: @color-text-regular;
}

.batch-actions {
  display: flex;
  gap: @space-2;
}
</style>
