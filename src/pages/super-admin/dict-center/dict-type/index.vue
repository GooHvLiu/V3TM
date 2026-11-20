<template>
  <div class="page-wrap-dict-type">
    <BasicPage :title="t('dicts.typeTitle')" :description="t('dicts.typeDescription')">
      <template #actions>
        <app-button v-permission="'superAdmin:dict:update'" tone="primary" @click="handleCreate">
          {{ t("dicts.createType") }}
        </app-button>
      </template>
      <template #content>
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
          <!-- 状态列：启用/停用 标签 -->
          <template #cell-status="{ row }">
            <app-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? t("dicts.statusEnabled") : t("dicts.statusDisabled") }}
            </app-tag>
          </template>
          <!-- 时间列 -->
          <template #cell-createdAt="{ row }">
            {{ formatDate(row.createdAt, "YYYY-MM-DD") }}
          </template>
          <template #cell-updatedAt="{ row }">
            {{ formatDate(row.updatedAt, "YYYY-MM-DD") }}
          </template>
          <!-- 操作列：字典项 / 编辑 / 删除 -->
          <template #cell-action="{ row }">
            <app-button class="editBtn" variant="link" tone="primary" @click="handleItems(row)">{{ t("dicts.items") }}</app-button>
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
    </BasicPage>
    <!-- 新增/编辑弹窗：submit-success → refresh 回显 -->
    <DictTypeForm
      v-model:visible="dialogVisible"
      :mode="formMode"
      :initial-data="editingType"
      @submit-success="refresh"
    />
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "DictType" });

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

// 引入子组件
import BasicPage from "@/components/page/basic/index.vue";
import ProTable from "@/components/common/table/pro-table/index.vue";
import type { ProTableColumn } from "@/components/common/table/pro-table/types";
import DictTypeForm from "@/components/dict-center/dict-type-form/index.vue";
import ProSearch from "@/components/common/search/pro-search/index.vue";
import type { ProFormField } from "@/components/common/form/pro-form/types";

// 引入列表状态机
import { useTable, useTablePreferences, type PageQuery } from "@/composables";

// 引入 api 与类型
import { fetchDictTypeList, deleteDictType } from "@/api";
import type { DictTypeInfo, DictTypeQueryParams } from "@/types";

// 引入日期格式化
import { formatDate } from "@/utils";

// 引入消息提示
import { ElMessage, ElMessageBox } from "@/utils/element-plus";

// 引入路由常量
import { LAYOUT } from "@/constants/route";

const router = useRouter();

// 搜索条件（keyword 关键字 + status 状态过滤）
const query = reactive<{ keyword: string; status: number | undefined }>({ keyword: "", status: undefined });

// 列表状态机
const { page, pageSize, total, list, loading, error, changePage, changePageSize, search, refresh } = useTable<
  DictTypeQueryParams & PageQuery,
  DictTypeInfo
>({
  fetcher: (params) => fetchDictTypeList(params).then((data) => ({ list: data.list, total: data.total })),
  query: () => {
    const params: { keyword?: string; status?: number } = {};
    if (query.keyword) params.keyword = query.keyword;
    if (query.status !== undefined && query.status !== null) params.status = query.status;
    return params;
  }
});

// 列配置：computed 包裹，语言切换时列头跟随刷新
const columns = computed<ProTableColumn[]>(() => [
  { prop: "id", label: "ID", width: 64, fixed: "left" },
  { prop: "typeCode", label: t("dicts.typeCode"), minWidth: 120, showOverflowTooltip: true },
  { prop: "typeName", label: t("dicts.typeName"), minWidth: 120, showOverflowTooltip: true },
  { prop: "status", label: t("dicts.status"), width: 80 },
  { prop: "dataCount", label: t("dicts.dataCount"), width: 90 },
  { prop: "createdAt", label: t("dicts.createdAt"), minWidth: 130, showOverflowTooltip: true },
  { prop: "updatedAt", label: t("dicts.updatedAt"), minWidth: 130, showOverflowTooltip: true },
  { prop: "action", label: t("dicts.action"), width: 170, align: "center", fixed: "right" }
]);

// 列显隐与行密度由表格偏好记忆
const { columnVisibility, density, setColumnVisibility, setDensity } = useTablePreferences(
  "super-admin/dict-center/dict-type",
  () => columns.value
);

// —— 弹窗状态 ——
const dialogVisible = ref(false);
const formMode = ref<"create" | "edit">("create");
const editingType = ref<DictTypeInfo>();

// 首次进入拉取第 1 页
onMounted(refresh);

// —— 动作 ——
/** 新增：create 模式，无回填 */
const handleCreate = () => {
  formMode.value = "create";
  editingType.value = undefined;
  dialogVisible.value = true;
};

/** 编辑：edit 模式，回填当前行 */
const handleEdit = (row: DictTypeInfo) => {
  formMode.value = "edit";
  editingType.value = row;
  dialogVisible.value = true;
};

/** 字典项：跳转字典项页，携带当前类型 id */
const handleItems = (row: DictTypeInfo) => {
  router.push({
    path: `/${LAYOUT.SUPER_ADMIN.ROOT}/${LAYOUT.SUPER_ADMIN.DICT_CENTER.ROOT}/${LAYOUT.SUPER_ADMIN.DICT_CENTER.DICTDATA}`,
    query: { typeId: row.id }
  });
};

/** 删除：确认 → 调接口 → 刷新（后端级联删其下字典项） */
const handleDelete = async (row: DictTypeInfo) => {
  await ElMessageBox.confirm(t("dicts.confirmDeleteType"), t("dicts.confirmDeleteTypeTitle"), {
    type: "warning",
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel")
  });
  await deleteDictType(row.id);
  ElMessage.success(t("dicts.dialog.message.deleteTypeSuccess"));
  refresh();
};

// 搜索字段配置：关键字 + 状态下拉
const searchFields = computed<ProFormField[]>(() => [
  { prop: "keyword", placeholder: t("dicts.typeCodePlaceholder"), width: 220 },
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
.page-wrap-dict-type {
  .editBtn {
    color: @color-text-regular;
  }
}
</style>
