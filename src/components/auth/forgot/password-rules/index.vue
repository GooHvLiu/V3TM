<template>
  <div class="password-rules" aria-live="polite">
    <span v-for="item in items" :key="item.key" class="rule" :class="{ 'is-ok': item.ok }">
      <i class="dot" />
      {{ t(item.key) }}
    </span>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "PasswordRules" });

import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { PASSWORD_MAX, PASSWORD_MIN, PASSWORD_MIN_CLASSES, passwordClassCount } from "@/constants";

const props = withDefaults(defineProps<{ value: string; prefix?: string }>(), {
  prefix: "auth.forgot.rules"
});

const { t } = useI18n();

// 两项规则与表单校验共用同一份判断：长度区间 + 四类字符至少三类
const items = computed(() => [
  { key: `${props.prefix}.length`, ok: props.value.length >= PASSWORD_MIN && props.value.length <= PASSWORD_MAX },
  { key: `${props.prefix}.complexity`, ok: passwordClassCount(props.value) >= PASSWORD_MIN_CLASSES }
]);
</script>

<style scoped lang="less">
.password-rules {
  display: flex;
  flex-wrap: wrap;
  gap: @space-1 @space-3;
  margin-top: @space-1-5;
  font-size: 0.75rem;
  color: @color-text-placeholder;

  .rule {
    display: inline-flex;
    align-items: center;
    gap: @space-1;

    .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: @color-text-placeholder;
    }

    &.is-ok {
      color: @color-primary;

      .dot {
        background: @color-primary;
      }
    }
  }
}
</style>
