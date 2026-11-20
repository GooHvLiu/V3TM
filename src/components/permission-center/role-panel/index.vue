<template>
  <div class="role-panel">
    <div class="panel-title">
      {{ t("permission.roleList") }}
    </div>
    <div
      v-for="role in roles"
      :key="role.id"
      class="role-card"
      role="button"
      tabindex="0"
      :class="{ 'is-active': role.id === selectedRoleId }"
      @click="emit('update:selectedRoleId', role.id)"
      @keydown.enter.prevent="emit('update:selectedRoleId', role.id)"
      @keydown.space.prevent="emit('update:selectedRoleId', role.id)"
    >
      <div class="role-card-name">
        {{ t(role.name) }}
      </div>
      <div class="role-card-desc">
        {{ role.description ? t(role.description) : role.code }}
      </div>
      <app-tag size="small" :type="role.status === 1 ? 'success' : 'danger'">
        {{ role.status === 1 ? t("permission.statusEnabled") : t("permission.statusDisabled") }}
      </app-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "PermissionRolePanel" });

import { useI18n } from "vue-i18n";
import type { RoleInfo } from "@/types";

defineProps<{
  roles: RoleInfo[];
  selectedRoleId?: number;
}>();

const emit = defineEmits<{
  (e: "update:selectedRoleId", value: number): void;
}>();

const { t } = useI18n();
</script>

<style scoped lang="less">
.role-panel {
  width: 280px;
  flex-shrink: 0;
  padding: @space-4;
  border: 1px solid @color-border;
  border-radius: @radius-lg;
  box-sizing: border-box;
}

.panel-title {
  margin-bottom: @space-3;
  font-size: 14px;
  font-weight: 600;
  color: @color-text-primary;
}

.role-card {
  position: relative;
  margin-bottom: @space-2-5;
  padding: @space-3 @space-3;
  border: 1px solid @color-border-light;
  border-radius: @radius-base;
  background-color: @color-bg-container;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: @color-bg-hover;
  }

  &.is-active {
    background-color: @color-bg-hover;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      border-radius: 3px 0 0 3px;
      background-color: @color-success;
    }
  }
}

.role-card-name {
  font-size: 14px;
  font-weight: 600;
  color: @color-text-primary;
}

.role-card-desc {
  margin: @space-1 0 @space-2;
  font-size: 12px;
  color: @color-text-secondary;
}

/* 窄屏让角色卡整张露出，交给页面滚动，不切半张卡片 */
@media (max-width: @mobile-max) {
  .role-panel {
    width: 100%;
    max-height: none;
    overflow-y: visible;
  }
}
</style>
