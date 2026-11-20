<template>
  <app-dialog
    :model-value="visible"
    :title="mode === 'create' ? t('users.dialog.createTitle') : t('users.dialog.editTitle')"
    width="520px"
    @update:model-value="emit('update:visible', $event)"
  >
    <!-- 规则按模式重建，切换模式时不该顺带跑一次全表校验 -->
    <ProForm
      ref="formRef"
      v-model="form"
      :fields="fields"
      :rules="rules"
      :errors="errors"
      label-width="90px"
      @field-change="handleFieldChange"
    />
    <template #footer>
      <app-button variant="outline" @click="emit('update:visible', false)">
        {{ t("common.cancel") }}
      </app-button>
      <app-button tone="primary" :loading="submitting" @click="handleSubmit">
        {{ t("common.confirm") }}
      </app-button>
    </template>
  </app-dialog>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "UserForm" });

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { computed, nextTick, ref, watch } from "vue";

// 引入表单组件与类型
import ProForm from "@/components/common/form/pro-form/index.vue";
import type { ProFormField, ProFormInstance, ProFormModel } from "@/components/common/form/pro-form/types";

// 引入表单验证
import { userCreateValidator, userEditValidator } from "@/pages/admin-center/user-center/validators/user.validator";
import { zodToRules } from "@/utils";
import { useFormServerErrors } from "@/composables";
import type { FormRules } from "element-plus";

// 引入 api 与类型
import { createUser, updateUser, fetchRoleList } from "@/api";

// 引入数据类型
import type { UserInfo, UpdateUserParams, PublicRequestError } from "@/types";

// 引入消息提示
import { ElMessage } from "@/utils/element-plus";
import { notifyRequestError } from "@/utils/request";

// Props：可见性 / 模式 / 回填数据
const props = withDefaults(defineProps<{ visible: boolean; mode?: "create" | "edit"; initialData?: UserInfo }>(), {
  mode: "create",
  initialData: undefined
});
const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
  (e: "submit-success"): void;
}>();

// 角色选项：打开弹窗时从角色接口拉取
const roleOptions = ref<{ value: string; label: string }[]>([]);

// 表单模型：字段集覆盖两个模式（status 仅编辑使用）
const formRef = ref<ProFormInstance>();
// 服务端字段错误：Element Plus 表单规则只管本地校验，重名一类必须回填到具体字段
const { errors, apply: applyServerError, clear: clearServerError } = useFormServerErrors([
  "username",
  "realName",
  "email",
  "password",
  "roleCodes"
]);
const form = ref<ProFormModel>({
  username: "",
  realName: "",
  email: "",
  status: 1,
  password: "",
  roleCodes: []
});

// 规则按模式切换（computed：mode 变化时重建）
const rules = computed<FormRules>(() =>
  props.mode === "create" ? zodToRules(userCreateValidator, t) : zodToRules(userEditValidator, t)
);

// 字段配置：密码提示、状态显隐与角色选项随模式变化
const fields = computed<ProFormField[]>(() => [
  {
    prop: "username",
    label: t("users.dialog.username"),
    placeholder: t("users.dialog.username"),
    required: true
  },
  {
    prop: "realName",
    label: t("users.dialog.realName"),
    placeholder: t("users.dialog.realName"),
    required: true
  },
  {
    prop: "email",
    label: t("users.dialog.email"),
    placeholder: t("users.dialog.email"),
    required: true
  },
  {
    prop: "status",
    label: t("users.status"),
    type: "switch",
    hidden: props.mode === "create",
    activeValue: 1,
    inactiveValue: 0,
    activeText: t("users.dialog.statusEnabled"),
    inactiveText: t("users.dialog.statusDisabled")
  },
  {
    prop: "password",
    label: t("users.dialog.password"),
    type: "password",
    placeholder: props.mode === "create" ? t("users.dialog.password") : t("users.dialog.passwordPlaceholder"),
    required: props.mode === "create"
  },
  {
    prop: "roleCodes",
    label: t("users.dialog.roleCodes"),
    type: "select",
    multiple: true,
    placeholder: t("users.dialog.roleCodes"),
    options: roleOptions.value,
    required: true
  }
]);

// 打开弹窗获取角色列表
const loadRoleOptions = async () => {
  const roles = await fetchRoleList();
  roleOptions.value = roles
    .filter((role) => role.code !== "superAdmin")
    .map((role) => ({ value: role.code, label: t(role.name) }));
};

// 打开弹窗时：重置表单；编辑模式回填
watch(
  () => props.visible,
  async (visible) => {
    if (!visible) return;
    clearServerError();

    if (props.mode === "edit" && props.initialData) {
      form.value = {
        username: props.initialData.username,
        realName: props.initialData.realName,
        email: props.initialData.email,
        // 编辑只允许启用 / 停用两态：待审核（2）由审批接口迁移，提交时归一到停用
        status: props.initialData.status === 1 ? 1 : 0,
        password: "",
        roleCodes: [...props.initialData.roles]
      };
    } else {
      form.value = { username: "", realName: "", email: "", status: 1, password: "", roleCodes: [] };
    }

    // 首次打开时弹窗内容还在渲染，formRef 尚未可用；等一帧后再清上一轮的错误态
    await nextTick();
    formRef.value?.clearValidate();
    loadRoleOptions();
  }
);

/** 字段重新输入后清掉该字段的服务端错误 */
const handleFieldChange = (prop: string): void => {
  clearServerError(prop);
};

// 提交：create / edit 走不同接口
const submitting = ref(false);
const handleSubmit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;
  submitting.value = true;
  try {
    const roleCodes = (Array.isArray(form.value.roleCodes) ? form.value.roleCodes : []) as string[];
    if (props.mode === "create") {
      await createUser(
        {
          username: String(form.value.username ?? ""),
          password: String(form.value.password ?? ""),
          realName: String(form.value.realName ?? ""),
          email: String(form.value.email ?? ""),
          roleCodes
        },
        { _silent: true }
      );
      ElMessage.success(t("users.dialog.message.createSuccess"));
    } else {
      // 按更新契约组装；密码留空 = 不修改，不传该字段（后端对空串做格式校验）
      const data: UpdateUserParams = {
        username: String(form.value.username ?? ""),
        realName: String(form.value.realName ?? ""),
        email: String(form.value.email ?? ""),
        status: form.value.status as UpdateUserParams["status"],
        roleCodes
      };
      if (form.value.password) data.password = String(form.value.password);
      await updateUser(props.initialData?.id as number, data, { _silent: true });
      ElMessage.success(t("users.dialog.message.editSuccess"));
    }

    emit("update:visible", false);
    emit("submit-success");
  } catch (error) {
    // 后端重名可能只给 msg、不带 params.field，这里兜底到用户名字段；
    // 仍无法归类时交给全局提示，保证静默请求不会无声失败
    const requestError = error as PublicRequestError;
    const applied = applyServerError(error, {
      field: requestError.msg === "USER_ALREADY_EXIST" ? "username" : undefined,
      messages: { username: t("users.dialog.message.usernameExist") }
    });
    if (!applied) notifyRequestError(requestError);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="less">
:deep(.el-switch__label, .el-switch__label--left):not(.is-active) {
  span {
    color: @color-text-placeholder;
  }
}
</style>
