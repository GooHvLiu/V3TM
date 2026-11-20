<template>
  <div class="search-desktop">
    <el-select
      ref="selectRef"
      v-model="keyword"
      class="menu-search-select"
      filterable
      :placeholder="t('layout.search.placeholder')"
      :aria-label="t('layout.search.placeholder')"
      :filter-method="handleFilter"
      popper-class="menu-search-popper"
      @change="handleJump"
    >
      <template #prefix>
        <el-icon size="18">
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
    <!-- kbd 提示：绝对定位覆盖在输入框右侧（filterable 下 suffix 插槽不可靠，脱离插槽机制） -->
    <div class="shortcut-hint"><kbd>Ctrl</kbd> <kbd>k</kbd></div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "HeaderSearchDesktop" });

// 共享逻辑（注入 + 拍平 + 过滤 + 跳转）
import { useMenuSearch } from "./use-menu-search";

// 引入 vue 方法
import { ref, onMounted, onBeforeUnmount } from "vue";

const { t, isDesktop, keyword, filteredMenus, handleFilter, handleJump } = useMenuSearch();

// el-select 实例（Ctrl+K 聚焦用）
const selectRef = ref<{ focus: () => void } | null>(null);

// Ctrl / Cmd + K：全局快捷键聚焦（仅桌面态响应）
const onGlobalKeydown = (e: KeyboardEvent): void => {
  if (!isDesktop.value) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    selectRef.value?.focus();
  }
};

onMounted(() => {
  window.addEventListener("keydown", onGlobalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onGlobalKeydown);
});
</script>

<style scoped lang="less">
.search-desktop {
  position: relative;
  .menu-search-select {
    width: 180px;
    :deep(.el-select__wrapper) {
      padding: @space-0-5 @space-2-5;
      border-radius: @radius-max;
      .el-select__placeholder {
        font-size: 0.7rem;
      }
      .el-select__caret {
        display: none;
      }
    }
    :deep(.el-select__wrapper:focus-within) {
      box-shadow: 0 0 12px -2px color-mix(in srgb, var(--color-primary), transparent 60%);
    }
  }
  /* kbd 提示：覆盖在输入框右侧，不参与 el-select 内部布局 */
  .shortcut-hint {
    color: @color-text-secondary;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none; /* 不挡输入与点击 */
    z-index: 1;
    kbd {
      font-size: 0.7rem;
      font-weight: 600;
      padding: @space-0-5 @space-1-5;

      margin-right: @space-0-5;
      border-radius: @radius-base;
      background-color: @color-bg-hover;
    }
  }
}
</style>
