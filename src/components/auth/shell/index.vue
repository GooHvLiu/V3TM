<template>
  <div class="page-wrap-auth">
    <div class="shell">
      <div class="auth-title">
        <BrandLogo class="logo" />
        <h2>{{ configStore.siteName }} - {{ t("auth.title") }}</h2>
      </div>
      <div class="auth-card">
        <app-card padding="xl" shadow="always">
          <div class="title">
            <h2>{{ formType == "login" ? t("auth.login.title") : t("auth.register.title") }}</h2>
          </div>
          <div class="subTitle">
            <span>{{ formType == "login" ? t("auth.login.subtitle") : t("auth.register.subtitle") }}</span>
            <!-- 注册侧始终给出去登录的出口；登录侧的注册入口跟随系统开关 -->
            <template v-if="formType === 'register' || (configReady && configStore.registerEnabled)">
              <span>{{ formType == "login" ? t("auth.login.noAccount") : t("auth.register.hasAccount") }}</span>
              <span
                class="link"
                role="button"
                tabindex="0"
                @click="goAlternate"
                @keydown.enter.prevent="goAlternate"
                @keydown.space.prevent="goAlternate"
                >{{ formType == "login" ? t("auth.login.toRegister") : t("auth.register.toLogin") }}</span>
            </template>
          </div>
          <div class="form">
            <!-- 注册表单：开关关闭时只留说明，不再渲染输入区 -->
            <div v-if="formType === 'register'" class="register">
              <app-alert
                v-if="configReady && !configStore.registerEnabled"
                :title="t('auth.register.disabled')"
                tone="warning"
              />
              <RegisterForm v-else />
            </div>
            <!-- 登录表单 -->
            <div v-else class="login">
              <LoginForm />
            </div>
          </div>
          <div class="underline" />
          <div class="otherMethods">
            <app-button variant="outline">
              <el-icon><i-carbon-logo-wechat /></el-icon>
              <span>{{ t("auth.otherMethods.weChat") }}</span></app-button>
          </div>
          <div class="termsTips">
            <span class="tips">{{ formType == "login" ? t("auth.login.terms") : t("auth.register.terms") }}</span>
            <span
              class="link"
              role="button"
              tabindex="0"
              @click="openTerms"
              @keydown.enter.prevent="openTerms"
              @keydown.space.prevent="openTerms"
              >{{
                formType == "login" ? t("auth.login.termsLink") : t("auth.register.termsLink")
              }}</span>
            <span>&nbsp;/&nbsp;</span>
            <span
              class="link"
              role="button"
              tabindex="0"
              @click="openPrivacy"
              @keydown.enter.prevent="openPrivacy"
              @keydown.space.prevent="openPrivacy"
              >{{
                formType == "login" ? t("auth.login.privacyLink") : t("auth.register.privacyLink")
              }}</span>
          </div>
        </app-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "AuthShell" });

// 引入相关资源
import { AUTH, LEGAL } from "@/constants";
import BrandLogo from "@/components/brand/logo/index.vue";

// 引入子组件
import LoginForm from "./login-form/index.vue";
import RegisterForm from "./register-form/index.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

// 引入 Pinia Store
import { useConfigStore } from "@/stores/modules/config";
const configStore = useConfigStore();

import { computed } from "vue";

import { useRouter } from "vue-router";
const router = useRouter();

// 父组件传递过来的 props 值
const props = withDefaults(
  defineProps<{
    formType?: "login" | "register";
  }>(),
  {
    formType: "login"
  }
);

// 配置就绪前不判定开关，避免首帧误显示"已关闭"
const configReady = computed(() => configStore.loaded || configStore.publicLoaded);

// 登录/注册互跳与页脚链接，点按与键盘走同一入口
const goAlternate = (): void => {
  router.push(props.formType === "login" ? `${AUTH.ROOT}/${AUTH.REGISTER}` : `${AUTH.ROOT}/${AUTH.LOGIN}`);
};

const openTerms = (): void => {
  void router.push(`/${LEGAL.ROOT}/${LEGAL.TERMS}`);
};

const openPrivacy = (): void => {
  void router.push(`/${LEGAL.ROOT}/${LEGAL.PRIVACY}`);
};

</script>

<style scoped lang="less">
.page-wrap-auth {
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: @color-bg-page;
  .shell {
    padding: @space-8;
    /* 内容整体垂直居中；内容高过视口时 auto 外边距归零，仍从顶部开始滚动 */
    margin: auto;
    scrollbar-width: none;
    .auth-title {
      display: flex;
      align-items: center;
      margin: 0 0 @space-4 @space-1;
      gap: @space-1;
      .logo {
        width: 30px;
      }
      h2 {
        font-weight: 900;
        font-size: 1.3rem;
      }
    }
    .auth-card {
      width: 100%;
      max-width: 384px;
      :deep(.el-card__body) {
        display: flex;
        flex-direction: column;
        scrollbar-width: none;
        gap: @space-5;
        .title {
          font-size: 1.2rem;
          font-weight: 900;
          margin-top: @space-4;
        }
        .subTitle {
          width: 100%;
          color: @color-text-secondary;
          font-size: 0.8rem;
          margin-right: @space-12;
        }
        .underline {
          height: 0.2px;
          background-color: @color-text-placeholder;
        }
        .otherMethods .el-button {
          width: 100%;
        }
        .termsTips {
          color: @color-text-secondary;
          font-size: 0.8rem;
          margin-bottom: @space-2-5;
          .tips {
            margin-right: @space-1;
          }
        }
      }
    }
    .link {
      text-decoration: underline 2px;
      text-underline-offset: 5px;
      font-weight: 900;
      &:hover {
        color: @color-primary;
        cursor: pointer;
      }
    }
  }
}
</style>

<style scoped lang="less">
@media (max-width: @mobile-max) {
  .subTitle {
    padding-right: 0; /* 原 padding-right: 100px 占掉大半个屏 */
  }
  .auth-title {
    justify-content: center; /* 移动端标题居中 */
    margin-left: 0;
  }
  /* iOS 缩放防坑：输入框字号 <16px 聚焦会自动放大页面 */
  :deep(.el-input__inner) {
    font-size: 1rem;
  }
}
</style>
