<template>
  <app-dialog
    :model-value="modelValue"
    :title="t('logCenter.detail.title')"
    width="620px"
    :show-footer="false"
    @update:model-value="handleVisible"
  >
    <el-descriptions v-if="log" :column="1" border size="small">
      <el-descriptions-item :label="t('logCenter.columns.createdAt')">
        {{ formatDate(log.createdAt, "YYYY-MM-DD HH:mm:ss") }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('logCenter.columns.username')">{{ log.username || "-" }}</el-descriptions-item>
      <el-descriptions-item :label="t('logCenter.columns.module')">{{ logModuleLabel(t, log.module, te) }}</el-descriptions-item>
      <el-descriptions-item :label="t('logCenter.columns.action')">{{ logActionLabel(t, log.action, te) }}</el-descriptions-item>
      <el-descriptions-item :label="t('logCenter.columns.result')">
        <app-tag size="small" :type="resultTagType(log.result)" effect="plain">
          {{ t(resultLabelKey(log.result)) }}
        </app-tag>
      </el-descriptions-item>
      <el-descriptions-item :label="t('logCenter.columns.target')">{{ log.target || "-" }}</el-descriptions-item>
      <el-descriptions-item :label="t('logCenter.columns.description')">
        {{ log.description || "-" }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('logCenter.columns.reason')">{{ log.reason || "-" }}</el-descriptions-item>
      <el-descriptions-item :label="t('logCenter.columns.ip')">{{ log.ip || "-" }}</el-descriptions-item>
      <el-descriptions-item :label="t('logCenter.columns.userAgent')">{{ log.userAgent || "-" }}</el-descriptions-item>
      <el-descriptions-item :label="t('logCenter.columns.requestId')">
        {{ log.requestId || "-" }}
      </el-descriptions-item>

      <template v-if="log.category === 'mail'">
        <el-descriptions-item :label="t('logCenter.columns.toEmail')">
          {{ log.toEmail || "-" }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logCenter.columns.subject')">
          {{ log.subject || "-" }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logCenter.columns.template')">
          {{ log.template || "-" }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('logCenter.columns.messageId')">
          {{ log.messageId || "-" }}
        </el-descriptions-item>
      </template>
    </el-descriptions>

    <p class="log-detail-tip">{{ t("logCenter.detail.tip") }}</p>
  </app-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: "LogDetailDialog" });

import { useI18n } from "vue-i18n";
import { LOG_RESULT_META } from "@/constants";
import { formatDate, logActionLabel, logModuleLabel } from "@/utils";
import type { LogDto, LogResult } from "@/types";

type TagType = "primary" | "success" | "info" | "warning" | "danger";

defineProps<{
  modelValue: boolean;
  /** 当前查看的日志行：为 null 时不渲染内容 */
  log: LogDto | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const { t, te } = useI18n();

const handleVisible = (value: boolean): void => {
  emit("update:modelValue", value);
};

const resultLabelKey = (value: LogResult): string => LOG_RESULT_META[value]?.labelKey ?? "logCenter.result.success";

const resultTagType = (value: LogResult): TagType => (LOG_RESULT_META[value]?.tagType ?? "info") as TagType;
</script>

<style scoped lang="less">
.log-detail-tip {
  margin: @space-3 0 0;
  font-size: 12px;
  color: @color-text-placeholder;
}
</style>
