/**
 * 帮助中心伪 RAG
 * 本地关键词匹配：标题命中×3、摘要×2、正文×1，取 top3 作为引用来源
 * 后端 RAG 就绪后整体替换本文件，调用方无感
 */
import type { HelpArticle } from "@/types/help/static";
import type { HelpChatResponse } from "@/types/help/ai";
import i18n from "@/locales";
import { getHelpTree } from "@/utils/help";

/** 简单分词：按 2-4 字滑窗切关键词 */
function sliceKeywords(text: string): string[] {
  const cleaned = text.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
  if (!cleaned) return [];
  const words = new Set<string>();
  for (let size = 4; size >= 2; size--) {
    for (let i = 0; i + size <= cleaned.length; i++) {
      words.add(cleaned.slice(i, i + size));
    }
  }
  return [...words];
}

function scoreArticle(article: HelpArticle, keywords: string[]): number {
  const title = article.title.toLowerCase();
  const summary = article.summary.toLowerCase();
  const content = article.content.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (title.includes(kw)) score += 3;
    if (summary.includes(kw)) score += 2;
    if (content.includes(kw)) score += 1;
  }
  return score;
}

/** 伪 RAG 主入口：提问 → 引用来源 + 拼接答案 */
export function mockRag(question: string, locale: string): HelpChatResponse {
  const keywords = sliceKeywords(question);
  const articles = getHelpTree(locale).sections.flatMap((s) => [
    ...s.chapters.flatMap((c) => c.articles),
    ...s.articles
  ]);

  const hits = articles
    .map((article) => ({ article, score: scoreArticle(article, keywords) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const sources = hits.map(({ article }) => ({
    title: article.title,
    path: article.path,
    summary: article.summary
  }));

  const answer = hits.length
    ? `${i18n.global.t("help.ragAnswerIntro", { question })}\n\n` +
      hits
        .map(
          ({ article }, index) =>
            `**${index + 1}. ${article.title}**\n${article.summary || i18n.global.t("help.ragNoSummary")}`
        )
        .join("\n\n") +
      `\n\n${i18n.global.t("help.ragAnswerMore")}`
    : i18n.global.t("help.ragEmpty", { question });

  return { answer, sources };
}
