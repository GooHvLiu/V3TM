<template>
  <aside class="locale-panel">
    <div class="panel-head">
      <span class="panel-title">{{ t("knowledgeCenter.locale.title") }}</span>
      <span class="panel-hint">{{ t("knowledgeCenter.locale.rightClickTip") }}</span>
    </div>
    <div class="locale-list" role="menu" tabindex="0" @contextmenu.prevent="handleBlankMenu">
      <div
        v-for="item in locales"
        :key="item.locale"
        class="locale-item"
        role="menuitem"
        tabindex="0"
        :class="{ 'is-active': item.locale === activeLocale }"
        @click="handleSelect(item.locale)"
        @keydown.enter.prevent="handleSelect(item.locale)"
        @contextmenu.prevent.stop="handleItemMenu($event, item.locale)"
      >
        <div class="locale-main">
          <span class="locale-code">{{ item.locale }}</span>
          <span class="locale-name">{{ item.title || item.dirName }}</span>
        </div>
        <div class="locale-side">
          <span class="locale-count">{{ item.docCount }}</span>
          <app-tag size="small" :type="manifestTone(item)">
            {{ t(manifestLabelKey(item)) }}
          </app-tag>
        </div>
      </div>
      <app-empty v-if="!locales.length" :image-size="64" :description="t('knowledgeCenter.locale.missing')" />
    </div>
  </aside>
</template>

<script setup lang="ts">
defineOptions({ name: "KnowledgeLocalePanel" });

import { useI18n } from "vue-i18n";
import type { AdminLocaleItem } from "@/types/help/admin";
import type { StatusTone } from "@/pages/super-admin/knowledge-center/status";
import { manifestLabelKey } from "@/pages/super-admin/knowledge-center/status";

defineProps<{
  locales: AdminLocaleItem[];
  activeLocale: string;
}>();

const emit = defineEmits<{
  (e: "select", locale: string): void;
  (e: "menu", event: MouseEvent, locale: string): void;
}>();

const { t } = useI18n();

const manifestTone = (item: AdminLocaleItem): StatusTone => {
  if (!item.manifestExists) return "info";
  if (!item.manifestValid) return "danger";
  return "success";
};

const handleSelect = (locale: string): void => emit("select", locale);

const handleBlankMenu = (event: MouseEvent): void => emit("menu", event, "");

const handleItemMenu = (event: MouseEvent, locale: string): void => emit("menu", event, locale);
</script>

<style scoped lang="less">
.locale-panel {
  display: flex;
  flex-direction: column;
  width: 260px;
  flex-shrink: 0;
  border: 1px solid @color-border-lighter;
  border-radius: @radius-base;
  background: @color-bg-container;
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: @space-2-5 @space-3;
  border-bottom: 1px solid @color-border-lighter;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: @color-text-primary;
}

.panel-hint {
  font-size: 12px;
  color: @color-text-placeholder;
}

.locale-list {
  flex: 1;
  padding: @space-1-5;
  overflow: auto;
}

.locale-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-2;
  padding: @space-2 @space-2-5;
  border-radius: @radius-sm;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: @color-bg-hover;
  }

  &.is-active {
    /* 与表格选中行同源：极淡主色底 + 左侧主色条，深色文字对比度不被底色吃掉 */
    background: var(--el-color-primary-light-9);
    box-shadow: inset 2px 0 0 var(--color-primary, #3370ff);
  }
}

.locale-main {
  display: flex;
  flex-direction: column;
  gap: @space-1;
  min-width: 0;
}

.locale-code {
  font-size: 13px;
  font-weight: 600;
  color: @color-text-primary;
}

.locale-name {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: @color-text-secondary;
}

.locale-side {
  display: flex;
  align-items: center;
  gap: @space-1-5;
  flex-shrink: 0;
}

.locale-count {
  font-size: 12px;
  color: @color-text-secondary;
}

@media (max-width: @mobile-max) {
  .locale-panel {
    width: 100%;
    max-height: 220px;
  }
}
</style>
