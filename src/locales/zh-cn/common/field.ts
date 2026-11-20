/**
 * ==========================================
 * 字段名映射
 * ------------------------------------------
 * 后端字段类错误通过 params.field 传递，可能是点路径（items.0.value）。
 * 取最后一段做映射，缺词条时回退原字段名。
 * ==========================================
 */
export default {
  body: "请求体",
  path: "路径",
  component: "组件",
  permission: "权限标识",
  parentId: "上级菜单",
  type: "类型",
  sort: "排序",
  status: "状态",
  visible: "显示",
  menuGroup: "分组",
  icon: "图标",
  username: "用户名",
  password: "密码",
  newPassword: "新密码",
  oldPassword: "旧密码",
  email: "邮箱",
  phone: "手机号",
  name: "名称",
  code: "编码",
  value: "字典值",
  label: "显示名称",
  id: "ID",
  configKey: "参数键",
  scope: "生效范围",
  retryAfterSeconds: "重试间隔"
};
