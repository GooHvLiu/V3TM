/**
 * ==========================================
 * 认证相关常量 · 注入契约
 * ------------------------------------------
 * provide/inject 用 symbol 常量 key，类型一并携带
 * 防止字符串拼错、命名冲突、泛型漏写
 * ==========================================
 */
import type { InjectionKey, Ref } from "vue";
import type { CaptchaInfo, LoginParams, RegisterParams } from "@/types";

/** 凭证存储 key（storage 自动加 V3T_ 前缀） */
export const TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

/** 验证码数据（父层 provide → login-form inject） */
export const LOGIN_CAPTCHA_KEY: InjectionKey<Ref<CaptchaInfo | null>> = Symbol("login-captcha");

/** 刷新验证码函数 */
export const LOGIN_CAPTCHA_REFRESH_KEY: InjectionKey<() => Promise<void>> = Symbol("login-captcha-refresh");

/** 登录提交函数 */
export const LOGIN_SUBMIT_KEY: InjectionKey<(params: LoginParams) => Promise<boolean>> = Symbol("login-submit");

/** 注册提交函数 */
export const REGISTER_SUBMIT_KEY: InjectionKey<(params: RegisterParams) => Promise<boolean>> =
  Symbol("register-submit");

/* 用户个人信息 */
export const USER_PROFILE_KEY = "user_profile";

/** 权限缓存 key（刷新后 v-permission 立即可用） */
export const PERMISSIONS_KEY = "permissions";

/** 重发冷却（秒） */
export const FORGOT_RESEND_SECONDS = 60;

/** 邮箱验证码位数 */
export const FORGOT_CODE_LENGTH = 6;

/** 后端 10003 返回的字段名 → 本页表单字段 */
export const FORGOT_FIELD_MAP: Record<string, string> = {
  username: "username",
  email: "email",
  code: "code",
  newPassword: "password",
  captchaCode: "captcha",
  captchaId: "captcha"
};

/** 密码强度：8-32 位，大写/小写/数字/符号四类至少三类，与后端 password.ts 对齐 */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 32;
export const PASSWORD_MIN_CLASSES = 3;
export const hasUpper = (value: string): boolean => /[A-Z]/.test(value);
export const hasLower = (value: string): boolean => /[a-z]/.test(value);
export const hasDigit = (value: string): boolean => /\d/.test(value);
export const hasSymbol = (value: string): boolean => /[^A-Za-z0-9]/.test(value);

/** 已命中的字符类别数量 */
export const passwordClassCount = (value: string): number =>
  [hasUpper(value), hasLower(value), hasDigit(value), hasSymbol(value)].filter(Boolean).length;

/** 表单与规则提示共用同一份判断，避免提示与校验口径漂移 */
export const isPasswordStrong = (value: string): boolean =>
  value.length >= PASSWORD_MIN && value.length <= PASSWORD_MAX && passwordClassCount(value) >= PASSWORD_MIN_CLASSES;

/** 旧密码长度上限：后端 1-64，不套新密码的强度区间 */
export const OLD_PASSWORD_MAX = 64;

/** 强制改密标记：刷新后守卫不等 profile 也能识别 */
export const MUST_CHANGE_PASSWORD_KEY = "must_change_password";
