/**
 * Profile page copy
 */
export default {
  title: "Profile",
  description: "Account details, interface preferences and recent activity",
  section: { info: "Account", preference: "Preferences", activity: "Activity" },
  field: {
    id: "User ID",
    username: "Username",
    realName: "Name",
    email: "Email",
    role: "Role",
    status: "Status",
    createdAt: "Registered",
    lastLoginAt: "Last sign-in"
  },
  status: { enabled: "Active", disabled: "Disabled", pending: "Pending approval" },
  neverLoggedIn: "Never signed in",
  preference: {
    language: "Language",
    theme: "Theme",
    zh: "简体中文",
    en: "English",
    readonly: "Switch in header"
  },
  activity: { login: "Signed in", created: "Account created", empty: "No activity yet" },
  action: { changePassword: "Change password", logout: "Sign out" },
  dialog: { title: "Change password" },
  message: { passwordChanged: "Password changed. Please sign in again" }
};
