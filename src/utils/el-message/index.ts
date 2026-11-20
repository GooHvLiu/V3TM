/**
 * ==========================================
 * 消息提示封装 TS版
 * ------------------------------------------
 * 统一封装 Element Plus 的 ElMessage，避免每次写 type / offset。
 *
 * @example
 * ElMsg("success", "操作成功");
 * ElMsg("error", "保存失败", "center");
 * ElMsg("warning", "请注意", "bottom", 120);
 * ==========================================
 */
import { ElMessage } from "@/utils/element-plus";

/** 消息提示位置：顶部 / 顶部左侧 / 顶部右侧 / 底部 / 底部左侧 / 底部右侧 */
export type MessagePosition = "top" | "top-left" | "top-right" | "bottom" | "bottom-left" | "bottom-right";

/**
 * 弹出轻量消息提示
 *
 * @param msgType  提示类型
 * @param msg      提示内容
 * @param position 显示位置，默认顶部
 * @param offsetValue 距离视口顶部（或底部）偏移像素，默认 70
 *
 * @example
 * ElMsg("success", "保存成功");
 * ElMsg("error", "网络异常", "center");
 */
export const ElMsg = (
  msgType: "success" | "warning" | "error" | "info",
  msg: string,
  position: MessagePosition = "top",
  offsetValue: number = 70
) => {
  ElMessage({
    type: msgType,
    message: msg,
    placement: position,
    offset: offsetValue
  });
};
