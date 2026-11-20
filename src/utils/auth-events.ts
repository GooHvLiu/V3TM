/**
 * 认证事件
 * 请求层不直接读写 store，凭证失效与强制改密通过事件通知应用层。
 */
export const AUTH_EVENT = {
  UNAUTHORIZED: "auth:unauthorized",
  PASSWORD_REQUIRED: "auth:password-required"
} as const;

export type AuthEventName = (typeof AUTH_EVENT)[keyof typeof AUTH_EVENT];

export const dispatchAuthEvent = (name: AuthEventName): void => {
  window.dispatchEvent(new Event(name));
};
