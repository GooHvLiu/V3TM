/**
 * ==========================================
 * 系统配置 mock（与 /api/v1/config/all、/api/v1/super-admin/settings 契约一致）
 * ------------------------------------------
 * 一份注册表 + 两个读接口 + 两个写接口；
 * 过滤、editable 覆盖、校验与错误码对齐后端 config.service.ts。
 * ==========================================
 */
import type { AxiosRequestConfig } from "axios";
import type { SystemConfigItem } from "@/types";
import { SENSITIVE_CONFIG_MASK } from "@/constants";
import { parseBody, mockError } from "../utils";

/** 除必填项外，其余字段给统一默认值，避免每条重复书写 */
type ConfigSeed = Omit<
  SystemConfigItem,
  | "description"
  | "editable"
  | "readScope"
  | "validation"
  | "envKey"
  | "restartRequired"
  | "status"
  | "source"
  | "sensitive"
  | "createdAt"
  | "updatedAt"
> &
  Partial<
    Pick<
      SystemConfigItem,
      | "description"
      | "editable"
      | "readScope"
      | "validation"
      | "envKey"
      | "restartRequired"
      | "status"
      | "source"
      | "sensitive"
    >
  >;

const createItem = (seed: ConfigSeed): SystemConfigItem => ({
  editable: 1,
  readScope: "all",
  validation: null,
  envKey: null,
  restartRequired: 0,
  status: 1,
  source: "db",
  sensitive: false,
  createdAt: "",
  updatedAt: "",
  ...seed,
  // 说明文案由前端按 key 渲染，后端只下发标识
  description: `config.${seed.configKey}.description`
});

/**
 * 46 条参数注册表（sort 与库表、后端注册表一致）
 * 库中部分键为 NULL：走环境变量或代码默认值兜底。
 * 邮件服务与日志保留项 readScope=super，只出现在超级设置页。
 */
const configRegistry: SystemConfigItem[] = [
  createItem({
    id: 29,
    configKey: "appVersion",
    configValue: "0.2",
    configScope: "super",
    configGroup: "site",
    valueType: "string",
    defaultValue: "0.2",
    validation: { maxLength: 50 },
    source: "default",
    sort: 9
  }),
  createItem({
    id: 1,
    configKey: "site_name",
    configValue: "V3TM",
    configScope: "super",
    configGroup: "site",
    valueType: "string",
    defaultValue: "V3TM",
    validation: { maxLength: 100 },
    sort: 10
  }),
  createItem({
    id: 2,
    configKey: "site_description",
    configValue: "SOFTWARE DESC.",
    configScope: "super",
    configGroup: "site",
    valueType: "string",
    defaultValue: "SOFTWARE DESC.",
    validation: { maxLength: 500 },
    sort: 11
  }),
  createItem({
    id: 3,
    configKey: "copyright",
    configValue: "© 2026 V3TM",
    configScope: "super",
    configGroup: "site",
    valueType: "string",
    defaultValue: "© 2026 V3TM",
    validation: { maxLength: 200 },
    sort: 12
  }),
  createItem({
    id: 4,
    configKey: "default_locale",
    configValue: "zh-cn",
    configScope: "system",
    configGroup: "general",
    valueType: "enum",
    defaultValue: "zh-cn",
    validation: { options: ["zh-cn", "en-us"] },
    sort: 20
  }),
  createItem({
    id: 5,
    configKey: "request_timeout",
    configValue: "10000",
    configScope: "system",
    configGroup: "general",
    valueType: "number",
    defaultValue: "10000",
    validation: { min: 1000, max: 120000, integer: true },
    sort: 21
  }),
  createItem({
    id: 44,
    configKey: "register_enabled",
    configValue: "false",
    configScope: "system",
    configGroup: "general",
    valueType: "boolean",
    defaultValue: "false",
    validation: { options: ["true", "false"] },
    sort: 22
  }),
  createItem({
    id: 6,
    configKey: "help_mode",
    configValue: "static",
    configScope: "system",
    configGroup: "help",
    valueType: "enum",
    defaultValue: "static",
    validation: { options: ["static", "ai"] },
    sort: 30
  }),
  createItem({
    id: 7,
    configKey: "help_answer_policy",
    configValue: "strict",
    configScope: "system",
    configGroup: "help",
    valueType: "enum",
    defaultValue: "strict",
    validation: { options: ["strict", "lenient"] },
    sort: 31
  }),
  createItem({
    id: 8,
    configKey: "ai_service_url",
    configValue: "http://127.0.0.1:11434",
    configScope: "super",
    configGroup: "ai",
    readScope: "super",
    valueType: "string",
    defaultValue: "http://127.0.0.1:11434",
    validation: { maxLength: 500, format: "url" },
    envKey: "OLLAMA_BASE_URL",
    source: "env",
    sort: 40
  }),
  createItem({
    id: 9,
    configKey: "ai_model_name",
    configValue: "qwen2.5:7b",
    configScope: "super",
    configGroup: "ai",
    readScope: "super",
    valueType: "string",
    defaultValue: "qwen2.5:7b",
    validation: { maxLength: 100 },
    envKey: "OLLAMA_MODEL",
    source: "env",
    sort: 41
  }),
  createItem({
    id: 10,
    configKey: "ai_timeout",
    configValue: "60000",
    configScope: "super",
    configGroup: "ai",
    readScope: "super",
    valueType: "number",
    defaultValue: "60000",
    validation: { min: 1000, max: 300000, integer: true },
    envKey: "OLLAMA_TIMEOUT",
    source: "env",
    sort: 42
  }),
  createItem({
    id: 11,
    configKey: "seller_name",
    configValue: "Public Repository",
    configScope: "super",
    configGroup: "legal",
    valueType: "string",
    defaultValue: "Public Repository",
    validation: { maxLength: 200 },
    sort: 50
  }),
  createItem({
    id: 12,
    configKey: "contact_email",
    configValue: "example@example.com",
    configScope: "super",
    configGroup: "legal",
    valueType: "string",
    defaultValue: "example@example.com",
    validation: { maxLength: 200, format: "email" },
    sort: 51
  }),
  createItem({
    id: 13,
    configKey: "legal_version",
    configValue: "V0.1",
    configScope: "super",
    configGroup: "legal",
    valueType: "string",
    defaultValue: "V0.1",
    validation: { maxLength: 50 },
    sort: 52
  }),
  createItem({
    id: 14,
    configKey: "legal_update_date",
    configValue: "2026-10-20",
    configScope: "super",
    configGroup: "legal",
    valueType: "string",
    defaultValue: "2026-10-20",
    validation: { maxLength: 20, format: "date" },
    sort: 53
  }),
  createItem({
    id: 15,
    configKey: "legal_effective_date",
    configValue: "2026-10-20",
    configScope: "super",
    configGroup: "legal",
    valueType: "string",
    defaultValue: "2026-10-20",
    validation: { maxLength: 20, format: "date" },
    sort: 54
  }),
  createItem({
    id: 16,
    configKey: "health_memory_warn_ratio",
    configValue: "0.85",
    configScope: "super",
    configGroup: "health",
    readScope: "super",
    valueType: "number",
    defaultValue: "0.85",
    validation: { min: 0, max: 1, step: 0.01 },
    sort: 60
  }),
  createItem({
    id: 17,
    configKey: "health_memory_fail_ratio",
    configValue: "0.95",
    configScope: "super",
    configGroup: "health",
    readScope: "super",
    valueType: "number",
    defaultValue: "0.95",
    validation: { min: 0, max: 1, step: 0.01 },
    sort: 61
  }),
  createItem({
    id: 18,
    configKey: "health_ai_probe_timeout_ms",
    configValue: "2000",
    configScope: "super",
    configGroup: "health",
    readScope: "super",
    valueType: "number",
    defaultValue: "2000",
    validation: { min: 500, max: 10000, integer: true },
    sort: 62
  }),
  createItem({
    id: 19,
    configKey: "session_cleanup_keep_days",
    configValue: "7",
    configScope: "super",
    configGroup: "session",
    readScope: "super",
    valueType: "number",
    defaultValue: "7",
    validation: { min: 1, max: 365, integer: true },
    sort: 70
  }),
  createItem({
    id: 20,
    configKey: "metrics_retention_hours",
    configValue: "24",
    configScope: "super",
    configGroup: "metrics",
    readScope: "super",
    valueType: "number",
    defaultValue: "24",
    validation: { min: 1, max: 24, integer: true },
    sort: 80
  }),
  createItem({
    id: 21,
    configKey: "metrics_sample_limit",
    configValue: "200",
    configScope: "super",
    configGroup: "metrics",
    readScope: "super",
    valueType: "number",
    defaultValue: "200",
    validation: { min: 50, max: 1000, integer: true },
    sort: 81
  }),
  createItem({
    id: 22,
    configKey: "ops_task_timeout_minutes",
    configValue: "10",
    configScope: "super",
    configGroup: "ops",
    readScope: "super",
    valueType: "number",
    defaultValue: "10",
    validation: { min: 1, max: 60, integer: true },
    sort: 90
  }),
  createItem({
    id: 23,
    configKey: "help_search_top_n",
    configValue: "3",
    configScope: "super",
    configGroup: "help",
    readScope: "super",
    valueType: "number",
    defaultValue: "3",
    validation: { min: 1, max: 10, integer: true },
    sort: 100
  }),
  createItem({
    id: 24,
    configKey: "help_search_term_limit",
    configValue: "20",
    configScope: "super",
    configGroup: "help",
    readScope: "super",
    valueType: "number",
    defaultValue: "20",
    validation: { min: 5, max: 50, integer: true },
    sort: 101
  }),
  createItem({
    id: 25,
    configKey: "dict_cache_ttl_minutes",
    configValue: "5",
    configScope: "super",
    configGroup: "dict",
    readScope: "super",
    valueType: "number",
    defaultValue: "5",
    validation: { min: 1, max: 60, integer: true },
    sort: 110
  }),
  createItem({
    id: 26,
    configKey: "upload_max_size_mb",
    configValue: "10",
    configScope: "super",
    configGroup: "upload",
    valueType: "number",
    defaultValue: "10",
    validation: { min: 1, max: 100, integer: true },
    envKey: null,
    source: "default",
    sort: 120
  }),
  createItem({
    id: 27,
    configKey: "login_max_failures",
    configValue: "5",
    configScope: "super",
    configGroup: "login",
    readScope: "super",
    valueType: "number",
    defaultValue: "5",
    validation: { min: 1, max: 20, integer: true },
    envKey: "LOGIN_MAX_FAILURES",
    source: "default",
    sort: 130
  }),
  createItem({
    id: 28,
    configKey: "login_lock_minutes",
    configValue: "15",
    configScope: "super",
    configGroup: "login",
    readScope: "super",
    valueType: "number",
    defaultValue: "15",
    validation: { min: 1, max: 1440, integer: true },
    envKey: "LOGIN_LOCK_MINUTES",
    source: "default",
    sort: 131
  }),
  // ---------- 邮件服务 ----------
  createItem({
    id: 40,
    configKey: "mail_enabled",
    configValue: "true",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "boolean",
    defaultValue: "true",
    sort: 140
  }),
  createItem({
    id: 41,
    configKey: "mail_smtp_host",
    configValue: "smtp.qq.com",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "string",
    defaultValue: "smtp.qq.com",
    validation: { maxLength: 200 },
    sort: 141
  }),
  createItem({
    id: 42,
    configKey: "mail_smtp_port",
    configValue: "465",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "number",
    defaultValue: "465",
    validation: { min: 1, max: 65535, integer: true },
    sort: 142
  }),
  createItem({
    id: 43,
    configKey: "mail_smtp_secure",
    configValue: "true",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "boolean",
    defaultValue: "true",
    sort: 143
  }),
  createItem({
    id: 54,
    configKey: "mail_smtp_user",
    configValue: "admin@example.com",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "string",
    defaultValue: "",
    validation: { maxLength: 200, format: "email" },
    sort: 144
  }),
  createItem({
    id: 45,
    configKey: "mail_smtp_pass",
    configValue: "smtp-auth-code",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "string",
    defaultValue: "",
    validation: { maxLength: 200 },
    sensitive: true,
    sort: 145
  }),
  createItem({
    id: 46,
    configKey: "mail_from",
    configValue: "",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "string",
    defaultValue: "",
    validation: { maxLength: 200, format: "email" },
    sort: 146
  }),
  createItem({
    id: 47,
    configKey: "mail_from_name",
    configValue: "V3TM",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "string",
    defaultValue: "V3TM",
    validation: { maxLength: 100 },
    sort: 147
  }),
  createItem({
    id: 48,
    configKey: "mail_timeout_ms",
    configValue: "10000",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "number",
    defaultValue: "10000",
    validation: { min: 1000, max: 60000, integer: true },
    sort: 148
  }),
  createItem({
    id: 49,
    configKey: "mail_imap_host",
    configValue: "imap.qq.com",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "string",
    defaultValue: "imap.qq.com",
    validation: { maxLength: 200 },
    sort: 149
  }),
  createItem({
    id: 50,
    configKey: "mail_imap_port",
    configValue: "993",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "number",
    defaultValue: "993",
    validation: { min: 1, max: 65535, integer: true },
    sort: 150
  }),
  createItem({
    id: 51,
    configKey: "mail_imap_secure",
    configValue: "true",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "boolean",
    defaultValue: "true",
    sort: 151
  }),
  createItem({
    id: 52,
    configKey: "mail_test_readback",
    configValue: "true",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "boolean",
    defaultValue: "true",
    sort: 152
  }),
  createItem({
    id: 53,
    configKey: "mail_test_readback_timeout_ms",
    configValue: "30000",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "number",
    defaultValue: "30000",
    validation: { min: 5000, max: 120000, integer: true },
    sort: 153
  }),
  createItem({
    id: 55,
    configKey: "mail_notify_enabled",
    configValue: "true",
    configScope: "super",
    configGroup: "mail",
    readScope: "super",
    valueType: "boolean",
    defaultValue: "true",
    sort: 154
  }),
  createItem({
    id: 56,
    configKey: "log_retention_days",
    configValue: "30",
    configScope: "super",
    configGroup: "log",
    readScope: "super",
    valueType: "number",
    defaultValue: "30",
    validation: { min: 1, max: 365, integer: true },
    sort: 160
  })
];

/** 按 sort、id 升序（与后端排序一致） */
const bySort = (a: SystemConfigItem, b: SystemConfigItem): number => a.sort - b.sort || a.id - b.id;

/** 敏感参数对外只给掩码；空值仍返回空串，表示尚未设置 */
const toDto = (item: SystemConfigItem): SystemConfigItem =>
  item.sensitive && item.configValue ? { ...item, configValue: SENSITIVE_CONFIG_MASK } : { ...item };

/** GET /v1/config/all：status=1、readScope=all；非 system 域 editable 强制 0 */
export const mockConfigAll = (): SystemConfigItem[] =>
  configRegistry
    .filter((item) => item.status === 1 && item.readScope === "all")
    .map((item) => {
      const copy = toDto(item);
      return copy.configScope === "system" ? copy : { ...copy, editable: 0 };
    })
    .sort(bySort);

/** 匿名可读白名单：与后端 PUBLIC_CONFIG_KEYS 对齐，只放站点展示项 */
const PUBLIC_CONFIG_KEYS: string[] = [
  "appVersion",
  "site_name",
  "site_description",
  "copyright",
  "default_locale",
  "seller_name",
  "contact_email",
  "legal_version",
  "legal_update_date",
  "legal_effective_date",
  "register_enabled"
];

/** GET /v1/config/public：白名单 + 注册表存在 + status=1；匿名只读，editable 一律 0 */
export const mockConfigPublic = (): SystemConfigItem[] =>
  configRegistry
    .filter((item) => item.status === 1 && PUBLIC_CONFIG_KEYS.includes(item.configKey))
    .map((item) => ({ ...toDto(item), editable: 0 }))
    .sort(bySort);

/** GET /v1/super-admin/settings：status=1、scope=super；editable 强制 1 */
export const mockSuperSettings = (): SystemConfigItem[] =>
  configRegistry
    .filter((item) => item.status === 1 && item.configScope === "super")
    .map((item) => ({ ...toDto(item), editable: 1 }))
    .sort(bySort);

/** 值校验：与后端 validateConfigValue 覆盖同一批规则 */
const isValidValue = (item: SystemConfigItem, value: string): boolean => {
  const rule = item.validation;
  if (!rule) return true;
  if (rule.options && !rule.options.includes(value)) return false;
  if (rule.maxLength !== undefined && value.length > rule.maxLength) return false;
  if (rule.format === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  if (rule.format === "url" && !/^https?:\/\/[^\s]+$/i.test(value)) return false;
  if (rule.format === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  if (item.valueType === "number") {
    const num = Number(value);
    if (value === "" || !Number.isFinite(num)) return false;
    if (rule.min !== undefined && num < rule.min) return false;
    if (rule.max !== undefined && num > rule.max) return false;
    if (rule.integer && !Number.isInteger(num)) return false;
  }
  return true;
};

/** 写入判断链：不存在 → 停用 → 域不匹配 → 系统域只读 → 敏感项 → 值非法 */
const applyUpdate = (config: AxiosRequestConfig, scope: SystemConfigItem["configScope"]): void => {
  const { key, value } = parseBody<{ key: string; value: string }>(config);
  const target = configRegistry.find((item) => item.configKey === key);
  if (!target) throw mockError(30009, "CONFIG_NOT_FOUND");
  if (target.status !== 1) throw mockError(30006, "CONFIG_NOT_EDITABLE");
  if (target.configScope !== scope) throw mockError(30007, "CONFIG_SCOPE_DENIED");
  if (scope === "system" && target.editable === 0) throw mockError(30006, "CONFIG_NOT_EDITABLE");
  if (target.sensitive) {
    // 掩码表示保持原值，空串与后端一样直接拒绝
    if (value === SENSITIVE_CONFIG_MASK) return;
    if (!value) throw mockError(30008, "CONFIG_VALUE_INVALID");
  }
  if (!isValidValue(target, value ?? "")) throw mockError(30008, "CONFIG_VALUE_INVALID");

  target.configValue = value ?? "";
  target.source = "db";
  target.updatedAt = new Date().toISOString();
};

/** PUT /v1/config：仅 system 域 */
export const mockConfigUpdate = (config: AxiosRequestConfig): null => {
  applyUpdate(config, "system");
  return null;
};

/** PUT /v1/super-admin/settings：仅 super 域 */
export const mockSuperSettingsUpdate = (config: AxiosRequestConfig): null => {
  applyUpdate(config, "super");
  return null;
};

/** 按 key 取当前生效值：邮件诊断与配置面板共用一份数据 */
export const getMockConfigValue = (key: string): string =>
  configRegistry.find((item) => item.configKey === key)?.configValue ?? "";
