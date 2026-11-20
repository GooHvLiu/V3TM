/**
 * 角色管理 · Mock 数据
 * 与后端 /api/v1/role 契约严格一致：全量数组返回 / 新增落库
 */
import type { AxiosRequestConfig } from "axios";
import type { RoleInfo, CreateRoleParams, UpdateRoleParams, SaveRolePermissionParams } from "@/types";
import { isCurrentSuperAdmin } from "../users";
import { parseBody } from "../utils";

/** 超级管理员（id=4，仅设计者维护）：对非超管身份隐藏 + 禁止修改/删除/改权限 */
const isSuperAdmin = (id: number): boolean => roleList.some((r) => r.id === id && r.code === "superAdmin");

/** 角色 mock 数据集（内存态：新增/删除会变更） */
export const roleList: RoleInfo[] = [
  {
    id: 1,
    code: "admin",
    name: "role.admin.name",
    description: "role.admin.description",
    status: 1,
    createdAt: "2026-01-05T08:00:00.000Z",
    updatedAt: "2026-01-05T08:00:00.000Z",
    menuIds: [
      1, 2, 3, 31, 32, 4, 41, 42, 5, 8, 2015, 2016, 6, 62, 2001, 2002, 2003, 2004, 65, 2017, 66, 2036, 2037, 7, 71,
      72, 73, 74
    ],
    permissions: [
      "dashBoard:list",
      "dataSearch:list",
      "designTasks:list",
      "designTasks:cuttingMachine:list",
      "designTasks:testMachine:list",
      "projects:list",
      "projects:tickets:list",
      "projects:orders:list",
      "systemSettings:list",
      "systemSettings:config:list",
      "systemSettings:config:update",
      "designSystem:list",
      "adminCenter:list",
      "adminCenter:userCenter:list",
      "adminCenter:user:list",
      "adminCenter:user:create",
      "adminCenter:user:update",
      "adminCenter:user:delete",
      "adminCenter:logsCenter:list",
      "adminCenter:log:list",
      "adminCenter:noticeCenter:list",
      "adminCenter:notice:send",
      "adminCenter:notice:manage",
      "about:list",
      "about:githubPage:list",
      "about:appDown:list",
      "about:credits:list",
      "about:help:list"
    ]
  },
  {
    id: 2,
    code: "operator",
    name: "role.operator.name",
    description: "role.operator.description",
    status: 1,
    createdAt: "2026-02-11T03:00:00.000Z",
    updatedAt: "2026-02-11T03:00:00.000Z",
    menuIds: [1, 2, 3, 31, 32, 4, 41, 42, 5, 8, 66, 7, 71, 72, 73, 74],
    permissions: [
      "dashBoard:list",
      "dataSearch:list",
      "designTasks:list",
      "designTasks:cuttingMachine:list",
      "designTasks:testMachine:list",
      "projects:list",
      "projects:tickets:list",
      "projects:orders:list",
      "systemSettings:list",
      "designSystem:list",
      "adminCenter:noticeCenter:list",
      "about:list",
      "about:githubPage:list",
      "about:appDown:list",
      "about:credits:list",
      "about:help:list"
    ]
  },
  {
    id: 3,
    code: "viewer",
    name: "role.viewer.name",
    description: "role.viewer.description",
    status: 1,
    createdAt: "2026-03-02T09:30:00.000Z",
    updatedAt: "2026-03-02T09:30:00.000Z",
    menuIds: [1, 2, 3, 31, 32, 4, 41, 42, 5, 8, 66, 7, 71, 72, 73, 74],
    permissions: [
      "dashBoard:list",
      "dataSearch:list",
      "designTasks:list",
      "designTasks:cuttingMachine:list",
      "designTasks:testMachine:list",
      "projects:list",
      "projects:tickets:list",
      "projects:orders:list",
      "designSystem:list",
      "adminCenter:noticeCenter:list",
      "about:list",
      "about:githubPage:list",
      "about:appDown:list",
      "about:credits:list",
      "about:help:list"
    ]
  },
  {
    id: 4,
    code: "superAdmin",
    name: "role.superAdmin.name",
    description: "role.superAdmin.description",
    status: 1,
    createdAt: "2026-11-05T06:42:11.518Z",
    updatedAt: "2026-11-05T06:42:11.518Z",
    // 业务菜单 30（与种子 BIZ_MOCK_IDS 同序，末尾为本仓库新增的组件演示页）+ 隐藏权限点 27
    menuIds: [
      1, 2, 3, 31, 32, 4, 41, 42, 5, 6, 62, 65, 66, 7, 71, 72, 73, 74, 8, 86, 87, 83, 81, 84, 85, 61, 63, 67, 82, 64, 2001,
      2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
      2021, 2022, 2023, 2024, 2026, 2028, 2029, 2030, 2031, 2036, 2037, 2038
    ],
    permissions: [
      // 菜单节点码（29）
      "dashBoard:list",
      "dataSearch:list",
      "designTasks:list",
      "designTasks:cuttingMachine:list",
      "designTasks:testMachine:list",
      "projects:list",
      "projects:tickets:list",
      "projects:orders:list",
      "systemSettings:list",
      "adminCenter:list",
      "adminCenter:userCenter:list",
      "adminCenter:logsCenter:list",
      "adminCenter:noticeCenter:list",
      "adminCenter:log:list",
      "adminCenter:log:cleanup",
      "adminCenter:notice:send",
      "adminCenter:notice:manage",
      "about:list",
      "about:githubPage:list",
      "about:appDown:list",
      "about:credits:list",
      "about:help:list",
      "designSystem:list",
      "superAdmin:settings:list",
      "superAdmin:settings:update",
      "superAdmin:center:list",
      "superAdmin:healthCheck:list",
      "superAdmin:sessionCenter:list",
      "superAdmin:metricsCenter:list",
      "superAdmin:taskCenter:list",
      "superAdmin:dictCenter:list",
      "superAdmin:roleCenter:list",
      "superAdmin:menuCenter:list",
      "superAdmin:knowledgeCenter:list",
      "superAdmin:permissionCenter:list",
      // 按钮码（29）
      "systemSettings:config:list",
      "systemSettings:config:update",
      "adminCenter:user:list",
      "adminCenter:user:create",
      "adminCenter:user:update",
      "adminCenter:user:delete",
      "adminCenter:log:list",
      "superAdmin:health:list",
      "superAdmin:health:probe",
      "superAdmin:session:list",
      "superAdmin:session:revoke",
      "superAdmin:session:cleanup",
      "superAdmin:metrics:reset",
      "superAdmin:task:run",
      "superAdmin:task:danger",
      "superAdmin:dict:update",
      "superAdmin:role:list",
      "superAdmin:role:create",
      "superAdmin:role:update",
      "superAdmin:role:delete",
      "superAdmin:menu:list",
      "superAdmin:menu:create",
      "superAdmin:menu:update",
      "superAdmin:menu:delete",
      "superAdmin:menu:restore",
      "superAdmin:help:list",
      "superAdmin:help:reindex",
      "superAdmin:help:slot:manage",
      "superAdmin:help:doc:create",
      "superAdmin:help:doc:update",
      "superAdmin:help:doc:delete",
      "superAdmin:role:assign"
    ]
  }
];

/** 角色级别：与后端 ROLE_LEVEL 一致，决定主角色与排序 */
const ROLE_LEVEL: Record<string, number> = { superAdmin: 100, admin: 50, operator: 20, viewer: 10 };

/** 用户启用的角色：级别降序、同级按 id 升序，与后端 profile.roles 同口径 */
export const resolveUserRoles = (codes: string[]): RoleInfo[] =>
  roleList
    .filter((r) => codes.includes(r.code) && r.status === 1)
    .sort((a, b) => (ROLE_LEVEL[b.code] ?? 0) - (ROLE_LEVEL[a.code] ?? 0) || a.id - b.id);

/** GET /v1/role/list：关键字过滤（AND），全量数组返回（与后端一致，不分页） */
export const mockRoleList = (config: AxiosRequestConfig): RoleInfo[] => {
  const params = (config.params ?? {}) as { code?: string; name?: string };
  // 超级管理员隐藏：非超管身份不可见（后端行为模拟）
  let filtered = isCurrentSuperAdmin(config) ? [...roleList] : roleList.filter((r) => r.code !== "superAdmin");
  if (params.code) filtered = filtered.filter((r) => r.code.includes(params.code as string));
  if (params.name) filtered = filtered.filter((r) => r.name.includes(params.name as string));
  return filtered;
};

/** POST /v1/role：新增角色（内存落库，刷新列表可见） */
export const mockRoleCreate = (config: AxiosRequestConfig): RoleInfo => {
  const body = parseBody<CreateRoleParams>(config);
  const newRole: RoleInfo = {
    id: Math.max(0, ...roleList.map((r) => r.id)) + 1,
    code: body.code,
    name: body.name,
    description: body.description,
    status: body.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    menuIds: body.menuIds,
    permissions: []
  };
  roleList.unshift(newRole);
  return newRole;
};

/** PUT /v1/role/{id}：按 id 更新（契约无 code，code 不可改） */
export const mockRoleUpdate = (config: AxiosRequestConfig): string => {
  const id = Number((config.params as { id?: string })?.id);
  // 超级管理员仅设计者维护，禁止修改
  if (isSuperAdmin(id)) return "ROLE_HIDDEN";
  const body = parseBody<UpdateRoleParams>(config);
  const target = roleList.find((r) => r.id === id);
  if (!target) return "ROLE_NOT_FOUND";
  target.name = body.name;
  target.description = body.description;
  target.status = body.status;
  target.menuIds = body.menuIds;
  target.updatedAt = new Date().toISOString();
  return "SUCCESS";
};

/** DELETE /v1/role/{id}：删除角色 */
export const mockRoleDelete = (config: AxiosRequestConfig): string => {
  const id = Number((config.params as { id?: string })?.id);
  // 超级管理员仅设计者维护，禁止删除
  if (isSuperAdmin(id)) return "ROLE_HIDDEN";
  const index = roleList.findIndex((r) => r.id === id);
  if (index === -1) return "ROLE_NOT_FOUND";
  roleList.splice(index, 1);
  return "SUCCESS";
};

/** PUT /v1/role/{id}/permissions：保存角色权限码（内存落库） */
export const mockRoleSavePermissions = (config: AxiosRequestConfig): string => {
  const id = Number((config.params as { id?: string })?.id);
  // 超级管理员仅设计者维护，禁止改权限
  if (isSuperAdmin(id)) return "ROLE_HIDDEN";
  const target = roleList.find((r) => r.id === id);
  if (!target) return "ROLE_NOT_FOUND";
  const body = parseBody<SaveRolePermissionParams>(config);
  target.permissions = body.permissionCodes ?? [];
  target.updatedAt = new Date().toISOString();
  return "SUCCESS";
};
