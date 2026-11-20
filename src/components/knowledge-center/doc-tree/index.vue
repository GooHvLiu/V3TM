<template>
  <div class="doc-tree">
    <div class="block-head">
      <span class="block-title">{{ title }}</span>
      <el-input
        :model-value="keyword"
        class="search-input"
        :placeholder="t('knowledgeCenter.tree.search')"
        clearable
        @update:model-value="handleKeyword"
      />
    </div>
    <el-tree
      :data="nodes"
      node-key="key"
      :props="{ label: 'title', children: 'children' }"
      default-expand-all
      :expand-on-click-node="false"
      :empty-text="keyword ? t('knowledgeCenter.tree.noMatch') : t('knowledgeCenter.tree.empty')"
      @node-click="handleNodeClick"
    >
      <template #default="{ data }">
        <div class="node-row" :class="`is-${data.type}`">
          <span class="node-title">{{ data.title }}</span>
          <template v-if="data.type === 'doc'">
            <app-tag size="small" :type="statusTone(data.status)">
              {{ statusLabel(data.status) }}
            </app-tag>
            <span class="node-file">{{ data.file }}</span>
          </template>
          <span v-else class="node-count">{{ data.children?.length || 0 }}</span>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "KnowledgeDocTree" });

import { useI18n } from "vue-i18n";
import type { AdminSectionNode, HelpDocStatus } from "@/types/help/admin";
import { DOC_STATUS } from "@/pages/super-admin/knowledge-center/status";
import type { StatusTone } from "@/pages/super-admin/knowledge-center/status";

defineProps<{
  title: string;
  nodes: AdminSectionNode[];
  keyword: string;
}>();

const emit = defineEmits<{
  (e: "update:keyword", value: string): void;
  (e: "node-click", data: Record<string, unknown>): void;
}>();

const { t } = useI18n();

const statusTone = (status: HelpDocStatus): StatusTone => DOC_STATUS[status].tone;
const statusLabel = (status: HelpDocStatus): string => t(DOC_STATUS[status].labelKey);

const handleKeyword = (value: string): void => emit("update:keyword", value);

const handleNodeClick = (data: Record<string, unknown>): void => {
  if (data.type !== "doc") return;
  emit("node-click", data);
};
</script>

<style scoped lang="less">
.doc-tree {
  display: flex;
  flex-direction: column;
  gap: @space-2-5;
  padding: @space-3;
  border: 1px solid @color-border-lighter;
  border-radius: @radius-base;
  background: @color-bg-container;
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-3;
}

.block-title {
  font-size: 13px;
  font-weight: 600;
  color: @color-text-primary;
}

.search-input {
  width: 240px;
}

.node-row {
  display: flex;
  align-items: center;
  gap: @space-2;
  width: 100%;
  padding-right: @space-2;
  font-size: 13px;
}

.node-title {
  color: @color-text-primary;
}

.node-row.is-section .node-title,
.node-row.is-chapter .node-title {
  font-weight: 600;
}

.node-file {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: @color-text-placeholder;
}

.node-count {
  font-size: 12px;
  color: @color-text-secondary;
}

@media (max-width: @mobile-max) {
  .search-input {
    width: 100%;
  }

  .block-head {
    flex-wrap: wrap;
  }
}
</style>
