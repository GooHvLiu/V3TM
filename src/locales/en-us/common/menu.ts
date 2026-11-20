/**
 * Menu copy
 */
export default {
  // Menu labels
  menu: {
    // General
    dashBoard: "Dashboard",
    dataSearch: "My records",
    // Project tasks
    designTasks: {
      title: "Design tasks",
      cuttingMachine: "Cutting machine",
      testMachine: "Test machine"
    },
    projects: {
      title: "Projects",
      tickets: "Ticketing",
      orders: "Orders"
    },
    // System settings
    systemSettings: "System settings",
    // Component showcase
    componentDemo: "Components",
    // Admin centre
    adminCenter: {
      title: "Admin centre",
      userCenter: "Users",
      logsCenter: "Logs",
      noticeCenter: "Notifications"
    },
    // About
    about: {
      title: "About",
      githubPage: "Source repository",
      appDown: "Downloads",
      credits: "Credits",
      help: "Help centre"
    },
    // Super settings
    superSettings: "Super settings",
    // Super admin
    superAdmin: {
      title: "Super admin",
      healthCheck: "Health",
      sessionCenter: "Sessions",
      metricsCenter: "Metrics",
      taskCenter: "Ops tasks",
      dictCenter: {
        title: "Dictionaries",
        dictDate: "Dictionary data"
      },
      roleCenter: "Roles",
      menuCenter: "Menus",
      knowledgeCenter: "Knowledge",
      permissionCenter: "Permissions"
    }
  },
  // Button-level permissions
  button: {
    user: { list: "Query", create: "Create", update: "Edit", delete: "Delete" },
    role: { list: "Query", create: "Create", update: "Edit", delete: "Delete" },
    permission: { assign: "Assign" },
    dict: { update: "Maintain" },
    config: { list: "Query", update: "Edit" },
    log: { list: "Query", cleanup: "Clean up logs" },
    notice: { send: "Send notification", manage: "Send records" },
    menu: { list: "Query", create: "Create", update: "Edit", delete: "Delete", restore: "Restore menu" },
    health: { list: "Query", probe: "Probe" },
    session: { list: "Query", revoke: "Force sign-out", cleanup: "Clean up expired" },
    metrics: { reset: "Reset statistics" },
    task: { run: "Run", danger: "High-risk operation" },
    help: { list: "Query", reindex: "Rebuild index" }
  },

  // Menu group labels
  group: {
    General: "General",
    Tasks: "Project tasks",
    Settings: "System operations",
    superAdmin: "Super admin",
    misc: "Other"
  }
};
