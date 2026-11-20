<template>
  <app-dialog
    :model-value="visible"
    :title="mode === 'create' ? t('roles.dialog.createTitle') : t('roles.dialog.editTitle')"
    width="520px"
    @update:model-value="emit('update:visible', $event)"
  >
    <ProForm
      ref="formRef"
      v-model="form"
      :fields="fields"
      :rules="rules"
      :errors="errors"
      label-width="90px"
      @field-change="clearServerError"
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
defineOptions({ name: "RoleForm" });

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { computed, ref, watch } from "vue";

// 引入表单组件与类型
import ProForm from "@/components/common/form/pro-form/index.vue";
import type { ProFormField, ProFormInstance, ProFormModel } from "@/components/common/form/pro-form/types";

// 引入表单验证
import { roleCreateValidator, roleEditValidator } from "@/pages/super-admin/role-center/validators/role.validator";
import { zodToRules } from "@/utils";
import { useFormServerErrors } from "@/composables";
import type { FormRules } from "element-plus";

// 引入 api 与类型
import { createRole, updateRole } from "@/api";

// 引入数据类型
import type { RoleInfo, UpdateRoleParams, PublicRequestError } from "@/types";

// 引入消息提示
import { ElMessage } from "@/utils/element-plus";
import { notifyRequestError } from "@/utils/request";

// 引入菜单数据（菜单权限多选的数据源）
import { useMenuStore } from "@/stores";

// 内置角色判定
import { isBuiltinRoleCode } from "@/constants";

// Props：可见性 / 模式 / 回填数据
const props = withDefaults(defineProps<{ visible: boolean; mode?: "create" | "edit"; initialData?: RoleInfo }>(), {
  mode: "create",
  initialData: undefined
});
const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
  (e: "submit-success"): void;
}>();

// 菜单选项
const menuStore = useMenuStore();
const menuOptions = computed(() => menuStore.menuDataArry.map((m) => ({ id: m.id, name: t(m.name) })));

// 表单模型：字段集覆盖两个模式
const formRef = ref<ProFormInstance>();
// 服务端字段错误：角色编码、名称重名回填到对应输入项
const {
  errors,
  apply: applyServerError,
  clear: clearServerError
} = useFormServerErrors(["code", "name", "description", "status", "menuIds"]);
const form = ref<ProFormModel>({
  code: "",
  name: "",
  description: "",
  status: 1,
  menuIds: []
});

/** 回填时记住原始值：内置角色存的是 i18n key，未改名要原样回传 */
const origin = { name: "", description: "" };

/** 内置角色名称由语言包维护，编辑时只读 */
const isBuiltinRole = computed(() => props.mode === "edit" && isBuiltinRoleCode(props.initialData?.code));

// 规则按模式切换
const rules = computed<FormRules>(() =>
  props.mode === "create" ? zodToRules(roleCreateValidator, t) : zodToRules(roleEditValidator, t)
);

// 字段配置：内置角色的名称只读并给出说明
const fields = computed<ProFormField[]>(() => [
  {
    prop: "code",
    label: t("roles.dialog.code"),
    placeholder: t("roles.dialog.code"),
    disabled: props.mode === "edit",
    required: true
  },
  {
    prop: "name",
    label: t("roles.dialog.name"),
    placeholder: t("roles.dialog.name"),
    disabled: isBuiltinRole.value,
    tip: isBuiltinRole.value ? t("roles.dialog.builtinNameTip") : undefined,
    required: true
  },
  {
    prop: "description",
    label: t("roles.dialog.description"),
    type: "textarea",
    rows: 2,
    placeholder: t("roles.dialog.description")
  },
  {
    prop: "status",
    label: t("roles.status"),
    type: "switch",
    hidden: props.mode === "create",
    activeValue: 1,
    inactiveValue: 0,
    activeText: t("roles.dialog.statusEnabled"),
    inactiveText: t("roles.dialog.statusDisabled")
  },
  {
    prop: "menuIds",
    label: t("roles.dialog.menuIds"),
    type: "select",
    multiple: true,
    placeholder: t("roles.dialog.menuIds"),
    options: menuOptions.value.map((menu) => ({ label: menu.name, value: menu.id }))
  }
]);

// 打开弹窗时：重置表单；编辑模式回填
watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    clearServerError();
    formRef.value?.clearValidate();
    if (props.mode === "edit" && props.initialData) {
      origin.name = props.initialData.name;
      origin.description = props.initialData.description;
      form.value = {
        code: props.initialData.code,
        name: t(props.initialData.name),
        description: props.initialData.description ? t(props.initialData.description) : "",
        status: props.initialData.status,
        menuIds: [...props.initialData.menuIds]
      };
    } else {
      form.value = { code: "", name: "", description: "", status: 1, menuIds: [] };
      origin.name = "";
      origin.description = "";
    }
  }
);

// 提交
const submitting = ref(false);
const handleSubmit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;
  submitting.value = true;
  try {
    const name = String(form.value.name ?? "");
    const description = String(form.value.description ?? "");
    const menuIds = (Array.isArray(form.value.menuIds) ? form.value.menuIds : []) as number[];
    if (props.mode === "create") {
      await createRole(
        {
          code: String(form.value.code ?? ""),
          name,
          description,
          status: form.value.status as UpdateRoleParams["status"],
          menuIds
        },
        { _silent: true }
      );
      ElMessage.success(t("roles.dialog.message.createSuccess"));
    } else {
      const data: UpdateRoleParams = {
        name: origin.name && name === t(origin.name) ? origin.name : name,
        description: origin.description && description === t(origin.description) ? origin.description : description,
        status: form.value.status as UpdateRoleParams["status"],
        menuIds
      };
      await updateRole(props.initialData?.id as number, data, { _silent: true });
      ElMessage.success(t("roles.dialog.message.editSuccess"));
    }
    emit("update:visible", false);
    emit("submit-success");
  } catch (error) {
    // 字段错误回填输入框；没有字段信息才交给全局提示，避免同一条错误弹两次
    const applied = applyServerError(error);
    if (!applied) notifyRequestError(error as PublicRequestError);
  } finally {
    submitting.value = false;
  }
};
</script>
