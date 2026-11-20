<template>
  <div class="page-wrap-orders">
    <BasicPage :title="t('route.projects.orders')" :description="t('common.placeholderDesc')">
      <template #actions>
        <app-button variant="outline">{{ t('common.cancel') }}</app-button>
        <app-button tone="primary">{{ t('common.submit') }}</app-button>
      </template>
      <template #content>
        <app-empty :description="t('common.underConstruction')" />
      </template>
    </BasicPage>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "Orders" });

// 加载通用骨架 base-page
import BasicPage from "@/components/page/basic/index.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

</script>

<style scoped lang="less"></style>
