<template>
  <div class="page-wrap-super-settings">
    <BasicPage :title="t('route.superSettings')" :description="t('superSettings.pageDesc')">
      <template #content>
        <SettingsPanel ref="panelRef" scope="super">
          <!-- 邮件服务的诊断卡挂在 mail 分区顶部，与配置同屏 -->
          <template #section-extra="{ group }">
            <MailPanel
              v-if="group.key === 'mail'"
              :status="mailStatus"
              :result="mailResult"
              :testing="testing"
              :phase="testPhase"
              :can-test="canTest"
              :status-loading="statusLoading"
              @test="runTest"
            />
          </template>
        </SettingsPanel>
      </template>
    </BasicPage>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "@/utils/element-plus";
import { hasPermission } from "@/utils";
import { useUserStore } from "@/stores";
import { getMailStatus, testMail } from "@/api";
import { translateMessage } from "@/utils/request";
import type { MailStatusResult, MailTestResult, MailTestMode } from "@/types";
import BasicPage from "@/components/page/basic/index.vue";
import SettingsPanel from "@/components/settings/panel/index.vue";
import MailPanel from "@/components/settings/mail-panel/index.vue";

defineOptions({ name: "SuperSettings" });

/** SMTP 阶段提示时长：超过后按回读阶段提示，避免长时间停在“发送中” */
const SMTP_PHASE_MS = 8_000;

const { t } = useI18n();
const userStore = useUserStore();

/** 只需要 flush，避免在页面里复制面板的保存逻辑 */
const panelRef = ref<{ flush: () => Promise<void> } | null>(null);

const permissions = computed<string[]>(() => userStore.permissions);
const canTest = computed<boolean>(() => hasPermission(permissions.value, "superAdmin:settings:update"));

const mailStatus = ref<MailStatusResult | null>(null);
const mailResult = ref<MailTestResult | null>(null);
const testing = ref<boolean>(false);
const testPhase = ref<"smtp" | "imap" | "">("");
const statusLoading = ref<boolean>(false);

let phaseTimer: ReturnType<typeof setTimeout> | undefined;

const clearPhaseTimer = (): void => {
  if (phaseTimer) clearTimeout(phaseTimer);
  phaseTimer = undefined;
};

/** 状态读取失败保留上一次结果，诊断卡退化成部分未知而不是整块消失 */
const loadMailStatus = async (): Promise<void> => {
  statusLoading.value = true;
  try {
    mailStatus.value = await getMailStatus({ _silent: true });
  } catch {
    // 静默：状态卡用旧值继续展示
  } finally {
    statusLoading.value = false;
  }
};

/** 后端 msg 是失败标识，统一走 error 命名空间；空标识回落通用失败文案 */
const resolveError = (error: unknown): string => {
  const code = (error as Error)?.message ?? "";
  return code ? translateMessage(code) : t("superSettings.mail.testFailed");
};

const runTest = async (mode: MailTestMode): Promise<void> => {
  if (testing.value) return;
  testing.value = true;
  testPhase.value = "smtp";
  mailResult.value = null;
  try {
    // 先让面板把失焦触发的逐键保存落库，否则可能测到旧配置
    await panelRef.value?.flush();
    if (mode === "full") phaseTimer = setTimeout(() => (testPhase.value = "imap"), SMTP_PHASE_MS);
    mailResult.value = await testMail(mode, { _silent: true });
    await loadMailStatus();
  } catch (error) {
    ElMessage.error(resolveError(error));
  } finally {
    clearPhaseTimer();
    testing.value = false;
    testPhase.value = "";
  }
};

onMounted(() => {
  void loadMailStatus();
});

onBeforeUnmount(clearPhaseTimer);
</script>

<style scoped lang="less">
:deep(.page-wrap-basic-page .content) {
  overflow: visible;
}
</style>
