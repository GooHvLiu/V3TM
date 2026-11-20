/// <reference types="vite/client" />

/**
 * ==========================================
 * 环境变量类型声明
 * ------------------------------------------
 * 只有 VITE_ 前缀的变量会注入前端
 * 环境变量同步声明于此，获得类型提示
 * ==========================================
 */
interface ImportMetaEnv {
  /** 接口基础路径 */
  readonly VITE_APP_BASE_API: string;
  /** Axios 请求超时时间（毫秒） */
  readonly VITE_APP_TIME_OUT: string;
  /** 后端代理目标地址（仅开发环境生效） */
  readonly VITE_APP_PROXY_TARGET: string;
  /** 开发服务器端口 */
  readonly VITE_APP_PORT: string;
  /** 页面标题（浏览器标签页） */
  readonly VITE_APP_TITLE: string;
  /** 默认语言（zh-CN / en） */
  readonly VITE_APP_LOCALE: string;
  /* 本地持久化存储的方式选择 local session */
  readonly VITE_STORAGE_TYPE: "local" | "session";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
