// ==========================================
// Mock 接口表：key 为接口 url，value 为模拟响应数据
// 接口注册：在此注册 url → 数据，即完成前端联调占位
// ==========================================
import type { AxiosRequestConfig } from "axios";
import {
  userList,
  mockUserList,
  mockUserCreate,
  mockUserUpdate,
  mockUserDelete,
  mockUserBatchDelete,
  mockUserResetPassword,
  mockUserApprove,
  mockUserReject,
  mockUserRegister
} from "./users";
import {
  mockRoleList,
  mockRoleCreate,
  mockRoleUpdate,
  mockRoleDelete,
  mockRoleSavePermissions,
  resolveUserRoles
} from "./roles";
import {
  resolveMockUsername,
  mockLogout,
  mockCaptcha,
  mockForgotPassword,
  mockResetPassword,
  mockChangePassword,
  isMustChangePassword
} from "./auth";
import { parseBody, mockError } from "./utils";
import { filterMenusByIds } from "@/utils";
import {
  mockDictAll,
  mockDictItemsByCode,
  mockDictTypeCreate,
  mockDictTypeUpdate,
  mockDictTypeDelete,
  mockDictDataCreate,
  mockDictDataUpdate,
  mockDictDataDelete,
  mockDictAdminTypes,
  mockDictAdminData
} from "./dicts";
import { mockHelpTree, mockHelpArticle, mockHelpMode, mockHelpChat, mockAiHealth } from "./help";
import { mockHealthChecks, mockHealthProbe } from "./health";
import { mockSessionList, mockSessionRevoke, mockSessionRevokeBatch, mockSessionCleanup } from "./session";
import { mockMetricsOverview, mockMetricsReset } from "./metrics";
import { mockOpsTasks, mockOpsTaskRun, mockOpsReseed } from "./ops";
import {
  getMenuTree,
  mockMenuTreeForUser,
  mockMenuList,
  mockMenuDeleted,
  mockMenuCreate,
  mockMenuUpdate,
  mockMenuDelete,
  mockMenuRestore
} from "./menu";

import {
  mockNotificationList,
  mockNotificationUnreadCount,
  mockNotificationRead,
  mockNotificationReadAll,
  mockNotificationBatches,
  mockNotificationBatchDetail,
  mockSendNotification,
  mockRetryNotificationEmails
} from "./notification";
import { mockLogList, mockMyLogList, mockLogSummary, mockLogCleanup } from "./log-center";
import { mockDashboardTrend } from "./dashboard";
import {
  mockConfigAll,
  mockConfigPublic,
  mockConfigUpdate,
  mockSuperSettings,
  mockSuperSettingsUpdate,
  getMockConfigValue
} from "./configs";
import { mockMailStatus, mockMailTest } from "./mail";
import {
  mockAdminAsset,
  mockAdminDocFile,
  mockAdminDocRoute,
  mockAdminFileOptions,
  mockAdminIndexStatus,
  mockAdminLocaleInit,
  mockAdminLocaleItemRoute,
  mockAdminLocales,
  mockAdminReindex,
  mockAdminSlotItemRoute,
  mockAdminSlotsRoute
} from "./help/admin";
import type { AuthProfile } from "@/types";

export const mockApis: Record<string, unknown> = {  // 知识库管理：同路径按 method 分派，与后端的语言、槽位、正文、资源接口一一对应
  "/v1/help/admin/locales": mockAdminLocales,
  "/v1/help/admin/locales/:locale/init": mockAdminLocaleInit,
  "/v1/help/admin/locales/:locale": mockAdminLocaleItemRoute,
  "/v1/help/admin/slots": mockAdminSlotsRoute,
  "/v1/help/admin/slots/file-options": mockAdminFileOptions,
  "/v1/help/admin/slots/:docKey": mockAdminSlotItemRoute,
  "/v1/help/admin/slots/:docKey/content": mockAdminDocRoute,
  "/v1/help/admin/slots/:docKey/file": mockAdminDocFile,
  "/v1/help/admin/assets": mockAdminAsset,
  "/v1/help/admin/reindex": mockAdminReindex,
  "/v1/help/admin/index/status": mockAdminIndexStatus,

  // 图形验证码：每次请求换新 id 与新图，旧 id 随即过期
  "/v1/captcha": mockCaptcha,

  // 模式用户登录：按用户名识别身份，密码不校验（mock users 无密码字段，接入后端后由后端校验）
  "/v1/auth/login": (config: AxiosRequestConfig) => {
    const body = parseBody<{ username?: string; password?: string }>(config);
    const username = body.username ?? "admin";
    // 对齐后端 USER_NOT_EXIST(20001)：业务失败走错误壳，不能退化成"接口不存在"
    const user = userList.find((u) => u.username === username);
    if (!user) throw Object.assign(new Error("USER_NOT_EXIST"), { mockCode: 20001 });
    // 账号状态先于发凭证判定：待审核 20016、停用（含被驳回）20004
    if (user.status === 2) throw mockError(20016, "USER_PENDING_APPROVAL");
    if (user.status === 0) throw mockError(20004, "USER_DISABLED");
    const roles = resolveUserRoles(user.roles);
    return {
      token: `mock-token-${username}`,
      refreshToken: `mock-refresh-${username}`,
      userInfo: {
        role: roles[0]?.code ?? null,
        roles: roles.map((r) => ({ id: r.id, code: r.code, name: r.name, description: r.description })),
        permissions: Array.from(new Set(roles.flatMap((r) => r.permissions))),
        mustChangePassword: isMustChangePassword(username),
        createdAt: user.createdAt,
        lastLoginAt: new Date().toISOString()
      }
    };
  },

  // 当前登录用户全量信息：身份 + 角色聚合权限 + 按 menuIds 裁剪的可见菜单（严格对齐后端）
  "/v1/auth/profile": (config: AxiosRequestConfig): AuthProfile | undefined => {
    const user = userList.find((u) => u.username === resolveMockUsername(config));
    if (!user) return undefined;
    const roles = resolveUserRoles(user.roles);
    const permissions = Array.from(new Set(roles.flatMap((r) => r.permissions)));
    const menuIds = Array.from(new Set(roles.flatMap((r) => r.menuIds)));
    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      role: roles[0]?.code ?? null,
      roles: roles.map((r) => ({ id: r.id, code: r.code, name: r.name, description: r.description })),
      mustChangePassword: isMustChangePassword(user.username),
      permissions,
      menus: filterMenusByIds(getMenuTree(), menuIds)
    };
  },

  // 刷新token
  "/v1/auth/refresh": (config: AxiosRequestConfig) => {
    const username = resolveMockUsername(config);
    return { token: `mock-token-${username}`, refreshToken: `mock-refresh-${username}` };
  },

  // 用户注册：开关关闭时直接拒绝（REGISTER_DISABLED 20013），开启时落库为待审核账号
  "/v1/auth/register": (config: AxiosRequestConfig) => {
    const enabled = getMockConfigValue("register_enabled");
    if (enabled !== "true" && enabled !== "1") throw mockError(20013, "REGISTER_DISABLED");
    return mockUserRegister(config);
  },

  // 登出：按当前用户吊销全部会话（全端下线）
  "/v1/auth/logout": mockLogout,

  // 忘记密码：账号不存在 / 邮箱不符 / 冷却中一律回同一成功结构，不泄露账号是否注册
  "/v1/auth/password/forgot": mockForgotPassword,

  // 重置密码：固定码 123456 通过，错码累计 5 次后按尝试过多锁定
  "/v1/auth/password/reset": mockResetPassword,

  // 修改密码：成功后凭证作废，未完成改密前后端只放行本接口、profile、logout
  "/v1/auth/password/change": mockChangePassword,

  // 获取所有用户清单
  "/v1/user/list": mockUserList,

  // 新增用户
  "/v1/user": mockUserCreate,

  // 批量删除（batch-delete 独立路径，与单删分离）
  "/v1/user/batch-delete": mockUserBatchDelete,

  // 动态 id 路径：PUT 更新 / DELETE 删除
  "/v1/user/:id": (config: AxiosRequestConfig) =>
    config.method?.toUpperCase() === "PUT" ? mockUserUpdate(config) : mockUserDelete(config),

  // 重置密码：四段路径不参与三段匹配，:id 由适配器按段注入 params
  "/v1/user/:id/reset-password": mockUserResetPassword,

  // 注册审批：通过 / 驳回，同样是四段路径
  "/v1/user/:id/approve": mockUserApprove,
  "/v1/user/:id/reject": mockUserReject,

  // 角色清单（全量数组）
  "/v1/role/list": mockRoleList,

  // 新增角色
  "/v1/role": mockRoleCreate,

  // 动态 id 路径：PUT 更新 / DELETE 删除
  "/v1/role/:id": (config: AxiosRequestConfig) =>
    config.method?.toUpperCase() === "PUT" ? mockRoleUpdate(config) : mockRoleDelete(config),

  // 保存角色权限（动态 id 路径：PUT）
  "/v1/role/:id/permissions": mockRoleSavePermissions,

  // 字典：公开侧（前端启动拉取）
  "/v1/dict/all": mockDictAll,

  // 新增字典类型
  "/v1/dict/type": mockDictTypeCreate,

  // 动态路径：GET 按类型编码查项（公开，参数为 typeCode）/ PUT 更新 / DELETE 删除（级联，参数实为 id）
  "/v1/dict/type/:typeCode": (config: AxiosRequestConfig) => {
    const method = config.method?.toUpperCase();
    if (method === "GET") return mockDictItemsByCode(config);
    // PUT/DELETE 走 id 语义：把路径值转成 id 传给管理 handler（参数名与后端文档一致）
    const idParams = { ...config, params: { id: (config.params as { typeCode?: string })?.typeCode } };
    if (method === "PUT") return mockDictTypeUpdate(idParams);
    return mockDictTypeDelete(idParams);
  },

  // 新增字典项
  "/v1/dict/data": mockDictDataCreate,

  // 动态 id 路径：PUT 更新 / DELETE 删除
  "/v1/dict/data/:id": (config: AxiosRequestConfig) =>
    config.method?.toUpperCase() === "PUT" ? mockDictDataUpdate(config) : mockDictDataDelete(config),

  // 管理端分页列表（需 superAdmin:dict:update）
  "/v1/dict/admin/types": mockDictAdminTypes,
  "/v1/dict/admin/data": mockDictAdminData,

  // 帮助中心（与后端 /api/v1/help/* 契约一致）
  "/v1/help/tree": mockHelpTree,
  "/v1/help/article": mockHelpArticle,
  "/v1/help/mode": mockHelpMode,
  "/v1/help/chat": mockHelpChat,
  "/v1/help/ai-health": mockAiHealth,

  // 系统设置参数（system 域读 / 写）
  "/v1/config/all": mockConfigAll,
  // 匿名公开配置（登录页可读，无需凭证）
  "/v1/config/public": mockConfigPublic,
  "/v1/config": mockConfigUpdate,

  // 超级设置参数（super 域读 / 写，与 /config/all 同构）
  "/v1/super-admin/settings": (config: AxiosRequestConfig) =>
    config.method?.toUpperCase() === "PUT" ? mockSuperSettingsUpdate(config) : mockSuperSettings(),

  // 邮件服务：状态读取 / 立即测试
  "/v1/super-admin/settings/mail/status": mockMailStatus,
  "/v1/super-admin/settings/mail/test": mockMailTest,

  // 健康检查：GET 全量/指定项（keys 逗号分隔），POST 立即探测
  "/v1/super-admin/health/checks": mockHealthChecks,
  "/v1/super-admin/health/probe": mockHealthProbe,

  // 会话管理：列表 / 单条吊销 / 批量吊销 / 清理失效会话
  "/v1/super-admin/sessions": mockSessionList,
  "/v1/super-admin/sessions/:id/revoke": mockSessionRevoke,
  "/v1/super-admin/sessions/revoke-batch": mockSessionRevokeBatch,
  "/v1/super-admin/sessions/cleanup": mockSessionCleanup,

  // 运行指标：概览 / 重置计数
  "/v1/super-admin/metrics/overview": mockMetricsOverview,
  "/v1/super-admin/metrics/reset": mockMetricsReset,

  // 运维任务：列表 / 单任务执行 / 种子重建
  "/v1/super-admin/ops/tasks": mockOpsTasks,
  "/v1/super-admin/ops/tasks/:key/run": mockOpsTaskRun,
  "/v1/super-admin/ops/reseed": mockOpsReseed,

  // 菜单：可见树 / 全量树 / 回收站
  "/v1/menu/tree": mockMenuTreeForUser,
  "/v1/menu/list": mockMenuList,
  "/v1/menu/deleted": mockMenuDeleted,
  // 新增菜单
  "/v1/menu": mockMenuCreate,
  // 动态 id：PUT 更新 / DELETE 软删
  "/v1/menu/:id": (config: AxiosRequestConfig) =>
    config.method?.toUpperCase() === "PUT" ? mockMenuUpdate(config) : mockMenuDelete(config),
  // 恢复单条
  "/v1/menu/:id/restore": mockMenuRestore,

  // 通知中心：收件箱 / 未读 / 单条已读 / 全部已读
  "/v1/notification/list": mockNotificationList,
  "/v1/notification/unread-count": mockNotificationUnreadCount,
  "/v1/notification/read/:id": mockNotificationRead,
  "/v1/notification/read-all": mockNotificationReadAll,
  // 发送记录：批次聚合 / 批次明细 / 群发 / 重试失败邮件
  "/v1/notification/admin/batches": mockNotificationBatches,
  "/v1/notification/admin/batches/:batchId": mockNotificationBatchDetail,
  "/v1/notification/admin/batches/:batchId/retry-email": mockRetryNotificationEmails,
  "/v1/notification/admin/send": mockSendNotification,

  // 日志中心：个人列表 / 统一列表 / 概览统计 / 清理（旧别名 /v1/operate-log/list 不再注册）
  "/v1/log-center/my-list": mockMyLogList,
  "/v1/log-center/list": mockLogList,
  "/v1/log-center/summary": mockLogSummary,
  "/v1/log-center/cleanup": mockLogCleanup,

  // 看板：近七日操作趋势（后端待实现，先提供同构响应）
  "/v1/dashboard/trend": mockDashboardTrend
};
