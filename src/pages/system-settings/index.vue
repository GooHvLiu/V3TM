<template>
  <div class="home-page-system-settings">
    <BasicPage :title="t('route.systemSettings')" :description="t('settings.pageDesc')">
      <template #content>
        <SettingsPanel scope="system" />
      </template>
    </BasicPage>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import BasicPage from "@/components/page/basic/index.vue";
import SettingsPanel from "@/components/settings/panel/index.vue";

defineOptions({ name: "SystemSettings" });

const { t } = useI18n();
</script>

<style scoped lang="less">
// 内容区不另起滚动，左侧导航才能贴住视口
:deep(.page-wrap-basic-page .content) {
  overflow: visible;
}
</style>
