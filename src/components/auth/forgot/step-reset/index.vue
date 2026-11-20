<template>
  <div class="step-reset">
    <div class="sent-tip">
      <div class="lines">
        <span class="line">{{ t("auth.forgot.sentTo", { email }) }}</span>
        <span class="line muted">{{ hintText }}</span>
      </div>
      <span
        class="link"
        role="button"
        tabindex="0"
        @click="emit('modify')"
        @keydown.enter.prevent="emit('modify')"
        @keydown.space.prevent="emit('modify')"
        >{{ t("auth.forgot.modify") }}</span>
    </div>

    <el-form ref="formRef" :model="form" status-icon :rules="rules" label-position="top" @submit.prevent>
      <el-form-item prop="code" :label="t('auth.forgot.codeLabel')">
        <CodeInput ref="codeInputRef" v-model="form.code" :disabled="loading" />
      </el-form-item>

      <el-form-item prop="password" :label="t('auth.forgot.newPassword')">
        <el-input
          ref="passwordRef"
          v-model="form.password"
          class="custom-big-radius-input"
          type="password"
          show-password
          :placeholder="t('auth.forgot.newPasswordPlaceholder')"
          :disabled="loading"
          maxlength="32"
          autocomplete="new-password"
        />
        <PasswordRules :value="form.password" class="rules" />
      </el-form-item>

      <el-form-item prop="confirmPsw" :label="t('auth.forgot.confirmPassword')">
        <el-input
          ref="confirmRef"
          v-model="form.confirmPsw"
          class="custom-big-radius-input"
          type="password"
          show-password
          :placeholder="t('auth.forgot.confirmPlaceholder')"
          :disabled="loading"
          maxlength="32"
          autocomplete="new-password"
          @keyup.enter="submit"
        />
      </el-form-item>

      <app-button class="submit-btn" tone="primary" :loading="loading" :disabled="submitLeft > 0" @click="submit">
        {{ t("auth.forgot.resetSubmit") }}
      </app-button>

      <div class="resend-row">
        <app-button variant="ghost" :disabled="resendLeft > 0 || loading" @click="emit('resend')">
          {{ resendLeft > 0 ? t("auth.forgot.resendCountdown", { seconds: resendLeft }) : t("auth.forgot.resend") }}
        </app-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "ForgotStepReset" });

import type { FormInstance } from "element-plus";
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { forgotResetValidator } from "@/pages/auth/validators/forgot.validator";
import { zodToRules } from "@/utils";
import CodeInput from "../code-input/index.vue";
import PasswordRules from "../password-rules/index.vue";

const props = withDefaults(
  defineProps<{
    /** 已脱敏的收件邮箱，只用于展示 */
    email: string;
    /** 邮箱验证码剩余有效时间（mm:ss），由页面按时间戳算好传入 */
    validText?: string;
    resendLeft?: number;
    /** 限流冷却剩余秒数，期间禁止再次提交 */
    submitLeft?: number;
    loading?: boolean;
  }>(),
  {
    validText: "",
    resendLeft: 0,
    submitLeft: 0,
    loading: false
  }
);

const emit = defineEmits<{
  submit: [payload: { code: string; password: string }];
  resend: [];
  modify: [];
}>();

const { t } = useI18n();

const formRef = ref<FormInstance>();
const codeInputRef = ref<InstanceType<typeof CodeInput> | null>(null);
const passwordRef = ref<{ focus: () => void } | null>(null);
const confirmRef = ref<{ focus: () => void } | null>(null);

const form = reactive({
  code: "",
  password: "",
  confirmPsw: ""
});

// 确认密码一致性靠 schema 的 superRefine，错误落在 confirmPsw 上
const rules = zodToRules(forgotResetValidator, t, () => form);

// 有效期归零后不再显示剩余时间，直接提示重新获取
const hintText = computed(() =>
  props.validText ? t("auth.forgot.validTip", { time: props.validText }) : t("auth.forgot.expiredTip")
);

const submit = async (): Promise<void> => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  emit("submit", { code: form.code, password: form.password });
};

// 验证码被拒时清空格子并把焦点送回第一格
const resetCode = (): void => {
  form.code = "";
  formRef.value?.clearValidate("code");
  codeInputRef.value?.focusFirst();
};

// 密码强度被拒时把焦点送回密码框
const focusPassword = (): void => {
  formRef.value?.validateField("password").catch(() => undefined);
  passwordRef.value?.focus();
};

/** 后端 10003 指明字段时把焦点送回去 */
const focusField = (field: string): void => {
  if (field === "code") codeInputRef.value?.focusFirst();
  else if (field === "password") passwordRef.value?.focus();
  else if (field === "confirmPsw") confirmRef.value?.focus();
};

defineExpose({ resetCode, focusPassword, focusField });
</script>

<style scoped lang="less">
.step-reset {
  .sent-tip {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: @space-2-5;
    padding: @space-2-5 @space-3;
    margin-bottom: @space-4;
    background: @color-bg-page;
    border: 1px solid @color-border;
    border-radius: @radius-base;

    .lines {
      display: flex;
      flex-direction: column;
      gap: @space-1;
      min-width: 0;

      .line {
        font-size: 0.8rem;
        line-height: 1.6;
        color: @color-text-primary;
        word-break: break-all;
      }

      .muted {
        color: @color-text-secondary;
        word-break: normal;
      }
    }

    .link {
      flex: 0 0 auto;
      font-size: 0.8rem;
      color: @color-primary;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 4px;
    }
  }

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

  .resend-row {
    display: flex;
    justify-content: center;
    margin-top: @space-1-5;

    .el-button {
      min-height: 44px;
    }
  }
}
</style>
