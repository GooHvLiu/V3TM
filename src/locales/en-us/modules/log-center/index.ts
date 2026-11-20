export default {
  description: "Operation, sign-in and mail logs, summarised by time range, with history cleanup",
  refresh: "Refresh",

  category: { operation: "Operations", login: "Sign-ins", mail: "Mail" },
  result: { success: "Success", failed: "Failed", blocked: "Blocked" },

  action: {
    CREATE: "Create",
    UPDATE: "Update",
    DELETE: "Delete",
    APPROVE: "Approve",
    REJECT: "Reject",
    REVOKE: "Force sign-out",
    CLEANUP: "Clean up",
    REINDEX: "Rebuild index",
    TEST: "Connection test",
    SEND: "Send",
    LOGIN: "Sign in",
    LOGOUT: "Sign out",
    RESET_PASSWORD: "Reset password"
  },

  module: {
    auth: "Auth",
    user: "Users",
    role: "Roles",
    menu: "Menus",
    dict: "Dictionaries",
    config: "Settings",
    mail: "Mail service",
    notification: "Notifications",
    "notice-center": "Notification centre",
    "log-center": "Log centre",
    session: "Sessions",
    help: "Help centre",
    unknown: "Unknown module"
  },

  summary: {
    rangeTip: "Ranges count rolling 24-hour windows, not calendar days",
    startAt: "Counting from {time}",
    range: { "24h": "Last 24 hours", "7d": "Last 7 days", "30d": "Last 30 days" },
    total: "All records",
    operation: "Operations",
    login: "Sign-ins",
    mail: "Mail",
    success: "Success",
    failed: "Failed",
    blocked: "Blocked",
    statusTip: "Pending and received mail count in the total but not in the three outcomes, so they may not add up",
    filteredTip: "Filtered by the current account's permissions; super admin activity is excluded"
  },

  filter: {
    allModule: "All modules",
    allAction: "All actions",
    allResult: "All results",
    username: "Search by username",
    keyword: "Search module, action, target or summary",
    dateStart: "Start date",
    dateEnd: "End date",
    mailModuleFixed: "Mail logs always use the mail module; username and action filters do not apply",
    noExport: "Logs cannot be exported; filter in the page and read them one by one"
  },

  columns: {
    createdAt: "Time",
    username: "Actor",
    module: "Module",
    action: "Action",
    result: "Result",
    target: "Target",
    description: "Summary",
    reason: "Failure reason",
    ip: "IP",
    userAgent: "Client",
    requestId: "Request ID",
    toEmail: "Recipient",
    subject: "Subject",
    template: "Template",
    messageId: "Message ID"
  },

  detail: {
    title: "Log detail",
    tip: "Mail templates and request IDs are kept verbatim so they can be matched against server logs"
  },

  cleanup: {
    title: "Clean up logs",
    tip: "Permanently deletes operation and mail logs older than the given days. This cannot be undone. The default comes from system settings",
    days: "Keep days",
    daysPlaceholder: "1 - 3650",
    confirmLabel: "Type CLEANUP to confirm",
    confirmPlaceholder: "CLEANUP",
    submit: "Clean up",
    done: "Removed {operation} operation logs and {mail} mail logs, kept records within {days} days",
    none: "No logs older than the cutoff, nothing was deleted",
    daysInvalid: "Keep days must be an integer from 1 to 3650",
    confirmInvalid: "Type CLEANUP before submitting"
  },

  loadFailed: "Could not load logs, showing the previous result"
};
