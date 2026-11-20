/** AI 问答引用来源 */
export interface HelpArticleSource {
  title: string;
  /** 相对 src/help 的路径，可跳转对应文章 */
  path: string;
  summary: string;
}

/** AI 问答消息 */
export interface HelpChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: HelpArticleSource[];
}

/** 聊天请求（后端契约） */
export interface HelpChatRequest {
  question: string;
  locale: string;
  history?: Pick<HelpChatMessage, "role" | "content">[];
}

/** 聊天响应（后端契约）：未命中或降级时 answer 为空串，文案走 answerKey */
export interface HelpChatResponse {
  answer: string;
  answerKey?: string;
  params?: Record<string, string | number>;
  sources: HelpArticleSource[];
}

/** AI 服务健康状态 */
export interface AiHealth {
  available: boolean;
  model: string;
  modelExists: boolean;
}

/** 帮助模式（来自后端 system_configs.help_mode） */
export interface HelpMode {
  mode: "static" | "ai";
}
