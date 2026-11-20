<template>
  <div class="page-wrap-dict-data">
    <BasicPage :title="t('dicts.dataTitle')" :description="t('dicts.dataDescription')">
      <template #actions>
        <app-button v-if="hasTypeId" v-permission="'superAdmin:dict:update'" tone="primary" @click="handleCreate">
          {{ t("dicts.createData") }}
        </app-button>
      </template>
      <template #content>
        <template v-if="hasTypeId">
          <!-- 搜索区 -->
          <ProSearch
            :fields="searchFields"
            :model-value="query"
            @update:model-value="syncQuery"
            @search="search"
            @reset="search"
          />
          <ProTable
            :columns="columns"
            :data="list"
            :loading="loading"
            :error="error"
            :total="total"
            :page="page"
            :page-size="pageSize"
            :column-visibility="columnVisibility"
            :density="density"
            show-toolbar
            @page-change="changePage"
            @size-change="changePageSize"
            @update:column-visibility="setColumnVisibility"
            @update:density="setDensity"
          >
            <!-- 状态列 -->
            <template #cell-status="{ row }">
              <app-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                {{ row.status === 1 ? t("dicts.statusEnabled") : t("dicts.statusDisabled") }}
              </app-tag>
            </template>
            <!-- 时间列 -->
            <template #cell-createdAt="{ row }">
              {{ formatDate(row.createdAt, "YYYY-MM-DD") }}
            </template>
            <!-- 操作列：编辑 / 删除 -->
            <template #cell-action="{ row }">
              <app-button
                v-permission="'superAdmin:dict:update'"
                class="editBtn"
                variant="link"
                tone="primary"
                @click="handleEdit(row)"
              >
                {{ t("dicts.edit") }}
              </app-button>
              <app-button v-permission="'superAdmin:dict:update'" variant="link" tone="danger" @click="handleDelete(row)">
                {{ t("dicts.delete") }}
              </app-button>
            </template>
          </ProTable>
        </template>
        <!-- 无类型上下文：空态提示 -->
        <app-empty v-else :description="t('dicts.emptyType')" />
      </template>
    </BasicPage>
    <!-- 新增/编辑弹窗：typeId 为当前类型上下文 -->
    <DictDataForm
      v-model:visible="dialogVisible"
      :mode="formMode"
      :type-id="typeId"
      :initial-data="editingData"
      @submit-success="refresh"
    />
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "DictDate" });

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

// 引入子组件
import BasicPage from "@/components/page/basic/index.vue";
import ProTable from "@/components/common/table/pro-table/index.vue";
import type { ProTableColumn } from "@/components/common/table/pro-table/types";
import DictDataForm from "@/components/dict-center/dict-data-form/index.vue";
import ProSearch from "@/components/common/search/pro-search/index.vue";
import type { ProFormField } from "@/components/common/form/pro-form/types";

// 引入列表状态机
import { useTable, useTablePreferences, type PageQuery } from "@/composables";

// 引入 api 与类型
import { fetchDictItemList, deleteDictItem } from "@/api";
import type { DictItemInfo, DictItemQueryParams } from "@/types";

// 引入日期格式化
import { formatDate } from "@/utils";

// 引入消息提示
import { ElMessage, ElMessageBox } from "@/utils/element-plus";

const route = useRoute();

// 类型上下文：从路由 query 读取（dictType 页"字典项"按钮跳转携带）
const typeId = computed(() => Number(route.query.typeId));
const hasTypeId = computed(() => Number.isFinite(typeId.value) && typeId.value > 0);

// 搜索条件（keyword 关键字 + status 状态过滤）
const query = reactive<{ keyword: string; status: number | undefined }>({ keyword: "", status: undefined });

// 列表状态机
const { page, pageSize, total, list, loading, error, changePage, changePageSize, search, refresh } = useTable<
  DictItemQueryParams & PageQuery,
  DictItemInfo
>({
  fetcher: (params) => fetchDictItemList(params).then((data) => ({ list: data.list, total: data.total })),
  query: () => {
    const params: { keyword?: string; status?: number } = {};
    if (query.keyword) params.keyword = query.keyword;
    if (query.status !== undefined && query.status !== null) params.status = query.status;
    return { ...params, typeId: typeId.value };
  }
});

// 类型上下文变化（菜单/类型页切换）时重新拉取
watch(typeId, (val) => {
  if (val > 0) search();
});

// 列配置：computed 包裹，语言切换时列头跟随刷新
const columns = computed<ProTableColumn[]>(() => [
  { prop: "id", label: "ID", width: 64, fixed: "left" },
  { prop: "label", label: t("dicts.label"), minWidth: 120, showOverflowTooltip: true },
  { prop: "value", label: t("dicts.value"), minWidth: 120, showOverflowTooltip: true },
  { prop: "sort", label: t("dicts.sort"), width: 80 },
  { prop: "status", label: t("dicts.status"), width: 80 },
  { prop: "createdAt", label: t("dicts.createdAt"), minWidth: 130, showOverflowTooltip: true },
  { prop: "action", label: t("dicts.action"), width: 130, align: "center", fixed: "right" }
]);

// 列显隐与行密度由表格偏好记忆
const { columnVisibility, density, setColumnVisibility, setDensity } = useTablePreferences(
  "super-admin/dict-center/dict-date",
  () => columns.value
);

// —— 弹窗状态 ——
const dialogVisible = ref(false);
const formMode = ref<"create" | "edit">("create");
const editingData = ref<DictItemInfo>();

// 有类型上下文时首次进入拉取第 1 页
onMounted(() => {
  if (hasTypeId.value) refresh();
});

// —— 动作 ——
/** 新增：create 模式，无回填 */
const handleCreate = () => {
  formMode.value = "create";
  editingData.value = undefined;
  dialogVisible.value = true;
};

/** 编辑：edit 模式，回填当前行 */
const handleEdit = (row: DictItemInfo) => {
  formMode.value = "edit";
  editingData.value = row;
  dialogVisible.value = true;
};

/** 删除：确认 → 调接口 → 刷新 */
const handleDelete = async (row: DictItemInfo) => {
  await ElMessageBox.confirm(t("dicts.confirmDeleteData"), t("dicts.confirmDeleteDataTitle"), {
    type: "warning",
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel")
  });
  await deleteDictItem(row.id);
  ElMessage.success(t("dicts.dialog.message.deleteDataSuccess"));
  refresh();
};

// 搜索字段配置：关键字 + 状态下拉
const searchFields = computed<ProFormField[]>(() => [
  { prop: "keyword", placeholder: t("dicts.labelPlaceholder"), width: 220 },
  {
    prop: "status",
    type: "select",
    placeholder: t("dicts.status"),
    width: 160,
    options: [
      { label: t("dicts.statusEnabled"), value: 1 },
      { label: t("dicts.statusDisabled"), value: 0 }
    ]
  }
]);

// 搜索条件同步
const syncQuery = (value: Record<string, unknown>): void => {
  Object.assign(query, value);
};
</script>

<style scoped lang="less">
.page-wrap-dict-data {
  .editBtn {
    color: @color-text-regular;
  }
}
</style>
