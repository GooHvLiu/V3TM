// 类型统一出口
// 基础后端响应结构
export * from "./api";
// 业务类型模块放在 ./ 下（如 user.ts、order.ts），再在这里 export * 出来

// 验证码 数据类型
export * from "./captcha";

// 登录/ 注册 请求和响应 数据类型
export * from "./auth";

// 导出菜单的后端响应数据类型
export * from "./menu";

// 本地持久化数据存储 数据类型
export * from "./storage";

// 面包屑 标准组件单一数据的 数据类型
export * from "./breadcrumb";

// 法律 服务文档 数据类型
export * from "./legal";

// 国际化配置 数据类型
export * from "./i18n";

// 错误页 数据类型
export * from "./error";

// 用户相关 数据类型
export * from "./user";

// 角色相关 数据类型
export * from "./role";

// 字典 数据类型
export * from "./dict";

// 帮助 数据类型
export * from "./help/static";
export * from "./help/ai";
export * from "./help/admin";

// 系统设置 数据类型
export * from "./config";

// 邮件服务 数据类型
export * from "./mail";

// 健康检查
export * from "./health";

// 会话管理
export * from "./session";

// 运行指标
export * from "./metrics";

// 运维指标
export * from "./ops";

// 通知中心 数据类型
export * from "./notification";

// 日志中心 数据类型
export * from "./log-center";

// 看板 数据类型
export * from "./dashboard";
