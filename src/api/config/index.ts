/**
 * ==========================================
 * Config | 系统配置接口
 * ==========================================
 */
import { http } from "@/utils/request";
import type { AxiosRequestConfig } from "axios";
import type { SystemConfigItem, UpdateConfigParams } from "@/types";
import type { RequestExtraConfig } from "@/utils/request";

enum API {
  CONFIG_ALL = "/v1/config/all",
  CONFIG_PUBLIC = "/v1/config/public",
  CONFIG_UPDATE = "/v1/config",
  SUPER_SETTINGS = "/v1/super-admin/settings"
}

/** 可附带静默标记：由页面自行提示，避免与拦截器双弹窗 */
type ConfigRequestConfig = AxiosRequestConfig & RequestExtraConfig;

/** 获取常规可读配置（14 项，super 域项 editable 固定为 0） */
export function getAllConfigs(config?: ConfigRequestConfig): Promise<SystemConfigItem[]> {
  return http.get<SystemConfigItem[]>(API.CONFIG_ALL, config);
}

/** 获取匿名可读的公开配置（无需登录，仅站点名/版权/法务等展示项） */
export function getPublicConfigs(config?: ConfigRequestConfig): Promise<SystemConfigItem[]> {
  const options: ConfigRequestConfig = { _public: true, ...config };
  return http.get<SystemConfigItem[]>(API.CONFIG_PUBLIC, options);
}

/** 更新系统域参数（仅 system 域 4 项可写） */
export function updateConfig(data: UpdateConfigParams, config?: ConfigRequestConfig): Promise<null> {
  return http.put<null>(API.CONFIG_UPDATE, data, config);
}

/** 获取超级设置参数（39 项，editable 恒为 1） */
export function getSuperSettings(config?: ConfigRequestConfig): Promise<SystemConfigItem[]> {
  return http.get<SystemConfigItem[]>(API.SUPER_SETTINGS, config);
}

/** 更新超级设置参数（仅 super 域） */
export function updateSuperSetting(data: UpdateConfigParams, config?: ConfigRequestConfig): Promise<null> {
  return http.put<null>(API.SUPER_SETTINGS, data, config);
}
