/**
 * ==========================================
 * 系统参数常量设定
 * ==========================================
 */
// 项目名称
export const APP_NAME = "V3TM";
// 项目描述
export const APP_DESCRIPTION = "SOFTWARE DESC.";
// 项目图标内容
export const APP_SVG = "V3";

// 角色标识（ROLE）
export * from "./role";

// 角色视觉（中心徽标配置）
export * from "./role-visual";

// 响应式断点（px）：取各档上界 +1，与 less 的 @screen-* 上界同源换算
export const BREAKPOINTS = {
  XS_MAX: 480, // < 480 → xs 小屏手机
  SM_MAX: 640, // 480-639 → sm 大屏手机
  MD_MAX: 768, // 640-767 → md 横屏手机
  LG_MAX: 1024, // 768-1023 → lg 平板竖持
  XL_MAX: 1200, // 1024-1199 → xl 平板横持
  XXL_MAX: 1600 // 1200-1599 → 2xl 桌面；≥ 1600 → 大屏桌面
} as const;

/* 销售公司信息，用于隐私条款和服务法规 */
// 公司名称
export const SELLER_NAME = "Public Repository";
// 作者联系方式
export const CONTACT_EMAIL = "example@example.com";
// 版本信息
export const LEGAL_VERSION = "V0.1";
// 版本更新时间
export const LEGAL_UPDATE_DATE = "2026-10-20";
// 生效日期：按实际合同签订日期填写（交付客户时填写）
export const LEGAL_EFFECTIVE_DATE = "2026-10-20";
