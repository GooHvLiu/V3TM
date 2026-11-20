/**
 * ==========================================
 * 中文语言包 · 聚合出口
 * ==========================================
 */
// 公共 模块
import common from "./common/common";
// 布局模块
import layout from "./common/layout";
// 主题模块
import theme from "./common/theme";
// 菜单模块
import menu from "./common/menu";
// 侧边栏模块
import sidebar from "./common/sidebar";
// 路由模块
import route from "./common/route";
// 后端消息码 模块
import backend from "./common/backend";
// 字段名映射 模块
import field from "./common/field";
// 系统参数说明 模块
import configParam from "./common/config-param";
// 健康检查 模块
import health from "./common/health";
// 运维任务 模块
import opsTask from "./common/ops-task";
// 内置角色 模块
import role from "./common/role";
// 搜索 模块
import search from "./common/search";
// 登录注册 模块
import auth from "./modules/auth";
// 法律，法规 模块
import terms from "./modules/terms";
// 法律，法规 模块
import privacy from "./modules/privacy";
// 法律页框架 模块
import legal from "./modules/legal";
// 错误页 模块
import errorPage from "./modules/error";
// 用户管理 模块
import users from "./modules/users";
// 角色 模块
import roles from "./modules/roles";
// 鸣谢 模块
import credits from "./modules/credits";
// 软件下载 模块
import appDown from "./modules/app-down";
// 字典 模块
import dicts from "./modules/dicts";
// 帮助 模块
import help from "./modules/help";
// 系统设置 模块
import settings from "./modules/settings";
// 系统授权 模块
import permission from "./modules/permission-center";
// 健康检查 模块
import healthCheck from "./modules/health-check";
// 会话管理 模块
import sessionCenter from "./modules/session-center";
// 运行指标 模块
import metricsCenter from "./modules/metrics-center";
// 运维任务 模块
import taskCenter from "./modules/task-center";
// 菜单中心 模块
import menuCenter from "./modules/menu-center";
// 超级设置 模块
import superSettings from "./modules/super-settings";
// 个人中心 模块
import profile from "./modules/profile";
// 知识管理 模块
import knowledgeCenter from "./modules/knowledge-center";
// 通知中心 模块
import notification from "./modules/notification";
// 日志中心 模块
import logCenter from "./modules/log-center";
// 我的看板 模块
import dashboard from "./modules/my-dashboard";
// 我的记录 模块
import dataSearch from "./modules/my-records";
// 组件演示 模块
import componentDemo from "./modules/component-demo";

export default {
  common,
  layout,
  theme,
  menu,
  sidebar,
  route,
  auth,
  terms,
  privacy,
  legal,
  // 后端消息标识与错误页共用 error 命名空间
  error: { ...errorPage, ...backend },
  field,
  config: configParam,
  health,
  opsTask,
  role,
  users,
  roles,
  credits,
  appDown,
  search,
  dicts,
  help,
  settings,
  permission,
  healthCheck,
  sessionCenter,
  metricsCenter,
  taskCenter,
  menuCenter,
  superSettings,
  profile,
  knowledgeCenter,
  notification,
  logCenter,
  dashboard,
  dataSearch,
  componentDemo
};
