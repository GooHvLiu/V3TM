<template>
  <div class="orphan-block">
    <div class="block-head">
      <span class="block-title">{{ t("knowledgeCenter.orphan.title") }}</span>
      <span class="block-tip">{{ t("knowledgeCenter.orphan.tip") }}</span>
    </div>
    <el-table
      :data="orphans"
      size="small"
      :empty-text="t('knowledgeCenter.orphan.empty')"
      :scrollbar-always-on="isMobile"
    >
      <el-table-column prop="file" :label="t('knowledgeCenter.orphan.file')" min-width="260" show-overflow-tooltip />
      <el-table-column prop="contentType" :label="t('knowledgeCenter.detail.contentType')" width="90" />
      <el-table-column :label="t('knowledgeCenter.orphan.size')" width="110">
        <template #default="{ row }">
          {{ formatSize(row.size) }}
        </template>
      </el-table-column>
      <el-table-column :label="t('knowledgeCenter.orphan.time')" width="160">
        <template #default="{ row }">
          {{ formatTime(row.mtime) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "KnowledgeOrphanTable" });

import { useI18n } from "vue-i18n";
import type { AdminOrphanFile } from "@/types/help/admin";
import { useBreakpoint } from "@/composables";
import { formatSize, formatTime } from "@/pages/super-admin/knowledge-center/status";

defineProps<{
  orphans: AdminOrphanFile[];
}>();

const { t } = useI18n();
const { isMobile } = useBreakpoint();
</script>

<style scoped lang="less">
.orphan-block {
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

.block-tip {
  font-size: 12px;
  color: @color-text-secondary;
}

@media (max-width: @mobile-max) {
  .block-head {
    flex-wrap: wrap;
  }
}
</style>
