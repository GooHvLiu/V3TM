<template>
  <el-skeleton :loading="loading" :animated="animated" :throttle="0">
    <template #template>
      <div v-if="variant === 'text'" class="app-skeleton__text">
        <el-skeleton-item v-for="row in rows" :key="row" variant="text" />
      </div>

      <div v-else-if="variant === 'list'" class="app-skeleton__list">
        <div v-for="row in rows" :key="row" class="app-skeleton__list-row">
          <el-skeleton-item variant="circle" class="app-skeleton__avatar" />
          <div class="app-skeleton__list-lines">
            <el-skeleton-item variant="text" style="width: 34%" />
            <el-skeleton-item variant="text" style="width: 68%" />
          </div>
        </div>
      </div>

      <div v-else-if="variant === 'table'" class="app-skeleton__table">
        <div class="app-skeleton__table-head">
          <el-skeleton-item v-for="col in 4" :key="`h-${col}`" variant="rect" />
        </div>
        <div v-for="row in rows" :key="row" class="app-skeleton__table-row">
          <el-skeleton-item v-for="col in 4" :key="`${row}-${col}`" variant="rect" />
        </div>
      </div>

      <div v-else-if="variant === 'chart'" class="app-skeleton__chart">
        <el-skeleton-item variant="rect" class="app-skeleton__chart-area" />
        <div class="app-skeleton__chart-axis">
          <el-skeleton-item v-for="bar in rows" :key="bar" variant="text" />
        </div>
      </div>

      <div v-else class="app-skeleton__page">
        <el-skeleton-item variant="rect" class="app-skeleton__page-title" />
        <el-skeleton-item variant="text" style="width: 46%" />
        <div class="app-skeleton__page-grid">
          <el-skeleton-item v-for="row in rows" :key="row" variant="rect" />
        </div>
      </div>
    </template>

    <template #default>
      <slot />
    </template>
  </el-skeleton>
</template>

<script setup lang="ts">
defineOptions({ name: "AppSkeleton" });

withDefaults(
  defineProps<{
    loading?: boolean;
    variant?: "text" | "list" | "table" | "page" | "chart";
    rows?: number;
    animated?: boolean;
  }>(),
  {
    loading: true,
    variant: "text",
    rows: 3,
    animated: true
  }
);
</script>

<style scoped lang="less">
.app-skeleton__text {
  display: flex;
  flex-direction: column;
  gap: @space-3;
  width: 100%;

  :deep(.el-skeleton__item) {
    width: 100%;
  }
}

.app-skeleton__list {
  display: flex;
  flex-direction: column;
  gap: @space-4;
  width: 100%;

  &-row {
    display: flex;
    align-items: center;
    gap: @space-3;
  }

  &-lines {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: @space-2-5;
  }
}

.app-skeleton__avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.app-skeleton__table {
  display: flex;
  flex-direction: column;
  gap: @space-2-5;
  width: 100%;

  &-head,
  &-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: @space-3;

    :deep(.el-skeleton__item) {
      height: 34px;
    }
  }

  &-head :deep(.el-skeleton__item) {
    height: 38px;
  }
}

.app-skeleton__chart {
  display: flex;
  flex-direction: column;
  gap: @space-3;
  width: 100%;

  &-area {
    width: 100%;
    height: 180px;
  }

  &-axis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: @space-2;

    :deep(.el-skeleton__item) {
      height: 14px;
    }
  }
}

.app-skeleton__page {
  display: flex;
  flex-direction: column;
  gap: @space-3;
  width: 100%;

  &-title {
    width: 40%;
    height: 30px;
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: @space-3;
    margin-top: @space-2;

    :deep(.el-skeleton__item) {
      height: 96px;
    }
  }
}
</style>
