/**
 * 用户管理 · Mock 数据
 * 与后端 /api/v1/user 契约严格一致：分页切片 / 新增落库
 */
import type { AxiosRequestConfig } from "axios";
import type {
  UserInfo,
  UserListResult,
  CreateUserParams,
  UpdateUserParams,
  RegisterParams,
  RegisterResult
} from "@/types";
import { resolveMockUsername, setMustChangePassword } from "../auth";
import { parseBody, mockError } from "../utils";

/** 当前登录身份是否为超级管理员（供角色/用户列表过滤，单点维护） */
export const isCurrentSuperAdmin = (config: AxiosRequestConfig): boolean =>
  userList.find((u) => u.username === resolveMockUsername(config))?.roles.includes("superAdmin") ?? false;

/** 用户 mock 数据集（内存态：新增/删除会变更） */
export const userList: UserInfo[] = [
  {
    id: 1,
    username: "admin",
    realName: "Administrator",
    email: "admin@example.com",
    status: 1,
    lastLoginAt: "2026-10-28T09:00:00.000Z",
    createdAt: "2026-01-05T08:00:00.000Z",
    roles: ["admin"]
  },
  {
    id: 2,
    username: "zhangjian",
    realName: "张坚",
    email: "zhangjian@example.com",
    status: 1,
    lastLoginAt: "2026-10-27T14:20:00.000Z",
    createdAt: "2026-02-11T03:00:00.000Z",
    roles: ["viewer"]
  },
  {
    id: 3,
    username: "liuyang",
    realName: "刘洋",
    email: "liuyang@example.com",
    status: 1,
    lastLoginAt: "2026-10-26T08:40:00.000Z",
    createdAt: "2026-03-02T09:30:00.000Z",
    roles: ["viewer", "operator"]
  },
  {
    id: 4,
    username: "wangfang",
    realName: "王芳",
    email: "wangfang@example.com",
    status: 1,
    lastLoginAt: "2026-10-25T10:15:00.000Z",
    createdAt: "2026-03-18T06:00:00.000Z",
    roles: ["operator"]
  },
  {
    id: 5,
    username: "zhaomin",
    realName: "赵敏",
    email: "zhaomin@example.com",
    status: 0,
    lastLoginAt: "2026-09-30T02:00:00.000Z",
    createdAt: "2026-04-01T01:00:00.000Z",
    roles: ["viewer"]
  },
  {
    id: 6,
    username: "chenhao",
    realName: "陈浩",
    email: "chenhao@example.com",
    status: 1,
    lastLoginAt: "2026-10-24T07:30:00.000Z",
    createdAt: "2026-04-22T08:00:00.000Z",
    roles: ["viewer"]
  },
  {
    id: 7,
    username: "sunli",
    realName: "孙丽",
    email: "sunli@example.com",
    status: 1,
    lastLoginAt: "2026-10-23T12:00:00.000Z",
    createdAt: "2026-05-10T02:30:00.000Z",
    roles: ["operator"]
  },
  {
    id: 8,
    username: "zhouwei",
    realName: "周伟",
    email: "zhouwei@example.com",
    status: 0,
    lastLoginAt: "2026-09-15T05:00:00.000Z",
    createdAt: "2026-06-05T10:00:00.000Z",
    roles: ["viewer"]
  },
  {
    id: 9,
    username: "wuxin",
    realName: "吴欣",
    email: "wuxin@example.com",
    status: 1,
    lastLoginAt: "2026-10-20T09:50:00.000Z",
    createdAt: "2026-07-01T04:00:00.000Z",
    roles: ["viewer", "operator"]
  },
  {
    id: 10,
    username: "xujun",
    realName: "徐军",
    email: "xujun@example.com",
    status: 1,
    lastLoginAt: "2026-10-19T15:30:00.000Z",
    createdAt: "2026-08-12T07:00:00.000Z",
    roles: ["viewer"]
  },
  {
    id: 11,
    username: "superAdmin",
    realName: "admin",
    email: "example@example.com",
    status: 1,
    // 密码明文（仅 mock 备注，生产绝不落库）：superAdmin123456@
    lastLoginAt: null,
    createdAt: "2026-11-05T06:42:11.863Z",
    roles: ["superAdmin"]
  },
  {
    // 管理员新建后从未登录过的账号：密码 666666，登录即被拦到改密页
    id: 12,
    username: "newUserNotLogin",
    realName: "待改密用户",
    email: "newuser@example.com",
    status: 1,
    lastLoginAt: null,
    createdAt: "2026-11-08T10:00:00.000Z",
    roles: ["viewer"]
  },
  {
    // 自助注册待审核：列表里可点通过 / 驳回，验证审批链路
    id: 13,
    username: "pendingUser",
    realName: "待审核用户",
    email: "pending@example.com",
    status: 2,
    lastLoginAt: null,
    createdAt: "2026-11-09T02:00:00.000Z",
    roles: []
  }
];

/** GET /v1/user/list：关键字与状态过滤（AND）+ 分页切片 */
export const mockUserList = (config: AxiosRequestConfig): UserListResult => {
  const params = (config.params ?? {}) as {
    page?: number;
    pageSize?: number;
    username?: string;
    realName?: string;
    status?: 0 | 1 | 2;
  };
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, params.pageSize ?? 10);
  // 超级管理员账号隐藏：非超管身份不可见（后端行为模拟）
  let filtered = userList;

  if (!isCurrentSuperAdmin(config)) filtered = filtered.filter((u) => u.username !== "superAdmin");
  if (params.username) filtered = filtered.filter((u) => u.username.includes(params.username as string));
  if (params.realName) filtered = filtered.filter((u) => u.realName.includes(params.realName as string));
  // 0 停用 / 1 启用 / 2 待审核，与后端 list 的 status 口径一致
  if (params.status !== undefined) filtered = filtered.filter((u) => u.status === Number(params.status));
  const start = (page - 1) * pageSize;
  return {
    list: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize
  };
};

/** POST /v1/user：新增用户（内存落库，刷新列表可见） */
export const mockUserCreate = (config: AxiosRequestConfig): UserInfo => {
  const body = parseBody<CreateUserParams>(config);
  const newUser: UserInfo = {
    id: Math.max(0, ...userList.map((u) => u.id)) + 1,
    username: body.username,
    realName: body.realName,
    email: body.email,
    status: 1,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    roles: body.roleCodes
  };
  userList.unshift(newUser);
  // 与后端一致：新建账号自动置待改密，首次登录必须先设新密码
  setMustChangePassword(newUser.username, true);
  return newUser;
};

/** PUT /v1/user/{id}：按 id 更新（契约含 username） */
export const mockUserUpdate = (config: AxiosRequestConfig): string => {
  const id = Number((config.params as { id?: string })?.id);
  const body = parseBody<UpdateUserParams>(config);
  const target = userList.find((u) => u.id === id);
  if (!target) return "USER_NOT_FOUND";
  target.username = body.username;
  target.realName = body.realName;
  target.email = body.email;
  target.status = body.status;
  target.roles = body.roleCodes;
  // password 仅校验不落库（响应契约无该字段）；带密码即视为管理员改密，下次登录须再次改密
  if (body.password) setMustChangePassword(target.username, true);
  return "SUCCESS";
};

/** POST /v1/user/{id}/reset-password：固定置为初始密码，并要求下次登录改密 */
export const mockUserResetPassword = (config: AxiosRequestConfig): null => {
  const id = Number((config.params as { id?: string })?.id);
  const target = userList.find((u) => u.id === id);
  if (!target) throw mockError(20001, "USER_NOT_EXIST");
  setMustChangePassword(target.username, true);
  return null;
};

/** POST /v1/user/{id}/approve：待审核 → 启用；已启用时幂等 */
export const mockUserApprove = (config: AxiosRequestConfig): UserInfo => {
  const id = Number((config.params as { id?: string })?.id);
  const target = userList.find((u) => u.id === id);
  if (!target) throw mockError(20001, "USER_NOT_EXIST");
  if (target.status === 1) return target;
  // 已停用的账号不能走审批通过
  if (target.status === 0) throw mockError(20004, "USER_DISABLED");
  target.status = 1;
  // 与后端一致：审批不消费改密标记，首次登录仍要先改初始密码
  setMustChangePassword(target.username, true);
  return target;
};

/** POST /v1/user/{id}/reject：待审核 → 停用（保留账号）；已停用时幂等 */
export const mockUserReject = (config: AxiosRequestConfig): UserInfo => {
  const id = Number((config.params as { id?: string })?.id);
  const target = userList.find((u) => u.id === id);
  if (!target) throw mockError(20001, "USER_NOT_EXIST");
  if (target.status === 0) return target;
  // 已启用的账号不在待审核态，不能驳回
  if (target.status === 1) throw mockError(20017, "USER_NOT_PENDING_APPROVAL");
  target.status = 0;
  setMustChangePassword(target.username, true);
  return target;
};

/** POST /v1/auth/register：落库为待审核账号，返回审批提示所需字段 */
export const mockUserRegister = (config: AxiosRequestConfig): RegisterResult => {
  const body = parseBody<RegisterParams>(config);
  // 同名账号已存在：真实后端会拒绝，mock 不重复建档，按同一结果返回
  if (!userList.some((u) => u.username === body.username)) {
    const newUser: UserInfo = {
      id: Math.max(0, ...userList.map((u) => u.id)) + 1,
      username: body.username,
      realName: body.realName,
      email: body.email,
      status: 2,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      // 与后端一致：注册不带角色，审批通过后再由管理员分配
      roles: []
    };
    userList.unshift(newUser);
  }
  return { username: body.username, status: 2, approvalRequired: true };
};

/** DELETE /v1/user/{id}：软删除（列表不再返回；后端由 status 体现，mock 直接移除） */
export const mockUserDelete = (config: AxiosRequestConfig): string => {
  const id = Number((config.params as { id?: string })?.id);
  const index = userList.findIndex((u) => u.id === id);
  if (index === -1) return "USER_NOT_FOUND";
  userList.splice(index, 1);
  return "SUCCESS";
};

/** DELETE /v1/user：批量软删除，返回实际删除数 */
export const mockUserBatchDelete = (config: AxiosRequestConfig): { deleted: number } => {
  const { ids } = parseBody<{ ids: number[] }>(config);
  const before = userList.length;
  ids.forEach((id) => {
    const index = userList.findIndex((u) => u.id === id);
    if (index !== -1) userList.splice(index, 1);
  });
  return { deleted: before - userList.length };
};
