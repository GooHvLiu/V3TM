<template>
  <div class="page-wrap-login-form">
    <el-form
      ref="loginFormRef"
      :model="ruleForm"
      status-icon
      :rules="rules"
      style="max-width: 400px"
      label-position="top"
    >
      <!-- 用户昵称 -->
      <el-form-item prop="username">
        <template #label>
          <div class="username-label">
            <span>{{ t("auth.login.username") }}</span>
          </div>
        </template>
        <el-input
          v-model="ruleForm.username"
          class="custom-big-radius-input"
          :placeholder="t('auth.login.usernamePlaceholder')"
          @keyup.enter="submitForm"
        />
      </el-form-item>
      <!-- 用户密码 利用插槽实现忘记密码在右侧功能 -->
      <el-form-item prop="psw">
        <template #label>
          <div class="password-label">
            <span>{{ t("auth.login.password") }}</span>
            <span
              class="forgotPassword"
              role="button"
              tabindex="0"
              @click="toForgot"
              @keydown.enter.prevent="toForgot"
              @keydown.space.prevent="toForgot"
              >{{ t("auth.login.forgotPassword") }}</span>
          </div>
        </template>
        <el-input
          v-model="ruleForm.psw"
          class="custom-big-radius-input"
          type="password"
          show-password
          :placeholder="t('auth.login.passwordPlaceholder')"
          @keyup.enter="submitForm"
        />
      </el-form-item>
      <!-- 验证码 -->
      <el-form-item prop="captcha" class="captcha-input-show">
        <template #label>
          <div class="label">
            <span>{{ t("auth.login.captcha") }}</span>
          </div>
        </template>
        <div class="input-show">
          <el-input v-model="ruleForm.captcha" class="custom-big-radius-input" @keyup.enter="submitForm" />
          <CaptchaImage :captcha="getCaptcha" @refresh="refreshCaptcha" />
        </div>
      </el-form-item>
      <app-button class="submitBtn" tone="primary" :loading="submitting" @click="submitForm">
        {{ t("auth.login.submit") }}
      </app-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "LoginForm" });

import type { FormInstance } from "element-plus";
import type { Ref } from "vue";

// 引入校验函数
import { loginValidator, type LoginFormModel } from "@/pages/auth/validators/login.validator";
import { zodToRules } from "@/utils";

// 引入常量
import { AUTH, LOGIN_CAPTCHA_KEY, LOGIN_CAPTCHA_REFRESH_KEY, LOGIN_SUBMIT_KEY } from "@/constants";

// 数据类型
import type { CaptchaInfo, LoginParams } from "@/types";

// 引入子组件
import CaptchaImage from "@/components/captcha/image/index.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { ref, reactive, inject, computed, watch } from "vue";

import { useRouter } from "vue-router";
const router = useRouter();

// 表单表格
const loginFormRef = ref<FormInstance>();

// 注册表单的输入数据
const ruleForm = reactive<LoginFormModel>({
  username: "",
  psw: "",
  captcha: ""
});

// 注册表单的验证规则
const rules = zodToRules(loginValidator, t);

// 获取父组件提供 验证码数据
const getCaptcha = inject<Ref<CaptchaInfo | null>>(LOGIN_CAPTCHA_KEY, ref(null));

// 获取父组件提供 刷新验证码函数
const refreshCaptcha = inject<() => Promise<void>>(LOGIN_CAPTCHA_REFRESH_KEY, async () => {});

// 登录提交由父层 handleLogin 提供
const submitLogin = inject<(params: LoginParams) => Promise<boolean>>(LOGIN_SUBMIT_KEY, async () => false);

// 计算属性 后端传入的验证码 id
const captchaID = computed(() => getCaptcha.value?.captchaId);

// 密码标签右侧的「忘记密码」入口，跳两步重置向导
const toForgot = (): void => {
  router.push(`${AUTH.ROOT}/${AUTH.FORGOT}`);
};

// 提交中状态（按钮 loading + 防连点，本地 UI 态不入 Store）
const submitting = ref(false);

// 换图后旧验证码作废 → 自动清空输入（验证码一次性）
watch(captchaID, () => {
  loginFormRef.value?.resetFields("captcha");
});

// 表单提交
const submitForm = async (): Promise<void> => {
  // 表单验证：校验失败 Promise 会 reject，捕获后返回 false
  const valid = await loginFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  // 锁按钮
  submitting.value = true;
  try {
    // 根据后端契约组装请求参数
    const ok = await submitLogin({
      username: ruleForm.username,
      password: ruleForm.psw,
      captchaCode: ruleForm.captcha,
      captchaId: captchaID.value ?? ""
    });
    // 登录失败：密码/验证码 值+校验状态 一起重置
    if (!ok) {
      loginFormRef.value?.resetFields("psw");
      loginFormRef.value?.resetFields("captcha");
    }
  } finally {
    // 无论成功/失败都解锁
    submitting.value = false;
  }
};
</script>

<style scoped lang="less">
.page-wrap-login-form {
  .el-form-item {
    display: flex;
    flex-direction: column;
    gap: @space-2-5;
    /* 底部留出校验提示的高度：错误文案绝对定位在输入框下方，留白不够会压到下一个标签 */
    margin: 0 @space-1 @space-6;
    /* 标签行上下排布：EP 默认把 label 靠右，登录页统一左对齐 */
    :deep(.el-form-item__label) {
      width: 100%;
      display: block;
      text-align: left;
      height: auto;
      padding: 0;
      margin-bottom: 0;
      line-height: 1.5;
      .password-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .forgotPassword {
          &:hover {
            color: @color-primary;
            text-decoration: underline;
            text-underline-offset: 5px;
            cursor: pointer;
          }
        }
      }
    }
  }
  .captcha-input-show {
    .input-show {
      width: 100%;
      display: flex;
      align-items: center;
      gap: @space-3;
      .el-input {
        width: 120px;
      }
    }
  }
  .el-button {
    width: 100%;
    margin: @space-5 0 @space-1 0;
  }
}
</style>
