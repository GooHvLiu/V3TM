// ==========================================
// Request | Axios 统一封装
// ------------------------------------------
// 唯一请求出口：拦截器 + Mock 适配器 + 类型化解包
// 契约：成功 HTTP 200、code 200；失败 HTTP 状态码表达传输层语义，
// msg 只给标识，插值参数放 params，展示文案由前端 i18n 渲染
// ==========================================
import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { h } from "vue";
import { ElMessage } from "@/utils/element-plus";
import RequestErrorNotice from "@/components/common/feedback/request-error-notice/index.vue";
import { AUTH_EVENT, dispatchAuthEvent } from "./auth-events";
import {
  AUTH,
  MUST_CHANGE_PASSWORD_KEY,
  PASSWORD_CHANGE_REQUIRED,
  PERMISSIONS_KEY,
  REFRESH_TOKEN_KEY,
  RELOGIN_CODES,
  TOKEN_KEY,
  UNAUTHORIZED_CODES,
  USER_PASSWORD_ERROR,
  USER_PROFILE_KEY
} from "@/constants";
import { storage } from "@/utils";
import type { ApiResponse, LoginResult, PublicRequestError } from "@/types";

// i18n 实例：拦截器在模块顶层，不依赖组件上下文
import i18n from "@/locales";

// Mock 接口表（url → 模拟数据）
import { mockApis } from "@/mocks";
import { HTTP_STATUS_BY_CODE } from "@/constants/request/http-status";

// Mock 模式开关：没配环境变量时按开启处理，连后端时显式写 false
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

/** 兼容 legacy:false 下的 Composer 取值方式 */
const translator = i18n.global as unknown as {
  t: (key: string, params?: Record<string, string | number | boolean>) => string;
};

/** 字段标签：点路径取末段，缺词条时回退原字段名 */
const fieldLabel = (field: string): string => {
  const last = field.split(".").pop() ?? field;
  const key = `field.${last}`;
  const text = translator.t(key);
  return text === key ? field : text;
};

/**
 * 标识 → 展示文案
 * 只认标识，不解析 msg 里的分隔符；插值全部来自 params。
 * 缺词条（含当前语言缺、回退语言也缺）时统一兜底 UNKNOWN_ERROR。
 */
export const translateMessage = (
  msg?: string,
  params?: Record<string, string | number | boolean>
): string => {
  if (!msg) return translator.t("error.UNKNOWN_ERROR");
  const key = `error.${msg}`;
  const text = translator.t(key, params ?? {});
  if (text === key) return translator.t("error.UNKNOWN_ERROR");
  return params?.field ? `${text}：${fieldLabel(String(params.field))}` : text;
};

/**
 * 请求配置扩展标记
 * _retry=已重放过；_isRefresh=续期请求（自身失效直接登出，防自锁死锁）
 * _silent=静默请求：业务错误不弹提示，由调用方自行处理（主动登出等）
 */
export interface RequestExtraConfig {
  _retry?: boolean;
  _isRefresh?: boolean;
  _silent?: boolean;
  /** 公开接口：不带凭证、不续期、不登出，业务码直接抛给调用方 */
  _public?: boolean;
}

/** 请求方法统一配置：Axios 原生字段 + 本项目扩展标记 */
export type RequestConfig = AxiosRequestConfig & RequestExtraConfig;

/**
 * 响应头里的请求编号
 * 后端会同时写入响应体与 X-Request-ID，响应体缺失时用它兜底。
 */
const requestIdOf = (response?: AxiosResponse): string | undefined => {
  const value = response?.headers?.["x-request-id"];
  return Array.isArray(value) ? value[0] : value;
};

/** 把响应体与 HTTP 状态收拢成页面可直接用的错误对象 */
const normalizeError = (
  body: Partial<ApiResponse> | undefined,
  httpStatus?: number,
  fallbackMsg = "NETWORK_ERROR"
): PublicRequestError => {
  const msg = typeof body?.msg === "string" && body.msg ? body.msg : fallbackMsg;
  const error = new Error(msg) as PublicRequestError;
  error.code = body?.code;
  error.msg = msg;
  error.params = body?.params;
  error.data = body?.data ?? null;
  error.requestId = body?.requestId;
  error.httpStatus = httpStatus;
  error.translated = translateMessage(msg, body?.params);
  return error;
};

/** 服务端异常与网络中断才附带诊断入口，业务校验错误保持纯文案 */
const needDiagnostic = (error: PublicRequestError): boolean =>
  error.httpStatus === undefined || error.httpStatus >= 500;

/** 统一提示：静默请求与公开接口由调用方自行处理 */
const notify = (error: PublicRequestError, silent?: boolean): void => {
  if (silent) return;
  if (needDiagnostic(error)) {
    ElMessage.error({
      message: h(RequestErrorNotice, { error }),
      duration: 5000,
      showClose: true
    });
    return;
  }
  ElMessage.error(error.translated ?? translateMessage(error.msg));
};

/** 字段错误交由表单处理时，静默请求失败的兜底提示入口 */
export const notifyRequestError = (error: PublicRequestError): void => {
  notify(error);
};

// 401 单飞续期状态：并发 401 只发一次 refresh，其余排队
let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

/** 单飞续期：成功唤醒队列，失败放行空串 */
const handleRefresh = async (silent = false): Promise<string> => {
  const storedRefreshToken = storage.get<string>(REFRESH_TOKEN_KEY) ?? "";
  if (!storedRefreshToken) {
    pendingQueue.forEach((resolve) => resolve(""));
    pendingQueue = [];
    throw new Error("NO_REFRESH_TOKEN");
  }

  try {
    const response = await request.post<ApiResponse<LoginResult>>(
      "/v1/auth/refresh",
      { refreshToken: storedRefreshToken },
      { _isRefresh: true, _silent: silent } as AxiosRequestConfig & RequestExtraConfig
    );
    const result = response.data?.data;
    if (!result?.token) throw new Error("REFRESH_FAILED");
    storage.set(TOKEN_KEY, result.token);
    if (result.refreshToken) storage.set(REFRESH_TOKEN_KEY, result.refreshToken);
    pendingQueue.forEach((resolve) => resolve(result.token));
    pendingQueue = [];
    return result.token;
  } catch (err) {
    pendingQueue.forEach((resolve) => resolve(""));
    pendingQueue = [];
    if (!silent) ElMessage.error(translateMessage("NO_REFRESH_TOKEN"));
    throw err;
  }
};

/** 凭证失效兜底：只清本地并回登录页（不再请求服务端登出，避免拿失效凭证二次请求） */
const toLogin = (): void => {
  storage.remove(TOKEN_KEY);
  storage.remove(REFRESH_TOKEN_KEY);
  storage.remove(USER_PROFILE_KEY);
  storage.remove(PERMISSIONS_KEY);
  storage.remove(MUST_CHANGE_PASSWORD_KEY);
  dispatchAuthEvent(AUTH_EVENT.UNAUTHORIZED);
  const loginPath = `${AUTH.ROOT}/${AUTH.LOGIN}`;
  if (window.location.pathname !== loginPath) window.location.href = loginPath;
};

/** 未完成强制改密：保留凭证，只把页面推到改密页 */
const toForcePassword = (): void => {
  storage.set(MUST_CHANGE_PASSWORD_KEY, true);
  dispatchAuthEvent(AUTH_EVENT.PASSWORD_REQUIRED);
  const forcePath = `${AUTH.ROOT}/${AUTH.FORCE_PASSWORD}`;
  if (window.location.pathname !== forcePath) window.location.href = forcePath;
};

/**
 * 单飞续期 + 重放（HTTP 401 与业务失效码共用同一套逻辑）
 * @param config 原请求配置（带 _retry 防死循环标记）
 */
const handleUnauthorized = (config: InternalAxiosRequestConfig & RequestExtraConfig): Promise<AxiosResponse> => {
  return new Promise((resolve, reject) => {
    if (isRefreshing) {
      pendingQueue.push((token) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          resolve(request(config));
        } else {
          reject(normalizeError(undefined, 401, "UNAUTHORIZED"));
        }
      });
      return;
    }

    isRefreshing = true;
    handleRefresh(Boolean(config._silent))
      .then((token) => {
        isRefreshing = false;
        config.headers.Authorization = `Bearer ${token}`;
        resolve(request(config));
      })
      .catch((err) => {
        isRefreshing = false;
        toLogin();
        reject(err);
      });
  });
};

// 创建 axios 实例（baseURL 走环境变量，开发期由 vite proxy 代理）
export const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: Number(import.meta.env.VITE_APP_TIME_OUT) || 10000
});

// 请求拦截器
request.interceptors.request.use((config) => {
  const token = storage.get<string>(TOKEN_KEY);
  const isPublic = Boolean((config as InternalAxiosRequestConfig & RequestExtraConfig)._public);
  if (token && !isPublic) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截器：成功分支与 HTTP 失败分支都要处理，错误一律带上业务码与参数
request.interceptors.response.use(
  (response) => {
    // 文件流不参与业务壳解包，原样交给调用方
    if (response.config.responseType === "blob") return response;
    const res = response.data as ApiResponse;
    const config = response.config as InternalAxiosRequestConfig & RequestExtraConfig;

    // 响应头与响应体双写 requestId，缺失时补齐
    if (res && !res.requestId) res.requestId = requestIdOf(response);

    // 公开接口：不续期、不登出、不弹全局提示；业务码交给页面分发
    if (config._public) {
      if (res.code !== 200) {
        return Promise.reject(
          normalizeError(res, response.status, response.status >= 400 ? "NETWORK_ERROR" : "UNKNOWN_ERROR")
        );
      }
      return response;
    }

    // 未完成强制改密：回改密页，不弹通用错误、不重试
    if (res.code === PASSWORD_CHANGE_REQUIRED) {
      toForcePassword();
      return Promise.reject(normalizeError(res, response.status));
    }

    // 凭证缺失 / 会话已被吊销：续期无法自愈，清本地重登
    if (RELOGIN_CODES.includes(res.code)) {
      if (!storage.get<string>(TOKEN_KEY)) return Promise.reject(normalizeError(res, response.status));
      notify(normalizeError(res, response.status), config._silent);
      toLogin();
      return Promise.reject(normalizeError(res, response.status));
    }

    // access 过期：单飞续期 + 重放原请求
    if (UNAUTHORIZED_CODES.includes(res.code)) {
      if (config._isRefresh || config._retry) {
        toLogin();
        return Promise.reject(normalizeError(res, response.status));
      }
      config._retry = true;
      return handleUnauthorized(config);
    }

    // 其他业务错误（含 10104 权限不足）：统一 i18n 提示，不登出
    if (res.code !== 200) {
      const error = normalizeError(res, response.status);
      notify(error, config._silent);
      return Promise.reject(error);
    }
    return response;
  },
  async (error) => {
    const { response } = error;
    const config = (error.config ?? {}) as InternalAxiosRequestConfig & RequestExtraConfig;
    let body = response?.data as Partial<ApiResponse> | undefined;

    // 二进制请求失败时响应体也是 Blob，先把 JSON 壳读出来才能拿到业务码
    if (config.responseType === "blob" && typeof Blob !== "undefined" && body instanceof Blob) {
      try {
        body = JSON.parse(await body.text()) as ApiResponse;
      } catch {
        body = undefined;
      }
    }

    // 响应体没带 requestId 时从响应头补齐，保证诊断信息可复制
    if (body && !body.requestId) body.requestId = requestIdOf(response);

    // 公开接口：带上状态码与 Retry-After，交给页面自行提示
    if (config._public) {
      const failed = normalizeError(body, response?.status);
      const headerRetry = Number(response?.headers?.["retry-after"]);
      failed.retryAfter = headerRetry || Number(failed.params?.retryAfterSeconds) || undefined;
      return Promise.reject(failed);
    }

    // HTTP 401：登录失败等表单错误不能触发续期，只提示并交还页面
    if (response?.status === 401) {
      if (typeof body?.code === "number" && body.code === USER_PASSWORD_ERROR && !config._isRefresh) {
        const failed = normalizeError(body, 401);
        notify(failed, config._silent);
        return Promise.reject(failed);
      }
      if (config._isRefresh || config._retry) {
        toLogin();
        return Promise.reject(normalizeError(body, 401));
      }
      config._retry = true;
      return handleUnauthorized(config);
    }

    const failed = normalizeError(body, response?.status);
    const headerRetry = Number(response?.headers?.["retry-after"]);
    failed.retryAfter = headerRetry || Number(failed.params?.retryAfterSeconds) || undefined;

    // 强制改密优先于其它 403
    if (body?.code === PASSWORD_CHANGE_REQUIRED) {
      toForcePassword();
      return Promise.reject(failed);
    }

    // 会话已失效：清本地重登
    if (typeof body?.code === "number" && RELOGIN_CODES.includes(body.code)) {
      notify(failed, config._silent);
      toLogin();
      return Promise.reject(failed);
    }

    // 其余 4xx / 5xx 统一按 msg + params 渲染，data 原样带回给页面
    notify(failed, config._silent);
    return Promise.reject(failed);
  }
);

/** Mock 响应壳：补齐 params / requestId，状态码与业务码保持一致 */
const mockEnvelope = (
  code: number,
  msg: string,
  data: unknown,
  params?: Record<string, string | number | boolean>
): ApiResponse => ({
  code,
  msg,
  params,
  data: data ?? null,
  timestamp: Date.now(),
  requestId: `mock-${Math.random().toString(16).slice(2, 10)}`
});

// Mock 适配器：开发期请求在 axios 通道内被本地数据拦截（保持"统一 axios"）
if (USE_MOCK) {
  request.defaults.adapter = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const matchEntry = (url: string): { entry: unknown; params: Record<string, string> } => {
      const exact = mockApis[url];
      if (exact !== undefined) return { entry: exact, params: {} };
      for (const key of Object.keys(mockApis)) {
        if (!key.includes(":")) continue;
        const keyParts = key.split("/");
        const urlParts = url.split("/");
        if (keyParts.length !== urlParts.length) continue;
        const params: Record<string, string> = {};
        let matched = true;
        for (let i = 0; i < keyParts.length; i++) {
          if (keyParts[i].startsWith(":")) {
            params[keyParts[i].slice(1)] = urlParts[i];
          } else if (keyParts[i] !== urlParts[i]) {
            matched = false;
            break;
          }
        }
        if (matched) return { entry: mockApis[key], params };
      }
      return { entry: undefined, params: {} };
    };

    const { entry, params: pathParams } = matchEntry(config.url ?? "");
    config.params = { ...config.params, ...pathParams };

    // 业务错误就地转成响应壳：状态码按业务码映射，才能走到真实失败分支
    let payload: unknown;
    try {
      payload = await (typeof entry === "function"
        ? (entry as (config: AxiosRequestConfig) => unknown)(config)
        : entry);
    } catch (mockFailure) {
      const code = (mockFailure as { mockCode?: number }).mockCode;
      if (typeof code !== "number") throw mockFailure;
      const params = (mockFailure as { mockParams?: Record<string, string | number | boolean> }).mockParams;
      return {
        data: mockEnvelope(code, (mockFailure as Error).message, null, params),
        status: HTTP_STATUS_BY_CODE[code] ?? 200,
        statusText: "",
        headers: {},
        config: config as InternalAxiosRequestConfig
      };
    }

    if (payload === undefined) {
      return {
        data: mockEnvelope(404, "API_NOT_FOUND", null),
        status: 404,
        statusText: "",
        headers: {},
        config: config as InternalAxiosRequestConfig
      };
    }

    // 文件流：mock 直接给 Blob，不再套业务壳
    if (config.responseType === "blob") {
      return {
        data: payload instanceof Blob ? payload : new Blob([String(payload ?? "")]),
        status: 200,
        statusText: "OK",
        headers: {},
        config: config as InternalAxiosRequestConfig
      };
    }

    return {
      data: mockEnvelope(200, "SUCCESS", payload),
      status: 200,
      statusText: "OK",
      headers: {},
      config: config as InternalAxiosRequestConfig
    };
  };
}

// 类型化请求方法：拦截器放行 AxiosResponse，此处解包业务数据
export const http = {
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await request.get<ApiResponse<T>>(url, config);
    return response.data.data;
  },
  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await request.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },
  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await request.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },
  async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await request.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },
  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await request.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  },
  /** 二进制流：文件预览用；后端把业务错误包成 JSON 时解出 code 再抛出 */
  async getBlob(url: string, config?: RequestConfig): Promise<Blob> {
    const response = await request.get<Blob>(url, { ...config, responseType: "blob" });
    const blob = response.data;
    if (blob.type.includes("application/json")) {
      const text = await blob.text();
      try {
        const body = JSON.parse(text) as ApiResponse;
        throw normalizeError(body);
      } catch (error) {
        if (error instanceof SyntaxError) throw normalizeError(undefined, undefined, "FILE_PREVIEW_FAILED");
        throw error;
      }
    }
    return blob;
  },
  /** multipart 提交：Content-Type 与 boundary 由浏览器生成，调用方不要手写 */
  async postForm<T>(url: string, form: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await request.post<ApiResponse<T>>(url, form, config);
    return response.data.data;
  },
  async putForm<T>(url: string, form: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await request.put<ApiResponse<T>>(url, form, config);
    return response.data.data;
  }
};
