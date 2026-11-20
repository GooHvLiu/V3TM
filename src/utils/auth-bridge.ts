/**
 * 认证事件桥接
 * 把请求层的凭证失效 / 强制改密事件落到 store，切断 request → stores 的循环依赖。
 */
import { useMenuStore, useUserStore } from "@/stores";
import { AUTH_EVENT } from "./auth-events";

export const bindAuthEvents = (): (() => void) => {
  const userStore = useUserStore();
  const menuStore = useMenuStore();

  const onUnauthorized = (): void => {
    userStore.clearSession();
    menuStore.setMenus([]);
  };

  const onPasswordRequired = (): void => {
    userStore.setMustChangePassword(true);
  };

  window.addEventListener(AUTH_EVENT.UNAUTHORIZED, onUnauthorized);
  window.addEventListener(AUTH_EVENT.PASSWORD_REQUIRED, onPasswordRequired);

  return () => {
    window.removeEventListener(AUTH_EVENT.UNAUTHORIZED, onUnauthorized);
    window.removeEventListener(AUTH_EVENT.PASSWORD_REQUIRED, onPasswordRequired);
  };
};
