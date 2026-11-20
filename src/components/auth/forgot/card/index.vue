<template>
  <div class="page-wrap-forgot">
    <div class="shell">
      <div class="auth-title">
        <BrandLogo class="logo" />
        <h2>{{ configStore.siteName }} - {{ t("auth.title") }}</h2>
      </div>
      <div class="auth-card">
        <app-card padding="xl" shadow="always">
          <!-- 流程中途的退路：标题上方，箭头与文字整行可点 -->
          <div v-if="props.showBack" class="back-row">
            <span
              class="back-link"
              role="button"
              tabindex="0"
              @click="emit('back')"
              @keydown.enter.prevent="emit('back')"
              @keydown.space.prevent="emit('back')"
            >
              <el-icon class="arrow"><ArrowLeft /></el-icon>
              <span>{{ t("auth.forgot.backToLogin") }}</span>
            </span>
          </div>

          <div class="title">
            <h2>{{ title }}</h2>
          </div>
          <div class="subTitle">
            <span>{{ subtitle }}</span>
          </div>
          <div class="form">
            <slot />
          </div>
        </app-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "ForgotCard" });

import { useI18n } from "vue-i18n";
import { ArrowLeft } from "@element-plus/icons-vue";
import BrandLogo from "@/components/brand/logo/index.vue";
import { useConfigStore } from "@/stores/modules/config";

// 只负责页面外壳与卡片标题，流程内容全部由插槽承接
const props = withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    /** 终态面板自带出口时，不再显示返回入口 */
    showBack?: boolean;
  }>(),
  { showBack: true }
);

const emit = defineEmits<{ back: [] }>();

const { t } = useI18n();
const configStore = useConfigStore();
</script>

<style scoped lang="less">
.page-wrap-forgot {
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: @color-bg-page;

  .shell {
    padding: @space-8;
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
        gap: @space-5;

        .back-row {
          width: 100%;
          /* 抵消 body 的 20px 间距，让返回入口与标题保持 14px */
          margin-bottom: -6px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: @space-1;
          padding: @space-0-5 0;
          font-size: 0.8125rem;
          color: @color-primary;
          cursor: pointer;
          user-select: none;

          .arrow {
            font-size: 0.875rem;
          }

          &:hover {
            text-decoration: underline;
            text-underline-offset: 4px;
          }
        }

        .title {
          font-size: 1.2rem;
          font-weight: 900;
        }

        .subTitle {
          width: 100%;
          color: @color-text-secondary;
          font-size: 0.8rem;
        }
      }
    }
  }
}
</style>

<style scoped lang="less">
@media (max-width: @mobile-max) {
  .auth-title {
    justify-content: center;
    margin-left: 0;
  }

  /* iOS 缩放防坑：输入框字号低于 1rem 聚焦会自动放大页面 */
  :deep(.el-input__inner) {
    font-size: 1rem;
  }
}
</style>
