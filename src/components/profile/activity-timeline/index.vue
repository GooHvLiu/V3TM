<template>
  <section class="activity-panel">
    <header class="panel-head">
      <h3>{{ t("profile.section.activity") }}</h3>
    </header>
    <ul v-if="items.length" class="timeline">
      <li v-for="(item, index) in items" :key="item.key" class="timeline-item">
        <span class="timeline-rail">
          <i class="dot" :class="{ plain: index > 0 }" />
          <i v-if="index < items.length - 1" class="line" />
        </span>
        <div class="timeline-body">
          <div class="timeline-title">
            {{ item.title }}
          </div>
          <div class="timeline-time">
            {{ item.time }}
          </div>
        </div>
      </li>
    </ul>
    <p v-else class="muted">
      {{ t("profile.activity.empty") }}
    </p>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: "ProfileActivityTimeline" });

import { useI18n } from "vue-i18n";
import type { ProfileActivityItem } from "@/components/profile/types";

defineProps<{
  items: ProfileActivityItem[];
}>();

const { t } = useI18n();
</script>

<style scoped lang="less">
.activity-panel {
  padding-top: @space-3;
  border-top: 1px solid @color-border-lighter;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-3;
  margin-bottom: @space-2-5;
}

.panel-head h3 {
  position: relative;
  padding-left: @space-2-5;
  font-size: 0.95rem;
  font-weight: 600;
  color: @color-text-primary;
}

.panel-head h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 14px;
  transform: translateY(-50%);
  border-radius: 2px;
  background: @color-primary;
}

.timeline {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.timeline-item {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  gap: @space-2-5;
}

.timeline-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  margin-top: @space-1;
  border-radius: 50%;
  background: @color-primary;

  &.plain {
    background: @color-border-deep;
  }
}

.line {
  flex: 1;
  width: 1px;
  margin-top: @space-1;
  background: @color-border-lighter;
}

.timeline-body {
  padding-bottom: @space-3;
}

.timeline-title {
  font-size: 0.85rem;
  color: @color-text-primary;
}

.timeline-time {
  margin-top: @space-0-5;
  font-size: 0.75rem;
  color: @color-text-secondary;
}

.muted {
  font-size: 0.75rem;
  color: @color-text-placeholder;
}
</style>
