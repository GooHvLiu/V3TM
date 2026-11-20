<template>
  <section class="identity">
    <div class="identity-left">
      <div class="identity-avatar">
        <UserAvatar :name="displayName" :role="profile?.role ?? null" />
      </div>
      <div class="identity-text">
        <div class="identity-name">
          <span class="name">{{ displayName }}</span>
          <app-tag v-if="roleLabel" size="small" effect="light">
            {{ roleLabel }}
          </app-tag>
          <app-tag v-if="profile" size="small" effect="light" :type="statusTagType">
            {{ statusText }}
          </app-tag>
        </div>
        <div class="identity-meta">
          <span>{{ profile?.email || "-" }}</span>
          <span>{{ profile?.username ? "@" + profile.username : "-" }}</span>
          <span>#{{ profile?.id ?? "-" }}</span>
        </div>
      </div>
    </div>
    <div class="identity-stats">
      <div class="stat">
        <span class="stat-value">{{ roleCount }}</span>
        <span class="stat-label">{{ t("profile.field.role") }}</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ lastLoginText }}</span>
        <span class="stat-label">{{ t("profile.field.lastLoginAt") }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: "ProfileIdentityCard" });

import { toRefs } from "vue";
import { useI18n } from "vue-i18n";
import UserAvatar from "@/components/user-info/avatar/index.vue";
import type { AuthProfile } from "@/types";

const props = defineProps<{
  profile: Partial<AuthProfile> | null;
  displayName: string;
  roleLabel: string;
  statusText: string;
  statusTagType: "success" | "info" | "warning";
  roleCount: number;
  lastLoginText: string;
}>();

const { t } = useI18n();

const { profile, displayName, roleLabel, statusText, statusTagType, roleCount, lastLoginText } = toRefs(props);
</script>

<style scoped lang="less">
.identity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-4;
  flex-wrap: wrap;
  padding: @space-4;
  background: @color-bg-hover;
  border-radius: @radius-lg;
}

.identity-left {
  display: flex;
  align-items: center;
  gap: @space-3;
  min-width: 0;
}

.identity-avatar {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: @space-1-5;
  background: @color-bg-container;
  border: 1px solid @color-border-light;
  border-radius: @radius-base;

  :deep(.page-wrap-brand-logo) {
    width: 100%;
    height: 100%;
  }
}

.identity-text {
  min-width: 0;
}

.identity-name {
  display: flex;
  align-items: center;
  gap: @space-2;
  flex-wrap: wrap;
}

.identity-name .name {
  font-size: 1.15rem;
  font-weight: 700;
  color: @color-text-primary;
}

.identity-meta {
  display: flex;
  gap: @space-3;
  flex-wrap: wrap;
  margin-top: @space-1-5;
  font-size: 0.8rem;
  color: @color-text-secondary;
}

.identity-stats {
  display: flex;
  gap: @space-8;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: @space-0-5;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: @color-text-primary;
}

.stat-label {
  font-size: 0.75rem;
  color: @color-text-secondary;
}

@media (max-width: @screen-lg) {
  .identity-stats {
    gap: @space-6;
  }
}
</style>
