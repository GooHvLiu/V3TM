<template>
  <div class="page-wrap-register">
    <AuthShell form-type="register" />
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "Register" });

// 引入子组件
import AuthShell from "@/components/auth/shell/index.vue";

// 引入常量（注册注入契约 + 路由跳转）
import { AUTH, REGISTER_SUBMIT_KEY } from "@/constants";

// 引入 API 后端数据
import { register } from "@/api";

import type { RegisterParams } from "@/types";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { provide } from "vue";

// 引入消息提示
import { ElMessage } from "@/utils/element-plus";

import { useRouter } from "vue-router";
const router = useRouter();

// 注册实现：提交 → 成功提示 → 跳登录页
const handleRegister = async (params: RegisterParams): Promise<boolean> => {
  try {
    // 开启注册审批时账号先落待审核，提示语随 approvalRequired 切换
    const result = await register(params);
    ElMessage.success(t(result.approvalRequired ? "auth.message.registerPending" : "auth.message.registerSuccess"));
    router.push(`${AUTH.ROOT}/${AUTH.LOGIN}`);
    return true;
  } catch {
    // 失败提示已由 request 拦截器统一弹出，表单停留供用户修正
    return false;
  }
};

// 注册方法（provide 给 register-form 注入）
provide(REGISTER_SUBMIT_KEY, handleRegister);
</script>

<style scoped lang="less"></style>
