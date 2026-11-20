/**
 * 帮助中心扫描器
 * 约定：src/help/{locale}/{template|custom}/{NN-版块}/{NN-章节(可选)}/{NN-文章}.md
 * 目录名数字前缀 = 排序；文章标题/summary 取 frontmatter
 */
import type { HelpArticle, HelpSection, HelpTree } from "@/types/help/static";

// Vite 编译期收集全部 md 原文（新增文件后重新 build 自动生效）
const mdModules = import.meta.glob("../../help/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true
}) as Record<string, string>;

/** 解析文件名/目录名数字前缀 */
function parseSort(name: string): number {
  const match = /^(\d+)-/.exec(name);
  return match ? Number(match[1]) : 999;
}

/** 去掉数字前缀，取显示名 */
function stripSort(name: string): string {
  return name.replace(/^\d+-/, "");
}

/** 解析 frontmatter（--- 包裹的 key: value 块） */
function parseFrontmatter(raw: string): { title: string; summary: string; content: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) {
    return { title: "", summary: "", content: raw };
  }
  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return {
    title: meta.title ?? "",
    summary: meta.summary ?? "",
    content: raw.slice(match[0].length)
  };
}

// 按 locale 缓存构建结果
const treeCache = new Map<string, HelpTree>();

function buildTree(locale: string): HelpTree {
  const sections = new Map<string, HelpSection>();

  for (const [key, raw] of Object.entries(mdModules)) {
    const parts = key.split("/");
    // ../../help/zh-cn/template/10-版块/install/01-文章.md
    //     0   1   2     3      4         5      6        7
    const keyLocale = parts[3];
    if (keyLocale !== locale) continue;

    const source = parts[4] === "custom" ? "custom" : "template";
    const sectionName = parts[5];
    if (!sectionName) continue;

    const fileName = parts[parts.length - 1];
    if (!fileName.endsWith(".md")) continue;

    const { title, summary, content } = parseFrontmatter(raw);
    const article: HelpArticle = {
      path: parts.slice(3).join("/"),
      title: title || stripSort(fileName).replace(/\.md$/, ""),
      summary,
      content,
      sort: parseSort(fileName)
    };

    const sectionKey = `${source}/${sectionName}`;
    let section = sections.get(sectionKey);
    if (!section) {
      section = {
        title: stripSort(sectionName),
        sort: parseSort(sectionName),
        source,
        chapters: [],
        articles: []
      };
      sections.set(sectionKey, section);
    }

    // 有章节目录（parts.length === 8）→ 挂章节；否则直接挂版块
    if (parts.length === 8) {
      const chapterName = parts[6];
      let chapter = section.chapters.find((c) => c.title === stripSort(chapterName));
      if (!chapter) {
        chapter = { title: stripSort(chapterName), sort: parseSort(chapterName), articles: [] };
        section.chapters.push(chapter);
      }
      chapter.articles.push(article);
    } else {
      section.articles.push(article);
    }
  }

  const sorted = [...sections.values()]
    .sort((a, b) => (a.source === b.source ? a.sort - b.sort : a.source === "template" ? -1 : 1))
    .map((section) => ({
      ...section,
      chapters: [...section.chapters]
        .sort((a, b) => a.sort - b.sort)
        .map((chapter) => ({
          ...chapter,
          articles: [...chapter.articles].sort((a, b) => a.sort - b.sort)
        })),
      articles: [...section.articles].sort((a, b) => a.sort - b.sort)
    }));

  return { sections: sorted };
}

/** 按语言取帮助目录树 */
export function getHelpTree(locale: string): HelpTree {
  if (!treeCache.has(locale)) {
    treeCache.set(locale, buildTree(locale));
  }
  return treeCache.get(locale)!;
}

/** 按 path 取文章 */
export function getHelpArticle(locale: string, path: string): HelpArticle | undefined {
  return getHelpTree(locale)
    .sections.flatMap((s) => [...s.chapters.flatMap((c) => c.articles), ...s.articles])
    .find((a) => a.path === path);
}
