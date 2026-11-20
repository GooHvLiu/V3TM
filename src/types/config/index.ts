/**
 * ==========================================
 * Config | 系统配置类型
 * ==========================================
 */
/** 值来源：库值 / 环境变量兜底 / 代码默认 */
export type ConfigValueSource = "db" | "env" | "default";

/** 参数归属域 */
export type ConfigScope = "system" | "super";

/** 读权限范围 */
export type ConfigReadScope = "all" | "super";

/** 控件类型 */
export type ConfigValueType = "string" | "number" | "boolean" | "enum" | "json";

/** 后端校验规则（接口返回对象，不是 JSON 字符串） */
export interface ConfigValidation {
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
  maxLength?: number;
  options?: string[];
  format?: "email" | "url" | "date";
}

/** 系统配置项（/v1/config/all 与 /v1/super-admin/settings 同一结构） */
export interface SystemConfigItem {
  id: number;
  configKey: string;
  configValue: string;
  /** 敏感参数：读接口恒返回掩码，提交掩码表示不改 */
  sensitive: boolean;
  description: string | null;
  editable: number;
  configScope: ConfigScope;
  configGroup: string;
  readScope: ConfigReadScope;
  valueType: ConfigValueType;
  defaultValue: string | null;
  validation: ConfigValidation | null;
  envKey: string | null;
  restartRequired: number;
  sort: number;
  status: number;
  source: ConfigValueSource;
  createdAt: string;
  updatedAt: string;
}

/** 更新配置请求体（PUT /v1/config 与 PUT /v1/super-admin/settings 均为 key/value） */
export interface UpdateConfigParams {
  key: string;
  value: string;
}
