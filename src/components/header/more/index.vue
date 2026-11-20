<template>
  <div class="page-wrap-header-more">
    <button
      type="button"
      class="square-line"
      :aria-label="t('menuCenter.more')"
      aria-haspopup="dialog"
      :aria-expanded="drawerVisible ? 'true' : 'false'"
      @click="drawerVisible = true"
    >
      <el-icon size="18"><i-carbon-overflow-menu-horizontal /></el-icon>
    </button>
    <app-drawer
      v-model="drawerVisible"
      direction="rtl"
      :size="'var(--sidebar-width, 200px)'"
      :with-header="false"
      :title="t('menuCenter.more')"
    >
      <div class="more-content">
        <HeaderNotice @navigate="drawerVisible = false" />
        <HeaderLang />
        <HeaderTheme />
        <HeaderStyleCustomize />
      </div>
    </app-drawer>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "HeaderMore" });

// 引入子组件
import HeaderNotice from "@/components/header/actions/header-notice/index.vue";
import HeaderLang from "@/components/header/actions/header-lang/index.vue";
import HeaderTheme from "@/components/header/actions/header-theme/index.vue";
import HeaderStyleCustomize from "@/components/header/actions/header-style-customize/index.vue";

import { useI18n } from "vue-i18n";
import { ref } from "vue";

const { t } = useI18n();
const drawerVisible = ref<boolean>(false);

</script>

<style scoped lang="less">
.page-wrap-header-more {
  .square-line {
    border: 0;
    padding: 0;
    background: transparent;
    color: inherit;
  }

  .more-content {
    display: grid;
    grid-template-columns: repeat(2, auto);
    gap: @space-5;
    row-gap: @space-12;
    margin-top: @space-3;
    justify-items: center;

    .responsive-icon-size();
  }
}
</style>
