<template>
  <div class="custom-error">
    <h1 class="error-code">
      <span v-for="(char, i) in String(code)" :key="i" class="code-digit" :style="{ animationDelay: `${i * 0.15}s` }">
        {{ char }}</span>
    </h1>
    <h2 class="error-subtitle">{{ subtitle }}</h2>
    <p class="error-description">{{ description }}</p>
    <footer class="error-footer">
      <app-button class="error-btn" variant="outline" @click="router.back()">{{ goBackLabel }}</app-button>
      <app-button class="error-btn" tone="primary" @click="router.push(homePath)">{{ backHomeLabel }}</app-button>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "ErrorPageComponent" });

// 引入常量（回首页路径）
import { LAYOUT } from "@/constants";
import AppButton from "@/components/common/base/app-button/index.vue";

// 引入路由
import { useRouter } from "vue-router";
const router = useRouter();

// Props：纯 UI 组件，收已翻译好的字符串
defineProps<{
  code: number;
  subtitle: string;
  description: string;
  goBackLabel: string;
  backHomeLabel: string;
}>();

// 回首页路径
const homePath = LAYOUT.ROOT;
</script>

<style scoped lang="less">
.custom-error {
  text-align: center;
  padding: @space-6;

  .error-code {
    font-size: 6rem;
    font-weight: 900;
    line-height: 1;
    color: @color-text-primary;
    margin-bottom: @space-4;
    display: flex;
    justify-content: center;
    gap: @space-1;
    .code-digit {
      display: inline-block;
      animation: float-up 0.6s ease-out both;
      &:hover {
        animation: wiggle 0.4s ease-in-out;
      }
    }
  }
  .error-subtitle {
    font-size: 1.5rem;
    font-weight: 700;
    color: @color-text-primary;
    margin-bottom: @space-3;
    animation: fade-in 0.5s ease-out 0.4s both;
  }
  .error-description {
    font-size: 0.875rem;
    color: @color-text-secondary;
    line-height: 1.7;
    max-width: 440px;
    margin: 0 auto 24px;
    animation: fade-in 0.5s ease-out 0.5s both;
  }
  .error-footer {
    display: flex;
    justify-content: center;
    gap: @space-3;
    animation: fade-in 0.5s ease-out 0.6s both;
    .error-btn {
      min-width: 120px;
      transition: transform 0.2s ease;
      &:hover {
        transform: translateY(-2px);
      }
      &:active {
        transform: translateY(0);
      }
    }
  }
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
