/**
 * ==========================================
 * 错误页常量
 * ==========================================
 */
/** 支持的错误码（对应 locales error 模块文案） */
export const ERROR_CODES = ["401", "403", "404", "500", "503"] as const;

/** 兜底错误码：非法/未知 code 一律回 404 */
export const FALLBACK_ERROR_CODE = "404" as const;
