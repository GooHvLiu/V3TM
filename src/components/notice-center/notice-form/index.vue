<template>
  <div class="notice-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="notice-form-body">
      <el-form-item :label="t('notification.form.title')" prop="title">
        <el-input
          v-model="form.title"
          :maxlength="NOTIFICATION_TITLE_MAX"
          show-word-limit
          :placeholder="t('notification.form.titlePlaceholder')"
        />
      </el-form-item>

      <el-form-item :label="t('notification.form.content')" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="6"
          resize="vertical"
          :maxlength="NOTIFICATION_CONTENT_MAX"
          show-word-limit
          :placeholder="t('notification.form.contentPlaceholder')"
        />
      </el-form-item>

      <div class="notice-form-row">
        <el-form-item :label="t('notification.form.category')" prop="category">
          <el-select v-model="form.category" class="notice-form-select">
            <el-option v-for="item in categoryOptions" :key="item.value" :value="item.value" :label="t(item.labelKey)" />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('notification.form.type')" prop="type">
          <el-select v-model="form.type" class="notice-form-select">
            <el-option v-for="item in typeOptions" :key="item.value" :value="item.value" :label="t(item.labelKey)" />
          </el-select>
        </el-form-item>
      </div>

      <el-form-item :label="t('notification.form.link')" prop="link">
        <el-input
          v-model="form.link"
          :maxlength="NOTIFICATION_LINK_MAX"
          :placeholder="t('notification.form.linkPlaceholder')"
        />
      </el-form-item>

      <el-form-item :label="t('notification.audience.label')" prop="audience">
        <AudiencePicker :model-value="form.audience" @update:model-value="handleAudience" />
      </el-form-item>

      <el-form-item class="notice-form-email">
        <div class="notice-form-email-row">
          <el-switch v-model="form.sendEmail" />
          <span class="notice-form-email-label">{{ t("notification.form.sendEmail") }}</span>
          <app-tooltip :content="t('notification.form.sendEmailTip')">
            <i class="notice-form-help" i-carbon-help />
          </app-tooltip>
        </div>
        <app-alert
          v-if="!mailNotifyEnabled"
          class="notice-form-email-alert"
          :title="t('notification.send.mailDisabledTip')"
          tone="warning"
        />
      </el-form-item>
    </el-form>

    <div class="notice-form-footer">
      <app-button :disabled="submitting" variant="outline" @click="handlePreview">{{ t("notification.form.preview") }}</app-button>
      <app-button :disabled="submitting" variant="outline" @click="emit('reset')">{{ t("notification.form.reset") }}</app-button>
      <app-button tone="primary" :loading="submitting" @click="handleSubmit">
        {{ t("notification.form.submit") }}
      </app-button>
    </div>

    <app-dialog v-model="previewVisible" :title="t('notification.form.previewTitle')" width="520px" :show-footer="false">
      <div class="notice-form-preview">
        <p class="notice-form-preview-title">{{ form.title || t("notification.form.title") }}</p>
        <div class="notice-form-preview-meta">
          <app-tag size="small" :type="categoryTagType()" effect="plain">{{ categoryLabel }}</app-tag>
          <span>{{ typeLabel }}</span>
          <span>{{ audienceText }}</span>
        </div>
        <p class="notice-form-preview-content">{{ form.content || t("notification.form.content") }}</p>
        <p v-if="form.link" class="notice-form-preview-link">{{ form.link }}</p>
      </div>
    </app-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "NoticeForm" });

import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { FormInstance, FormRules } from "element-plus";
import AudiencePicker from "@/components/notice-center/audience-picker/index.vue";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_META,
  NOTIFICATION_CONTENT_MAX,
  NOTIFICATION_LINK_MAX,
  NOTIFICATION_TITLE_MAX,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_META
} from "@/constants";
import type { NotificationAudience, NotificationCategory, NotificationType, SendNotificationParams } from "@/types";

type TagType = "primary" | "success" | "info" | "warning" | "danger";

const props = defineProps<{
  /** 草稿，受控 */
  modelValue: SendNotificationParams;
  /** 提交中：按钮转 loading */
  submitting: boolean;
  /** 邮件总开关：关闭时只提示，不禁用发送 */
  mailNotifyEnabled: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: SendNotificationParams];
  submit: [];
  reset: [];
}>();

const { t } = useI18n();
const formRef = ref<FormInstance>();
const previewVisible = ref<boolean>(false);

const categoryOptions = NOTIFICATION_CATEGORIES.map((value) => ({
  value,
  labelKey: NOTIFICATION_CATEGORY_META[value].labelKey
}));

const typeOptions = NOTIFICATION_TYPES.map((value) => ({
  value,
  labelKey: NOTIFICATION_TYPE_META[value].labelKey
}));

/** 草稿代理：读取走 props，写入统一 emit，父组件是唯一数据源 */
const form = reactive({
  get title(): string {
    return props.modelValue.title;
  },
  set title(value: string) {
    patch({ title: value });
  },
  get content(): string {
    return props.modelValue.content;
  },
  set content(value: string) {
    patch({ content: value });
  },
  get category(): NotificationCategory {
    return props.modelValue.category ?? "system";
  },
  set category(value: NotificationCategory) {
    patch({ category: value });
  },
  get type(): NotificationType {
    return props.modelValue.type ?? "info";
  },
  set type(value: NotificationType) {
    patch({ type: value });
  },
  get link(): string {
    return props.modelValue.link ?? "";
  },
  set link(value: string) {
    patch({ link: value });
  },
  get sendEmail(): boolean {
    return props.modelValue.sendEmail ?? false;
  },
  set sendEmail(value: boolean) {
    patch({ sendEmail: value });
  },
  get audience(): NotificationAudience {
    return props.modelValue.audience;
  }
});

const patch = (value: Partial<SendNotificationParams>): void => {
  emit("update:modelValue", { ...props.modelValue, ...value });
};

/** 接收人变化单独处理：清掉该字段的历史校验提示 */
const handleAudience = (value: NotificationAudience): void => {
  patch({ audience: value });
  formRef.value?.clearValidate("audience");
};

const rules = computed<FormRules>(() => ({
  title: [
    { required: true, message: t("notification.validate.titleRequired"), trigger: "blur" },
    { max: NOTIFICATION_TITLE_MAX, message: t("notification.validate.titleTooLong"), trigger: "blur" }
  ],
  content: [
    { required: true, message: t("notification.validate.contentRequired"), trigger: "blur" },
    { max: NOTIFICATION_CONTENT_MAX, message: t("notification.validate.contentTooLong"), trigger: "blur" }
  ],
  link: [
    {
      validator: (_rule, value: string, callback: (error?: Error) => void) => {
        if (!value) return callback();
        const legal = value.startsWith("/") || /^https?:\/\//.test(value);
        return legal ? callback() : callback(new Error(t("notification.validate.linkInvalid")));
      },
      trigger: "blur"
    }
  ],
  audience: [
    {
      validator: (_rule, value: NotificationAudience, callback: (error?: Error) => void) => {
        if (!value?.type) return callback(new Error(t("notification.validate.audienceTypeRequired")));
        if (value.type === "role" && !(value.roleCodes ?? []).length) {
          return callback(new Error(t("notification.validate.roleRequired")));
        }
        if (value.type === "user" && !(value.userIds ?? []).length) {
          return callback(new Error(t("notification.validate.userRequired")));
        }
        return callback();
      },
      trigger: "change"
    }
  ]
}));

const categoryLabel = computed<string>(() => {
  const category = form.category;
  return t(NOTIFICATION_CATEGORY_META[category]?.labelKey ?? "notification.category.system");
});

const typeLabel = computed<string>(() => {
  const type = form.type;
  return t(NOTIFICATION_TYPE_META[type]?.labelKey ?? "notification.type.info");
});

const categoryTagType = (): TagType =>
  (NOTIFICATION_CATEGORY_META[form.category]?.tagType ?? "info") as TagType;

/** 预览里的接收人摘要：只描述范围，不发人数断言 */
const audienceText = computed<string>(() => {
  const audience = form.audience;
  if (audience?.type === "role") {
    return `${t("notification.audience.role")}：${(audience.roleCodes ?? []).join("、") || "-"}`;
  }
  if (audience?.type === "user") {
    return `${t("notification.audience.user")}：${(audience.userIds ?? []).length} 人`;
  }
  return t("notification.audience.all");
});

const handlePreview = async (): Promise<void> => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  previewVisible.value = true;
};

const handleSubmit = async (): Promise<void> => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  emit("submit");
};
</script>

<style scoped lang="less">
.notice-form {
  display: flex;
  flex-direction: column;
  gap: @space-3;
  height: 100%;
  min-height: 0;
}

.notice-form-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: @space-1;
}

.notice-form-row {
  display: flex;
  gap: @space-4;

  .el-form-item {
    flex: 1;
  }
}

.notice-form-select {
  width: 100%;
}

.notice-form-email-row {
  display: flex;
  align-items: center;
  gap: @space-2;
}

.notice-form-email-label {
  font-size: 14px;
  color: @color-text-regular;
}

.notice-form-help {
  font-size: 15px;
  color: @color-text-placeholder;
  cursor: help;
}

.notice-form-email-alert {
  margin-top: @space-2;
}

@media (max-width: @screen-sm) {
  .notice-form-row {
    flex-direction: column;
    gap: 0;
  }
}

.notice-form-footer {
  display: flex;
  justify-content: flex-end;
  gap: @space-2-5;
  padding-top: @space-1;
}

.notice-form-preview {
  display: flex;
  flex-direction: column;
  gap: @space-2-5;
}

.notice-form-preview-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: @color-text-primary;
}

.notice-form-preview-meta {
  display: flex;
  align-items: center;
  gap: @space-2-5;
  font-size: 12px;
  color: @color-text-secondary;
}

.notice-form-preview-content {
  margin: 0;
  padding: @space-3;
  font-size: 13px;
  line-height: 1.8;
  color: @color-text-regular;
  white-space: pre-wrap;
  word-break: break-word;
  background: @color-bg-hover;
  border-radius: @radius-lg;
}

.notice-form-preview-link {
  margin: 0;
  font-size: 12px;
  color: @color-primary;
  word-break: break-all;
}
</style>
