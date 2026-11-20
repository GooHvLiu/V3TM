/**
 * ==========================================
 * 角色标识常量
 * ------------------------------------------
 * 与后端 roles.code 一一对应；
 * 自定义角色在运行时以字符串出现，内置场景用 ROLE 取值
 * ==========================================
 */

// 后端响应回来的用户角色
export const ROLE = {
  ADMIN: "admin",
  OPERATOR: "operator",
  VIEWER: "viewer",
  SUPER_ADMIN: "superAdmin"
} as const;
