<template>
  <div class="page-wrap-legal-layout">
    <!-- 顶部品牌区 -->
    <header class="legal-header">
      <div
        class="brand"
        role="button"
        tabindex="0"
        @click="router.push(LAYOUT.ROOT)"
        @keydown.enter.prevent="router.push(LAYOUT.ROOT)"
        @keydown.space.prevent="router.push(LAYOUT.ROOT)"
      >
        <img :src="favicon" alt="logo">
        <span>{{ configStore.siteName }}</span>
      </div>
    </header>

    <!-- 内容区（slot 放文档） -->
    <main class="legal-main">
      <slot />
    </main>

    <!-- 底部：版权 + 互跳 -->
    <footer class="legal-footer">
      <div class="copyright">© {{ currentYear }} {{ configStore.sellerName }} · {{ t("legal.copyright") }}</div>
      <div class="links">
        <span
          class="link"
          role="button"
          tabindex="0"
          @click="router.push(`/${LEGAL.ROOT}/${LEGAL.TERMS}`)"
          @keydown.enter.prevent="router.push(`/${LEGAL.ROOT}/${LEGAL.TERMS}`)"
          @keydown.space.prevent="router.push(`/${LEGAL.ROOT}/${LEGAL.TERMS}`)"
          >{{ t("legal.termsLink") }}</span>
        <span class="dot">·</span>
        <span
          class="link"
          role="button"
          tabindex="0"
          @click="router.push(`/${LEGAL.ROOT}/${LEGAL.PRIVACY}`)"
          @keydown.enter.prevent="router.push(`/${LEGAL.ROOT}/${LEGAL.PRIVACY}`)"
          @keydown.space.prevent="router.push(`/${LEGAL.ROOT}/${LEGAL.PRIVACY}`)"
          >{{ t("legal.privacyLink") }}</span>
        <span class="dot">·</span>
        <span
          class="link"
          role="button"
          tabindex="0"
          @click="router.push(LAYOUT.ROOT)"
          @keydown.enter.prevent="router.push(LAYOUT.ROOT)"
          @keydown.space.prevent="router.push(LAYOUT.ROOT)"
          >{{ t("legal.backHome") }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "LegalLayout" });

// 引入常量
import { LAYOUT, LEGAL } from "@/constants";
import favicon from "@/assets/images/favicon.svg";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

// 引入 Pinia Store
import { useConfigStore } from "@/stores/modules/config";
const configStore = useConfigStore();

// 引入路由
import { useRouter } from "vue-router";
const router = useRouter();

// 当前年份（版权行）
const currentYear = new Date().getFullYear();
</script>

<style scoped lang="less">
.page-wrap-legal-layout {
  min-height: 100vh;
  min-height: 100dvh; /* 移动端动态视口 */
  display: flex;
  flex-direction: column;
  background-color: @color-bg-page;
  .legal-header {
    height: @header-height;
    border-bottom: 1px solid @color-border;
    display: flex;
    align-items: center;
    padding: 0 @space-6;
    .brand {
      display: flex;
      align-items: center;
      gap: @space-2;
      cursor: pointer;
      img {
        width: 24px;
      }
      span {
        font-weight: 700;
        color: @color-text-primary;
      }
    }
  }
  .legal-main {
    flex: 1;
    padding: @space-8 @space-4 0;
  }
  .legal-footer {
    border-top: 1px solid @color-border;
    padding: @space-5 @space-6;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: @space-2;
    font-size: 0.8rem;
    color: @color-text-secondary;
    .links {
      display: flex;
      gap: @space-1-5;
      .link {
        cursor: pointer;
        &:hover {
          color: @color-primary;
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
