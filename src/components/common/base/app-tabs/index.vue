<template>
  <el-tabs
    :model-value="current"
    :type="type"
    :stretch="stretch"
    :closable="closable"
    @update:model-value="handleChange"
    @tab-click="emit('tab-click', $event)"
    @tab-change="emit('tab-change', $event)"
    @tab-remove="emit('tab-remove', $event)"
  >
    <el-tab-pane
      v-for="item in items"
      :key="String(item.value)"
      :name="item.value"
      :disabled="item.disabled"
    >
      <template #label>
        <slot name="label" :item="item">
          <span class="app-tabs__label">
            <el-icon v-if="item.icon" class="app-tabs__icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
            <span
              v-if="item.badge !== undefined"
              class="app-tabs__badge"
              :class="`app-tabs__badge--${item.tone ?? 'primary'}`"
              >{{ item.badge }}</span>
          </span>
        </slot>
      </template>
      <slot name="content" :item="item" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts" generic="T extends string | number">
import { computed } from "vue";
import type { Component } from "vue";
import type { TabsPaneContext } from "element-plus";

defineOptions({ name: "AppTabs" });

interface TabItem<V extends string | number> {
  label: string;
  value: V;
  icon?: Component;
  badge?: string | number;
  /** 徽标语义：未读一类的提醒用 danger，其余留在主色 */
  tone?: "primary" | "danger";
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    items: TabItem<T>[];
    type?: "" | "card" | "border-card";
    stretch?: boolean;
    closable?: boolean;
  }>(),
  {
    type: "",
    stretch: false,
    closable: false
  }
);

const active = defineModel<T>();

const emit = defineEmits<{
  "tab-click": [pane: TabsPaneContext];
  "tab-change": [name: T];
  "tab-remove": [name: T];
}>();

const current = computed<T | undefined>(() => active.value ?? props.items[0]?.value);

const handleChange = (name: T): void => {
  active.value = name;
};
</script>

<style scoped lang="less">
.app-tabs__label {
  display: inline-flex;
  align-items: center;
  gap: @space-1-5;
}
.app-tabs__badge--danger {
  background: @color-danger;
}
.app-tabs__icon {
  font-size: @font-size-lg;
}
.app-tabs__badge {
  min-width: @icon-size-md;
  height: @icon-size-md;
  padding: 0 @space-1;
  border-radius: @radius-pill;
  background: @color-primary;
  color: @color-text-white;
  font-size: @font-size-2xs;
  line-height: @icon-size-md;
  text-align: center;
}
</style>
