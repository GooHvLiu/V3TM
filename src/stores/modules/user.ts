import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { login as loginApi, getProfile, logout as logoutApi } from "@/api";
import {
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_PROFILE_KEY,
  PERMISSIONS_KEY,
  MUST_CHANGE_PASSWORD_KEY
} from "@/constants";
import { storage } from "@/utils";
import type { AuthProfile, LoginParams, LoginResult } from "@/types";

export const useUserStore = defineStore("UserStore", () => {
  const token = ref<string>(storage.get<string>(TOKEN_KEY) ?? "");

  const refreshToken = ref<string>(storage.get<string>(REFRESH_TOKEN_KEY) ?? "");

  // 用户全量信息（profile）与权限均持久化：刷新后立即可用（v-permission 不误判）
  const userProfile = ref<Partial<AuthProfile> | null>(storage.get<Partial<AuthProfile>>(USER_PROFILE_KEY) ?? null);
  const permissions = ref<string[]>(storage.get<string[]>(PERMISSIONS_KEY) ?? []);

  // loading：profile 拉取期间（左下角 + 菜单骨架屏共用）
  const loading = ref<boolean>(false);

  // 强制改密标记：登录响应与 profile 各写一次，同时落 storage 供刷新后判定
  const mustChangePassword = ref<boolean>(storage.get<boolean>(MUST_CHANGE_PASSWORD_KEY) ?? false);

  const isLoggedIn = computed(() => !!token.value);

  /** 写入改密标记：内存 + storage 单点同步 */
  const setMustChangePassword = (flag: boolean): void => {
    mustChangePassword.value = flag;
    if (flag) storage.set(MUST_CHANGE_PASSWORD_KEY, true);
    else storage.remove(MUST_CHANGE_PASSWORD_KEY);
  };

  /** 登录：落凭证与改密标记（用户信息/权限/菜单仍由 profile 提供） */
  const login = async (params: LoginParams): Promise<LoginResult> => {
    const result = await loginApi(params);
    setToken(result.token);
    setRefreshToken(result.refreshToken);
    setMustChangePassword(Boolean(result.userInfo?.mustChangePassword));
    return result;
  };

  /** 拉取当前用户全量信息（详情 + 权限 + 菜单）——唯一入口 */
  const fetchProfile = async (): Promise<AuthProfile> => {
    loading.value = true;
    try {
      const profile = await getProfile();
      userProfile.value = profile;
      permissions.value = profile.permissions;
      setMustChangePassword(Boolean(profile.mustChangePassword));
      storage.set(USER_PROFILE_KEY, profile);
      storage.set(PERMISSIONS_KEY, profile.permissions);
      return profile;
    } finally {
      loading.value = false;
    }
  };

  /** 清空本地凭证（内存 + storage）：主动登出与凭证失效兜底共用 */
  const clearSession = (): void => {
    token.value = "";
    refreshToken.value = "";
    userProfile.value = null;
    permissions.value = [];
    setMustChangePassword(false);
    storage.remove(TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
    storage.remove(USER_PROFILE_KEY);
    storage.remove(PERMISSIONS_KEY);
  };

  /** 登出：先通知服务端吊销全部会话，无论成败再清本地 */
  const logout = async (): Promise<void> => {
    try {
      await logoutApi();
    } catch {
      // 凭证已失效（被踢 / 已登出 / 网络异常）：服务端会话已不可用，本地照常清理
    } finally {
      clearSession();
    }
  };

  /** 写入 token：内存 + storage 单点同步 */
  const setToken = (newToken: string): void => {
    token.value = newToken;
    storage.set(TOKEN_KEY, newToken);
  };
  /** 写入 refreshToken：内存 + storage 单点同步 */
  const setRefreshToken = (newRefreshToken: string): void => {
    refreshToken.value = newRefreshToken;
    storage.set(REFRESH_TOKEN_KEY, newRefreshToken);
  };

  return {
    token,
    refreshToken,
    userProfile,
    permissions,
    loading,
    isLoggedIn,
    mustChangePassword,
    login,
    fetchProfile,
    clearSession,
    logout,
    setToken,
    setRefreshToken,
    setMustChangePassword
  };
});
