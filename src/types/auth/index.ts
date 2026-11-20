// 引入菜单的数据类型
import type { MenuItems } from "@/types";

/** 角色摘要：profile 与 login 的 roles 元素 */
export interface RoleBrief {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

/** 当前用户身份：登录响应与 profile 共用同一套口径 */
export interface UserIdentity {
  /** 主角色：启用角色里级别最高的 code，一个都没有时为 null */
  role: string | null;
  /** 全部启用角色，按级别降序、同级按 id 升序 */
  roles: RoleBrief[];
  /** 启用角色的菜单权限并集 */
  permissions: string[];
}

/** 账号时间字段：登录响应与 profile 共用 */
export interface UserTimestampFields {
  /** 注册时间，ISO 8601 UTC */
  createdAt: string;
  /** 最后登录时间，从未登录为 null */
  lastLoginAt: string | null;
}

/** 登录请求 */
export interface LoginParams {
  username: string;
  password: string;
  captchaCode: string;
  captchaId: string;
}

/** 登录成功返回（凭证已解包，userInfo 里取身份标记） */
export interface LoginResult {
  token: string;
  refreshToken: string;
  userInfo?: UserIdentity & UserTimestampFields & { mustChangePassword?: boolean };
}

/** /v1/auth/profile 当前用户全量信息（详情 + 身份 + 权限 + 菜单 一站式） */
export interface AuthProfile extends UserIdentity, UserTimestampFields {
  id: number;
  username: string;
  realName: string;
  email: string;
  /** 0 停用 / 1 启用 / 2 待审核 */
  status: 0 | 1 | 2;
  /** 管理员新建 / 重置过的账号，首次登录必须先改密 */
  mustChangePassword?: boolean;
  menus: MenuItems;
}

/** 注册请求 */
export interface RegisterParams {
  username: string;
  password: string;
  realName: string;
  email: string;
}

/** 注册结果：账号先落待审核，管理员通过后才能登录 */
export interface RegisterResult {
  username: string;
  /** 固定为待审核 */
  status: 2;
  /** 后端是否开启了注册审批；关闭时注册即启用 */
  approvalRequired: boolean;
}

/** token 刷新请求 */
export interface RefreshParams {
  refreshToken: string;
}

/** 忘记密码 · 申请验证码 */
export interface ForgotParams {
  username: string;
  email: string;
  captchaId: string;
  captchaCode: string;
}

/** 忘记密码 · 申请结果（只回有效期，不回是否发成功） */
export interface ForgotResult {
  expiresMinutes: number;
}

/** 忘记密码 · 提交新密码 */
export interface ResetParams {
  username: string;
  email: string;
  code: string;
  newPassword: string;
}

/** 忘记密码 · 重置结果 */
export interface ResetResult {
  username: string;
}

/** 修改密码 · 请求（旧密码必填，首次改密填管理员给的初始密码） */
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

/** 修改密码 · 结果：成功后凭证已作废，必须重新登录 */
export interface ChangePasswordResult {
  reloginRequired: boolean;
}

/** 请求层统一错误：页面按 code / params.field 分发，按 message 展示 */
export interface PublicRequestError extends Error {
  /** 业务码；网络层失败时为 undefined */
  code?: number;
  /** 原始 msg 标识 */
  msg?: string;
  /** 插值参数，字段类错误取 params.field */
  params?: Record<string, string | number | boolean>;
  /** 失败响应携带的数据，运维任务失败时为执行记录 */
  data?: unknown;
  requestId?: string;
  /** HTTP 状态码；无响应时为 undefined */
  httpStatus?: number;
  /** Retry-After 秒数，限流场景使用 */
  retryAfter?: number;
  /** 已翻译的展示文案 */
  translated?: string;
}
