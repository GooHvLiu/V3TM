<template>
  <div class="page-wrap-login">
    <AuthShell form-type="login" />
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "Login" });

// 引入子组件
import AuthShell from "@/components/auth/shell/index.vue";

// 获取常量
import { AUTH, LAYOUT, LOGIN_CAPTCHA_KEY, LOGIN_CAPTCHA_REFRESH_KEY, LOGIN_SUBMIT_KEY } from "@/constants";

// 获取数据类型
import type { CaptchaInfo, LoginParams } from "@/types";

// 引入 API 后端数据
import { getCaptcha } from "@/api";

// 引入Store user / menu / config
import { useUserStore } from "@/stores";
import { useConfigStore } from "@/stores/modules/config";
const userStore = useUserStore();
const configStore = useConfigStore();

import { useI18n } from "vue-i18n";
const { t } = useI18n();

// 引入消息提示
import { ElMessage } from "@/utils/element-plus";

import { ref, onMounted, provide } from "vue";

import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();

// 存储验证码的变量
const captchaReq = ref<CaptchaInfo>({} as CaptchaInfo);

onMounted(() => {
  // 组件启用后即可获取验证码数据请求
  loadCaptcha();
  // 改密成功回流：提示一次后去掉 query，刷新不再重复
  if (route.query.changed === "1") {
    ElMessage.success(t("auth.message.passwordChanged"));
    router.replace({ path: route.path });
  }
});

// 获取验证码
const loadCaptcha = async () => {
  try {
    captchaReq.value = await getCaptcha();
  } catch {}
};

// 登录实现
const handleLogin = async (params: LoginParams): Promise<boolean> => {
  try {
    await userStore.login(params);
    // 首次登录被要求改密：先设密码，不进业务页，也不拉全量配置
    if (userStore.mustChangePassword) {
      router.push(`${AUTH.ROOT}/${AUTH.FORCE_PASSWORD}`);
      return true;
    }
    // 登录后把公开白名单换成全量：request_timeout、help_mode 只在登录态可读
    configStore.fetchConfig(true).catch(() => {});
    const redirect = (route.query.redirect as string) ?? "";
    // 无回跳目标时落根路径：守卫装配完动态路由后再分流到首页
    router.push(redirect.startsWith("/") ? redirect : LAYOUT.ROOT);
    return true;
  } catch {
    loadCaptcha();
    return false;
  }
};

// 用户登录验证码数据
provide(LOGIN_CAPTCHA_KEY, captchaReq);

// 刷新验证码方法
provide(LOGIN_CAPTCHA_REFRESH_KEY, loadCaptcha);

// 登录方法
provide(LOGIN_SUBMIT_KEY, handleLogin);
</script>

<style scoped lang="less"></style>
