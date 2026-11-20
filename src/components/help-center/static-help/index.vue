<template>
  <div class="static-help">
    <div class="static-help-search">
      <el-input v-model="keyword" :placeholder="t('help.searchPlaceholder')" clearable />
    </div>
    <div class="static-help-body">
      <!-- 数据加载中：整体骨架（目录 + 文章一起占位） -->
      <StaticHelpSkeleton v-if="loading" />
      <template v-else>
        <div v-if="sections.length" class="static-help-aside">
          <el-scrollbar>
            <template v-for="section in tree.sections" :key="section.title">
              <!-- 版块标题：可点击折叠 -->
              <div
                class="section-title"
                role="button"
                tabindex="0"
                :class="{ 'is-fold': !isExpanded(section.title) }"
                :aria-expanded="isExpanded(section.title)"
                @click="toggleSection(section.title)"
                @keydown.enter.prevent="toggleSection(section.title)"
                @keydown.space.prevent="toggleSection(section.title)"
              >
                <el-icon class="section-arrow"><ArrowRight /></el-icon>
                <span class="section-name">{{ section.title }}</span>
                <span v-if="section.source === 'custom'" class="section-badge">项目</span>
              </div>
              <ul v-show="isExpanded(section.title)" class="chapter-list">
                <li v-for="chapter in section.chapters" :key="chapter.title">
                  <div class="chapter-title">{{ chapter.title }}</div>
                  <div
                    v-for="entry in chapter.articles"
                    :key="entry.path"
                    class="article-item"
                    role="button"
                    tabindex="0"
                    :class="{ active: entry.path === path }"
                    @click="emit('update:path', entry.path)"
                    @keydown.enter.prevent="emit('update:path', entry.path)"
                    @keydown.space.prevent="emit('update:path', entry.path)"
                  >
                    {{ entry.title }}
                  </div>
                </li>
                <li
                  v-for="entry in section.articles"
                  :key="entry.path"
                  class="article-item"
                  role="button"
                  tabindex="0"
                  :class="{ active: entry.path === path }"
                  @click="emit('update:path', entry.path)"
                  @keydown.enter.prevent="emit('update:path', entry.path)"
                  @keydown.space.prevent="emit('update:path', entry.path)"
                >
                  {{ entry.title }}
                </li>
              </ul>
            </template>
          </el-scrollbar>
        </div>
        <div class="static-help-content">
          <template v-if="article">
            <!-- 文章头部：标题 + 摘要 -->
            <div class="static-help-header">
              <h2 class="static-help-title">{{ article.title }}</h2>
              <p v-if="article.summary" class="static-help-summary">{{ article.summary }}</p>
            </div>
            <div class="static-help-article" v-html="renderedHtml" />
          </template>
          <!-- noMatch 用法：搜索态且无结果 -->
          <app-empty v-else-if="keyword.trim() && !tree.sections.length" :description="t('help.noMatch')" />
          <!-- 其他空态（如 en 未建目录） -->
          <app-empty v-else :description="t('help.noContent')" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "StaticHelp" });

import StaticHelpSkeleton from "./static-help-skeleton/index.vue";

import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ArrowRight } from "@element-plus/icons-vue";
import MarkdownIt from "markdown-it";
import type { HelpArticle, HelpSection } from "@/types/help/static";

const { t } = useI18n();
const md = new MarkdownIt({ html: false, linkify: true });

// 容器传入：数据只读，交互上抛
const props = defineProps<{
  sections: HelpSection[];
  article: HelpArticle | null;
  loading: boolean;
  /** 当前选中文章路径（v-model 受控，来自容器） */
  path: string;
}>();

const emit = defineEmits<{ (e: "update:path", path: string): void }>();

const keyword = ref("");
/** 展开的版块集合（纯本地 UI 状态） */
const expanded = ref<Set<string>>(new Set());

function toggleSection(title: string) {
  const next = new Set(expanded.value);
  if (next.has(title)) {
    next.delete(title);
  } else {
    next.add(title);
  }
  expanded.value = next;
}

function isExpanded(title: string): boolean {
  return expanded.value.has(title);
}

/** 目录树（含搜索过滤，数据来自 props） */
const tree = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return { sections: props.sections };
  return {
    sections: props.sections
      .map((s) => ({
        ...s,
        chapters: s.chapters
          .map((c) => ({ ...c, articles: c.articles.filter(matchArticle) }))
          .filter((c) => c.articles.length),
        articles: s.articles.filter(matchArticle)
      }))
      .filter((s) => s.articles.length || s.chapters.length)
  };
});

function matchArticle(a: HelpArticle): boolean {
  const kw = keyword.value.trim().toLowerCase();
  return !kw || [a.title, a.summary, a.content].some((v) => v.toLowerCase().includes(kw));
}

/** 文章内容渲染（md 在此被使用） */
const renderedHtml = computed(() => (props.article ? md.render(props.article.content) : ""));

// 树加载完成：默认展开第一个版块
watch(
  () => props.sections,
  (sections) => {
    const first = sections[0];
    if (first) {
      expanded.value = new Set([first.title]);
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="less">
.static-help {
  display: flex;
  flex-direction: column;
  gap: @space-3;

  .static-help-search {
    max-width: 320px;
  }

  .static-help-body {
    display: flex;
    gap: @space-4;
    min-height: 480px;
  }

  .static-help-aside {
    width: 240px;
    flex-shrink: 0;
    border: 1px solid var(--el-border-color);
    border-radius: var(--radius-lg);
    padding: @space-3;

    .section-title {
      display: flex;
      align-items: center;
      gap: @space-1;
      font-weight: 600;
      font-size: 14px;
      padding: @space-2 @space-1-5;
      border-radius: var(--radius-base);
      cursor: pointer;
      color: var(--el-text-color-primary);
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      .section-arrow {
        font-size: 14px;
        transform: rotate(90deg);
        transition: transform 0.2s;
      }

      &.is-fold .section-arrow {
        transform: rotate(0deg);
      }
    }

    .section-badge {
      margin-left: auto;
      padding: 0 @space-1-5;
      font-size: 11px;
      line-height: 18px;
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
      border-radius: var(--radius-base);
      vertical-align: 2px;
    }

    .chapter-title {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      padding: @space-1-5 0 @space-0-5 @space-2;
    }

    .article-item {
      font-size: 13px;
      padding: @space-1-5 @space-2 @space-1-5 @space-5;
      border-radius: var(--radius-base);
      cursor: pointer;
      color: var(--el-text-color-regular);
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.active {
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
        font-weight: 500;
      }
    }
  }

  .static-help-content {
    flex: 1;
    min-width: 0;
    border: 1px solid var(--el-border-color);
    border-radius: var(--radius-lg);
    padding: @space-4 @space-5;
    overflow: auto;
  }

  .static-help-header {
    padding-bottom: @space-3;
    margin-bottom: @space-3;
    border-bottom: 1px solid var(--el-border-color);
  }

  .static-help-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
  }

  .static-help-summary {
    margin: @space-2 0 0;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  .static-help-article {
    font-size: 14px;
    line-height: 1.75;
    color: var(--el-text-color-primary);

    :deep(h1) {
      font-size: 24px;
      margin: 0 0 @space-3;
    }
    :deep(h2) {
      font-size: 20px;
      margin: @space-5 0 @space-2;
    }
    :deep(h3) {
      font-size: 16px;
      margin: @space-4 0 @space-1-5;
    }
    :deep(p) {
      margin: @space-2 0;
    }
    :deep(ul),
    :deep(ol) {
      padding-left: @space-5;
      margin: @space-2 0;
    }
    :deep(blockquote) {
      margin: @space-2 0;
      padding: @space-1-5 @space-3;
      border-left: 3px solid var(--el-color-primary);
      background: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);
      border-radius: 0 var(--radius-base) var(--radius-base) 0;
    }
    :deep(code) {
      background: var(--el-fill-color-light);
      border-radius: var(--radius-sm);
      padding: @space-0-5 @space-1;
      font-size: 13px;
    }
    :deep(pre) {
      background: var(--el-fill-color-light);
      border-radius: var(--radius-base);
      padding: @space-3;
      overflow: auto;
      code {
        background: none;
        padding: 0;
      }
    }
    :deep(img) {
      max-width: 100%;
      border-radius: var(--radius-base);
    }
    :deep(table) {
      border-collapse: collapse;
      margin: @space-2 0;
      th,
      td {
        border: 1px solid var(--el-border-color);
        padding: @space-1-5 @space-2-5;
      }
      th {
        background: var(--el-fill-color-light);
      }
    }
  }
}
</style>
