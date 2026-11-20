/**
 * 帮助中心 · Mock 数据
 * 与后端 /api/v1/help/* 契约严格一致（tree / article / mode / chat）
 * 数据源：本地 src/help md 扫描 + 伪 RAG
 */
import type { HelpArticle, HelpSection } from "@/types/help/static";
import { getHelpTree, getHelpArticle } from "@/utils/help";
import { mockRag } from "@/utils/help/rag";
import { mockConfigAll } from "@/mocks/configs";
import { parseBody } from "../utils";

/** GET /v1/help/tree：文档树（与后端 data 一致：HelpSection[]） */
export const mockHelpTree = async (config: { params?: { locale?: string } }): Promise<HelpSection[]> => {
  const locale = config.params?.locale ?? "zh-cn";
  // 模拟文档树拉取耗时，让 static 骨架可见
  await new Promise((resolve) => setTimeout(resolve, 500));
  return getHelpTree(locale).sections;
};

/** GET /v1/help/article：文章详情；未命中返回 null（真实后端抛 30004） */
export const mockHelpArticle = async (config: {
  params?: { locale?: string; path?: string };
}): Promise<HelpArticle | null> => {
  const locale = config.params?.locale ?? "zh-cn";
  const path = config.params?.path ?? "";
  // 模拟文章拉取耗时
  await new Promise((resolve) => setTimeout(resolve, 400));
  return getHelpArticle(locale, path) ?? null;
};

/** GET /v1/help/mode：帮助模式（读 mock 配置，与设置页联动） */
export const mockHelpMode = (): { mode: "static" | "ai" } => {
  const target = mockConfigAll().find((i) => i.configKey === "help_mode");
  return { mode: target?.configValue === "ai" ? "ai" : "static" };
};

/** POST /v1/help/chat：伪 RAG（与真实契约同构） */
export const mockHelpChat = async (config: { data?: unknown }): Promise<ReturnType<typeof mockRag>> => {
  const body = parseBody<{ question: string; locale: string }>(config);
  // 模拟 Ollama 生成耗时，让"回复中"骨架可见
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockRag(body.question, body.locale ?? "zh-cn");
};

/** GET /v1/help/ai-health：AI 服务健康（mock 固定在线；延迟让页面骨架可见） */
export const mockAiHealth = async (): Promise<{ available: boolean; model: string; modelExists: boolean }> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { available: true, model: "mocks2.5:7b", modelExists: true };
};
