<template>
  <app-dialog
    :model-value="visible"
    :title="mode === 'create' ? t('dicts.dialog.createTypeTitle') : t('dicts.dialog.editTypeTitle')"
    width="480px"
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
defineOptions({ name: "DictTypeForm" });

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { computed, ref, watch } from "vue";

// 引入表单组件与类型
import ProForm from "@/components/common/form/pro-form/index.vue";
import type { ProFormField, ProFormInstance, ProFormModel } from "@/components/common/form/pro-form/types";

// 引入表单验证
import {
  dictTypeCreateValidator,
  dictTypeEditValidator
} from "@/pages/super-admin/dict-center/dict-type/validators/dict-type.validator";
import { zodToRules } from "@/utils";
import { useFormServerErrors } from "@/composables";
import type { FormRules } from "element-plus";

// 引入 api 与类型
import { createDictType, updateDictType } from "@/api";
import type { DictTypeInfo, UpdateDictTypeParams, PublicRequestError } from "@/types";

// 引入消息提示
import { ElMessage } from "@/utils/element-plus";
import { notifyRequestError } from "@/utils/request";

// Props：可见性 / 模式 / 回填数据
const props = withDefaults(defineProps<{ visible: boolean; mode?: "create" | "edit"; initialData?: DictTypeInfo }>(), {
  mode: "create",
  initialData: undefined
});
const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
  (e: "submit-success"): void;
}>();

// 表单模型：字段集覆盖两个模式
const formRef = ref<ProFormInstance>();
// 服务端字段错误：类型编码、名称重名回填到对应输入项
const {
  errors,
  apply: applyServerError,
  clear: clearServerError
} = useFormServerErrors(["typeCode", "typeName", "remark", "status"]);
const form = ref<ProFormModel>({
  typeCode: "",
  typeName: "",
  remark: "",
  status: 1
});

// 规则按模式切换
const rules = computed<FormRules>(() =>
  props.mode === "create" ? zodToRules(dictTypeCreateValidator, t) : zodToRules(dictTypeEditValidator, t)
);

// 字段配置：编辑时类型编码只读
const fields = computed<ProFormField[]>(() => [
  {
    prop: "typeCode",
    label: t("dicts.dialog.typeCode"),
    placeholder: t("dicts.typeCodePlaceholder"),
    disabled: props.mode === "edit",
    required: true
  },
  {
    prop: "typeName",
    label: t("dicts.dialog.typeName"),
    placeholder: t("dicts.typeNamePlaceholder"),
    required: true
  },
  {
    prop: "remark",
    label: t("dicts.dialog.remark"),
    type: "textarea",
    rows: 2,
    placeholder: t("dicts.dialog.remark")
  },
  {
    prop: "status",
    label: t("dicts.status"),
    type: "switch",
    hidden: props.mode === "create",
    activeValue: 1,
    inactiveValue: 0,
    activeText: t("dicts.dialog.statusEnabled"),
    inactiveText: t("dicts.dialog.statusDisabled")
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
      form.value = {
        typeCode: props.initialData.typeCode,
        typeName: props.initialData.typeName,
        remark: props.initialData.remark,
        status: props.initialData.status
      };
    } else {
      form.value = { typeCode: "", typeName: "", remark: "", status: 1 };
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
    if (props.mode === "create") {
      await createDictType(
        {
          typeCode: String(form.value.typeCode ?? ""),
          typeName: String(form.value.typeName ?? ""),
          remark: String(form.value.remark ?? "")
        },
        { _silent: true }
      );
      ElMessage.success(t("dicts.dialog.message.createTypeSuccess"));
    } else {
      const data: UpdateDictTypeParams = {
        typeName: String(form.value.typeName ?? ""),
        remark: String(form.value.remark ?? ""),
        status: form.value.status as UpdateDictTypeParams["status"]
      };
      await updateDictType(props.initialData?.id as number, data, { _silent: true });
      ElMessage.success(t("dicts.dialog.message.editTypeSuccess"));
    }
    emit("update:visible", false);
    emit("submit-success");
  } catch (error) {
    // 字段错误回填输入框；没有字段信息才交给全局提示
    const applied = applyServerError(error);
    if (!applied) notifyRequestError(error as PublicRequestError);
  } finally {
    submitting.value = false;
  }
};
</script>
