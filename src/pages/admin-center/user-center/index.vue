<template>
  <div class="page-wrap-user-center">
    <BasicPage :title="t('users.title')" :description="t('users.description')">
      <template #actions>
        <app-button
          v-permission="'adminCenter:user:delete'"
          tone="danger"
          :class="{ 'batch-delete--disabled': selectedRows.length === 0 }"
          variant="outline"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          {{ t("users.batchDelete") }}
        </app-button>
        <app-button v-permission="'adminCenter:user:create'" tone="primary" @click="handleCreate">{{
          t("users.create")
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
          show-selection
          show-toolbar
          @page-change="changePage"
          @size-change="changePageSize"
          @selection-change="setSelected"
          @update:column-visibility="setColumnVisibility"
          @update:density="setDensity"
        >
          <!-- 状态列：待审核 / 启用 / 停用 三态 -->
          <template #cell-status="{ row }">
            <app-tag :type="statusTagType(row.status)" size="small">{{ statusText(row.status) }}</app-tag>
          </template>
          <!-- 角色列：首枚角色码 + 其余计数，长码在格内省略，全文走悬停提示 -->
          <template #cell-roles="{ row }">
            <div class="role-cell">
              <app-tooltip v-for="role in row.roles.slice(0, 1)" :key="role" :content="role">
                <app-tag class="role-tag" size="small">{{ role }}</app-tag>
              </app-tooltip>
              <app-tooltip v-if="row.roles.length > 1" :content="row.roles.join(' / ')" :max-width="360">
                <app-tag class="role-tag role-count" size="small">+{{ row.roles.length - 1 }}</app-tag>
              </app-tooltip>
            </div>
          </template>
          <!-- 时间列：dayjs 格式化（空值兜底） -->
          <template #cell-lastLoginAt="{ row }">
            {{ row.lastLoginAt ? formatDate(row.lastLoginAt, "YYYY-MM-DD") : "-" }}
          </template>
          <template #cell-createdAt="{ row }">
            {{ formatDate(row.createdAt, "YYYY-MM-DD") }}
          </template>
          <!-- 操作列：待审核走通过/驳回，其余走编辑/重置密码；删除共用 -->
          <template #cell-action="{ row }">
            <template v-if="row.status === 2">
              <app-button
                v-permission="'adminCenter:user:update'"
                variant="link"
                tone="success"
                @click="handleApprove(row)"
                >{{ t("users.approve") }}</app-button>
              <app-button
                v-permission="'adminCenter:user:update'"
                variant="link"
                tone="warning"
                @click="handleReject(row)"
                >{{ t("users.reject") }}</app-button>
            </template>
            <template v-else>
              <app-button
                v-permission="'adminCenter:user:update'"
                class="editBtn"
                variant="link"
                tone="primary"
                @click="handleEdit(row)"
                >{{ t("users.edit") }}</app-button>
              <app-button
                v-permission="'adminCenter:user:update'"
                class="editBtn"
                variant="link"
                tone="primary"
                @click="handleResetPassword(row)"
                >{{ t("users.resetPassword") }}</app-button>
            </template>
            <app-button v-permission="'adminCenter:user:delete'" variant="link" tone="danger" @click="handleDelete(row)">{{
              t("users.delete")
            }}</app-button>
          </template>
        </ProTable>
      </template>
    </BasicPage>
    <!-- 新增/编辑弹窗：submit-success → refresh 回显 -->
    <UserForm v-model:visible="dialogVisible" :mode="formMode" :initial-data="editingUser" @submit-success="refresh" />
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "UserCenter" });

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { computed, onMounted, reactive, ref } from "vue";

// 引入子组件
import BasicPage from "@/components/page/basic/index.vue";
import ProTable from "@/components/common/table/pro-table/index.vue";
import type { ProTableColumn } from "@/components/common/table/pro-table/types";
import UserForm from "@/components/user-center/user-form/index.vue";
import ProSearch from "@/components/common/search/pro-search/index.vue";
import type { ProFormField } from "@/components/common/form/pro-form/types";

// 引入列表状态机与表格偏好
import { useTable, useTablePreferences } from "@/composables";

// 引入 api 与类型
import { fetchUserList, deleteUser, batchDeleteUsers, resetUserPassword, approveUser, rejectUser } from "@/api";
import type { UserQueryParams, UserInfo } from "@/types";

// 引入日期格式化
import { formatDate } from "@/utils";

// 引入消息提示
import { ElMessage, ElMessageBox } from "@/utils/element-plus";

// 搜索条件（reactive + getter 接入 useTable：变化自动重置第 1 页）
const query = reactive<{ username: string; realName: string; status?: UserInfo["status"] }>({
  username: "",
  realName: "",
  status: undefined
});

// 列表状态机
const {
  page,
  pageSize,
  total,
  list,
  loading,
  error,
  selectedRows,
  changePage,
  changePageSize,
  setSelected,
  search,
  clearSelection,
  refresh
} = useTable<UserQueryParams, UserInfo>({
  fetcher: fetchUserList,
  query: () => {
    const q = { ...query };
    const params: { username?: string; realName?: string; status?: UserInfo["status"] } = {};
    if (q.username) params.username = q.username;
    if (q.realName) params.realName = q.realName;
    if (q.status !== undefined) params.status = q.status;
    return params;
  }
});

/** 状态标签配色：启用绿 / 待审核橙 / 停用红 */
const statusTagType = (status: UserInfo["status"]): "success" | "warning" | "danger" =>
  status === 1 ? "success" : status === 2 ? "warning" : "danger";

/** 状态文案：与标签配色同源判断 */
const statusText = (status: UserInfo["status"]): string =>
  status === 1 ? t("users.statusEnabled") : status === 2 ? t("users.statusPending") : t("users.statusDisabled");

// 列配置：computed 包裹，语言切换时列头跟随刷新
const columns = computed<ProTableColumn[]>(() => [
  { prop: "id", label: "ID", width: 64, fixed: "left" },
  { prop: "username", label: t("users.username"), minWidth: 100, showOverflowTooltip: true },
  { prop: "realName", label: t("users.realName"), minWidth: 88, showOverflowTooltip: true },
  { prop: "email", label: t("users.email"), minWidth: 128, showOverflowTooltip: true },
  { prop: "status", label: t("users.status"), width: 76 },
  { prop: "roles", label: t("users.roles"), minWidth: 122 },
  { prop: "lastLoginAt", label: t("users.lastLoginAt"), minWidth: 104, showOverflowTooltip: true },
  { prop: "createdAt", label: t("users.createdAt"), minWidth: 104, showOverflowTooltip: true },
  { prop: "action", label: t("users.action"), width: 182, align: "center", fixed: "right" }
]);

// 列显隐与行密度由表格偏好记忆，换页或刷新后保持上次的选择
const { columnVisibility, density, setColumnVisibility, setDensity } = useTablePreferences(
  "admin-center/user-center",
  () => columns.value
);

// —— 弹窗状态 ——
const dialogVisible = ref(false);
const formMode = ref<"create" | "edit">("create");
const editingUser = ref<UserInfo>();

// 首次进入拉取第 1 页
onMounted(refresh);

// —— 动作 ——
/** 新增：create 模式，无回填 */
const handleCreate = () => {
  formMode.value = "create";
  editingUser.value = undefined;
  dialogVisible.value = true;
};

/** 编辑：edit 模式，回填当前行 */
const handleEdit = (row: UserInfo) => {
  formMode.value = "edit";
  editingUser.value = row;
  dialogVisible.value = true;
};

/** 删除：确认 → 调接口 → 刷新 */
const handleDelete = async (row: UserInfo) => {
  await ElMessageBox.confirm(t("users.confirmDelete"), t("users.confirmDeleteTitle"), {
    type: "warning",
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel")
  });
  await deleteUser(row.id);
  ElMessage.success(t("users.dialog.message.deleteSuccess"));
  refresh();
};

/** 重置密码：确认 → 调接口 → 刷新（密码固定 666666，用户下次登录须改密） */
const handleResetPassword = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(t("users.confirmResetPassword"), t("users.confirmResetPasswordTitle"), {
      type: "warning",
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel")
    });
  } catch {
    // 取消：不动数据
    return;
  }
  try {
    await resetUserPassword(row.id);
  } catch {
    // 接口失败已由拦截器提示
    return;
  }
  ElMessage.success(t("users.resetPasswordSuccess"));
  refresh();
};

/** 通过审批：待审核 → 启用，账号仍需先改初始密码 */
const handleApprove = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(t("users.confirmApprove"), t("users.confirmApproveTitle"), {
      type: "warning",
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel")
    });
  } catch {
    // 取消：不动数据
    return;
  }
  try {
    await approveUser(row.id);
  } catch {
    // 接口失败已由拦截器提示
    return;
  }
  ElMessage.success(t("users.approveSuccess"));
  refresh();
};

/** 驳回审批：待审核 → 停用（账号保留，管理员后续可改回启用） */
const handleReject = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(t("users.confirmReject"), t("users.confirmRejectTitle"), {
      type: "warning",
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel")
    });
  } catch {
    // 取消：不动数据
    return;
  }
  try {
    await rejectUser(row.id);
  } catch {
    // 接口失败已由拦截器提示
    return;
  }
  ElMessage.success(t("users.rejectSuccess"));
  refresh();
};

/** 批量删除：无选中时按钮禁用，确认后批量调用 */
const handleBatchDelete = async () => {
  await ElMessageBox.confirm(t("users.confirmBatchDelete"), t("users.confirmBatchDeleteTitle"), {
    type: "warning",
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel")
  });
  await batchDeleteUsers(selectedRows.value.map((r) => r.id));
  ElMessage.success(t("users.dialog.message.batchDeleteSuccess"));
  clearSelection();
  refresh();
};

// 搜索字段配置
const searchFields = computed<ProFormField[]>(() => [
  { prop: "username", placeholder: t("users.usernamePlaceholder"), width: 180 },
  { prop: "realName", placeholder: t("users.realNamePlaceholder"), width: 180 },
  {
    prop: "status",
    type: "select",
    placeholder: t("users.statusPlaceholder"),
    width: 160,
    options: [
      { label: t("users.statusPending"), value: 2 },
      { label: t("users.statusEnabled"), value: 1 },
      { label: t("users.statusDisabled"), value: 0 }
    ]
  }
]);

// 搜索条件同步
const syncQuery = (value: Record<string, unknown>): void => {
  Object.assign(query, value);
};
</script>

<style scoped lang="less">
.page-wrap-user-center {
  .batch-delete--disabled {
    background-color: @color-border;
    color: @color-text-placeholder;
  }
  /* 角色标签并排单行，超出的角色码在格内省略 */
  .role-cell {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: @space-1;
    min-width: 0;
  }

  .role-tag {
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

  /* 计数标签固定宽度，不跟着角色码一起被压 */
  .role-count {
    flex: 0 0 auto;
  }
  .editBtn {
    color: @color-text-regular;
  }
  :deep(.role-tag) {
    background-color: @color-border;
    span {
      color: @color-text-regular;
    }
  }
}
</style>
