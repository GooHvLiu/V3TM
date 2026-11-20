<template>
  <el-empty :description="emptyLabel" :image="image" :image-size="imageSize">
    <template #default>
      <div v-if="$slots.action" class="app-empty__action">
        <slot name="action" />
      </div>
      <slot v-else />
    </template>
  </el-empty>
</template>

<script setup lang="ts">
defineOptions({ name: "AppEmpty" });

import { computed } from "vue";
import { useLabel } from "../shared/label";

const props = withDefaults(
  defineProps<{
    /** 传空字符串可以只保留插画 */
    description?: string;
    image?: string;
    imageSize?: number;
  }>(),
  {
    description: undefined,
    image: undefined,
    // 不传就交给 Element Plus 的 --el-empty-image-width，避免包一层后插画尺寸被改掉
    imageSize: undefined
  }
);

const label = useLabel();

const emptyLabel = computed<string>(() => props.description ?? label("empty"));
</script>

<style scoped lang="less">
.app-empty__action {
  margin-top: @space-1;
}
</style>
