<template>
  <div class="page-wrap-header-theme">
    <app-tooltip
      :content="t('layout.tooltip.theme')"
      placement="bottom"
      :show-after="300"
      :disabled="!popoverVisable"
    >
      <el-dropdown
        ref="dropdownRef"
        placement="bottom-end"
        trigger="click"
        @command="handleChangeTheme"
        @visible-change="handleVisibleChange"
      >
        <button
          type="button"
          class="theme square-line"
          :aria-label="t('layout.tooltip.theme')"
          aria-haspopup="menu"
          :aria-expanded="dropdownOpen ? 'true' : 'false'"
          @keydown.escape.prevent="closeDropdown"
        >
          <el-icon size="18">
            <i-carbon-sun />
          </el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="theme in THEMES_OPTIONS"
              :key="theme.value"
              :command="theme.value"
              :disabled="theme.value === mode"
            >
              <span>
                <el-icon size="18">
                  <i-carbon-light v-if="theme.value === THEMES.LIGHT" />
                  <i-carbon-moon v-if="theme.value === THEMES.DARK" />
                  <i-carbon-partly-cloudy v-if="theme.value === THEMES.SYSTEM" />
                </el-icon>
                {{ t(theme.themeKey) }}
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </app-tooltip>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "HeaderTheme" });

// 引入常量
import { THEMES, THEMES_OPTIONS } from "@/constants";

// 引入子组件

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { ref } from "vue";

// 引入主题模式类型
import type { Theme } from "@/constants";

// 引入明暗模式开关（模块级单例）
import { useColorMode } from "@/composables";
const { mode, setMode } = useColorMode();

// 控制提示工具是否起作用
const popoverVisable = ref<boolean>(true);

// 下拉菜单展开状态：供按钮 aria-expanded 使用
const dropdownOpen = ref<boolean>(false);
const dropdownRef = ref<{ handleClose: () => void } | null>(null);

/** Esc 收起下拉，焦点留在触发按钮上 */
const closeDropdown = (): void => {
  dropdownRef.value?.handleClose();
};

// 切换主题触发按钮
const handleChangeTheme = (value: string): void => {
  setMode(value as Theme);
};

// 下拉菜单出现时，控制提示文字的显示与否
const handleVisibleChange = (visible: boolean): void => {
  dropdownOpen.value = visible;
  if (visible) {
    popoverVisable.value = false;
  } else {
    setTimeout(() => {
      popoverVisable.value = true;
    }, 300);
  }
};
</script>

<style scoped lang="less">
.theme {
  background: transparent;
  color: inherit;
  font: inherit;
}
</style>
