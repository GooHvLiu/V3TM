/**
 * My records copy
 * Operations, sign-ins and notification mails come from the personal log
 * endpoint; messages come from the notification endpoint.
 */
export default {
  description: "Operations, sign-ins, notification mails and messages for the signed-in account",
  action: {
    refresh: "Refresh"
  },
  tab: {
    message: "Messages"
  },
  filter: {
    keyword: "Search subject, description or mail subject",
    keywordLabel: "Keyword",
    result: "Result",
    allResult: "All results",
    dateRange: "Date range",
    reset: "Reset",
    search: "Search",
    dateStart: "Start date",
    dateEnd: "End date",
    to: "to",
    allCategory: "All categories",
    allStatus: "All statuses"
  },
  logTip: "Operations, sign-ins and notification mails are scoped to the signed-in account. The mail tab shows notification mail only, excluding captcha and test mail",
  message: {
    title: "Message detail",
    content: "Body",
    category: "Category",
    type: "Level",
    createdAt: "Received",
    readAt: "Read",
    source: "Source",
    link: "Related page",
    openLink: "Open link",
    unread: "Unread",
    read: "Read",
    permissionTip: "Messages are the in-app notifications sent to you; operations, sign-ins and mails are isolated per account.",
    tip: "Messages are queried by recipient account; unread state matches the red dot in the header.",
    empty: "No messages",
    detail: "Detail"
  },
  table: {
    createdAt: "Time",
    module: "Module",
    action: "Action",
    result: "Result",
    target: "Target",
    description: "Description",
    reason: "Reason",
    ip: "IP",
    userAgent: "Client",
    detail: "Detail",
    category: "Category",
    title: "Title",
    type: "Level",
    status: "Status",
    subject: "Subject",
    toEmail: "Recipient",
    template: "Template",
    messageId: "Message ID"
  },
  empty: {
    log: "No records match the filter",
    message: "No messages match the filter"
  },
  detail: {
    title: "Record detail"
  }
};
