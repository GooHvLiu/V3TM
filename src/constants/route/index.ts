/**
 * ==========================================
 * 路由常量，管理路由路径
 * ------------------------------------------
 * 路由路径统一从本文件获取，页面不直接写路径字面量
 * ==========================================
 */
/** Layout 常量 */
export const LAYOUT = {
  ROOT: "/",
  DASH_BOARD: "dashboard",
  DATA_SEARCH: "data-search",
  DESIGN_TASKS: {
    ROOT: "design-tasks",
    CUTTING_MACHINE: "cutting-machine",
    TEST_MACHINE: "test-machine"
  },
  PROJECTS: {
    ROOT: "projects",
    TICKETS: "tickets",
    ORDERS: "orders"
  },
  SYSTEM_SETTINGS: "system-settings",
  ADMIN_CENTER: {
    ROOT: "admin-center",
    USER_CENTER: "user-center",
    NOTICE_CENTER: "notice-center",
    LOGSCENTER: "logs-center"
  },
  ABOUT: {
    ROOT: "about",
    APP_DOWN: "app-down",
    CREDITS: "credits",
    HELP: "help"
  },
  SUPER_ADMIN: {
    ROOT: "super-admin",
    HEALTH_CHECK: "health-check",
    SESSION_CENTER: "session-center",
    METRICS_CENTER: "metrics-center",
    TASK_CENTER: "task-center",
    KNOWLEDGE_CENTER: "knowledge-center",
    DICT_CENTER: {
      ROOT: "dict-center",
      DICTDATA: "dict-date"
    },
    ROLE_CENTER: "role-center",
    MENU_CENTER: "menu-center",
    PERMISSION_CENTER: "permission-center"
  },
  PROFILE: "profile"
} as const;

/** Auth 常量 */
export const AUTH = {
  ROOT: "/auth",
  LOGIN: "login",
  REGISTER: "register",
  FORGOT: "forgot-password",
  FORCE_PASSWORD: "force-password"
} as const;

// Legal 法律法规
export const LEGAL = {
  ROOT: "legal",
  TERMS: "terms",
  PRIVACY: "privacy"
};

// ErrorPages 错误页面
export const ERROR_PAGE = {
  ROOT: "errors",
  CODE: ":code"
};
