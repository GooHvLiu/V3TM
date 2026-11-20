// API 模块统一出口
// 新的业务接口模块放在 ./ 下（如 user.ts、order.ts），再在这里 export * 出来

// 认证 接口
export * from "./auth";

// 用户管理 接口
export * from "./user";

// 角色管理 接口
export * from "./role";

// 菜单 接口
export * from "./menu";

// 字典 接口
export * from "./dict";

// 系统设置 接口
export * from "./config";

// 邮件服务 接口
export * from "./mail";

// 健康检查 接口
export * from "./health";

// 会话管理 接口
export * from "./session";

// 运行指标 接口
export * from "./metrics";

// 运维任务 接口
export * from "./ops";

// 通知中心 接口
export * from "./notification";

// 日志中心 接口
export * from "./log-center";

// 看板 接口
export * from "./dashboard";
