/**
 * 个人中心 页面文案
 */
export default {
  title: "个人中心",
  description: "查看账号资料、界面偏好与近期动态",
  section: { info: "账号资料", preference: "界面偏好", activity: "账号动态" },
  field: {
    id: "用户 ID",
    username: "用户名",
    realName: "姓名",
    email: "邮箱",
    role: "角色",
    status: "账号状态",
    createdAt: "注册时间",
    lastLoginAt: "最后登录"
  },
  status: { enabled: "已启用", disabled: "停用", pending: "待审核" },
  neverLoggedIn: "从未登录",
  preference: {
    language: "界面语言",
    theme: "主题风格",
    zh: "简体中文",
    en: "English",
    readonly: "顶栏切换"
  },
  activity: { login: "登录成功", created: "账号创建", empty: "暂无动态" },
  action: { changePassword: "修改密码", logout: "退出登录" },
  dialog: { title: "修改密码" },
  message: { passwordChanged: "密码已修改，请重新登录" }
};
