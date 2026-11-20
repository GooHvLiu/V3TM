<template>
  <div class="column-settings" role="group" :aria-label="t('common.table.columnSettings')">
    <el-checkbox
      v-for="item in items"
      :key="item.prop"
      :model-value="item.checked"
      :disabled="item.disabled"
      @update:model-value="toggle(item.prop, $event)"
    >
      {{ item.label }}
    </el-checkbox>

    <div class="column-settings__foot">
      <app-button variant="ghost" size="sm" @click="emit('reset')">
        {{ t("common.table.resetColumns") }}
      </app-button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "ColumnSettings" });

import { useI18n } from "vue-i18n";
import AppButton from "@/components/common/base/app-button/index.vue";

/** 列设置面板只负责展示与上抛，谁可见、谁不可隐藏由表格算好再传进来 */
defineProps<{
  items: Array<{
    prop: string;
    label: string;
    checked: boolean;
    disabled?: boolean;
  }>;
}>();

const emit = defineEmits<{
  (e: "toggle", prop: string, value: boolean): void;
  (e: "reset"): void;
}>();

const { t } = useI18n();

const toggle = (prop: string, value: string | number | boolean): void => {
  emit("toggle", prop, value === true);
};
</script>

<style scoped lang="less">
.column-settings {
  display: flex;
  flex-direction: column;
  gap: @space-1-5;
  max-height: 280px;
  overflow-y: auto;

  &__foot {
    margin-top: @space-1;
    padding-top: @space-1-5;
    border-top: 1px solid @color-border-lighter;
  }
}
</style>
