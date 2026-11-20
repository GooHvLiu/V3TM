import { http } from "@/utils/request";
import type { RequestExtraConfig } from "@/utils/request";
import type { AxiosRequestConfig } from "axios";
import type {
  CaptchaInfo,
  LoginParams,
  LoginResult,
  RefreshParams,
  RegisterParams,
  RegisterResult,
  AuthProfile,
  ForgotParams,
  ForgotResult,
  ResetParams,
  ResetResult,
  ChangePasswordParams,
  ChangePasswordResult
} from "@/types";

enum API {
  CAPTCHA_URL = "/v1/captcha",
  LOGIN_URL = "/v1/auth/login",
  LOGOUT_URL = "/v1/auth/logout",
  REFRESH_URL = "/v1/auth/refresh",
  REGISTER_URL = "/v1/auth/register",
  PROFILE_URL = "/v1/auth/profile",
  FORGOT_URL = "/v1/auth/password/forgot",
  RESET_URL = "/v1/auth/password/reset",
  CHANGE_PASSWORD_URL = "/v1/auth/password/change"
}

/** 获取登录验证码 */
export function getCaptcha(): Promise<CaptchaInfo> {
  return http.get<CaptchaInfo>(API.CAPTCHA_URL);
}

/** 用户登录 */
export function login(params: LoginParams): Promise<LoginResult> {
  return http.post<LoginResult>(API.LOGIN_URL, params);
}

/** 获取当前登录用户全量信息（权限/菜单/详情一站式） */
export function getProfile(): Promise<AuthProfile> {
  return http.post<AuthProfile>(API.PROFILE_URL);
}

/* 刷新token：续期请求带标记，拦截器见标记即跳过续期逻辑（防死锁） */
export function refreshToken(params: RefreshParams): Promise<LoginResult> {
  return http.post<LoginResult>(API.REFRESH_URL, params, {
    _isRefresh: true
  } as AxiosRequestConfig & RequestExtraConfig);
}

/* 用户注册：开启审批时账号落待审核，返回体带 approvalRequired 供页面分发文案 */
export function register(params: RegisterParams): Promise<RegisterResult> {
  return http.post<RegisterResult>(API.REGISTER_URL, params);
}

/**
 * 登出：服务端按 userId 吊销全部未吊销会话（全端下线），无请求体、无 query
 * access 过期时由拦截器先续期再重放本请求；静默标记避免主动登出时弹错误条
 */
export function logout(): Promise<null> {
  return http.post<null>(API.LOGOUT_URL, undefined, {
    _silent: true,
    timeout: 5000
  } as AxiosRequestConfig & RequestExtraConfig);
}

/* 发信为同步 SMTP，比普通接口慢；30 秒，不沿用邮件测试的 70 秒 */
const PUBLIC_TIMEOUT = 30_000;

/** 申请重置验证码（公开接口：不带凭证、不续期、提示交给页面） */
export function forgotPassword(params: ForgotParams): Promise<ForgotResult> {
  return http.post<ForgotResult>(API.FORGOT_URL, params, {
    timeout: PUBLIC_TIMEOUT,
    _public: true,
    _silent: true
  } as AxiosRequestConfig & RequestExtraConfig);
}

/** 提交验证码并重置密码 */
export function resetPassword(params: ResetParams): Promise<ResetResult> {
  return http.post<ResetResult>(API.RESET_URL, params, {
    timeout: PUBLIC_TIMEOUT,
    _public: true,
    _silent: true
  } as AxiosRequestConfig & RequestExtraConfig);
}

/** 修改密码（需登录态）：失败码交给页面按字段分发，不弹通用提示 */
export function changePassword(params: ChangePasswordParams): Promise<ChangePasswordResult> {
  return http.post<ChangePasswordResult>(API.CHANGE_PASSWORD_URL, params, {
    _silent: true
  } as AxiosRequestConfig & RequestExtraConfig);
}
