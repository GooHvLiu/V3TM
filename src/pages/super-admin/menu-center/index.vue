<template>
  <BasicPage :title="t(String(route.meta.title))" :description="t('menuCenter.description')">
    <template #actions>
      <el-dropdown trigger="click" @command="handleMoreCommand">
        <app-button variant="outline">
          {{ t("menuCenter.more") }}
          <el-icon class="el-icon--right">
            <ArrowDown />
          </el-icon>
        </app-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="expand" :disabled="activeTab !== 'tree'">
              <el-icon>
                <Refresh v-if="expandedKeys.length" />
                <Refresh v-else />
              </el-icon>
              {{ expandActionLabel }}
            </el-dropdown-item>
            <el-dropdown-item command="refresh" :disabled="treeLoading || deletedLoading" divided>
              <el-icon><Refresh /></el-icon>
              {{ t("menuCenter.refresh") }}
            </el-dropdown-item>
            <el-dropdown-item command="sync" :disabled="syncing">
              <el-icon><RefreshRight /></el-icon>
              {{ t("menuCenter.sync") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <app-button v-permission="'superAdmin:menu:create'" tone="primary" @click="openCreate(0)">
        <el-icon class="menu-center-btn-icon">
          <Plus />
        </el-icon>
        {{ t("menuCenter.createTop") }}
      </app-button>
    </template>

    <template #content>
      <div class="menu-center-page">
        <app-tabs
          v-model="activeTab"
          :items="tabItems"
          class="menu-center-tabs"
          @tab-change="handleTabChange"
        >
          <template #label="{ item }">
            <span v-if="item.value === 'recycle' && deletedList.length" class="menu-center-tab-label">
              {{ item.label }}
              <span class="menu-center-tab-count">{{ deletedList.length }}</span>
            </span>
            <span v-else>{{ item.label }}</span>
          </template>

          <template #content="{ item }">
            <MenuTreePanel
              v-if="item.value === 'tree'"
              :ref="setTreePanelRef"
              v-model:keyword="keyword"
              v-model:type-filter="typeFilter"
              v-model:status-filter="statusFilter"
              :visible-rows="visibleRows"
              :tree="treeData"
              :expanded-keys="expandedKeys"
              :table-max-height="tableMaxHeight"
              :count-text="countText"
              :loading="treeLoading"
              @expand-change="handleExpandChange"
              @cell-click="handleCellClick"
              @create="openCreate"
              @edit="openEdit"
              @remove="handleDelete"
              @sort="commitSort"
            />

            <MenuRecyclePanel
              v-else
              :deleted="deletedList"
              :loading="deletedLoading"
              :tree="treeData"
              @restore="handleRestore"
            />
          </template>
        </app-tabs>

        <MenuForm
          v-model="drawerVisible"
          :mode="drawerMode"
          :menu="drawerMenu"
          :tree="treeData"
          :parent-id="drawerParentId"
          @success="handleFormSuccess"
        />
      </div>
    </template>
  </BasicPage>
</template>

<script setup lang="ts">
defineOptions({ name: "MenuCenter" });

import { computed } from "vue";
import { useRoute } from "vue-router";
import { ArrowDown, Plus, Refresh, RefreshRight } from "@element-plus/icons-vue";
import BasicPage from "@/components/page/basic/index.vue";
import MenuForm from "@/components/menu-form/index.vue";
import MenuTreePanel from "@/components/menu-center/menu-tree-panel/index.vue";
import MenuRecyclePanel from "@/components/menu-center/menu-recycle-panel/index.vue";
import { useMenuCenter } from "./use-menu-center";

const route = useRoute();

const {
  t,
  activeTab,
  treeData,
  treeLoading,
  deletedList,
  deletedLoading,
  keyword,
  typeFilter,
  statusFilter,
  expandedKeys,
  syncing,
  tableMaxHeight,
  setTreePanelRef,
  drawerVisible,
  drawerMode,
  drawerMenu,
  drawerParentId,
  visibleRows,
  countText,
  expandActionLabel,
  handleMoreCommand,
  handleTabChange,
  handleExpandChange,
  handleCellClick,
  openCreate,
  openEdit,
  handleFormSuccess,
  commitSort,
  handleDelete,
  handleRestore
} = useMenuCenter();

const tabItems = computed<{ value: "tree" | "recycle"; label: string }[]>(() => [
  { value: "tree", label: t("menuCenter.tabTree") },
  { value: "recycle", label: t("menuCenter.tabRecycle") }
]);

</script>

<style scoped lang="less">
.menu-center-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  gap: @space-2-5;
  // 不锁死 100%：树表撑高时由 BasicPage 的 .content 负责滚动，
  // 锁定高度会被 el-tabs__content 的 overflow:hidden 裁掉下半部分
  .menu-center-tabs {
    display: flex;
    flex-direction: column;
  }
  .menu-center-btn-icon {
    margin-right: @space-1;
    font-size: 14px;
    vertical-align: -2px;
  }
  .menu-center-tab-label {
    display: inline-flex;
    align-items: center;
    gap: @space-1-5;
  }
  .menu-center-tab-count {
    min-width: 18px;
    height: 18px;
    padding: 0 @space-1;
    border-radius: @radius-max;
    background: @color-bg-hover;
    color: @color-text-regular;
    font-size: 0.72rem;
    line-height: 18px;
    text-align: center;
  }
}
</style>
