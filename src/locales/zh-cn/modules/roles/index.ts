/**
 * 角色管理 页面文案
 */
export default {
  title: "角色管理",
  titleDescription: "管理系统角色，支持新增、编辑与删除",
  code: "角色编码",
  name: "角色名称",
  status: "状态",
  description: "描述",
  createdAt: "创建时间",
  updatedAt: "更新时间",
  create: "新增角色",
  edit: "编辑",
  delete: "删除",
  statusEnabled: "启用",
  statusDisabled: "停用",
  permissions: "权限码",
  confirmDelete: "确定删除该角色？",
  confirmDeleteTitle: "删除角色",
  action: "操作",
  codePlaceholder: "角色编码，如 operator",
  namePlaceholder: "角色名称，如 操作员",
  // dialog 与消息
  dialog: {
    code: "角色编码",
    name: "角色名称",
    description: "描述",
    status: "状态",
    menuIds: "菜单权限",
    createTitle: "新增角色",
    editTitle: "编辑角色",
    builtinNameTip: "内置角色名称由语言包维护，不可修改",
    statusEnabled: "启用",
    statusDisabled: "停用",
    message: {
      codeRequired: "请输入角色编码",
      codeFormat: "角色编码只能包含字母、数字、下划线",
      nameRequired: "请输入角色名称",
      nameMin: "角色名称至少 2 个字符",
      descriptionMax: "描述最多 200 个字符",
      createSuccess: "新增成功",
      editSuccess: "更新成功",
      deleteSuccess: "删除成功"
    }
  }
};
