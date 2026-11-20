<template>
  <div class="force-password-form">
    <el-form ref="formRef" :model="form" status-icon :rules="rules" label-position="top" @submit.prevent>
      <el-form-item prop="oldPassword" :label="t('auth.force.oldPassword')">
        <el-input
          ref="oldRef"
          v-model="form.oldPassword"
          class="custom-big-radius-input"
          type="password"
          show-password
          :placeholder="t('auth.force.oldPasswordPlaceholder')"
          :disabled="loading"
          maxlength="64"
          autocomplete="current-password"
        />
      </el-form-item>

      <el-form-item prop="newPassword" :label="t('auth.force.newPassword')">
        <el-input
          ref="newRef"
          v-model="form.newPassword"
          class="custom-big-radius-input"
          type="password"
          show-password
          :placeholder="t('auth.force.newPasswordPlaceholder')"
          :disabled="loading"
          maxlength="32"
          autocomplete="new-password"
        />
        <PasswordRules :value="form.newPassword" prefix="auth.force.rules" class="rules" />
      </el-form-item>

      <el-form-item prop="confirmPassword" :label="t('auth.force.confirmPassword')">
        <el-input
          ref="confirmRef"
          v-model="form.confirmPassword"
          class="custom-big-radius-input"
          type="password"
          show-password
          :placeholder="t('auth.force.confirmPlaceholder')"
          :disabled="loading"
          maxlength="32"
          autocomplete="new-password"
          @keyup.enter="submit"
        />
      </el-form-item>

      <!-- 弹窗内由外层 footer 承担确认动作，此时不重复渲染内置按钮 -->
      <app-button v-if="!hideSubmit" class="submit-btn" tone="primary" :loading="loading" @click="submit">
        {{ t("auth.force.submit") }}
      </app-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "ForcePasswordForm" });

import type { FormInstance } from "element-plus";
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { changePasswordValidator } from "@/pages/auth/validators/change-password.validator";
import { zodToRules } from "@/utils";
import PasswordRules from "@/components/auth/forgot/password-rules/index.vue";

withDefaults(defineProps<{ loading?: boolean; hideSubmit?: boolean }>(), { loading: false, hideSubmit: false });

const emit = defineEmits<{ submit: [payload: { oldPassword: string; newPassword: string }] }>();

const { t } = useI18n();

const formRef = ref<FormInstance>();
const oldRef = ref<{ focus: () => void } | null>(null);
const newRef = ref<{ focus: () => void } | null>(null);
const confirmRef = ref<{ focus: () => void } | null>(null);

const form = reactive({ oldPassword: "", newPassword: "", confirmPassword: "" });

// 新旧相同、两次不一致都在 schema 里，错误各自挂到对应输入框
const rules = zodToRules(changePasswordValidator, t, () => form);

const submit = async (): Promise<void> => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  emit("submit", { oldPassword: form.oldPassword, newPassword: form.newPassword });
};

/** 旧密码被拒：重新校验并把焦点送回 */
const focusOld = (): void => {
  formRef.value?.validateField("oldPassword").catch(() => undefined);
  oldRef.value?.focus();
};

/** 新密码被拒（强度 / 与旧密码相同）：定位到新密码框 */
const focusNew = (): void => {
  formRef.value?.validateField("newPassword").catch(() => undefined);
  newRef.value?.focus();
};

/** 确认密码被拒 */
const focusConfirm = (): void => {
  formRef.value?.validateField("confirmPassword").catch(() => undefined);
  confirmRef.value?.focus();
};

defineExpose({ submit, focusOld, focusNew, focusConfirm });
</script>

<style scoped lang="less">
.force-password-form {
  .el-form-item {
    margin-bottom: @space-3;

    :deep(.el-form-item__content) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .rules {
    width: 100%;
  }

  .submit-btn {
    width: 100%;
    height: 44px;
    margin: @space-2 0 0;
  }
}
</style>
