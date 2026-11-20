/**
 * 后端统一返回结构（四模板一致契约）
 * code: 业务码；200 成功，其余按模块分段（10xxx 通用/鉴权、20xxx 认证/用户、30xxx 字典、40xxx RBAC、70xxx 上传）
 * msg: 纯标识，如 LOGIN_SUCCESS、PARAM_INVALID；不含分隔符，也不携带参数
 * params: 插值参数，如 { field: "username" }、{ retryAfterSeconds: 60 }
 * data: 业务数据；失败通常为 null，运维任务失败时带执行记录
 * timestamp: 服务器时间戳
 * requestId: 链路追踪标识，同时回写 X-Request-ID 响应头
 */
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  params?: Record<string, string | number | boolean>;
  data: T;
  timestamp: number;
  requestId?: string;
}

/** 分页请求参数通用结构 */
export interface PageParams {
  page: number;
  pageSize: number;
}

/** 分页响应通用结构 */
export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
