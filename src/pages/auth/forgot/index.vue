<template>
  <ForgotCard
    :title="cardTitle"
    :subtitle="t('auth.forgot.subtitle')"
    :show-back="step !== 'success'"
    @back="goLogin"
  >
    <app-alert
      v-if="alertMessage"
      class="top-alert"
      :title="alertMessage"
      tone="danger"
    />

    <ResultPanel v-if="blocked" variant="blocked" @action="handleUnblock" />
    <ResultPanel v-else-if="step === 'success'" variant="success" @action="goLogin" />

    <StepAccount
      v-else-if="step === 'account'"
      ref="stepAccountRef"
      :captcha="captcha"
      :loading="loading"
      :initial="account"
      @submit="handleAccountSubmit"
      @refresh-captcha="loadCaptcha"
    />

    <StepReset
      v-else
      ref="stepResetRef"
      :email="maskedEmail"
      :valid-text="codeLeftText"
      :resend-left="resendLeft"
      :submit-left="rateLimitLeft"
      :loading="loading"
      @submit="handleResetSubmit"
      @resend="backToAccount"
      @modify="backToAccount"
    />
  </ForgotCard>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "ForgotPassword" });

import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import ForgotCard from "@/components/auth/forgot/card/index.vue";
import StepAccount from "@/components/auth/forgot/step-account/index.vue";
import StepReset from "@/components/auth/forgot/step-reset/index.vue";
import ResultPanel from "@/components/auth/forgot/result-panel/index.vue";

import { AUTH, FORGOT_FIELD_MAP, FORGOT_RESEND_SECONDS, TOKEN_KEY } from "@/constants";
import { forgotPassword, resetPassword, getCaptcha } from "@/api";
import { storage } from "@/utils";
import { translateMessage } from "@/utils/request";
import { useUserStore, useMenuStore } from "@/stores";
import type { CaptchaInfo, PublicRequestError } from "@/types";

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const menuStore = useMenuStore();

/** 单页两步：account 填账号 → reset 填码与密码；success / blocked 为终态面板 */
const step = ref<"account" | "reset" | "success">("account");
const blocked = ref(false);
const loading = ref(false);

const captcha = ref<CaptchaInfo | null>(null);
const validMinutes = ref(10);
const alertMessage = ref("");

// 第 1 步通过的账号信息，第 2 步与原路重发都靠它，不再让用户重填
const account = reactive({ username: "", email: "" });

const stepAccountRef = ref<InstanceType<typeof StepAccount> | null>(null);
const stepResetRef = ref<InstanceType<typeof StepReset> | null>(null);

// 倒计时以本地时间戳为准，切后台回来按剩余时间恢复，不做逐秒累加
const now = ref(Date.now());
const resendDeadline = ref(0);
const codeDeadline = ref(0);
const rateLimitDeadline = ref(0);
let tickTimer = 0;

const resendLeft = computed(() => Math.max(0, Math.ceil((resendDeadline.value - now.value) / 1000)));
const rateLimitLeft = computed(() => Math.max(0, Math.ceil((rateLimitDeadline.value - now.value) / 1000)));

// 邮箱验证码有效期同样按时间戳倒推，归零后只提示重新获取
const codeLeft = computed(() => Math.max(0, Math.ceil((codeDeadline.value - now.value) / 1000)));
const codeLeftText = computed(() => {
  if (codeLeft.value <= 0) return "";
  const mm = String(Math.floor(codeLeft.value / 60)).padStart(2, "0");
  const ss = String(codeLeft.value % 60).padStart(2, "0");
  return `${mm}:${ss}`;
});

const cardTitle = computed(() => (step.value === "reset" ? t("auth.forgot.stepReset") : t("auth.forgot.title")));

/** 第 2 步只展示脱敏邮箱：保留首尾便于核对，中间固定打码 */
const maskedEmail = computed(() => {
  const email = account.email;
  const at = email.indexOf("@");
  if (at <= 0) return email;

  const name = email.slice(0, at);
  const domain = email.slice(at);
  if (name.length <= 2) return `${name.slice(0, 1)}***${domain}`;

  const head = name.slice(0, 2);
  const tail = name.length > 4 ? name.slice(-2) : "";
  return `${head}${"*".repeat(Math.max(3, name.length - head.length - tail.length))}${tail}${domain}`;
});

/** 后端字段名 → 表单字段，10003 的 params.field 与聚焦共用同一份映射 */
const focusFieldOf = (error: PublicRequestError): string =>
  FORGOT_FIELD_MAP[String(error.params?.field ?? "")] ?? "";

const loadCaptcha = async (): Promise<void> => {
  try {
    captcha.value = await getCaptcha();
  } catch {
    captcha.value = null;
  }
};

const startCooldown = (seconds?: string | number): void => {
  const parsed = Number(seconds);
  const wait = Number.isFinite(parsed) && parsed > 0 ? parsed : FORGOT_RESEND_SECONDS;
  resendDeadline.value = Date.now() + wait * 1000;
  now.value = Date.now();
};

// 限流冷却：重发与提交一起停，按 Retry-After 或 60 秒恢复
const startRateLimit = (seconds?: string | number): void => {
  const parsed = Number(seconds);
  const wait = Number.isFinite(parsed) && parsed > 0 ? parsed : FORGOT_RESEND_SECONDS;
  rateLimitDeadline.value = Date.now() + wait * 1000;
  now.value = Date.now();
};

const handleAccountSubmit = async (payload: {
  username: string;
  email: string;
  captchaCode: string;
}): Promise<void> => {
  if (loading.value) return;
  alertMessage.value = "";
  loading.value = true;

  try {
    const result = await forgotPassword({
      username: payload.username,
      email: payload.email,
      captchaId: captcha.value?.captchaId ?? "",
      captchaCode: payload.captchaCode
    });

    account.username = payload.username;
    account.email = payload.email;
    validMinutes.value = result?.expiresMinutes || 10;
    codeDeadline.value = Date.now() + validMinutes.value * 60 * 1000;

    startCooldown();
    step.value = "reset";
  } catch (error) {
    handleError(error);
  } finally {
    loading.value = false;
    // 图形码一次性：本次请求用过即作废，留在第 1 步时立刻换一张
    if (step.value === "account" && !blocked.value) loadCaptcha();
  }
};

const handleResetSubmit = async (payload: { code: string; password: string }): Promise<void> => {
  if (loading.value) return;
  alertMessage.value = "";
  loading.value = true;

  try {
    await resetPassword({
      username: account.username,
      email: account.email,
      code: payload.code,
      newPassword: payload.password
    });

    // 后端重置成功即吊销全部会话，本地凭证与菜单都不再可信
    if (storage.get<string>(TOKEN_KEY)) {
      userStore.clearSession();
      menuStore.setMenus([]);
    }

    step.value = "success";
  } catch (error) {
    handleError(error);
  } finally {
    loading.value = false;
  }
};

/** 错误码分发：能落到具体字段的交给字段，其余统一走顶部提示 */
const handleError = (error: unknown): void => {
  const err = error as PublicRequestError;

  switch (err.code) {
    case 10201:
      alertMessage.value = t("auth.forgot.errors.captchaExpired");
      stepAccountRef.value?.focusField("captcha");
      return;
    case 10202:
      alertMessage.value = t("auth.forgot.errors.captchaError");
      stepAccountRef.value?.focusField("captcha");
      return;
    case 20005:
      stepResetRef.value?.focusPassword();
      alertMessage.value = t("auth.forgot.errors.passwordWeakServer");
      return;
    case 20009:
      stepResetRef.value?.resetCode();
      alertMessage.value = t("auth.forgot.errors.codeInvalid");
      return;
    case 20012:
      alertMessage.value = t("auth.forgot.errors.accountMismatch");
      stepAccountRef.value?.focusField("username");
      return;
    case 20010:
      blocked.value = true;
      return;
    case 20018:
      startCooldown(err.retryAfter);
      startRateLimit(err.retryAfter);
      alertMessage.value = translateMessage(err.msg, err.params);
      return;
    case 10106:
      startCooldown(err.retryAfter);
      startRateLimit(err.retryAfter);
      alertMessage.value = t("auth.forgot.errors.rateLimited");
      return;
    case 10003: {
      const field = focusFieldOf(err);
      alertMessage.value = translateMessage(err.msg, err.params);
      stepAccountRef.value?.focusField(field);
      stepResetRef.value?.focusField(field);
      return;
    }
    default:
      break;
  }

  if (err.httpStatus === 429) {
    startCooldown(err.retryAfter);
    startRateLimit(err.retryAfter);
    alertMessage.value = t("auth.forgot.errors.rateLimited");
    return;
  }

  alertMessage.value = err.httpStatus ? t("auth.forgot.errors.network") : t("auth.forgot.errors.unknown");
};

const backToAccount = (): void => {
  alertMessage.value = "";
  step.value = "account";
  loadCaptcha();
};

const handleUnblock = (): void => {
  blocked.value = false;
  backToAccount();
};

const goLogin = (): void => {
  router.push(`${AUTH.ROOT}/${AUTH.LOGIN}`);
};

onMounted(() => {
  loadCaptcha();
  tickTimer = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  if (tickTimer) window.clearInterval(tickTimer);
});
</script>

<style scoped lang="less">
@media (max-width: @mobile-max) {
  .top-alert {
    margin-bottom: @space-1;
  }
}
</style>
