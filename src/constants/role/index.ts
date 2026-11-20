/**
 * 内置角色
 * ------------------------------------------
 * 名称与说明存在数据库时是 i18n 标识，不允许管理员改写。
 */
export const BUILTIN_ROLE_CODES = ["superAdmin", "admin", "operator", "viewer"] as const;

export const isBuiltinRoleCode = (code?: string | null): boolean =>
  !!code && (BUILTIN_ROLE_CODES as readonly string[]).includes(code);
