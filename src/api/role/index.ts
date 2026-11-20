import { http } from "@/utils/request";
import type { RequestConfig } from "@/utils/request";
import type {
  RoleInfo,
  RoleQueryParams,
  RoleListResult,
  CreateRoleParams,
  UpdateRoleParams,
  SaveRolePermissionParams
} from "@/types";

enum API {
  ROLE_LIST = "/v1/role/list",
  ROLE_CREATE = "/v1/role",
  ROLE_UPDATE = "/v1/role/",
  ROLE_DELETE = "/v1/role/",
  ROLE_PERMISSIONS = "/v1/role/"
}

/** 获取角色清单 */
export function fetchRoleList(params?: RoleQueryParams): Promise<RoleListResult> {
  return http.get<RoleListResult>(API.ROLE_LIST, { params });
}

/** 新增角色 */
export function createRole(data: CreateRoleParams, config?: RequestConfig): Promise<RoleInfo> {
  return http.post<RoleInfo>(API.ROLE_CREATE, data, config);
}

/** 更新角色 */
export function updateRole(id: number, data: UpdateRoleParams, config?: RequestConfig): Promise<string> {
  return http.put<string>(`${API.ROLE_UPDATE}${id}`, data, config);
}

/** 删除角色 */
export function deleteRole(id: number): Promise<string> {
  return http.delete<string>(`${API.ROLE_DELETE}${id}`);
}

/** 保存角色权限 */
export function saveRolePermissions(id: number, data: SaveRolePermissionParams): Promise<string> {
  return http.put<string>(`${API.ROLE_PERMISSIONS}${id}/permissions`, data);
}
