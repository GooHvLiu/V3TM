<template>
  <div class="page-wrap-role-center">
    <BasicPage :title="t('roles.title')" :description="t('roles.titleDescription')">
      <template #actions>
        <app-button v-permission="'superAdmin:role:create'" tone="primary" @click="handleCreate">{{
          t("roles.create")
        }}</app-button>
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
          <!-- 内置角色的名称与说明是 i18n key，自建角色为手写文案 -->
          <template #cell-name="{ row }">{{ t(row.name) }}</template>
          <template #cell-description="{ row }">{{ row.description ? t(row.description) : "-" }}</template>
          <!-- 状态列：启用/停用 标签 -->
          <template #cell-status="{ row }">
            <app-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? t("roles.statusEnabled") : t("roles.statusDisabled") }}
            </app-tag>
          </template>
          <!-- 权限码列：首枚权限码 + 其余计数，长码在单元格内省略，全文走悬停提示 -->
          <template #cell-permissions="{ row }">
            <div class="permission-cell">
              <app-tooltip v-for="permission in row.permissions.slice(0, 1)" :key="permission" :content="permission">
                <app-tag class="permission-tag" size="small">{{ permission }}</app-tag>
              </app-tooltip>
              <app-tooltip v-if="row.permissions.length > 1" :content="row.permissions.join(' / ')" :max-width="420">
                <app-tag class="permission-tag permission-count" size="small">+{{ row.permissions.length - 1 }}</app-tag>
              </app-tooltip>
            </div>
          </template>
          <!-- 时间列：dayjs 格式化 -->
          <template #cell-createdAt="{ row }">
            {{ formatDate(row.createdAt, "YYYY-MM-DD") }}
          </template>
          <template #cell-updatedAt="{ row }">
            {{ formatDate(row.updatedAt, "YYYY-MM-DD") }}
          </template>
          <!-- 操作列：编辑 / 删除 -->
          <template #cell-action="{ row }">
            <app-button
              v-permission="'superAdmin:role:update'"
              class="editBtn"
              variant="link"
              tone="primary"
              @click="handleEdit(row)"
              >{{ t("roles.edit") }}</app-button>
            <app-button v-permission="'superAdmin:role:delete'" variant="link" tone="danger" @click="handleDelete(row)">{{
              t("roles.delete")
            }}</app-button>
          </template>
        </ProTable>
      </template>
    </BasicPage>
    <!-- 新增/编辑弹窗：submit-success → refresh 回显 -->
    <RoleForm v-model:visible="dialogVisible" :mode="formMode" :initial-data="editingRole" @submit-success="refresh" />
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "RoleCenter" });

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { computed, onMounted, reactive, ref } from "vue";

// 引入子组件
import BasicPage from "@/components/page/basic/index.vue";
import ProTable from "@/components/common/table/pro-table/index.vue";
import type { ProTableColumn } from "@/components/common/table/pro-table/types";
import RoleForm from "@/components/role-center/role-form/index.vue";
import ProSearch from "@/components/common/search/pro-search/index.vue";
import type { ProFormField } from "@/components/common/form/pro-form/types";

// 引入列表状态机与表格偏好
import { useTable, useTablePreferences, type PageQuery } from "@/composables";

// 引入 api 与类型
import { fetchRoleList, deleteRole } from "@/api";

// 引入数据类型
import type { RoleInfo, RoleQueryParams } from "@/types";

// 引入日期格式化
import { formatDate } from "@/utils";

// 引入消息提示
import { ElMessage, ElMessageBox } from "@/utils/element-plus";

// 搜索条件（reactive + getter 接入 useTable：变化自动重置第 1 页）
const query = reactive<{ code: string; name: string }>({ code: "", name: "" });

// 列表状态机
const { page, pageSize, total, list, loading, error, changePage, changePageSize, search, refresh } = useTable<
  RoleQueryParams & PageQuery,
  RoleInfo
>({
  fetcher: ({ page: _page, pageSize: _pageSize, name, ...rest }) => {
    // 内置角色接口里存的是 i18n key，按名称搜索在前端比对译文
    const keyword = (name ?? "").trim().toLowerCase();
    return fetchRoleList(rest).then((data) => {
      const rows = keyword
        ? data.filter((row) => t(row.name).toLowerCase().includes(keyword) || row.name.toLowerCase().includes(keyword))
        : data;
      return { list: rows, total: rows.length };
    });
  },
  query: () => {
    const params: { code?: string; name?: string } = {};
    if (query.code) params.code = query.code;
    if (query.name) params.name = query.name;
    return params;
  }
});

// 列配置：computed 包裹，语言切换时列头跟随刷新
const columns = computed<ProTableColumn[]>(() => [
  { prop: "id", label: "ID", width: 64, fixed: "left" },
  { prop: "code", label: t("roles.code"), minWidth: 108, showOverflowTooltip: true },
  { prop: "name", label: t("roles.name"), minWidth: 120, showOverflowTooltip: true },
  { prop: "description", label: t("roles.description"), minWidth: 140, showOverflowTooltip: true },
  { prop: "status", label: t("roles.status"), width: 76 },
  { prop: "permissions", label: t("roles.permissions"), minWidth: 166 },
  { prop: "createdAt", label: t("roles.createdAt"), minWidth: 108, showOverflowTooltip: true },
  { prop: "updatedAt", label: t("roles.updatedAt"), minWidth: 108, showOverflowTooltip: true },
  { prop: "action", label: t("roles.action"), width: 104, align: "center", fixed: "right" }
]);

// 列显隐与行密度由表格偏好记忆
const { columnVisibility, density, setColumnVisibility, setDensity } = useTablePreferences(
  "super-admin/role-center",
  () => columns.value
);

// —— 弹窗状态 ——
const dialogVisible = ref(false);
const formMode = ref<"create" | "edit">("create");
const editingRole = ref<RoleInfo>();

// 首次进入拉取第 1 页
onMounted(refresh);

// —— 动作 ——
/** 新增：create 模式，无回填 */
const handleCreate = () => {
  formMode.value = "create";
  editingRole.value = undefined;
  dialogVisible.value = true;
};

/** 编辑：edit 模式，回填当前行 */
const handleEdit = (row: RoleInfo) => {
  formMode.value = "edit";
  editingRole.value = row;
  dialogVisible.value = true;
};

/** 删除：确认 → 调接口 → 刷新 */
const handleDelete = async (row: RoleInfo) => {
  await ElMessageBox.confirm(t("roles.confirmDelete"), t("roles.confirmDeleteTitle"), {
    type: "warning",
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel")
  });
  await deleteRole(row.id);
  ElMessage.success(t("roles.dialog.message.deleteSuccess"));
  refresh();
};

// 搜索字段配置
const searchFields = computed<ProFormField[]>(() => [
  { prop: "code", placeholder: t("roles.codePlaceholder"), width: 200 },
  { prop: "name", placeholder: t("roles.namePlaceholder"), width: 200 }
]);

// 搜索条件同步
const syncQuery = (value: Record<string, unknown>): void => {
  Object.assign(query, value);
};
</script>

<style scoped lang="less">
.page-wrap-role-center {
  /* 权限码与计数标签并排单行，超出的权限码在格内省略 */
  .permission-cell {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: @space-1;
    min-width: 0;
  }

  .permission-tag {
    flex: 0 1 auto;
    max-width: 100%;
    overflow: hidden;

    :deep(.el-tag__content) {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  /* 计数标签固定宽度，不跟着权限码一起被压 */
  .permission-count {
    flex: 0 0 auto;
  }
  .editBtn {
    color: @color-text-regular;
  }
  :deep(.permission-tag) {
    background-color: @color-border;
    span {
      color: @color-text-regular;
    }
  }
}
</style>
