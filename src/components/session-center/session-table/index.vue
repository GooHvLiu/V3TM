<template>
  <ProTable
    ref="tableRef"
    :columns="columns"
    :data="list"
    :loading="loading"
    :total="total"
    :page="page"
    :page-size="pageSize"
    :column-visibility="columnVisibility"
    :density="density"
    show-selection
    show-toolbar
    @page-change="emit('page-change', $event)"
    @size-change="emit('size-change', $event)"
    @selection-change="emit('selection-change', $event)"
    @update:column-visibility="setColumnVisibility"
    @update:density="setDensity"
  >
    <template #cell-username="{ row }">
      <span>{{ row.username }}</span>
    </template>
    <template #cell-status="{ row }">
      <app-tag :type="statusMetaOf(row.status).tag" size="small" effect="plain">
        {{ t(statusMetaOf(row.status).text) }}
      </app-tag>
    </template>
    <template #cell-createdAt="{ row }">
      {{ formatDate(row.createdAt, "YYYY-MM-DD HH:mm") }}
    </template>
    <template #cell-expiresAt="{ row }">
      {{ formatDate(row.expiresAt, "YYYY-MM-DD HH:mm") }}
    </template>
    <template #cell-action="{ row }">
      <app-button
        v-permission="'superAdmin:session:revoke'"
        variant="link"
        tone="primary"
        :disabled="row.status !== 'active'"
        @click="emit('revoke', row)"
      >
        {{ t("sessionCenter.revoke") }}
      </app-button>
      <app-button v-permission="'superAdmin:session:revoke'" variant="link" tone="danger" @click="emit('force', row)">
        {{ t("sessionCenter.force") }}
      </app-button>
    </template>
  </ProTable>
</template>

<script setup lang="ts">
defineOptions({ name: "SessionTable" });

import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import ProTable from "@/components/common/table/pro-table/index.vue";
import type { ProTableColumn } from "@/components/common/table/pro-table/types";
import { formatDate } from "@/utils";
import { useTablePreferences } from "@/composables";
import type { SessionItem, SessionStatus } from "@/types";
import { SESSION_STATUS } from "@/pages/super-admin/session-center/status";

defineProps<{
  list: SessionItem[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "page-change", value: number): void;
  (e: "size-change", value: number): void;
  (e: "selection-change", rows: SessionItem[]): void;
  (e: "revoke", row: SessionItem): void;
  (e: "force", row: SessionItem): void;
}>();

const { t } = useI18n();

/** 会话状态元信息：插槽 row 为 any，经参数类型收窄后再索引映射表 */
const statusMetaOf = (status: SessionStatus) => SESSION_STATUS[status];

const columns = computed<ProTableColumn[]>(() => [
  { prop: "id", label: t("sessionCenter.columns.id"), width: 70, fixed: "left" },
  { prop: "username", label: t("sessionCenter.columns.username"), minWidth: 150, showOverflowTooltip: true },
  { prop: "status", label: t("sessionCenter.columns.status"), width: 110 },
  { prop: "createdAt", label: t("sessionCenter.columns.createdAt"), minWidth: 150 },
  { prop: "expiresAt", label: t("sessionCenter.columns.expiresAt"), minWidth: 150 },
  { prop: "action", label: t("sessionCenter.columns.action"), width: 160, align: "center", fixed: "right" }
]);

// 列显隐与行密度由表格偏好记忆
const { columnVisibility, density, setColumnVisibility, setDensity } = useTablePreferences(
  "super-admin/session-center",
  () => columns.value
);

const tableRef = ref<{ clearSelection: () => void }>();

defineExpose({
  clearSelection: (): void => tableRef.value?.clearSelection()
});
</script>
