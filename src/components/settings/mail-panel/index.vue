<template>
  <div class="mail-panel">
    <div class="mail-panel-head">
      <span class="mail-panel-title">{{ t("superSettings.mail.statusTitle") }}</span>
      <span class="mail-panel-tip">{{ t("superSettings.mail.statusTip") }}</span>
    </div>

    <div class="mail-badges">
      <div v-for="badge in badges" :key="badge.label" class="mail-badge">
        <span class="mail-badge-label">{{ badge.label }}</span>
        <app-tag :type="badge.type" size="small" effect="plain">{{ badge.value }}</app-tag>
      </div>
    </div>

    <div v-if="status && !status.enabled" class="mail-alert">
      <app-alert :title="t('superSettings.mail.enabledOffTip')" tone="info" />
    </div>
    <div v-if="status && !status.imap.readback" class="mail-alert">
      <app-alert :title="t('superSettings.mail.readbackOffTip')" tone="warning" />
    </div>

    <div class="mail-actions">
      <app-button tone="primary" :loading="testing" :disabled="!canTest || testing" @click="emit('test', 'full')">
        {{ t("superSettings.mail.test") }}
      </app-button>
      <app-button :loading="testing" :disabled="!canTest || testing" variant="outline" @click="emit('test', 'verify')">
        {{ t("superSettings.mail.testVerify") }}
      </app-button>
      <app-button :loading="testing" :disabled="!canTest || testing" variant="outline" @click="emit('test', 'send')">
        {{ t("superSettings.mail.testSend") }}
      </app-button>
      <span class="mail-phase">{{ phaseText }}</span>
    </div>
    <p class="mail-hint">{{ t("superSettings.mail.testHint") }}</p>

    <div v-if="result" class="mail-result" :class="`is-${resultType}`">
      <div class="mail-result-title">{{ resultText }}</div>
      <div class="mail-result-meta">{{ resultDetail }}</div>
      <div v-if="readbackText" class="mail-result-meta">{{ readbackText }}</div>
    </div>

    <div v-if="statusLoading" class="mail-loading">{{ t("superSettings.mail.statusLoading") }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { MailStatusResult, MailTestResult, MailTestMode } from "@/types";

defineOptions({ name: "MailPanel" });

const props = defineProps<{
  status: MailStatusResult | null;
  result: MailTestResult | null;
  testing: boolean;
  phase: "smtp" | "imap" | "";
  canTest: boolean;
  statusLoading?: boolean;
}>();

const emit = defineEmits<{ test: [mode: MailTestMode] }>();

const { t } = useI18n();

/** 唯一判定口径：full 且 SMTP 接受、IMAP 收到、回读无错；落在垃圾箱不算可用 */
const usable = computed<boolean>(() => {
  const result = props.result;
  return (
    !!result &&
    result.mode === "full" &&
    result.status === "received" &&
    result.smtpAccepted === true &&
    result.received === true &&
    result.readbackError === null
  );
});

const resultType = computed<"success" | "warning" | "info" | "danger">(() => {
  const result = props.result;
  if (!result) return "info";
  if (usable.value) return "success";
  if (result.status === "verified") return "info";
  if (result.status === "sent") return "warning";
  return "danger";
});

const resultText = computed<string>(() => {
  if (usable.value) return t("superSettings.mail.usable");
  if (props.result?.status === "blocked") return t("superSettings.mail.blockedJunk");
  if (props.result?.status === "verified") return t("superSettings.mail.verifiedOnly");
  if (props.result?.status === "sent") return t("superSettings.mail.sentOnly");
  return t("superSettings.mail.failed");
});

const resultDetail = computed<string>(() => {
  const result = props.result;
  if (!result) return "";
  return t("superSettings.mail.resultMeta", { to: result.to || "—", ms: result.elapsedMs });
});

/** 回读结果：有错误先翻错误码，无错误则展示落点目录 */
const readbackText = computed<string>(() => {
  const result = props.result;
  if (!result) return "";
  const raw = result.readbackError;
  if (!raw) return result.receivedFolder ? t("superSettings.mail.receivedFolder", { folder: result.receivedFolder }) : "";
  const index = raw.indexOf(":");
  const key = index > 0 ? raw.slice(0, index) : raw;
  const detail = index > 0 ? raw.slice(index + 1).trim() : "";
  const label = t(`error.${key}`);
  const text = label === `error.${key}` ? key : label;
  return detail ? `${text}：${detail}` : text;
});

const lastTestText = computed<string>(() => {
  const log = props.status?.lastTest;
  if (!log) return t("superSettings.mail.lastTestEmpty");
  const key = `superSettings.mail.lastTestStatus_${log.status}`;
  const label = t(key);
  return label === key ? log.status : label;
});

const lastTestType = computed<"success" | "warning" | "info" | "danger">(() => {
  const status = props.status?.lastTest?.status;
  if (status === "received") return "success";
  if (status === "sent" || status === "blocked") return "warning";
  if (status === "failed") return "danger";
  return "info";
});

const badges = computed(() => {
  const status = props.status;
  return [
    {
      label: t("superSettings.mail.enabled"),
      value: status ? (status.enabled ? t("superSettings.mail.enabledOn") : t("superSettings.mail.enabledOff")) : "—",
      type: status?.enabled ? ("success" as const) : ("info" as const)
    },
    {
      label: t("superSettings.mail.configured"),
      value: status ? (status.configured ? t("superSettings.mail.configuredYes") : t("superSettings.mail.configuredNo")) : "—",
      type: status?.configured ? ("success" as const) : ("warning" as const)
    },
    {
      label: t("superSettings.mail.passSet"),
      value: status ? (status.passSet ? t("superSettings.mail.passSetYes") : t("superSettings.mail.passSetNo")) : "—",
      type: status?.passSet ? ("success" as const) : ("danger" as const)
    },
    {
      label: t("superSettings.mail.lastTest"),
      value: lastTestText.value,
      type: lastTestType.value
    }
  ];
});

const phaseText = computed<string>(() => {
  if (!props.testing) return "";
  if (props.phase === "smtp") return t("superSettings.mail.phaseSmtp");
  if (props.phase === "imap") return t("superSettings.mail.phaseImap");
  return t("superSettings.mail.testing");
});
</script>

<style scoped lang="less">
.mail-panel {
  margin-top: @space-3;
  padding: @space-4;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--radius-lg);
  background: var(--el-fill-color-lighter);
}

.mail-panel-head {
  display: flex;
  align-items: baseline;
  gap: @space-2-5;
  flex-wrap: wrap;
}

.mail-panel-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary, #1f2329);
}

.mail-panel-tip {
  font-size: 12px;
  color: var(--color-text-secondary, #646a73);
}

.mail-badges {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: @space-2-5;
  margin-top: @space-3;

  @media (max-width: @screen-md) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.mail-badge {
  display: flex;
  flex-direction: column;
  gap: @space-1;
  padding: @space-2-5 @space-3;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--radius-sm);
  background: var(--el-bg-color);
}

.mail-badge-label {
  font-size: 12px;
  color: var(--color-text-secondary, #646a73);
}

.mail-alert {
  margin-top: @space-2-5;
}

.mail-actions {
  display: flex;
  align-items: center;
  gap: @space-2;
  flex-wrap: wrap;
  margin-top: @space-3;
}

.mail-phase {
  font-size: 12px;
  color: var(--color-text-secondary, #646a73);
}

.mail-hint {
  margin: @space-1-5 0 0;
  font-size: 12px;
  color: var(--color-text-secondary, #646a73);
}

.mail-result {
  margin-top: @space-3;
  padding: @space-3;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--radius-sm);
  background: var(--el-bg-color);

  &.is-success {
    border-color: var(--el-color-success-light-5);
  }

  &.is-warning {
    border-color: var(--el-color-warning-light-5);
  }

  &.is-danger {
    border-color: var(--el-color-danger-light-5);
  }
}

.mail-result-title {
  font-size: 14px;
  font-weight: 600;
}

.mail-result-meta {
  margin-top: @space-1;
  font-size: 12px;
  color: var(--color-text-secondary, #646a73);
  word-break: break-all;
}

.mail-loading {
  margin-top: @space-2-5;
  font-size: 12px;
  color: var(--color-text-secondary, #646a73);
}
</style>
