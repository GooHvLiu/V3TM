<template>
  <ForgotCard :title="t('auth.force.title')" :subtitle="t('auth.force.subtitle')" :show-back="false">
    <ForcePasswordForm ref="formRef" :loading="loading" @submit="handleSubmit" />

    <div class="force-foot">
      <span class="notice">{{ t("auth.force.notice") }}</span>
      <app-button variant="link" tone="primary" :disabled="loading" @click="handleLogout">{{
        t("auth.force.logout")
      }}</app-button>
    </div>
  </ForgotCard>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "ForcePassword" });

import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { ElMessage } from "@/utils/element-plus";
import { AUTH } from "@/constants";
import { changePassword } from "@/api";
import { useUserStore, useMenuStore } from "@/stores";
import ForgotCard from "@/components/auth/forgot/card/index.vue";
import ForcePasswordForm from "@/components/auth/force-password/form/index.vue";
import type { PublicRequestError } from "@/types";

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const menuStore = useMenuStore();

const formRef = ref<InstanceType<typeof ForcePasswordForm> | null>(null);
const loading = ref(false);

/** 回到登录页：本地凭证已按需清理，守卫不会再拦 */
const backToLogin = (): void => {
  router.replace({ path: `${AUTH.ROOT}/${AUTH.LOGIN}` });
};

// 提交：成功后后端已吊销全部凭证，本地必须一并清空
const handleSubmit = async (payload: { oldPassword: string; newPassword: string }): Promise<void> => {
  loading.value = true;
  try {
    await changePassword(payload);
    userStore.clearSession();
    menuStore.setMenus([]);
    ElMessage.success(t("auth.message.passwordChanged"));
    backToLogin();
  } catch (error) {
    // 拦截器已带上业务码，按码把焦点送回对应输入框
    const err = error as PublicRequestError;
    switch (err.code) {
      case 20003:
        ElMessage.error(t("auth.force.errors.oldWrong"));
        formRef.value?.focusOld();
        break;
      case 20014:
        ElMessage.error(t("auth.force.errors.sameAsOld"));
        formRef.value?.focusNew();
        break;
      case 20005:
        ElMessage.error(t("auth.force.errors.passwordWeak"));
        formRef.value?.focusNew();
        break;
      case 10003:
        // 参数非法：后端在 params.field 指明字段
        if (err.params?.field === "oldPassword") {
          ElMessage.error(t("auth.force.errors.oldWrong"));
          formRef.value?.focusOld();
        } else if (err.params?.field === "newPassword") {
          ElMessage.error(t("auth.force.errors.passwordWeak"));
          formRef.value?.focusNew();
        } else {
          ElMessage.error(t("auth.force.errors.unknown"));
        }
        break;
      default:
        ElMessage.error(t("auth.force.errors.unknown"));
    }
  } finally {
    loading.value = false;
  }
};

// 退出登录：未完成改密时后端只放行本接口与 profile
const handleLogout = async (): Promise<void> => {
  try {
    await userStore.logout();
  } finally {
    backToLogin();
  }
};
</script>

<style scoped lang="less">
.force-foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: @space-2;

  .notice {
    font-size: 0.75rem;
    line-height: 1.6;
    color: @color-text-secondary;
    text-align: center;
  }
}
</style>
