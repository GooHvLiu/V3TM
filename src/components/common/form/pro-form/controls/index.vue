<template>
  <el-input
    v-if="!field.type || field.type === 'input' || field.type === 'password'"
    :model-value="textValue"
    :type="field.type === 'password' ? 'password' : 'text'"
    :placeholder="field.placeholder"
    :aria-label="controlLabel"
    :clearable="field.clearable !== false"
    :show-password="field.type === 'password'"
    :disabled="disabled"
    @update:model-value="update($event)"
    @keyup.enter="emit('submit')"
  />

  <el-input
    v-else-if="field.type === 'textarea'"
    :model-value="textValue"
    type="textarea"
    :rows="field.rows ?? 2"
    :placeholder="field.placeholder"
    :aria-label="controlLabel"
    :disabled="disabled"
    @update:model-value="update($event)"
  />

  <el-select
    v-else-if="field.type === 'select'"
    :model-value="selectValue"
    :placeholder="field.placeholder"
    :aria-label="controlLabel"
    :multiple="field.multiple"
    :clearable="field.clearable !== false"
    :disabled="disabled"
    class="pro-form-control"
    @update:model-value="update($event)"
  >
    <el-option
      v-for="option in field.options ?? []"
      :key="String(option.value)"
      :label="option.label"
      :value="option.value"
      :disabled="option.disabled"
    />
  </el-select>

  <el-switch
    v-else-if="field.type === 'switch'"
    :model-value="switchValue"
    :aria-label="controlLabel"
    :active-value="field.activeValue ?? true"
    :inactive-value="field.inactiveValue ?? false"
    :active-text="field.activeText"
    :inactive-text="field.inactiveText"
    :disabled="disabled"
    @update:model-value="update($event)"
  />

  <el-input-number
    v-else-if="field.type === 'number'"
    :model-value="numberValue"
    :aria-label="controlLabel"
    :min="field.min"
    :max="field.max"
    :step="field.step ?? 1"
    :disabled="disabled"
    class="pro-form-control"
    @update:model-value="update($event)"
  />

  <el-date-picker
    v-else-if="field.type === 'daterange'"
    :model-value="rangeValue"
    :aria-label="controlLabel"
    type="daterange"
    range-separator="-"
    :start-placeholder="field.startPlaceholder"
    :end-placeholder="field.endPlaceholder"
    :disabled="disabled"
    class="pro-form-control"
    @update:model-value="update($event)"
  />
</template>

<script setup lang="ts">
defineOptions({ name: "ProFormControl" });

import { computed } from "vue";
import type { ProFormField } from "../types";

/** 单一字段的控件渲染：类型分支只在这里维护，ProForm 负责布局与校验 */
const props = defineProps<{
  field: ProFormField;
  modelValue: unknown;
  disabled: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: unknown];
  "submit": [];
}>();

/** 无可见标签时的可访问名称：ariaLabel → placeholder → label */
const controlLabel = computed<string | undefined>(
  () => props.field.ariaLabel || props.field.placeholder || props.field.label
);

const textValue = computed<string>(() =>
  props.modelValue === undefined || props.modelValue === null ? "" : String(props.modelValue)
);

const selectValue = computed<string | number | boolean | Record<string, unknown> | unknown[] | undefined>(
  () => props.modelValue as string | number | boolean | Record<string, unknown> | unknown[] | undefined
);

const numberValue = computed<number | undefined>(() =>
  typeof props.modelValue === "number" && Number.isFinite(props.modelValue) ? props.modelValue : undefined
);

const switchValue = computed<string | number | boolean | undefined>(() =>
  typeof props.modelValue === "string" || typeof props.modelValue === "number" || typeof props.modelValue === "boolean"
    ? props.modelValue
    : undefined
);

const rangeValue = computed<[Date, Date] | null>(() =>
  Array.isArray(props.modelValue) && props.modelValue.length >= 2 ? (props.modelValue as [Date, Date]) : null
);

const update = (value: unknown): void => emit("update:modelValue", value);
</script>

<style scoped lang="less">
/* 下拉、数字、日期需要撑满表单项，输入类自身就是 100% */
.pro-form-control {
  width: 100%;
}
</style>
