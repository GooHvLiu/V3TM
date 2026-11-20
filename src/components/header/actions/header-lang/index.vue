<template>
  <div class="page-wrap-header-lang">
    <app-tooltip
      :content="t('layout.tooltip.changeLang')"
      placement="bottom"
      :show-after="300"
      :disabled="!popoverVisable"
    >
      <el-dropdown
        ref="dropdownRef"
        placement="bottom-end"
        trigger="click"
        @command="handleChangeLang"
        @visible-change="handleVisibleChange"
      >
        <button
          type="button"
          class="lang square-line"
          :aria-label="t('layout.tooltip.changeLang')"
          aria-haspopup="menu"
          :aria-expanded="dropdownOpen ? 'true' : 'false'"
          @keydown.escape.prevent="closeDropdown"
        >
          <el-icon size="18">
            <i-carbon-translate />
          </el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="lang in LOCALE_OPTIONS"
              :key="lang.value"
              :command="lang.value"
              :disabled="lang.value === locale || switching"
            >
              <span class="flag-name">
                <el-icon size="18">
                  <i-custom-flag-zh-cn v-if="lang.value === LOCALES.ZH_CN" />
                  <i-custom-flag-en-us v-else-if="lang.value === LOCALES.EN_US" />
                </el-icon>
                {{ t(lang.labelKey) }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </app-tooltip>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "HeaderLang" });

// 引入常量
import { LOCALE_OPTIONS, LOCALES } from "@/constants";
import type { Locale } from "@/constants";
import { hasPermission } from "@/utils";
import { useUserStore } from "@/stores";
import { useConfigStore } from "@/stores/modules/config";
import { ElMessage } from "@/utils/element-plus";
import { translateMessage } from "@/utils/request";

// 引入子组件

import { useI18n } from "vue-i18n";
import { setLocale } from "@/locales";
const { t, locale } = useI18n();

import { ref } from "vue";

const userStore = useUserStore();
const configStore = useConfigStore();

/** 正在写库，避免连点造成两次写入 */
const switching = ref<boolean>(false);

/** 提示是否可触发：气泡展开期间关闭，避免遮挡 */
const popoverVisable = ref<boolean>(true);

/** 下拉菜单展开状态：供按钮 aria-expanded 使用 */
const dropdownOpen = ref<boolean>(false);
const dropdownRef = ref<{ handleClose: () => void } | null>(null);

/** Esc 收起下拉，焦点留在触发按钮上 */
const closeDropdown = (): void => {
  dropdownRef.value?.handleClose();
};

// 下拉语言选项被点击触发
const handleChangeLang = async (langValue: Locale): Promise<void> => {
  if (langValue === locale.value || switching.value) return;

  // 非管理员不带写权限：语言由管理员统一设置，本地不切
  if (!hasPermission(userStore.permissions, "systemSettings:config:update")) {
    ElMessage.warning(t("settings.lang.noPermission"));
    return;
  }

  switching.value = true;
  try {
    // 先落库，成功后才切界面：失败时当前语言原样保留
    await configStore.saveConfig({ key: "default_locale", value: langValue }, true);
    locale.value = langValue;
    setLocale(langValue);
    ElMessage.success(t("settings.lang.switched"));
  } catch (error) {
    const code = (error as Error)?.message ?? "";
    ElMessage.error(code ? translateMessage(code) : t("settings.lang.switchFailed"));
  } finally {
    switching.value = false;
  }
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
.flag-name {
  display: flex;
  align-items: center;
  gap: @space-1-5;
}

.lang {
  background: transparent;
  color: inherit;
  font: inherit;
}
</style>
