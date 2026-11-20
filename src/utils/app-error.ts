import type { App } from "vue";
import { ElMessage } from "element-plus";
import i18n from "@/locales";

/** 同一轮异常只提示一次，避免组件抛错后又被 window 事件重复播报 */
let notified = false;

const notify = (): void => {
  if (notified) return;
  notified = true;
  ElMessage.error(i18n.global.t("error.UNKNOWN_ERROR"));
  window.setTimeout(() => {
    notified = false;
  }, 3000);
};

const report = (source: string, error: unknown): void => {
  console.error(`[app-error] ${source}`, error);
  if (typeof window !== "undefined") notify();
};

/** 注册 Vue 渲染异常、未处理 Promise 与全局脚本错误三类兜底 */
export const installAppErrorHandler = (app: App): void => {
  app.config.errorHandler = (error, instance, info) => {
    report(`vue:${info}`, error);
    if (import.meta.env.DEV) console.warn("[app-error] component", instance);
  };

  if (typeof window === "undefined") return;

  window.addEventListener("unhandledrejection", (event) => {
    report("promise", event.reason);
  });
  window.addEventListener("error", (event) => {
    // 资源加载失败不带 error 对象，交由浏览器网络面板处理
    if (!event.error) return;
    report("window", event.error);
  });
};
