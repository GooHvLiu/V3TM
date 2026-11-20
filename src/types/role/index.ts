/**
 * 角色管理 · 数据类型
 */

/* 角色实体 */
export interface RoleInfo {
  id: number;
  code: string;
  name: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  menuIds: number[];
  permissions: string[];
}

/** 角色列表查询参数：全量返回，无分页 */
export interface RoleQueryParams {
  code?: string;
  name?: string;
}

/** 新增角色请求参数（对应 POST /v1/role 请求体） */
export interface CreateRoleParams {
  code: string;
  name: string;
  description: string;
  status: number;
  menuIds: number[];
}

/** 角色列表响应 */
export type RoleListResult = RoleInfo[];

/** 更新角色请求参数 */
export interface UpdateRoleParams {
  name: string;
  description: string;
  status: number;
  menuIds: number[];
}

/** 保存角色权限请求参数  */
export interface SaveRolePermissionParams {
  permissionCodes: string[];
}
