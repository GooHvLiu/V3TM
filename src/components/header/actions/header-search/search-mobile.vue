<template>
  <div class="search-mobile">
    <app-tooltip
      :content="t('layout.tooltip.search')"
      placement="bottom"
      :show-after="300"
    >
      <button
        type="button"
        class="square-line"
        :aria-label="t('layout.tooltip.search')"
        aria-haspopup="dialog"
        :aria-expanded="mobileSearchVisible ? 'true' : 'false'"
        @click="handleOpen"
      >
        <el-icon size="18">
          <i-carbon-search />
        </el-icon>
      </button>
    </app-tooltip>

    <!-- 磨砂搜索层：半透明遮罩能看到后面内容；点击遮罩自动关闭（close-on-click-modal 默认） -->
    <el-dialog
      v-model="mobileSearchVisible"
      :show-close="false"
      modal-class="mobile-search-mask"
      class="mobile-search-dialog"
      :title="t('layout.tooltip.search')"
    >
      <!-- 放大版搜索框：与桌面同款 el-select（filterable + prefix 图标 + focus 光晕） -->
      <el-select
        ref="selectRef"
        v-model="keyword"
        class="mobile-search-select"
        filterable
        :placeholder="t('layout.search.placeholder')"
        :aria-label="t('layout.search.placeholder')"
        :filter-method="handleFilter"
        popper-class="menu-search-popper mobile-popper"
        @change="handleJumpMobile"
      >
        <template #prefix>
          <el-icon size="20">
            <i-carbon-search />
          </el-icon>
        </template>
        <el-option v-for="item in filteredMenus" :key="item.path" :value="item.path" :label="t(item.nameKey)">
          <span>{{ t(item.nameKey) }}</span>
        </el-option>
        <!-- 无匹配结果 -->
        <template #empty>
          <span>{{ t("layout.search.empty") }}</span>
        </template>
      </el-select>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "HeaderSearchMobile" });

// 共享逻辑
import { useMenuSearch } from "./use-menu-search";

// 引入 vue 方法
import { ref, nextTick } from "vue";

const { t, keyword, filteredMenus, handleFilter, handleJump } = useMenuSearch();

// 磨砂搜索层显隐
const mobileSearchVisible = ref(false);

// el-select 实例（打开后自动聚焦）
const selectRef = ref<{ focus: () => void } | null>(null);

// 点击图标：打开磨砂层并聚焦
const handleOpen = (): void => {
  mobileSearchVisible.value = true;
  nextTick(() => selectRef.value?.focus());
};

// 选中跳转：共享跳转 + 关闭磨砂层
const handleJumpMobile = (path: string): void => {
  handleJump(path);
  mobileSearchVisible.value = false;
};
</script>

<style scoped lang="less">
.search-mobile {
  .square-line {
    border: 0;
    padding: 0;
    background: transparent;
    color: inherit;
  }
}

:deep(.mobile-search-mask) {
  backdrop-filter: blur(10px);
  background: color-mix(in srgb, var(--color-bg-container), transparent 50%);
}

:deep(.mobile-search-dialog) {
  width: 100%;
  max-width: none;
  margin-top: 10vh;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: @space-4;
  }
}

:deep(.mobile-search-select) {
  width: 100%;
  .el-select__wrapper {
    height: 52px;
    padding: @space-1 @space-4;
    border-radius: @radius-max;
    font-size: 1rem;
    .el-select__placeholder {
      font-size: 1rem;
    }
    .el-select__caret {
      display: none;
    }
  }
  .el-select__wrapper:focus-within {
    box-shadow: 0 0 12px -2px color-mix(in srgb, var(--color-primary), transparent 60%);
  }
}

:deep(.menu-search-popper.mobile-popper) {
  z-index: 3000;
  .el-select-dropdown__item {
    font-size: 1rem;
    padding: @space-3 @space-4;
  }
}
</style>
