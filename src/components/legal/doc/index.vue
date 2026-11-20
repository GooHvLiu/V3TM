<template>
  <div class="page-wrap-legal-doc">
    <div class="doc-layout">
      <!-- 左侧 sticky 目录（移动端隐藏） -->
      <aside v-if="data.sections.length >= 6" class="doc-toc">
        <div class="toc-title">{{ tocTitle }}</div>
        <a
          v-for="section in data.sections"
          :key="section.id"
          class="toc-item"
          :href="`#${section.id}`"
          @click.prevent="scrollTo(section.id)"
          >{{ section.title }}</a>
      </aside>

      <!-- 正文 -->
      <div class="doc-content">
        <!-- 文档头 -->
        <div class="doc-header">
          <h2 class="doc-title">{{ data.title }}</h2>
          <div class="doc-meta">
            <app-tag size="small" effect="plain">{{ versionLabel }} {{ data.version }}</app-tag>
            <span v-if="data.effectiveDate" class="meta-item">{{ effectiveDateLabel }}：{{ data.effectiveDate }}</span>
            <span class="dot">·</span>
            <span class="meta-item">{{ updateDateLabel }}：{{ data.updateDate }}</span>
          </div>
        </div>
        <!-- 引言 -->
        <p v-if="data.intro" class="doc-intro">{{ data.intro }}</p>
        <!-- 章节 -->
        <section v-for="section in data.sections" :id="section.id" :key="section.id" class="doc-section">
          <h3 class="section-title">{{ section.title }}</h3>
          <p v-for="(paragraph, i) in section.paragraphs" :key="i" class="section-paragraph">
            {{ paragraph }}
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "LegalDoc" });

// 引入数据类型
import type { LegalDocData } from "@/types";

// Props：纯 UI 组件，收已翻译好的字符串（BasicPage 同款规范）
defineProps<{
  data: LegalDocData;
  versionLabel?: string;
  effectiveDateLabel?: string;
  updateDateLabel?: string;
  tocTitle?: string;
}>();

// 目录锚点滚动（vue-router history 模式下不能直接用 href="#id"，会触发路由解析）
const scrollTo = (id: string): void => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};
</script>

<style scoped lang="less">
.page-wrap-legal-doc {
  max-width: 980px;
  margin: 0 auto;
  padding-bottom: @space-12;
  .doc-layout {
    display: flex;
    gap: @space-10;
    .doc-toc {
      width: 180px;
      flex-shrink: 0;
      position: sticky;
      top: 24px;
      align-self: flex-start;
      max-height: calc(100vh - 48px);
      overflow-y: auto;
      padding: @space-3;
      .toc-title {
        font-size: 0.8rem;
        font-weight: 700;
        color: @color-text-secondary;
        margin-bottom: @space-2-5;
        padding-left: @space-2;
      }
      .toc-item {
        display: block;
        font-size: 0.78rem;
        line-height: 1.9;
        color: @color-text-secondary;
        padding: @space-1 @space-2;
        border-radius: @radius-base;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        &:hover {
          color: @color-primary;
          background-color: @color-bg-container;
        }
      }
    }
    .doc-content {
      flex: 1;
      min-width: 0;
      .doc-header {
        border-bottom: 1px solid @color-border;
        padding-bottom: @space-4;
        margin-bottom: @space-6;
        .doc-title {
          font-size: 1.6rem;
          font-weight: 900;
          color: @color-text-primary;
          margin-bottom: @space-2-5;
        }
        .doc-meta {
          display: flex;
          align-items: center;
          gap: @space-2;
          font-size: 0.8rem;
          color: @color-text-secondary;
          .dot {
            color: @color-text-placeholder;
          }
        }
      }
      .doc-intro {
        font-size: 0.9rem;
        color: @color-text-primary;
        line-height: 1.9;
        margin-bottom: @space-6;
        padding: @space-3 @space-4;
        background-color: @color-bg-container;
        border-radius: @radius-base;
        border-left: 3px solid @color-primary;
      }
      .doc-section {
        scroll-margin-top: 24px; /* 锚点跳转不被顶栏遮挡 */
        background-color: @color-bg-container;
        border-radius: @radius-lg;
        padding: @space-4 @space-5;
        margin-bottom: @space-3;
        .section-title {
          font-size: 1rem;
          font-weight: 700;
          color: @color-text-primary;
          margin-bottom: @space-2-5;
        }
        .section-paragraph {
          font-size: 0.85rem;
          color: @color-text-secondary;
          line-height: 1.9;
          margin-bottom: @space-2;
        }
      }
    }
  }
}

/* 移动端：目录隐藏，正文全宽 */
@media (max-width: @mobile-max) {
  .page-wrap-legal-doc {
    .doc-layout {
      .doc-toc {
        display: none;
      }
      .doc-content {
        .doc-header {
          .doc-title {
            font-size: 1.3rem;
          }
        }
      }
    }
  }
}
</style>
