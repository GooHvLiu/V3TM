<template>
  <div class="search-tablet">
    <app-tooltip
      :content="t('layout.tooltip.search')"
      placement="bottom"
      :show-after="300"
    >
      <button
        type="button"
        class="square-line"
        :class="{ 'is-hidden': needShow }"
        :aria-label="t('layout.tooltip.search')"
        :aria-expanded="needShow ? 'true' : 'false'"
        :aria-hidden="needShow"
        :tabindex="needShow ? -1 : 0"
        @click="handleOpen"
      >
        <el-icon size="18">
          <i-carbon-search />
        </el-icon>
      </button>
    </app-tooltip>
    <!-- 内联展开的搜索框（Transition 提供淡入滑动过渡） -->
    <div class="search-inline" :class="{ 'is-open': needShow }">
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
        @blur="collapseInline"
        @visible-change="handleVisibleChange"
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
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "HeaderSearchTablet" });

// 共享逻辑
import { useMenuSearch } from "./use-menu-search";

// 引入 vue 方法
import { ref, nextTick } from "vue";

const { t, keyword, filteredMenus, handleFilter, handleJump } = useMenuSearch();

// 内联搜索框显隐
const needShow = ref(false);

// el-select 实例（展开后自动聚焦）
const selectRef = ref<{ focus: () => void } | null>(null);

// 点击图标：显示内联搜索框并自动聚焦（聚焦即展开下拉，一次点击到位）
const handleOpen = (): void => {
  needShow.value = true;
  nextTick(() => selectRef.value?.focus());
};

// 失焦 → 隐藏内联搜索框（覆盖"未展开下拉就点空白"的情况）
const collapseInline = (): void => {
  if (needShow.value) needShow.value = false;
};

// 下拉收起（Esc/选中跳转）→ 同样隐藏
const handleVisibleChange = (visible: boolean): void => {
  if (!visible) collapseInline();
};
</script>

<style scoped lang="less">
.search-tablet {
  position: relative;
  .square-line {
    border: 0;
    padding: 0;
    background: transparent;
    color: inherit;
    transition: opacity 0.2s cubic-bezier(0.8, 0, 0.99, 0.01); /* 慢开始、快结束 */
    &.is-hidden {
      opacity: 0;
      pointer-events: none; /* 隐藏时不可点，防误触 */
    }
  }
  .search-inline {
    position: absolute;
    right: 0; /* 右侧固定，向左侧伸展 */
    /* 相对定位中配套使用居中 */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    opacity: 0;
    pointer-events: none;
    transition:
      width 0.3s ease,
      opacity 0.3s ease;

    &.is-open {
      width: 180px;
      opacity: 100%;
      pointer-events: auto;
    }
    .menu-search-select {
      width: 180px;
      :deep(.el-select__wrapper) {
        padding: @space-0-5 @space-2-5;
        border-radius: @radius-max;
        font-size: 1rem;
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
  }
}
</style>
