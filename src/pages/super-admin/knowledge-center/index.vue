<script setup lang="ts">
defineOptions({ name: "KnowledgeCenter" });

import { useRoute } from "vue-router";
import BasicPage from "@/components/page/basic/index.vue";
import DocDrawer from "@/components/knowledge-center/doc-drawer/index.vue";
import SlotCreateDialog from "@/components/knowledge-center/slot-create-dialog/index.vue";
import KnowledgeLocalePanel from "@/components/knowledge-center/locale-panel/index.vue";
import KnowledgeSlotOverview from "@/components/knowledge-center/slot-overview/index.vue";
import KnowledgeDocTree from "@/components/knowledge-center/doc-tree/index.vue";
import KnowledgeOrphanTable from "@/components/knowledge-center/orphan-table/index.vue";
import { useKnowledgeCenter } from "./use-knowledge-center";

const route = useRoute();

const {
  t,
  locales,
  activeLocale,
  slots,
  loading,
  localeLoading,
  reindexing,
  keyword,
  menu,
  drawerVisible,
  activeDocKey,
  createVisible,
  initVisible,
  initLoading,
  initForm,
  setInitFormRef,
  initRules,
  renameVisible,
  renameLoading,
  renameForm,
  setRenameFormRef,
  renameRules,
  treeData,
  menuEntries,
  handleRefresh,
  switchLocale,
  openMenu,
  handleKeyword,
  handleNodeClick,
  submitInit,
  handleReindex,
  submitRename,
  runMenu
} = useKnowledgeCenter();
</script>

<template>
  <BasicPage :title="t(String(route.meta.title))" :description="t('knowledgeCenter.locale.title')">
    <template #actions>
      <app-button :loading="loading || localeLoading" variant="outline" @click="handleRefresh">
        {{ t("knowledgeCenter.action.refresh") }}
      </app-button>
      <app-button v-permission="'superAdmin:help:reindex'" :loading="reindexing" variant="outline" @click="handleReindex">
        {{ t("knowledgeCenter.action.reindex") }}
      </app-button>
      <app-button
        v-permission="'superAdmin:help:slot:manage'"
        tone="primary"
        :disabled="!activeLocale || !slots?.manifestExists"
        @click="createVisible = true"
      >
        {{ t("knowledgeCenter.action.create") }}
      </app-button>
    </template>

    <template #content>
      <div v-loading="loading || localeLoading" class="knowledge-layout">
        <KnowledgeLocalePanel
          :locales="locales"
          :active-locale="activeLocale"
          @select="switchLocale"
          @menu="openMenu"
        />

        <main class="main-panel">
          <template v-if="slots">
            <KnowledgeSlotOverview :slots="slots" />

            <KnowledgeDocTree
              :title="slots.title || activeLocale"
              :nodes="treeData"
              :keyword="keyword"
              @update:keyword="handleKeyword"
              @node-click="handleNodeClick"
            />

            <KnowledgeOrphanTable :orphans="slots.orphans" />
          </template>

          <app-empty v-else :description="t('knowledgeCenter.tree.empty')" />
        </main>
      </div>

      <ul v-if="menu.visible" class="context-menu" :style="{ left: `${menu.x}px`, top: `${menu.y}px` }">
        <li
          v-for="entry in menuEntries"
          :key="entry.key"
          class="context-menu-item"
          role="menuitem"
          tabindex="0"
          :class="{ 'is-disabled': entry.disabled }"
          @click.stop="runMenu(entry)"
          @keydown.enter.prevent.stop="runMenu(entry)"
        >
          {{ t(entry.labelKey) }}
        </li>
      </ul>

      <DocDrawer
        v-model="drawerVisible"
        :locale="activeLocale"
        :doc-key="activeDocKey"
        @refresh="handleRefresh"
      />
      <SlotCreateDialog v-model="createVisible" :locale="activeLocale" :slots="slots" @created="handleRefresh" />

      <app-dialog v-model="initVisible" :title="t('knowledgeCenter.locale.initTitle')" width="460px">
        <el-form :ref="setInitFormRef" :model="initForm" :rules="initRules" label-width="96px">
          <el-form-item :label="t('knowledgeCenter.locale.initLocale')" prop="locale">
            <el-input v-model="initForm.locale" :placeholder="t('knowledgeCenter.locale.initLocalePlaceholder')" />
          </el-form-item>
          <el-form-item :label="t('knowledgeCenter.locale.initName')">
            <el-input v-model="initForm.title" :placeholder="t('knowledgeCenter.locale.initNamePlaceholder')" />
          </el-form-item>
        </el-form>
        <div class="init-tip">
          {{ t("knowledgeCenter.locale.initTip") }}
        </div>
        <template #footer>
          <app-button variant="outline" @click="initVisible = false">
            {{ t("common.cancel") }}
          </app-button>
          <app-button tone="primary" :loading="initLoading" @click="submitInit">
            {{ t("common.confirm") }}
          </app-button>
        </template>
      </app-dialog>

      <app-dialog v-model="renameVisible" :title="t('knowledgeCenter.locale.renameTitle')" width="460px">
        <el-form :ref="setRenameFormRef" :model="renameForm" :rules="renameRules" label-width="96px">
          <el-form-item :label="t('knowledgeCenter.locale.renameLocale')" prop="newLocale">
            <el-input v-model="renameForm.newLocale" :placeholder="t('knowledgeCenter.locale.renameLocalePlaceholder')" />
          </el-form-item>
          <el-form-item :label="t('knowledgeCenter.locale.renameName')">
            <el-input v-model="renameForm.title" :placeholder="t('knowledgeCenter.locale.renameNamePlaceholder')" />
          </el-form-item>
        </el-form>
        <div class="init-tip">
          {{ t("knowledgeCenter.locale.renameTip") }}
        </div>
        <template #footer>
          <app-button variant="outline" @click="renameVisible = false">
            {{ t("common.cancel") }}
          </app-button>
          <app-button tone="primary" :loading="renameLoading" @click="submitRename">
            {{ t("common.confirm") }}
          </app-button>
        </template>
      </app-dialog>
    </template>
  </BasicPage>
</template>

<style scoped lang="less">
.knowledge-layout {
  display: flex;
  gap: @space-4;
  min-height: 520px;
}

.context-menu {
  position: fixed;
  z-index: 3000;
  min-width: 168px;
  padding: @space-1;
  margin: 0;
  list-style: none;
  border: 1px solid @color-border-light;
  border-radius: @radius-base;
  background: @color-bg-container;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.context-menu-item {
  padding: @space-1-5 @space-2-5;
  font-size: 13px;
  line-height: 1.4;
  border-radius: @radius-sm;
  cursor: pointer;
  color: @color-text-regular;

  &:hover {
    background: @color-bg-hover;
    color: @color-primary;
  }

  &.is-disabled {
    cursor: not-allowed;
    color: @color-text-disabled;

    &:hover {
      background: transparent;
      color: @color-text-disabled;
    }
  }
}

.main-panel {
  display: flex;
  flex-direction: column;
  gap: @space-3;
  flex: 1;
  min-width: 0;
}

@media (max-width: @mobile-max) {
  .knowledge-layout {
    flex-direction: column;
    min-height: 0;
  }
}

.init-tip {
  font-size: 12px;
  line-height: 1.6;
  color: @color-text-secondary;
}
</style>
