<template>
  <div class="page-wrap-basic-page">
    <!-- 页面分头部和内容区，如下为头部（标题+描述+操作区） -->
    <header class="header">
      <!-- 左边的图标 标题 -->
      <div class="left-icon-title">
        <!-- 可加的图标 -->
        <div v-if="leftIcon" class="left-icon">
          <slot name="icon" />
        </div>
        <!-- 页面 标题和描述 区域 -->
        <div class="left-title-description">
          <!-- 页面 标题 -->
          <h2 class="title">{{ title }}</h2>
          <!-- 页面 描述区域 -->
          <p v-if="description" class="description">{{ description }}</p>
        </div>
      </div>
      <!-- 页面 操作 区域 -->
      <div v-if="$slots.actions" class="right-actions">
        <slot name="actions" />
      </div>
    </header>
    <!-- 页面分头部和内容区，如下为内容区 -->
    <section class="content">
      <slot name="content" />
    </section>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "BasicPage" });

// 父传子所需定义参数
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    leftIcon?: boolean;
  }>(),
  {
    leftIcon: false
  }
);

</script>

<style scoped lang="less">
.page-wrap-basic-page {
  color: @color-text-regular;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: @space-4;
  gap: @space-4;
  header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .left-icon-title {
      display: flex;
      flex-direction: row;
      align-items: center;
      .left-icon {
        width: 42px;
        height: 42px;
        margin-right: @space-2-5;
      }
      .left-title-description {
        .title {
          color: @color-text-primary;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: @space-2-5;
        }
        .description {
          font-size: 0.85rem;
        }
      }
    }
    .right-actions {
      display: flex;
      gap: @space-2;
      flex-shrink: 0;
    }
  }
  .content {
    flex: 1;
    background: @color-bg-container;
    border: 1px solid @color-border-light;
    border-radius: @radius-lg;
    padding: @space-4;
    overflow: auto;
  }
  @media (max-width: @mobile-max) {
    padding: @space-2-5;
    gap: @space-2-5;
    header {
      flex-wrap: wrap;
      align-items: flex-start;
      gap: @space-2-5;
      .left-icon-title {
        min-width: 0;
        .left-title-description {
          min-width: 0;
          .title {
            font-size: 1.05rem;
            margin-bottom: @space-1;
          }
        }
      }
      .right-actions {
        width: 100%;
        flex-wrap: wrap;
      }
    }
    .content {
      padding: @space-2-5;
    }
  }
}
</style>
