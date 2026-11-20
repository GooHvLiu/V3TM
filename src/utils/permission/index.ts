/**
 * ==========================================
 * 权限判断单点：指令 / 路由 / 按钮共用
 * ------------------------------------------
 * permissions：当前用户拥有的权限列表
 * required：当前页面或按钮要求的权限
 * 支持三种形态：
 * - 超级权限：permissions 含 "*:*:*" 或 "*" → 全通
 * - 单权限：  "adminCenter:user:list"
 * - 权限数组：["a:add", "b:del"] → 任一命中即通过
 * ==========================================
 */
export const hasPermission = (permissions: string[], required: string | string[]): boolean => {
  if (permissions.includes("*:*:*") || permissions.includes("*")) return true;
  const need = Array.isArray(required) ? required : [required];
  return need.some((p) => permissions.includes(p));
};
