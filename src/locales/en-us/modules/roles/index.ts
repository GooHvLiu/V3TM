/**
 * Role management copy
 */
export default {
  title: "Roles",
  titleDescription: "Manage system roles: create, edit and delete",
  code: "Role code",
  name: "Role name",
  status: "Status",
  description: "Description",
  createdAt: "Created",
  updatedAt: "Updated",
  create: "New role",
  edit: "Edit",
  delete: "Delete",
  statusEnabled: "Active",
  statusDisabled: "Disabled",
  permissions: "Permissions",
  confirmDelete: "Delete this role?",
  confirmDeleteTitle: "Delete role",
  action: "Actions",
  codePlaceholder: "Role code, e.g. operator",
  namePlaceholder: "Role name, e.g. Operator",
  // Dialog and messages
  dialog: {
    code: "Role code",
    name: "Role name",
    description: "Description",
    status: "Status",
    menuIds: "Menu permissions",
    createTitle: "New role",
    editTitle: "Edit role",
    builtinNameTip: "Built-in role names come from the language pack and cannot be changed",
    statusEnabled: "Active",
    statusDisabled: "Disabled",
    message: {
      codeRequired: "Enter a role code",
      codeFormat: "Role code may contain letters, digits and underscores only",
      nameRequired: "Enter a role name",
      nameMin: "Role name needs at least 2 characters",
      descriptionMax: "Description is limited to 200 characters",
      createSuccess: "Role created",
      editSuccess: "Role updated",
      deleteSuccess: "Role deleted"
    }
  }
};
