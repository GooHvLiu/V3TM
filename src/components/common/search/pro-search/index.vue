<template>
  <div class="pro-search">
    <ProForm
      v-model="innerModel"
      :fields="visibleFields"
      :label-width="labelWidth"
      layout="inline"
      @submit="emit('search')"
    >
      <template #actions>
        <app-button tone="primary" :loading="loading" @click="emit('search')">
          {{ t("search.search") }}
        </app-button>
        <app-button variant="outline" @click="handleReset">
          {{ t("search.reset") }}
        </app-button>
        <app-button
          v-if="hasMore"
          class="pro-search-toggle"
          variant="link"
          tone="primary"
          @click="expanded = !expanded"
        >
          {{ expanded ? t("search.collapse") : t("search.expand") }}
        </app-button>
      </template>
    </ProForm>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "ProSearch" });

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { computed, ref } from "vue";

// 引入表单组件与类型
import ProForm from "@/components/common/form/pro-form/index.vue";
import AppButton from "@/components/common/base/app-button/index.vue";
import { clearFormModel } from "@/components/common/form/pro-form/helpers";
import type { ProFormField, ProFormModel } from "@/components/common/form/pro-form/types";

// Props：查询模型、字段配置、默认展示数量
const props = withDefaults(
  defineProps<{
    modelValue: ProFormModel;
    fields: ProFormField[];
    loading?: boolean;
    labelWidth?: string;
    defaultVisibleCount?: number;
    collapsible?: boolean;
  }>(),
  {
    loading: false,
    labelWidth: "0px",
    defaultVisibleCount: 3,
    collapsible: true
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: ProFormModel): void;
  (e: "search"): void;
  (e: "reset"): void;
}>();

const expanded = ref(false);

/** 受控桥接：ProForm 回写整份模型，查询区继续上抛给页面 */
const innerModel = computed<ProFormModel>({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});

/** 超出默认数量的字段折叠，展开后全部展示 */
const visibleFields = computed<ProFormField[]>(() => {
  if (!props.collapsible || expanded.value) return props.fields;
  return props.fields.slice(0, Math.max(1, props.defaultVisibleCount));
});

const hasMore = computed<boolean>(() => props.collapsible && props.fields.length > props.defaultVisibleCount);

/** 重置：清空全部已配置字段后通知页面重新查询 */
const handleReset = (): void => {
  emit("update:modelValue", clearFormModel(props.fields, props.modelValue));
  emit("reset");
};
</script>

<style scoped lang="less">
.pro-search {
  margin-bottom: @space-3;
}

:deep(.el-form-item) {
  margin-right: @space-2;
  margin-bottom: @space-2;
}

:deep(.el-form-item__label) {
  display: none;
}

/* 展开/收起是链接样式，去掉 EP 的小热区，抬到与搜索按钮同高 */
:deep(.pro-search-toggle) {
  display: inline-flex;
  align-items: center;
  min-height: var(--el-component-size);
  padding: 0 @space-2;
}
</style>
