<template>
  <div class="audience-picker">
    <el-radio-group :model-value="audienceType" class="audience-picker-type" @change="handleTypeChange">
      <el-radio-button value="all">{{ t("notification.audience.all") }}</el-radio-button>
      <el-radio-button value="role">{{ t("notification.audience.role") }}</el-radio-button>
      <el-radio-button value="user">{{ t("notification.audience.user") }}</el-radio-button>
    </el-radio-group>

    <p class="audience-picker-tip">{{ typeTip }}</p>

    <div v-if="audienceType === 'role'" class="audience-picker-field">
      <el-select
        :model-value="roleCodes"
        multiple
        filterable
        collapse-tags
        collapse-tags-tooltip
        class="audience-picker-select"
        :loading="loading"
        :placeholder="t('notification.audience.rolePlaceholder')"
        :no-data-text="loading ? t('notification.audience.loading') : t('notification.audience.roleEmpty')"
        @update:model-value="handleRoleChange"
      >
        <el-option v-for="item in roles" :key="item.value" :value="item.value" :label="item.label">
          <div class="audience-picker-option">
            <span class="audience-picker-option-label">{{ item.label }}</span>
            <span class="audience-picker-option-desc">{{ item.description }}</span>
          </div>
        </el-option>
      </el-select>
    </div>

    <div v-else-if="audienceType === 'user'" class="audience-picker-field">
      <el-select
        :model-value="userIds"
        multiple
        filterable
        collapse-tags
        collapse-tags-tooltip
        class="audience-picker-select"
        :loading="loading"
        :placeholder="t('notification.audience.userPlaceholder')"
        :no-data-text="loading ? t('notification.audience.loading') : t('notification.audience.userEmpty')"
        @update:model-value="handleUserChange"
      >
        <el-option v-for="item in users" :key="item.value" :value="item.value" :label="item.label">
          <div class="audience-picker-option">
            <div class="audience-picker-option-main">
              <span class="audience-picker-option-label">{{ item.label }}</span>
              <span class="audience-picker-option-desc">{{ item.description }}</span>
            </div>
            <span v-if="item.missingEmail" class="audience-picker-option-warn">
              {{ t("notification.audience.emailMissing") }}
            </span>
          </div>
        </el-option>
      </el-select>
      <p v-if="userTotal > users.length" class="audience-picker-hint">
        {{ t("notification.audience.userLimit", { n: users.length, total: userTotal }) }}
      </p>
    </div>

    <app-alert
      v-if="loadError"
      :title="t('notification.audience.loadFailed')"
      tone="warning"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "AudiencePicker" });

import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { fetchRoleList, fetchUserList } from "@/api";
import type { NotificationAudience, NotificationAudienceType } from "@/types";

/** 单选项：角色用 code，用户用 id */
interface AudienceOption {
  value: string | number;
  label: string;
  description: string;
  missingEmail?: boolean;
}

const props = defineProps<{
  /** 接收人范围配置 */
  modelValue: NotificationAudience;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: NotificationAudience];
}>();

const { t } = useI18n();
const loading = ref<boolean>(false);
const loadError = ref<boolean>(false);
const roles = ref<AudienceOption[]>([]);
const users = ref<AudienceOption[]>([]);
const userTotal = ref<number>(0);

/** 用户下拉一次取满 100 条，超出时在下方给出提示 */
const USER_PAGE_SIZE = 100;

const audienceType = computed<NotificationAudienceType>(() => props.modelValue?.type ?? "all");
const roleCodes = computed<string[]>(() => props.modelValue?.roleCodes ?? []);
const userIds = computed<number[]>(() => props.modelValue?.userIds ?? []);

/** 三种范围各自的口径说明 */
const typeTip = computed<string>(() => t(`notification.audience.${audienceType.value}Tip`));

/** 切换范围时清空另一侧取值：多余字段后端会忽略，前端不留下脏数据 */
const handleTypeChange = (type: NotificationAudienceType): void => {
  emit("update:modelValue", { type, roleCodes: [], userIds: [] });
};

const handleRoleChange = (value: string[]): void => {
  emit("update:modelValue", { ...props.modelValue, type: "role", roleCodes: value });
};

const handleUserChange = (value: number[]): void => {
  emit("update:modelValue", { ...props.modelValue, type: "user", userIds: value });
};

const loadOptions = async (): Promise<void> => {
  loading.value = true;
  loadError.value = false;
  try {
    const [roleData, userData] = await Promise.all([
      fetchRoleList(),
      fetchUserList({ page: 1, pageSize: USER_PAGE_SIZE, status: 1 })
    ]);
    // 角色下拉：后端对管理员返回全量，必须自行剔除超管角色
    roles.value = roleData
      .filter((role) => role.status === 1 && role.code !== "superAdmin")
      .map((role) => ({
        value: role.code,
        label: t(role.name),
        description: role.description ? t(role.description) : role.code
      }));
    users.value = userData.list
      .filter((user) => user.status === 1)
      .map((user) => ({
        value: user.id,
        label: user.username,
        description: [user.realName, user.email].filter(Boolean).join(" · ") || String(user.id),
        missingEmail: !user.email
      }));
    userTotal.value = userData.total;
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => void loadOptions());
</script>

<style scoped lang="less">
.audience-picker {
  display: flex;
  flex-direction: column;
  gap: @space-2;
  width: 100%;
}

.audience-picker-type {
  align-self: flex-start;
}

.audience-picker-tip {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: @color-text-secondary;
}

.audience-picker-field {
  width: 100%;
}

.audience-picker-select {
  width: 100%;
}

.audience-picker-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-3;
}

.audience-picker-option-main {
  display: flex;
  align-items: baseline;
  gap: @space-2;
  min-width: 0;
}

.audience-picker-option-label {
  color: @color-text-primary;
}

.audience-picker-option-desc {
  font-size: 12px;
  color: @color-text-secondary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audience-picker-option-warn {
  flex-shrink: 0;
  font-size: 12px;
  color: @color-warning;
}

.audience-picker-hint {
  margin: @space-1 0 0;
  font-size: 12px;
  color: @color-text-placeholder;
}
</style>
