/**
 * ==========================================
 * Config | 系统配置 Store（运行时配置单点读取层）
 * ------------------------------------------
 * 启动拉取 /v1/config/all 缓存；超级设置单独缓存一份。
 * 写库成功后回写本地快照并标记来源为 db，全局展示立即刷新。
 * ==========================================
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getAllConfigs, getPublicConfigs, getSuperSettings, updateConfig as updateConfigApi, updateSuperSetting } from "@/api";
import { request } from "@/utils/request";
import {
  APP_NAME,
  APP_DESCRIPTION,
  SELLER_NAME,
  CONTACT_EMAIL,
  LEGAL_VERSION,
  LEGAL_UPDATE_DATE,
  LEGAL_EFFECTIVE_DATE,
  LOCALES,
  SENSITIVE_CONFIG_MASK
} from "@/constants";
import type { SystemConfigItem, UpdateConfigParams } from "@/types";
import type { Locale } from "@/constants";

/** 受支持的语言集合：后端脏值一律回落中文 */
const SUPPORTED_LOCALES: Locale[] = Object.values(LOCALES);

export const useConfigStore = defineStore("ConfigStore", () => {
  /** 常规可读配置（14 项） */
  const list = ref<SystemConfigItem[]>([]);
  /** 超级设置参数（39 项） */
  const superList = ref<SystemConfigItem[]>([]);

  const loaded = ref<boolean>(false);
  const loading = ref<boolean>(false);
  /** 公开白名单已拉取：未登录态只认这一份，不能当作最终配置 */
  const publicLoaded = ref<boolean>(false);
  const superLoaded = ref<boolean>(false);
  const superLoading = ref<boolean>(false);

  /** 取单键原始值 */
  const getValue = (key: string): string => list.value.find((i) => i.configKey === key)?.configValue ?? "";

  /**
   * 取超级设置单键原始值
   * superList 与常规配置分表存放，必须先用 fetchSuperConfig 拉取；非超管账号取不到时返回空串
   */
  const getSuperValue = (key: string): string =>
    superList.value.find((i) => i.configKey === key)?.configValue ?? "";

  // ============ 读取：后端值 ?? 常量兜底 ============
  const siteName = computed(() => getValue("site_name") || APP_NAME);
  const siteDescription = computed(() => getValue("site_description") || APP_DESCRIPTION);
  const copyright = computed(() => getValue("copyright") || "");
  /** 默认语言：只认语言包已注册的值，其余回落中文，避免把 i18n 切到空语言 */
  const defaultLocale = computed<Locale>(() => {
    const value = getValue("default_locale") || (import.meta.env.VITE_APP_LOCALE as string) || LOCALES.ZH_CN;
    return SUPPORTED_LOCALES.includes(value as Locale) ? (value as Locale) : LOCALES.ZH_CN;
  });
  const requestTimeout = computed(
    () => Number(getValue("request_timeout")) || Number(import.meta.env.VITE_APP_TIME_OUT) || 10_000
  );
  const sellerName = computed(() => getValue("seller_name") || SELLER_NAME);
  const contactEmail = computed(() => getValue("contact_email") || CONTACT_EMAIL);
  const legalVersion = computed(() => getValue("legal_version") || LEGAL_VERSION);
  const legalUpdateDate = computed(() => getValue("legal_update_date") || LEGAL_UPDATE_DATE);
  const legalEffectiveDate = computed(() => getValue("legal_effective_date") || LEGAL_EFFECTIVE_DATE);
  const helpMode = computed(() => getValue("help_mode") || "static");
  const helpAnswerPolicy = computed(() => getValue("help_answer_policy") || "strict");
  /** 自助注册开关：配置值统一是字符串，只有 true / 1 算开启 */
  const registerEnabled = computed(() => {
    const value = getValue("register_enabled");
    return value === "true" || value === "1";
  });

  /** 写库成功后同步快照：值 + 来源 + 更新时间 */
  const patchSnapshot = (target: SystemConfigItem[], key: string, value: string): void => {
    const item = target.find((i) => i.configKey === key);
    if (!item) return;
    item.configValue = value;
    item.source = "db";
    item.updatedAt = new Date().toISOString();
  };

  /** request_timeout 仅前端消费，改完立即套到 axios 默认超时 */
  const applyRequestTimeout = (): void => {
    request.defaults.timeout = requestTimeout.value;
  };

  // ============ Actions ============
  /**
   * 未登录态读匿名公开配置（站点名/版权/法务等展示项）
   * 这份结果只够首屏展示，登录后要用 fetchConfig 换成全量
   */
  const fetchPublicConfig = async (force = false): Promise<void> => {
    if (publicLoaded.value && !force) return;
    loading.value = true;
    try {
      list.value = await getPublicConfigs();
      publicLoaded.value = true;
      loaded.value = false;
      applyRequestTimeout();
    } finally {
      loading.value = false;
    }
  };

  const fetchConfig = async (force = false): Promise<void> => {
    if (loaded.value && !force) return;
    loading.value = true;
    try {
      list.value = await getAllConfigs();
      loaded.value = true;
      applyRequestTimeout();
    } finally {
      loading.value = false;
    }
  };

  const fetchSuperConfig = async (force = false): Promise<void> => {
    if (superLoaded.value && !force) return;
    superLoading.value = true;
    try {
      superList.value = await getSuperSettings();
      superLoaded.value = true;
    } finally {
      superLoading.value = false;
    }
  };

  /** 更新系统域参数；silent=true 时不弹拦截器提示，由页面按错误码自行提示 */
  const saveConfig = async (params: UpdateConfigParams, silent = false): Promise<void> => {
    await updateConfigApi(params, silent ? { _silent: true } : undefined);
    patchSnapshot(list.value, params.key, params.value);
    if (params.key === "request_timeout") applyRequestTimeout();
  };

  /** 更新超级设置；站点/法务/上传属于全局展示项，同步回 list 让页头页脚立即生效 */
  const saveSuperConfig = async (params: UpdateConfigParams, silent = false): Promise<void> => {
    await updateSuperSetting(params, silent ? { _silent: true } : undefined);
    // 敏感参数不回写明文：快照里只留掩码，与读接口一致
    const sensitive = superList.value.find((i) => i.configKey === params.key)?.sensitive ?? false;
    const snapshot = sensitive ? SENSITIVE_CONFIG_MASK : params.value;
    patchSnapshot(superList.value, params.key, snapshot);
    patchSnapshot(list.value, params.key, snapshot);
  };

  return {
    list,
    superList,
    getValue,
    getSuperValue,
    loaded,
    loading,
    publicLoaded,
    superLoaded,
    superLoading,
    siteName,
    siteDescription,
    copyright,
    defaultLocale,
    requestTimeout,
    sellerName,
    contactEmail,
    legalVersion,
    legalUpdateDate,
    legalEffectiveDate,
    helpMode,
    helpAnswerPolicy,
    registerEnabled,
    fetchConfig,
    fetchPublicConfig,
    fetchSuperConfig,
    saveConfig,
    saveSuperConfig
  };
});
