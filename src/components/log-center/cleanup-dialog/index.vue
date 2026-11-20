<template>
  <app-dialog
    :model-value="modelValue"
    :title="t('logCenter.cleanup.title')"
    width="480px"
    :close-on-click-modal="false"
    :destroy-on-close="false"
    @update:model-value="handleVisible"
  >
    <app-alert :title="t('logCenter.cleanup.tip')" tone="warning" class="cleanup-dialog-tip" />

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item :label="t('logCenter.cleanup.days')" prop="beforeDays">
        <el-input-number
          v-model="form.beforeDays"
          :min="1"
          :max="3650"
          :step="1"
          :precision="0"
          controls-position="right"
          class="cleanup-dialog-days"
        />
        <span class="cleanup-dialog-days-tip">{{ t("logCenter.cleanup.daysPlaceholder") }}</span>
      </el-form-item>

      <el-form-item :label="t('logCenter.cleanup.confirmLabel')" prop="confirm">
        <el-input
          v-model="form.confirm"
          :placeholder="t('logCenter.cleanup.confirmPlaceholder')"
          clearable
          @input="handleConfirmInput"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="cleanup-dialog-footer">
        <app-button :disabled="submitting" @click="handleVisible(false)">{{ t("common.cancel") }}</app-button>
        <app-button tone="danger" :loading="submitting" @click="handleSubmit">
          {{ t("logCenter.cleanup.submit") }}
        </app-button>
      </div>
    </template>
  </app-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: "CleanupDialog" });

import { reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { FormInstance, FormRules } from "element-plus";
import { LOG_CLEANUP_CONFIRM_TEXT } from "@/constants";
import AppDialog from "@/components/common/base/app-dialog/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";

const props = defineProps<{
  /** 弹窗开关，v-model */
  modelValue: boolean;
  /** 默认保留天数：取自系统配置，取不到用常量兜底 */
  defaultDays: number;
  /** 提交中：按钮转 loading，并禁止关闭 */
  submitting: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [params: { beforeDays: number }];
}>();

const { t } = useI18n();
const formRef = ref<FormInstance>();

const form = reactive<{ beforeDays: number; confirm: string }>({
  beforeDays: props.defaultDays,
  confirm: ""
});

const rules: FormRules = {
  beforeDays: [
    {
      validator: (_rule, value: number, callback) => {
        if (!Number.isInteger(value) || value < 1 || value > 3650) {
          callback(new Error(t("logCenter.cleanup.daysInvalid")));
          return;
        }
        callback();
      },
      trigger: "change"
    }
  ],
  confirm: [
    {
      validator: (_rule, value: string, callback) => {
        if (value !== LOG_CLEANUP_CONFIRM_TEXT) {
          callback(new Error(t("logCenter.cleanup.confirmInvalid")));
          return;
        }
        callback();
      },
      trigger: "change"
    }
  ]
};

/** 逐字短语：输入即转大写，减少大小写误报 */
const handleConfirmInput = (value: string): void => {
  form.confirm = value.toUpperCase();
};

const handleVisible = (value: boolean): void => {
  if (!value && props.submitting) return;
  emit("update:modelValue", value);
};

const handleSubmit = async (): Promise<void> => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  emit("submit", { beforeDays: form.beforeDays });
};

/** 每次打开回到默认天数与空确认词 */
watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) return;
    form.beforeDays = props.defaultDays;
    form.confirm = "";
    formRef.value?.clearValidate();
  }
);
</script>

<style scoped lang="less">
.cleanup-dialog-tip {
  margin-bottom: @space-4;
}

.cleanup-dialog-days {
  width: 160px;
}

.cleanup-dialog-days-tip {
  margin-left: @space-2-5;
  font-size: @font-size-xs;
  color: @color-text-secondary;
}

.cleanup-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: @space-2-5;
}
</style>
