/**
 * ==========================================
 * Field name mapping
 * ------------------------------------------
 * Field errors arrive with params.field, which may be a dotted path
 * (items.0.value). The last segment is looked up here; a missing entry
 * falls back to the raw field name.
 * ==========================================
 */
export default {
  body: "Request body",
  path: "Path",
  component: "Component",
  permission: "Permission code",
  parentId: "Parent menu",
  type: "Type",
  sort: "Order",
  status: "Status",
  visible: "Visible",
  menuGroup: "Group",
  icon: "Icon",
  username: "Username",
  password: "Password",
  newPassword: "New password",
  oldPassword: "Current password",
  email: "Email",
  phone: "Phone",
  name: "Name",
  code: "Code",
  value: "Dictionary value",
  label: "Display label",
  id: "ID",
  configKey: "Config key",
  scope: "Scope",
  retryAfterSeconds: "Retry after"
};
