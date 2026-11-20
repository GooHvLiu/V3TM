<template>
  <el-alert
    :title="title"
    :description="description"
    :type="resolvedType"
    :show-icon="showIcon"
    :closable="closable"
    :center="center"
    class="app-alert"
    :class="`app-alert--tone-${tone}`"
    @close="emit('close')"
  />
</template>

<script setup lang="ts">
defineOptions({ name: "AppAlert" });

import { computed } from "vue";
import type { SemanticTone } from "../shared/tone";

type AlertType = "success" | "warning" | "info" | "error";

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    tone?: SemanticTone;
    showIcon?: boolean;
    closable?: boolean;
    center?: boolean;
  }>(),
  {
    title: "",
    description: undefined,
    tone: "info",
    showIcon: true,
    closable: false,
    center: false
  }
);

const emit = defineEmits<{ close: [] }>();

/* 语义色档位只有 danger 一档落到 Element Plus 的 error，其余同名直传 */
const resolvedType = computed<AlertType>(() => {
  const tone = props.tone;
  if (tone === "danger") return "error";
  if (tone === "primary" || tone === "neutral") return "info";
  return tone;
});
</script>

<style scoped lang="less">
.app-alert {
  border: 1px solid var(--app-alert-border);
  border-radius: @radius-base;
  align-items: flex-start;

  :deep(.el-alert__title) {
    font-size: @font-size-sm;
    line-height: 1.65;
  }

  :deep(.el-alert__description) {
    margin-top: @space-1;
    font-size: @font-size-xs;
    line-height: 1.7;
  }

  :deep(.el-alert__content) {
    padding-top: @space-0-5;
  }
}

/* 边框跟着语义色走，底色仍由 Element Plus 的浅色档位提供 */
.app-alert--tone-info {
  --app-alert-border: var(--el-color-info-light-7);
}

.app-alert--tone-primary,
.app-alert--tone-neutral {
  --app-alert-border: var(--el-color-info-light-7);
}

.app-alert--tone-success {
  --app-alert-border: var(--el-color-success-light-7);
}

.app-alert--tone-warning {
  --app-alert-border: var(--el-color-warning-light-7);
}

.app-alert--tone-danger {
  --app-alert-border: var(--el-color-danger-light-7);
}
</style>
