<template>
  <div class="page-wrap-error">
    <ErrorPageComponent
      :code="errorPage.code"
      :subtitle="errorPage.subtitle"
      :description="errorPage.description"
      :go-back-label="t('error.goBack')"
      :back-home-label="t('error.backHome')"
    />
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "ErrorPage" });

// 引入子组件
import ErrorPageComponent from "@/components/page/error/index.vue";

// 引入常量
import { ERROR_CODES, FALLBACK_ERROR_CODE } from "@/constants";

import { useI18n } from "vue-i18n";
const { t, tm } = useI18n();

// 引入路由
import { useRoute } from "vue-router";
const route = useRoute();

// 引入数据类型
import type { ErrorPageType } from "@/types";

// 非法 code 一律兜底 404
const codeParam = route.params.code as string;
const resolvedCode: string = (ERROR_CODES as readonly string[]).includes(codeParam) ? codeParam : FALLBACK_ERROR_CODE;

// tm() 取结构化消息
const content = tm(`error.ERROR_${resolvedCode}`) as unknown as {
  subtitle: string;
  description: string;
};

const errorPage: ErrorPageType = {
  code: Number(resolvedCode),
  subtitle: content.subtitle,
  description: content.description
};
</script>

<style scoped lang="less">
.page-wrap-error {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: @color-bg-page;
}
</style>
