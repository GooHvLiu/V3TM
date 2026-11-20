<template>
  <div class="home-page-data-search">
    <BasicPage :title="t('route.dataSearch')" :description="t('dataSearch.description')">
      <template #actions>
        <app-button :loading="activeLoading" variant="outline" @click="refreshActive">
          <el-icon><Refresh /></el-icon>
          <span>{{ t("dataSearch.action.refresh") }}</span>
        </app-button>
      </template>

      <template #content>
        <div class="records-body">
          <app-tabs
            :model-value="activeTab"
            :items="visibleTabs"
            class="records-tabs"
            @update:model-value="handleTabSelect"
          />

          <!-- 操作 / 登录 / 通知邮件：个人日志接口按当前账号隔离 -->
          <LogPane
            v-if="isLogTab"
            ref="logPaneRef"
            :category="logCategory"
            @update:loading="logLoading = $event"
          />

          <!-- 消息记录：通知接口按接收账号返回，所有账号可用 -->
          <MessagePane
            v-else
            ref="messagePaneRef"
            :show-permission-tip="!canReadLogs"
            @update:loading="messageLoading = $event"
          />
        </div>
      </template>
    </BasicPage>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "DataSearch" });

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { computed, ref, watch } from "vue";
import { Refresh } from "@element-plus/icons-vue";

// 引入页面骨架与两个记录面板
import BasicPage from "@/components/page/basic/index.vue";
import LogPane from "./log-pane/index.vue";
import MessagePane from "./message-pane/index.vue";

// 引入常量、权限与状态
import { LOG_CATEGORIES } from "@/constants";
import { hasPermission } from "@/utils";
import { useUserStore } from "@/stores";

import type { LogCategory } from "@/types";

type RecordTabName = LogCategory | "message";

interface RecordTab {
  value: RecordTabName;
  label: string;
}

const userStore = useUserStore();

/** 个人日志接口按 dataSearch:list 放行，admin / operator / viewer 都有 */
const canReadLogs = computed(() => hasPermission(userStore.permissions, "dataSearch:list"));

const activeTab = ref<RecordTabName>(canReadLogs.value ? "operation" : "message");

const isLogTab = computed(() => canReadLogs.value && activeTab.value !== "message");

/** 日志面板的分类口，仅在日志页签下被使用 */
const logCategory = computed<LogCategory>(() => (activeTab.value === "message" ? "operation" : activeTab.value));

/** 操作、登录、通知邮件都走个人日志接口，邮件范围由服务端按当前账号收敛 */
const visibleTabs = computed<RecordTab[]>(() => {
  const tabs: RecordTab[] = canReadLogs.value
    ? LOG_CATEGORIES.map((category) => ({
        value: category,
        label: t(`logCenter.category.${category}`)
      }))
    : [];
  tabs.push({ value: "message", label: t("dataSearch.tab.message") });
  return tabs;
});

/** 页签切换经 app-tabs 上抛，只接受日志分类与通知两个域 */
const handleTabSelect = (value: RecordTabName): void => {
  activeTab.value = value;
};

// 两个面板各自维护取数状态，页面只负责转调刷新与合并 loading
const logPaneRef = ref<InstanceType<typeof LogPane> | null>(null);
const messagePaneRef = ref<InstanceType<typeof MessagePane> | null>(null);
const logLoading = ref<boolean>(false);
const messageLoading = ref<boolean>(false);

const activeLoading = computed(() => (isLogTab.value ? logLoading.value : messageLoading.value));

const refreshActive = async (): Promise<void> => {
  if (isLogTab.value) {
    await logPaneRef.value?.refresh();
    return;
  }
  await messagePaneRef.value?.refresh();
};

/** 权限变化时收敛页签，避免停留在已无权访问的分类 */
watch(canReadLogs, (value) => {
  if (!value) {
    activeTab.value = "message";
    return;
  }
  if (activeTab.value === "message") activeTab.value = "operation";
});
</script>

<style scoped lang="less">
.home-page-data-search {
  height: 100%;
}

.records-body {
  display: flex;
  flex-direction: column;
  gap: @space-3;
  min-width: 0;
}

.records-tabs {
  :deep(.el-tabs__header) {
    margin: 0;
  }
}
</style>
