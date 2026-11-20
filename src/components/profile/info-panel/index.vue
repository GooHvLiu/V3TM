<template>
  <section class="info-panel">
    <header class="panel-head">
      <h3>{{ title }}</h3>
      <span v-if="note" class="panel-note">{{ note }}</span>
    </header>
    <div class="info-grid" :class="{ one: single }">
      <div v-for="item in items" :key="item.label" class="info-item">
        <span class="info-key">{{ item.label }}</span>
        <span class="info-value" :class="{ mono: item.mono }">
          <i v-if="item.color" class="swatch" :style="{ background: item.color }" />
          {{ item.value }}
          <span v-if="item.code" class="muted">{{ item.code }}</span>
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: "ProfileInfoPanel" });

import type { ProfileInfoItem } from "@/components/profile/types";

defineProps<{
  title: string;
  note?: string;
  items: ProfileInfoItem[];
  single?: boolean;
}>();
</script>

<style scoped lang="less">
.info-panel {
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

.panel-note {
  font-size: 0.75rem;
  color: @color-text-secondary;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 @space-6;

  &.one {
    grid-template-columns: minmax(0, 1fr);
  }
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: @space-3;
  padding: @space-2 0;
  border-bottom: 1px dashed @color-border-lighter;
}

.info-key {
  width: 88px;
  flex-shrink: 0;
  font-size: 0.8rem;
  color: @color-text-secondary;
}

.info-value {
  flex: 1;
  min-width: 0;
  font-size: 0.85rem;
  color: @color-text-primary;
  word-break: break-all;

  &.mono {
    font-family: Consolas, Monaco, "Courier New", monospace;
    font-size: 0.8rem;
  }
}

.swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: @space-1-5;
  border-radius: 3px;
  vertical-align: middle;
}

.muted {
  font-size: 0.75rem;
  color: @color-text-placeholder;
}

@media (max-width: @screen-lg) {
  .info-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
