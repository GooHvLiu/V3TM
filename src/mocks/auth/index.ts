/**
 * 认证 · Mock 登录态解析
 * 身份唯一来源：Authorization header 中的 token（mock-token-{username}）
 * 与后端一致：登录返回凭证 → 前端持久化 → 后续请求带凭证 → 服务端解析身份
 */
import type { AxiosRequestConfig } from "axios";
import { revokeSessionsOfUser } from "../session";
import { parseBody, mockError } from "../utils";
import { isPasswordStrong, OLD_PASSWORD_MAX } from "@/constants";

// 忘记密码：图形码池与两段接口
export * from "./forgot";

/** 管理员下发的初始密码：重置密码与首次改密校验共用 */
export const INITIAL_PASSWORD = "666666";

/** 待改密账号集合（内存态）：管理员新建 / 重置 / 改他人密码时加入，改密成功后移出 */
const mustChangePasswordUsers = new Set<string>(["newUserNotLogin"]);

/** 该账号是否被要求首次登录改密 */
export const isMustChangePassword = (username: string): boolean => mustChangePasswordUsers.has(username);

/** 写入 / 清除改密标记 */
export const setMustChangePassword = (username: string, flag: boolean): void => {
  if (flag) mustChangePasswordUsers.add(username);
  else mustChangePasswordUsers.delete(username);
};

/** 从请求头解析当前登录用户名（token 格式 mock-token-{username}；缺省兜底 admin） */
export const resolveMockUsername = (config: AxiosRequestConfig): string => {
  const auth = (config.headers?.Authorization ?? "") as string;
  const token = auth.replace(/^Bearer\s+/i, "");
  return token.startsWith("mock-token-") ? token.slice("mock-token-".length) : "admin";
};

/** POST /v1/auth/logout：按当前凭证的用户吊销全部会话，前端不读 data */
export const mockLogout = (config: AxiosRequestConfig): null => {
  revokeSessionsOfUser(resolveMockUsername(config));
  return null;
};

/** POST /v1/auth/password/change：成功后凭证作废，前端必须重新登录 */
export const mockChangePassword = (config: AxiosRequestConfig): { reloginRequired: boolean } => {
  const body = parseBody<{ oldPassword?: string; newPassword?: string }>(config);
  const username = resolveMockUsername(config);
  const oldPassword = body.oldPassword ?? "";
  const newPassword = body.newPassword ?? "";

  if (!oldPassword) throw mockError(10003, "PARAM_MISSING");
  if (oldPassword.length > OLD_PASSWORD_MAX) throw mockError(10003, "PARAM_INVALID");
  // 待改密账号只认管理员下发的初始密码，模拟后端校验旧密码
  if (isMustChangePassword(username) && oldPassword !== INITIAL_PASSWORD) {
    throw mockError(20003, "USER_PASSWORD_ERROR");
  }
  // 新旧相同先判：初始密码本身不满足强度，否则这条永远走不到
  if (newPassword === oldPassword) throw mockError(20014, "PASSWORD_SAME_AS_OLD");
  if (!isPasswordStrong(newPassword)) throw mockError(20005, "PASSWORD_WEAK");

  setMustChangePassword(username, false);
  return { reloginRequired: true };
};
