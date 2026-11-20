/**
 * 帮助中心 API
 */
import { http } from "@/utils/request";
import type { HelpArticle, HelpSection } from "@/types/help/static";
import type { HelpMode, AiHealth, HelpChatRequest, HelpChatResponse } from "@/types/help/ai";

enum API {
  HELP_TREE = "/v1/help/tree",
  HELP_ARTICLE = "/v1/help/article",
  HELP_MODE = "/v1/help/mode",
  HELP_CHAT = "/v1/help/chat",
  HELP_AI_HEALTH = "/v1/help/ai-health"
}

/**  AI 对话超时时间 */
const HELP_AI_TIMEOUT = Number(import.meta.env.VITE_APP_HELP_AI_TIMEOUT) || 60_000;

/** 文档树（版块 → 章节 → 文章） */
export function fetchHelpTree(locale: string): Promise<HelpSection[]> {
  return http.get<HelpSection[]>(API.HELP_TREE, { params: { locale } });
}

/** 文章详情；未命中返回 null（真实后端为 30004 拒绝，由组件 catch） */
export function fetchHelpArticle(locale: string, path: string): Promise<HelpArticle | null> {
  return http.get<HelpArticle>(API.HELP_ARTICLE, { params: { locale, path } });
}

/** 当前帮助模式（static | ai） */
export function fetchHelpMode(): Promise<HelpMode> {
  return http.get<HelpMode>(API.HELP_MODE);
}

/** AI 问答  */
export function chatHelp(data: HelpChatRequest): Promise<HelpChatResponse> {
  return http.post<HelpChatResponse>(API.HELP_CHAT, data, { timeout: HELP_AI_TIMEOUT });
}

/** AI 服务健康检查 */
export function fetchAiHealth(): Promise<AiHealth> {
  return http.get<AiHealth>(API.HELP_AI_HEALTH);
}
