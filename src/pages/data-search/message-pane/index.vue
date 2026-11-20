<template>
  <div class="records-pane">
    <app-alert v-if="showPermissionTip" class="records-alert" :title="t('dataSearch.message.permissionTip')" tone="info" />

    <ProSearch
      :fields="fields"
      :model-value="filter"
      @update:model-value="syncFilter"
      @search="applyFilters"
      @reset="applyFilters"
    />

    <p class="records-tip">{{ t("dataSearch.message.tip") }}</p>

    <ProTable
      :columns="columns"
      :data="list"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :error="error"
      :empty-text="t('dataSearch.empty.message')"
      :column-visibility="columnVisibility"
      :density="density"
      row-key="id"
      show-toolbar
      @page-change="changePage"
      @size-change="changePageSize"
      @update:column-visibility="setColumnVisibility"
      @update:density="setDensity"
    >
      <template #cell-createdAt="{ row }">
        {{ formatDate(row.createdAt, "YYYY-MM-DD HH:mm") }}
      </template>

      <template #cell-category="{ row }">
        <app-tag size="small" :type="categoryTagType(row.category)" effect="plain">
          {{ t(categoryLabelKey(row.category)) }}
        </app-tag>
      </template>

      <template #cell-title="{ row }">{{ notificationText(row, "title") }}</template>

      <template #cell-type="{ row }">
        <app-tag size="small" :type="typeTagType(row.type)" effect="plain">
          {{ t(typeLabelKey(row.type)) }}
        </app-tag>
      </template>

      <template #cell-isRead="{ row }">
        <app-tag size="small" :type="row.isRead === 1 ? 'success' : 'warning'" effect="plain">
          {{ row.isRead === 1 ? t("dataSearch.message.read") : t("dataSearch.message.unread") }}
        </app-tag>
      </template>

      <template #cell-detail="{ row }">
        <app-button variant="ghost" tone="primary" size="sm" @click="openDetail(row)">
          {{ t("dataSearch.message.detail") }}
        </app-button>
      </template>
    </ProTable>

    <app-dialog
      v-model="detailVisible"
      :title="t('dataSearch.message.title')"
      width="min(620px, 92vw)"
      :show-footer="false"
    >
      <el-descriptions v-if="currentMessage" :column="1" border size="small">
        <el-descriptions-item :label="t('dataSearch.message.category')">
          <app-tag size="small" :type="categoryTagType(currentMessage.category)" effect="plain">
            {{ t(categoryLabelKey(currentMessage.category)) }}
          </app-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('dataSearch.message.type')">
          <app-tag size="small" :type="typeTagType(currentMessage.type)" effect="plain">
            {{ t(typeLabelKey(currentMessage.type)) }}
          </app-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="t('dataSearch.table.title')">
          {{ notificationText(currentMessage, "title") }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('dataSearch.message.content')">
          <p class="message-content">{{ notificationText(currentMessage, "content") }}</p>
        </el-descriptions-item>
        <el-descriptions-item :label="t('dataSearch.message.createdAt')">
          {{ formatDate(currentMessage.createdAt, "YYYY-MM-DD HH:mm:ss") }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('dataSearch.message.readAt')">
          {{ currentMessage.readAt ? formatDate(currentMessage.readAt, "YYYY-MM-DD HH:mm:ss") : "-" }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('dataSearch.message.source')">
          {{ currentMessage.source || "-" }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentMessage.link" :label="t('dataSearch.message.link')">
          <app-button variant="ghost" tone="primary" @click="openCurrentLink">
            {{ t("dataSearch.message.openLink") }}
          </app-button>
        </el-descriptions-item>
      </el-descriptions>
    </app-dialog>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "DataSearchMessagePane" });

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";

// 引入查询区与表格、基础组件
import ProSearch from "@/components/common/search/pro-search/index.vue";
import ProTable from "@/components/common/table/pro-table/index.vue";
import type { ProTableColumn } from "@/components/common/table/pro-table/types";
import type { ProFormField, ProFormModel } from "@/components/common/form/pro-form/types";

// 引入列表状态机与状态仓库
import { useTable, useTablePreferences } from "@/composables";
import { useNotificationStore } from "@/stores";

// 引入 api、常量与工具
import { getNotificationList, markNotificationRead } from "@/api";
import { NOTIFICATION_CATEGORIES, NOTIFICATION_CATEGORY_META, NOTIFICATION_TYPE_META } from "@/constants";
import { formatDate } from "@/utils";
import { notificationText } from "@/utils/notification-text";

import type { NotificationCategory, NotificationDto, NotificationListParams, NotificationType } from "@/types";

type MessagePageQuery = NotificationListParams & { page: number; pageSize: number };
type TagType = "primary" | "success" | "info" | "warning" | "danger";

// Props：无日志权限时顶部补一条说明，提示消息范围不受影响
defineProps<{ showPermissionTip?: boolean }>();

const emit = defineEmits<{
  (e: "update:loading", value: boolean): void;
}>();

const router = useRouter();
const notificationStore = useNotificationStore();

/** 筛选值：分类与已读状态都是可选条件，空串或未选都表示不限 */
interface MessageFilter {
  category: NotificationCategory | "" | undefined;
  isRead: 0 | 1 | "" | undefined;
}

const filter = reactive<MessageFilter>({
  category: "",
  isRead: ""
});

/** 查询区回写：合并到本地筛选对象 */
const syncFilter = (value: ProFormModel): void => {
  Object.assign(filter, value);
};

/** 查询区字段：分类与状态两个下拉，选项跟随常量表 */
const fields = computed<ProFormField[]>(() => [
  {
    prop: "category",
    type: "select",
    ariaLabel: t("dataSearch.table.category"),
    placeholder: t("dataSearch.filter.allCategory"),
    options: [
      { value: "", label: t("dataSearch.filter.allCategory") },
      ...NOTIFICATION_CATEGORIES.map((value) => ({ value, label: t(`notification.category.${value}`) }))
    ],
    width: 160
  },
  {
    prop: "isRead",
    type: "select",
    ariaLabel: t("dataSearch.table.status"),
    placeholder: t("dataSearch.filter.allStatus"),
    options: [
      { value: "", label: t("dataSearch.filter.allStatus") },
      { value: 0, label: t("dataSearch.message.unread") },
      { value: 1, label: t("dataSearch.message.read") }
    ],
    width: 140
  }
]);

/** 通知接口按接收账号返回，分类与已读状态为可选过滤 */
const source = useTable<MessagePageQuery, NotificationDto>({
  initialPageSize: 10,
  fetcher: (params) =>
    getNotificationList({
      ...params,
      category: filter.category || undefined,
      isRead: filter.isRead === "" ? undefined : filter.isRead
    })
});

const { list, total, page, pageSize, loading, error, fetchData, search, refresh, changePage, changePageSize } = source;

watch(
  loading,
  (value) => emit("update:loading", value),
  { immediate: true }
);

onMounted(() => {
  void fetchData();
});

const applyFilters = (): void => {
  void search();
};

const categoryLabelKey = (value: NotificationCategory): string =>
  NOTIFICATION_CATEGORY_META[value]?.labelKey ?? "notification.category.system";

const categoryTagType = (value: NotificationCategory): TagType =>
  (NOTIFICATION_CATEGORY_META[value]?.tagType ?? "info") as TagType;

const typeLabelKey = (value: NotificationType): string =>
  NOTIFICATION_TYPE_META[value]?.labelKey ?? "notification.type.info";

const typeTagType = (value: NotificationType): TagType =>
  (NOTIFICATION_TYPE_META[value]?.tagType ?? "info") as TagType;

const columns = computed<ProTableColumn[]>(() => [
  { prop: "createdAt", label: t("dataSearch.table.createdAt"), width: 170, fixed: "left" },
  { prop: "category", label: t("dataSearch.table.category"), width: 110 },
  { prop: "title", label: t("dataSearch.table.title"), minWidth: 280, showOverflowTooltip: true },
  { prop: "type", label: t("dataSearch.table.type"), width: 90 },
  { prop: "isRead", label: t("dataSearch.table.status"), width: 90 },
  { prop: "detail", label: t("dataSearch.table.detail"), width: 80, fixed: "right", hideable: false }
]);

// 列显隐与行密度由表格偏好记忆
const { columnVisibility, density, setColumnVisibility, setDensity } = useTablePreferences(
  "data-search/message-pane",
  () => columns.value
);

const detailVisible = ref<boolean>(false);
const currentMessage = ref<NotificationDto | null>(null);

/** 站内链接走路由，外链新开一页 */
const openLink = (link: string): void => {
  if (/^https?:\/\//.test(link)) {
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }
  void router.push(link);
};

/** 点开消息即补已读，未读计数与顶栏红点共用同一个 store */
const openDetail = async (row: NotificationDto): Promise<void> => {
  if (row.isRead === 0) {
    try {
      await markNotificationRead(row.id);
      row.isRead = 1;
      notificationStore.decrease(1);
    } catch {
      return;
    }
  }
  currentMessage.value = row;
  detailVisible.value = true;
  // 只筛未读时，这一条标记后应从当前列表消失
  if (filter.isRead === 0) void search();
};

const openCurrentLink = (): void => {
  const message = currentMessage.value;
  if (message?.link) openLink(message.link);
};

// 顶部刷新按钮按当前面板转调，保持当前页码与筛选条件
defineExpose({ refresh });
</script>

<style scoped lang="less">
.records-pane {
  display: flex;
  flex-direction: column;
  gap: @space-3;
  min-width: 0;
}

.records-alert {
  margin: 0;
}

.records-tip {
  margin: 0;
  font-size: @font-size-xs;
  line-height: 1.5;
  color: @color-text-placeholder;
}

.message-content {
  margin: 0;
  max-height: 40vh;
  overflow: auto;
  white-space: pre-wrap;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
</style>
