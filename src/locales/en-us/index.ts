/**
 * ==========================================
 * English language pack · aggregate
 * ==========================================
 */
import common from "./common/common";
import layout from "./common/layout";
import theme from "./common/theme";
import menu from "./common/menu";
import sidebar from "./common/sidebar";
import route from "./common/route";
import backend from "./common/backend";
import field from "./common/field";
import configParam from "./common/config-param";
import health from "./common/health";
import opsTask from "./common/ops-task";
import role from "./common/role";
import search from "./common/search";
import auth from "./modules/auth";
import terms from "./modules/terms";
import privacy from "./modules/privacy";
import legal from "./modules/legal";
import errorPage from "./modules/error";
import users from "./modules/users";
import roles from "./modules/roles";
import credits from "./modules/credits";
import appDown from "./modules/app-down";
import dicts from "./modules/dicts";
import help from "./modules/help";
import settings from "./modules/settings";
import permission from "./modules/permission-center";
import healthCheck from "./modules/health-check";
import sessionCenter from "./modules/session-center";
import metricsCenter from "./modules/metrics-center";
import taskCenter from "./modules/task-center";
import menuCenter from "./modules/menu-center";
import superSettings from "./modules/super-settings";
import profile from "./modules/profile";
import knowledgeCenter from "./modules/knowledge-center";
import notification from "./modules/notification";
import logCenter from "./modules/log-center";
import dashboard from "./modules/my-dashboard";
import dataSearch from "./modules/my-records";
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
  // Backend message codes and the error page share the error namespace
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
