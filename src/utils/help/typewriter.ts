/**
 * 打字机输出工具
 * 将整段文本按固定块长分批写入响应式对象的 content 字段，
 * 每批间隔 interval 毫秒，驱动视图逐块上屏（模拟流式输出）。
 * 目标对象必须由 reactive/ref 包装，content 变更才会驱动视图更新。
 */
import { nextTick } from "vue";

export interface TypewriterOptions {
  /** 每批写入的字符数，默认 6 */
  chunkSize?: number;
  /** 每批之间的间隔（毫秒），默认 18 */
  interval?: number;
  /** 每批写入后的回调（如滚动到底部） */
  onTick?: () => void;
}

/**
 * 执行打字机写入
 * @param target 响应式目标对象（必须是被 Vue 代理的对象，如 reactive 包装）
 * @param target.content 目标对象的文本字段
 * @param text 完整文本
 * @param options 配置
 */
export async function runTypewriter(
  target: { content: string },
  text: string,
  options: TypewriterOptions = {}
): Promise<void> {
  const { chunkSize = 6, interval = 18, onTick } = options;
  target.content = "";
  for (const chunk of splitChunks(text, chunkSize)) {
    target.content += chunk;
    onTick?.();
    await nextTick();
    await new Promise<void>((resolve) => setTimeout(resolve, interval));
  }
}

/** 按块长切分文本（保留换行，避免单字符过碎） */
function splitChunks(text: string, size: number): string[] {
  return text.match(new RegExp(`.{1,${size}}`, "gs")) ?? [text];
}
