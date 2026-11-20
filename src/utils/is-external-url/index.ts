/**
 * 外部链接判断（单点）
 * ------------------------------------------
 * 菜单 path 带协议前缀（http/https/mailto/tel）视为外链 → 新窗口打开
 * 内部路由 path（/xxx）走 router.push
 */
export const isExternalUrl = (path: string): boolean => /^(https?:|mailto:|tel:|www\.)/i.test(path);
