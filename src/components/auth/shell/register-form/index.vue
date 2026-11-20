<template>
  <div class="page-wrap-register-form">
    <el-form
      ref="registerFormRef"
      :model="ruleForm"
      status-icon
      :rules="rules"
      style="max-width: 400px"
      label-width="auto"
    >
      <el-form-item prop="realName" :label="t('auth.register.realName')">
        <el-input
          v-model="ruleForm.realName"
          class="custom-big-radius-input"
          :placeholder="t('auth.register.realNamePlaceholder')"
          @keyup.enter="submitForm"
        />
      </el-form-item>
      <el-form-item prop="username" :label="t('auth.register.username')">
        <el-input
          v-model="ruleForm.username"
          class="custom-big-radius-input"
          :placeholder="t('auth.register.usernamePlaceholder')"
          @keyup.enter="submitForm"
        />
      </el-form-item>
      <el-form-item prop="email" :label="t('auth.register.email')">
        <el-input
          v-model="ruleForm.email"
          class="custom-big-radius-input"
          :placeholder="t('auth.register.emailPlaceholder')"
          @keyup.enter="submitForm"
        />
      </el-form-item>
      <el-form-item prop="psw" :label="t('auth.register.password')">
        <el-input
          v-model="ruleForm.psw"
          class="custom-big-radius-input"
          type="password"
          show-password
          :placeholder="t('auth.register.passwordPlaceholder')"
          @keyup.enter="submitForm"
        />
      </el-form-item>
      <el-form-item prop="confirmPsw" :label="t('auth.register.confirmPassword')">
        <el-input
          v-model="ruleForm.confirmPsw"
          class="custom-big-radius-input"
          type="password"
          :placeholder="t('auth.register.confirmPlaceholder')"
          @keyup.enter="submitForm"
        />
      </el-form-item>
      <app-button tone="primary" :loading="submitting" @click="submitForm"> {{ t("auth.register.submit") }} </app-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "RegisterForm" });

import type { FormInstance } from "element-plus";

// 引入校验函数
import { registerValidator, type RegisterFormModel } from "@/pages/auth/validators/register.validator";
import { zodToRules } from "@/utils";

// 引入常量
import { REGISTER_SUBMIT_KEY } from "@/constants";

// 引入数据类型
import type { RegisterParams } from "@/types";

// 引入子组件

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { inject, ref, reactive } from "vue";

// 表单表格
const registerFormRef = ref<FormInstance>();
const submitting = ref(false);

// 注册表单的输入数据
const ruleForm = reactive<RegisterFormModel>({
  realName: "",
  username: "",
  email: "",
  psw: "",
  confirmPsw: ""
});

// 注册表单的验证规则
const rules = zodToRules(registerValidator, t, () => ruleForm);

// 接收父组件的注册表单方法
const submitRegister = inject<(params: RegisterParams) => Promise<boolean>>(REGISTER_SUBMIT_KEY, async () => false);

// 注册方法
const submitForm = async () => {
  // 表单验证：校验失败 Promise 会 reject，捕获后返回 false
  const valid = await registerFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  // 锁按钮
  submitting.value = true;
  try {
    // 根据后端契约组装请求参数
    const ok = await submitRegister({
      username: ruleForm.username,
      password: ruleForm.psw,
      realName: ruleForm.realName,
      email: ruleForm.email
    });
    // 登录失败进行重置
    if (!ok) {
      registerFormRef.value?.resetFields("psw");
      registerFormRef.value?.resetFields("confirmPsw");
    }
  } catch {
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="less">
.page-wrap-register-form {
  .el-form-item {
    display: flex;
    flex-direction: column;
    gap: @space-2-5;
    /* 与登录表单一致：底部留白承载校验提示，否则提示会压到下一个标签 */
    margin-bottom: @space-6;
  }
  .el-button {
    width: 100%;
    margin: @space-2-5 0 @space-1 0;
  }
}
</style>
