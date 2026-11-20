<template>
  <app-dialog
    :model-value="visible"
    :title="mode === 'create' ? t('dicts.dialog.createDataTitle') : t('dicts.dialog.editDataTitle')"
    width="480px"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item :label="t('dicts.dialog.label')" prop="label" :error="errors.label">
        <el-input v-model="form.label" :placeholder="t('dicts.dialog.label')" @input="clearServerError('label')" />
      </el-form-item>
      <el-form-item :label="t('dicts.dialog.value')" prop="value" :error="errors.value">
        <el-input v-model="form.value" :placeholder="t('dicts.dialog.value')" @input="clearServerError('value')" />
      </el-form-item>
      <el-form-item :label="t('dicts.dialog.sort')" prop="sort">
        <el-input-number v-model="form.sort" :min="0" :max="999" style="width: 100%" />
      </el-form-item>
      <el-form-item v-if="mode === 'edit'" :label="t('dicts.status')" prop="status">
        <el-switch
          v-model="form.status"
          :active-value="1"
          :inactive-value="0"
          :active-text="t('dicts.dialog.statusEnabled')"
          :inactive-text="t('dicts.dialog.statusDisabled')"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <app-button variant="outline" @click="emit('update:visible', false)">{{ t("common.cancel") }}</app-button>
      <app-button tone="primary" :loading="submitting" @click="handleSubmit">{{ t("common.confirm") }}</app-button>
    </template>
  </app-dialog>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "DictDataForm" });

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { computed, reactive, ref, watch } from "vue";

// 引入表单验证
import {
  dictDataCreateValidator,
  dictDataEditValidator
} from "@/pages/super-admin/dict-center/dict-date/validators/dict-data.validator";
import { zodToRules } from "@/utils";
import { useFormServerErrors } from "@/composables";
import type { FormInstance } from "element-plus";

// 引入 api 与类型
import { createDictItem, updateDictItem } from "@/api";
import type { DictItemInfo, UpdateDictItemParams, PublicRequestError } from "@/types";

// 引入消息提示
import { ElMessage } from "@/utils/element-plus";
import { notifyRequestError } from "@/utils/request";

// Props：可见性 / 模式 / 所属类型 id / 回填数据
const props = withDefaults(
  defineProps<{ visible: boolean; mode?: "create" | "edit"; typeId: number; initialData?: DictItemInfo }>(),
  { mode: "create", initialData: undefined }
);
const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
  (e: "submit-success"): void;
}>();

// 表单：字段集覆盖两个模式
const formRef = ref<FormInstance>();
// 服务端字段错误：同类型下字典值重复回填到值输入项
const {
  errors,
  apply: applyServerError,
  clear: clearServerError
} = useFormServerErrors(["label", "value", "sort", "status"]);
const form = reactive({
  label: "",
  value: "",
  sort: 0,
  status: 1
});

// 规则按模式切换
const rules = computed(() =>
  props.mode === "create" ? zodToRules(dictDataCreateValidator, t) : zodToRules(dictDataEditValidator, t)
);

// 打开弹窗时：重置表单；编辑模式回填
watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    clearServerError();
    formRef.value?.clearValidate();
    if (props.mode === "edit" && props.initialData) {
      form.label = props.initialData.label;
      form.value = props.initialData.value;
      form.sort = props.initialData.sort;
      form.status = props.initialData.status;
    } else {
      form.label = "";
      form.value = "";
      form.sort = 0;
      form.status = 1;
    }
  }
);

// 提交
const submitting = ref(false);
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    if (props.mode === "create") {
      await createDictItem(
        { dictTypeId: props.typeId, label: form.label, value: form.value, sort: form.sort },
        { _silent: true }
      );
      ElMessage.success(t("dicts.dialog.message.createDataSuccess"));
    } else {
      const data: UpdateDictItemParams = { label: form.label, value: form.value, sort: form.sort, status: form.status };
      await updateDictItem(props.initialData?.id as number, data, { _silent: true });
      ElMessage.success(t("dicts.dialog.message.editDataSuccess"));
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
