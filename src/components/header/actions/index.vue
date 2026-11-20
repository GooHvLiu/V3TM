<template>
  <div class="page-wrap-header-actions">
    <HeaderSearch />
    <HeaderNotice v-if="!isMobile" />
    <HeaderLang v-if="!isMobile" />
    <HeaderTheme v-if="!isMobile" />
    <HeaderStyleCustomize v-if="!isMobile" />
    <HeaderMore v-if="isMobile" />
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "HeaderActions" });

// 引入composables
import { useBreakpoint } from "@/composables";
const { isMobile } = useBreakpoint();

// 引入子组件
import HeaderSearch from "./header-search/index.vue";
import HeaderNotice from "./header-notice/index.vue";
import HeaderLang from "./header-lang/index.vue";
import HeaderTheme from "./header-theme/index.vue";
import HeaderStyleCustomize from "./header-style-customize/index.vue";
import HeaderMore from "@/components/header/more/index.vue";

</script>

<style scoped lang="less">
.page-wrap-header-actions {
  display: flex;
  flex-direction: row;
  gap: @space-2-5;
  margin-right: @space-4;
  :deep(.square-line) {
    padding: @space-1-5;
    border: 1px solid @color-border;
    border-radius: @radius-lg;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .responsive-icon-size();
}
</style>
