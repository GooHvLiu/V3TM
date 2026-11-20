/**
 * 帮助中心 AI 对话历史 · 本地持久化
 * 单线历史 + 按用户隔离；读写收敛此处（单点）
 */
import { storage } from "@/utils";
import type { HelpChatMessage } from "@/types/help/ai";

/** 单用户历史上限（条），超出丢最旧 */
const HISTORY_LIMIT = 100;
/** 存储 key 前缀（storage 自动加 V3T_ 前缀） */
const HISTORY_KEY = "help_ai_history_";

export interface HelpChatHistory {
  messages: HelpChatMessage[];
  updatedAt: number;
}

/** 读取某用户的历史；无数据 / 损坏数据返回空数组 */
export function loadHelpHistory(userId: number | string): HelpChatMessage[] {
  const key = `${HISTORY_KEY}${userId}`;
  const history = storage.get<HelpChatHistory>(key);
  const messages = history?.messages;
  return Array.isArray(messages) ? messages.slice(-HISTORY_LIMIT) : [];
}

/** 保存某用户的历史（截断到上限；写入失败由 storage 内部容错） */
export function saveHelpHistory(userId: number | string, messages: HelpChatMessage[]): void {
  const key = `${HISTORY_KEY}${userId}`;
  storage.set<HelpChatHistory>(key, {
    messages: messages.slice(-HISTORY_LIMIT),
    updatedAt: Date.now()
  });
}
