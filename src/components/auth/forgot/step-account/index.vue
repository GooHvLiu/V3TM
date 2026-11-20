<template>
  <div class="step-account">
    <el-form ref="formRef" :model="form" status-icon :rules="rules" label-position="top" @submit.prevent>
      <el-form-item prop="username" :label="t('auth.forgot.username')">
        <el-input
          ref="usernameRef"
          v-model="form.username"
          class="custom-big-radius-input"
          :placeholder="t('auth.forgot.usernamePlaceholder')"
          :disabled="loading"
          maxlength="50"
          autocomplete="username"
          @keyup.enter="submit"
        />
      </el-form-item>

      <el-form-item prop="email" :label="t('auth.forgot.email')">
        <el-input
          ref="emailRef"
          v-model="form.email"
          class="custom-big-radius-input"
          :placeholder="t('auth.forgot.emailPlaceholder')"
          :disabled="loading"
          maxlength="100"
          autocomplete="email"
          @keyup.enter="submit"
        />
      </el-form-item>

      <el-form-item prop="captcha" :label="t('auth.forgot.captcha')">
        <div class="captcha-row">
          <el-input
            ref="captchaRef"
            v-model="form.captcha"
            class="custom-big-radius-input"
            :placeholder="t('auth.forgot.captchaPlaceholder')"
            :disabled="loading"
            maxlength="4"
            autocomplete="off"
            @keyup.enter="submit"
          />
          <CaptchaImage :captcha="captcha" :disabled="loading" @refresh="emit('refresh-captcha')" />
        </div>
      </el-form-item>

      <app-button class="submit-btn" tone="primary" :loading="loading" @click="submit">
        {{ t("auth.forgot.sendCode") }}
      </app-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "ForgotStepAccount" });

import type { FormInstance } from "element-plus";
import { reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { forgotAccountValidator } from "@/pages/auth/validators/forgot.validator";
import { zodToRules } from "@/utils";
import CaptchaImage from "@/components/captcha/image/index.vue";
import type { CaptchaInfo } from "@/types";

const props = withDefaults(
  defineProps<{
    captcha?: CaptchaInfo | null;
    loading?: boolean;
    /** 从重置步骤退回时保留上一次填写的账号信息 */
    initial?: { username: string; email: string };
  }>(),
  {
    captcha: null,
    loading: false,
    initial: () => ({ username: "", email: "" })
  }
);

const emit = defineEmits<{
  submit: [payload: { username: string; email: string; captchaCode: string }];
  "refresh-captcha": [];
}>();

const { t } = useI18n();

const formRef = ref<FormInstance>();
const usernameRef = ref<{ focus: () => void } | null>(null);
const emailRef = ref<{ focus: () => void } | null>(null);
const captchaRef = ref<{ focus: () => void } | null>(null);

const form = reactive({
  username: props.initial.username,
  email: props.initial.email,
  captcha: ""
});

const rules = zodToRules(forgotAccountValidator, t);

// 换图即作废：图形码一次性，旧输入跟着清掉
watch(
  () => props.captcha?.captchaId,
  () => resetCaptcha()
);

const resetCaptcha = (): void => {
  form.captcha = "";
  formRef.value?.clearValidate("captcha");
};

// 提交前统一去空白，邮箱转小写与后端口径一致
const submit = async (): Promise<void> => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  emit("submit", {
    username: form.username.trim(),
    email: form.email.trim().toLowerCase(),
    captchaCode: form.captcha.trim()
  });
};

/** 后端 10003 指明字段时把焦点送回去 */
const focusField = (field: string): void => {
  if (field === "username") usernameRef.value?.focus();
  else if (field === "email") emailRef.value?.focus();
  else if (field === "captcha") captchaRef.value?.focus();
};

// 图形码失效 / 错误时由页面调用，就地清输入
defineExpose({ resetCaptcha, focusField });
</script>

<style scoped lang="less">
.step-account {
  .el-form-item {
    margin-bottom: @space-3;
  }

  .captcha-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: @space-3;

    .el-input {
      flex: 1 1 auto;
      min-width: 0;
    }
  }

  .submit-btn {
    width: 100%;
    height: 44px;
    margin: @space-2 0 0;
  }
}
</style>
