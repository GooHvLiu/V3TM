/**
 * 用户管理 · 数据类型
 * 列表查询复用通用分页契约 PageParams / PageResult
 */

// 引入后端统一返回结构
import type { PageParams, PageResult } from "@/types";

/* 用户实体 */
export interface UserInfo {
  id: number;
  username: string;
  realName: string;
  email: string;
  /** 0 停用 / 1 启用 / 2 待审核 */
  status: 0 | 1 | 2;
  lastLoginAt: string | null;
  createdAt: string;
  /** 后端列表里是角色 code 数组，不是 profile.roles 那种对象数组 */
  roles: string[];
}

/** 用户列表查询参数：分页 + 关键字（username/realName 模糊搜索，AND 语义）+ 状态筛选 */
export interface UserQueryParams extends PageParams {
  username?: string;
  realName?: string;
  status?: 0 | 1 | 2;
}

/** 新增用户请求参数（对应 POST /v1/user 请求体） */
export interface CreateUserParams {
  username: string;
  password: string;
  realName: string;
  email: string;
  roleCodes: string[];
}

/** 用户列表分页响应 */
export type UserListResult = PageResult<UserInfo>;

/** 更新用户请求参数（后端已含 username，与 PUT /v1/user/{id} 契约一致） */
export interface UpdateUserParams {
  username: string;
  realName: string;
  email: string;
  /** 编辑只允许在启用 / 停用之间切换，待审核态由审批接口迁移 */
  status: 0 | 1;
  password?: string;
  roleCodes: string[];
}
