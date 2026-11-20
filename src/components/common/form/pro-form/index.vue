<template>
  <el-form
    ref="formRef"
    :model="modelValue"
    :rules="formRules"
    :inline="layout === 'inline'"
    :label-width="layout === 'inline' ? '0px' : labelWidth"
    :label-position="labelPosition"
    :validate-on-rule-change="false"
    class="pro-form"
    @submit.prevent="emit('submit')"
  >
    <div :class="layout === 'inline' ? 'pro-form-inline' : 'pro-form-grid'">
      <div
        v-for="field in visibleFields"
        :key="field.prop"
        class="pro-form-item"
        :class="{ 'pro-form-item--inline': layout === 'inline' }"
        :style="itemStyle(field)"
      >
        <el-form-item
          :label="field.label"
          :prop="field.prop"
          :error="errors[field.prop]"
          :required="field.required"
        >
          <slot
            :name="`field-${field.prop}`"
            :field="field"
            :model-value="modelValue[field.prop]"
            :update="createUpdater(field.prop)"
          >
            <ProFormControl
              :field="field"
              :model-value="modelValue[field.prop]"
              :disabled="isDisabled(field)"
              @update:model-value="updateField(field.prop, $event)"
              @submit="emit('submit')"
            />
          </slot>

          <p v-if="field.tip" class="pro-form-tip">
            {{ field.tip }}
          </p>
        </el-form-item>
      </div>

      <div v-if="$slots.actions" class="pro-form-actions" :class="{ 'pro-form-actions--inline': layout === 'inline' }">
        <slot name="actions" />
      </div>
    </div>
  </el-form>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "ProForm" });

import { computed, ref } from "vue";

// 引入表单类型
import type { FormInstance, FormRules } from "element-plus";
import type { ProFormField, ProFormInstance, ProFormModel } from "./types";
import {
  isFieldDisabled,
  isFieldHidden,
  mergeFormRules,
  resolveFieldSpan,
  resolveFieldWidth
} from "./helpers";

// 单个字段的控件渲染，类型分支集中在这一层
import ProFormControl from "./controls/index.vue";

// Props：模型、字段配置、表单级规则与布局
const props = withDefaults(
  defineProps<{
    modelValue: ProFormModel;
    fields: ProFormField[];
    rules?: FormRules;
    errors?: Record<string, string>;
    labelWidth?: string;
    labelPosition?: "left" | "right" | "top";
    layout?: "grid" | "inline";
    columns?: number;
    disabled?: boolean;
  }>(),
  {
    rules: () => ({}),
    errors: () => ({}),
    labelWidth: "90px",
    labelPosition: "right",
    layout: "grid",
    columns: 24,
    disabled: false
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: ProFormModel): void;
  (e: "field-change", prop: string, value: unknown): void;
  (e: "submit"): void;
}>();

const formRef = ref<FormInstance>();

// 表单级与字段级规则合并，字段配置变化时自动重建
const formRules = computed<FormRules>(() => mergeFormRules(props.fields, props.rules));

// 只渲染未隐藏字段
const visibleFields = computed<ProFormField[]>(() =>
  props.fields.filter((field) => !isFieldHidden(field, props.modelValue))
);

/** 字段显隐、禁用按当前模型计算 */
const isDisabled = (field: ProFormField): boolean =>
  isFieldDisabled(field, props.modelValue, props.disabled);

/** 栅格跨度或查询区宽度：查询区把宽度传成变量，窄屏换行由样式表统一接管 */
const itemStyle = (field: ProFormField): Record<string, string> => {
  if (props.layout === "inline") {
    const width = resolveFieldWidth(field.width);
    return width ? { "--pro-form-item-width": width } : {};
  }
  return { gridColumn: `span ${resolveFieldSpan(field.span, props.columns)}` };
};

/** 值变更：浅拷贝后整体上抛，父组件通过 v-model 接收 */
const updateField = (prop: string, value: unknown): void => {
  emit("update:modelValue", { ...props.modelValue, [prop]: value });
  emit("field-change", prop, value);
};

/** 自定义字段插槽使用的更新函数 */
const createUpdater = (prop: string) => (value: unknown): void => updateField(prop, value);

/** 校验：失败返回 false，调用方不需要再包 catch */
const validate = async (): Promise<boolean> => {
  if (!formRef.value) return false;
  return formRef.value.validate().catch(() => false);
};

const clearValidate = (): void => formRef.value?.clearValidate();

const resetFields = (): void => formRef.value?.resetFields();

defineExpose<ProFormInstance>({ validate, clearValidate, resetFields });
</script>

<style scoped lang="less">
/* 行距与查询区字段宽度：同一数值只在这里维护 */
@form-row-gap: 18px;
@inline-field-width: 200px;

.pro-form-grid {
  display: grid;
  grid-template-columns: repeat(24, minmax(0, 1fr));
  column-gap: @space-4;
}

.pro-form-item {
  min-width: 0;
}

.pro-form-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0 @space-2;
}

.pro-form-item--inline {
  /* 字段宽度由 itemStyle 写成变量，窄屏整行时只需在这里改一次 */
  width: var(--pro-form-item-width, @inline-field-width);

  /* EP 的 inline 表单项是 inline-flex，不自撑到外层宽度，控件会缩成文字宽 */
  :deep(.el-form-item) {
    width: 100%;
    margin-right: 0;
  }
}

@media (max-width: @mobile-max) {
  .pro-form-item--inline {
    width: 100%;
  }

  .pro-form-actions--inline {
    width: 100%;
    justify-content: flex-start;
  }
}

.pro-form-tip {
  margin: @space-1 0 0;
  color: @color-text-secondary;
  font-size: @font-size-xs;
  line-height: @line-height-base;
}

.pro-form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: @space-2;
}

.pro-form-actions--inline {
  display: flex;
  align-items: flex-start;
  padding-bottom: @form-row-gap;
}

:deep(.el-form-item) {
  margin-bottom: @form-row-gap;
}

:deep(.el-form-item__content) {
  min-width: 0;
}
</style>
