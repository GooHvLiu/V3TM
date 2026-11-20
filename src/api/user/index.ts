import { http } from "@/utils/request";
import type { RequestConfig } from "@/utils/request";
import type { UserInfo, UserQueryParams, UserListResult, CreateUserParams, UpdateUserParams } from "@/types";

enum API {
  USER_LIST = "/v1/user/list",
  USER_CREATE = "/v1/user",
  USER_UPDATE = "/v1/user/",
  USER_DELETE = "/v1/user/",
  USER_RESET_PASSWORD = "/v1/user/",
  USER_APPROVE = "/v1/user/",
  USER_REJECT = "/v1/user/",
  USER_BATCH_DELETE = "/v1/user/batch-delete"
}

/** 获取用户清单 */
export function fetchUserList(params: UserQueryParams): Promise<UserListResult> {
  return http.get<UserListResult>(API.USER_LIST, { params });
}

/** 新增用户 */
export function createUser(data: CreateUserParams, config?: RequestConfig): Promise<UserInfo> {
  return http.post<UserInfo>(API.USER_CREATE, data, config);
}

/** 更新用户 */
export function updateUser(id: number, data: UpdateUserParams, config?: RequestConfig): Promise<string> {
  return http.put<string>(`${API.USER_UPDATE}${id}`, data, config);
}

/** 删除用户（软删除） */
export function deleteUser(id: number): Promise<string> {
  return http.delete<string>(`${API.USER_DELETE}${id}`);
}

/** 批量删除用户 */
export function batchDeleteUsers(ids: number[]): Promise<{ deleted: number }> {
  return http.post<{ deleted: number }>(API.USER_BATCH_DELETE, { ids });
}

/** 重置密码：后端固定置为 666666，并把该用户标记为下次登录必须改密 */
export function resetUserPassword(id: number): Promise<null> {
  return http.post<null>(`${API.USER_RESET_PASSWORD}${id}/reset-password`);
}

/** 通过注册审批：待审核 → 启用，保留改密标记；对已启用账号幂等 */
export function approveUser(id: number): Promise<UserInfo> {
  return http.post<UserInfo>(`${API.USER_APPROVE}${id}/approve`);
}

/** 驳回注册审批：待审核 → 停用（不删号）；对已停用账号幂等 */
export function rejectUser(id: number): Promise<UserInfo> {
  return http.post<UserInfo>(`${API.USER_REJECT}${id}/reject`);
}
