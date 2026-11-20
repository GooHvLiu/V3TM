<template>
  <div class="page-wrap-header-styleCusomize">
    <span ref="triggerRef" class="customize-trigger">
      <app-tooltip
        :content="t('layout.tooltip.customize')"
        placement="bottom"
        :show-after="300"
        :disabled="customizeOpen"
      >
        <button
          type="button"
          class="customize square-line"
          :aria-label="t('layout.tooltip.customize')"
          aria-haspopup="dialog"
          :aria-expanded="customizeOpen ? 'true' : 'false'"
          @click.stop="toggleCustomize"
          @keydown.escape.prevent="closeCustomize"
        >
          <el-icon size="18">
            <i-carbon-paint-brush />
          </el-icon>
        </button>
      </app-tooltip>
    </span>
    <el-popover
      ref="popoverRef"
      v-model:visible="customizeOpen"
      trigger="click"
      :virtual-ref="triggerRef"
      virtual-triggering
      width="250"
      placement="bottom-end"
      :show-after="0"
      :hide-after="0"
      popper-class="custom-theme-popover"
      @show="handlePopoverShow"
      @hide="handlePopoverHide"
    >
      <div class="style-customize">
        <div class="top-one-tittle">
          <div class="name">
            <span>{{ t("theme.customize.customize") }}</span>
          </div>
          <div class="tip">
            <span>{{ t("theme.customize.titleTips") }}</span>
          </div>
        </div>
        <div class="top-two-customize">
          <!-- ① 主题色 -->
          <SegmentedOptionsBlock title-key="theme.customize.color">
            <SegmentedOptions
              grid
              :options="colorOptions"
              :model-value="customizeTheme"
              @update:model-value="themeStore.setCustomizeTheme"
            >
              <template #item="{ opt }">
                <span class="theme-color-dot" :style="{ backgroundColor: opt.primaryColor }" />
                {{ opt.label }}
              </template>
            </SegmentedOptions>
          </SegmentedOptionsBlock>
          <!-- ② 圆角 -->
          <SegmentedOptionsBlock title-key="theme.customize.radius.title">
            <SegmentedOptions
              :options="radiusOptions"
              :model-value="customizeRadius"
              @update:model-value="themeStore.setRadius"
            />
          </SegmentedOptionsBlock>
          <!-- ③ 明暗模式（与独立 header-theme 同一 useColorMode 单例，天然同步） -->
          <SegmentedOptionsBlock title-key="theme.customize.colorMode">
            <SegmentedOptions :options="modeOptions" :model-value="mode" @update:model-value="setMode">
              <template #item="{ opt }">
                <el-icon size="16">
                  <i-carbon-light v-if="opt.value === THEMES.LIGHT" />
                  <i-carbon-moon v-else-if="opt.value === THEMES.DARK" />
                  <i-carbon-partly-cloudy v-else />
                </el-icon>
                {{ opt.label }}
              </template>
            </SegmentedOptions>
          </SegmentedOptionsBlock>
          <!-- ④ 内容宽度 -->
          <SegmentedOptionsBlock title-key="theme.customize.content.title">
            <SegmentedOptions
              :options="contentOptions"
              :model-value="contentWidth"
              @update:model-value="themeStore.setContentWidth"
            />
          </SegmentedOptionsBlock>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "HeaderStyleCustomize" });

// 引入子组件
import SegmentedOptions from "@/components/common/segmented-options/options/index.vue";
import SegmentedOptionsBlock from "@/components/common/segmented-options/block/index.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

// 引入主题常量
import { THEMES, THEMES_OPTIONS, THEME_PRIMARY_COLORS, RADIUS_OPTIONS, CONTENT_OPTIONS } from "@/constants";

// 引入 Pinia Store 存储变量
import { useThemeStore } from "@/stores";
const themeStore = useThemeStore();

// 引入明暗模式（模块级单例，与 header-theme 共享）
import { useColorMode } from "@/composables";
const { mode, setMode } = useColorMode();

import { ref, computed, unref } from "vue";

// 切换样式的按钮别名

// 浮层展开状态：供按钮 aria-expanded 使用
const customizeOpen = ref<boolean>(false);
const popoverRef = ref<{ hide: () => void } | null>(null);
const triggerRef = ref<HTMLSpanElement | null>(null);

/** 触发按钮控制浮层显隐，键盘与鼠标走同一路径 */
const toggleCustomize = (): void => {
  customizeOpen.value = !customizeOpen.value;
};

/** Esc 收起浮层，焦点留在触发按钮上 */
const closeCustomize = (): void => {
  popoverRef.value?.hide();
};

// computed + unref 直读
const customizeTheme = computed(() => unref(themeStore.customizeTheme));
const customizeRadius = computed(() => unref(themeStore.customizeRadius));
const contentWidth = computed(() => unref(themeStore.contentWidth));

// 主题颜色 转换为 value label
const colorOptions = computed(() =>
  THEME_PRIMARY_COLORS.map((c) => ({ value: c.theme, label: c.theme, primaryColor: c.primaryColor }))
);
// 组件圆角 转换为 value label
const radiusOptions = computed(() => RADIUS_OPTIONS.map((r) => ({ value: r.value, label: t(r.labelKey) })));
// 明暗模式
const modeOptions = computed(() => THEMES_OPTIONS.map((m) => ({ value: m.value, label: t(m.themeKey) })));
// 内容宽度
const contentOptions = computed(() => CONTENT_OPTIONS.map((c) => ({ value: c.value, label: t(c.labelKey) })));

// popover显示的时候，记录展开状态
const handlePopoverShow = () => {
  customizeOpen.value = true;
};

// popover消失的时候，同步收起状态
const handlePopoverHide = () => {
  customizeOpen.value = false;
};
</script>

<style lang="less">
.page-wrap-header-styleCusomize {
  .customize-trigger {
    display: inline-flex;
    align-items: center;
  }

  .customize {
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
  }
}

.custom-theme-popover {
  .style-customize {
    display: flex;
    flex-direction: column;
    gap: @space-4;
    .top-one-tittle {
      display: flex;
      flex-direction: column;
      .name {
        font-size: 0.9rem;
        font-weight: 600;
      }
      .tip {
        font-size: 0.7rem;
      }
      gap: @space-4;
    }
    .top-two-customize {
      .theme-color-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
    }
  }
}
</style>
