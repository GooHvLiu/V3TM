export default {
  description: "Read system notifications, send messages to users or roles and track delivery",
  refresh: "Refresh",
  tab: { mine: "My notifications", send: "Send", record: "History" },

  category: { system: "System", security: "Security", business: "Business", announcement: "Announcement" },
  type: { info: "Info", success: "Success", warning: "Warning", error: "Error" },
  email: { none: "Not requested", pending: "Queued", sent: "Sent", failed: "Failed", skipped: "Skipped" },

  mine: {
    allCategory: "All categories",
    allType: "All types",
    allStatus: "All statuses",
    unread: "Unread",
    read: "Read",
    markAll: "Mark all read",
    markAllConfirm: "Mark {n} unread notifications as read?",
    markAllDone: "{n} notifications marked read",
    empty: "No notifications match the filter",
    unreadTag: "Unread",
    viewDetail: "View",
    unreadTip: "The red dot refreshes every 60 seconds; opening a notification marks it read",
    loadMore: "Load more",
    noMore: "Nothing more to load",
    loadFailed: "Could not load notifications, showing the previous result"
  },

  audience: {
    label: "Recipients",
    all: "All users",
    role: "By role",
    user: "By user",
    allTip: "Sent to every active account, super admins excluded",
    roleTip: "Matched by role code; an account holding several roles still receives one copy",
    userTip: "Pick accounts individually; disabled accounts are not listed",
    rolePlaceholder: "Select roles",
    userPlaceholder: "Select users",
    roleEmpty: "No roles available",
    userEmpty: "No users available",
    emailMissing: "No email address, mail will be skipped",
    loading: "Loading",
    loadFailed: "Could not load recipients, refresh and try again",
    userLimit: "Showing the first {n} of {total} active accounts; search by username to narrow down"
  },

  form: {
    title: "Title",
    titlePlaceholder: "Notification title, up to 100 characters",
    content: "Body",
    contentPlaceholder: "Plain text body, up to 5000 characters; rich text is not supported",
    category: "Category",
    type: "Type",
    link: "Link",
    linkPlaceholder: "Optional. In-app path starting with /, or a full http(s) URL",
    sendEmail: "Also send by email",
    sendEmailTip: "Mail is sent asynchronously; a success response only means it was queued",
    preview: "Preview",
    previewTitle: "Notification preview",
    reset: "Reset",
    submit: "Send"
  },

  send: {
    done: "Sent to {n} users, {queued} mails queued, {skipped} skipped",
    doneNoEmail: "Sent to {n} users",
    mailDisabledTip: "Mail is switched off, only in-app notifications are sent. Turn it on in super settings to send mail",
    confirm: "Send this notification? It cannot be recalled. Mail is queued asynchronously, so a success response is not proof of delivery."
  },

  record: {
    allCategory: "All categories",
    allType: "All types",
    keyword: "Search by title",
    filter: {
      category: "Category",
      type: "Type",
      source: "Source",
      keyword: "Title keyword"
    },
    empty: "Nothing sent yet",
    detail: "View recipients",
    retry: "Retry failed mail",
    retryDone: "Retried {retried}, {sent} sent, {failed} still failing",
    columns: {
      title: "Title",
      category: "Category",
      recipientCount: "Recipients",
      readCount: "Read",
      email: "Mail",
      source: "Source",
      createdAt: "Sent at",
      action: "Actions"
    },
    emailSummary: "queued {pending} · sent {sent} · failed {failed} · skipped {skipped}",
    loadFailed: "Could not load history, showing the previous result"
  },

  detail: {
    title: "Batch detail",
    batchId: "Batch ID",
    createdAt: "Sent at",
    source: "Source",
    readProgress: "{read}/{total} read",
    statRecipient: "Recipients",
    statRead: "Read",
    statUnread: "Unread",
    statEmail: "Mail",
    empty: "This batch has no recipient records",
    columns: {
      userId: "User ID",
      isRead: "Read state",
      emailStatus: "Mail state",
      emailError: "Failure reason",
      readAt: "Read at"
    },
    recipientTip: "Read and mail states are written back by the server; expand a failed mail to see the original error",
    loadFailed: "Could not load the batch"
  },

  header: {
    title: "Notifications",
    markAll: "Mark all read",
    viewAll: "View all",
    empty: "No new notifications",
    unreadTip: "{n} unread",
    loadFailed: "Could not load the preview"
  },

  validate: {
    titleRequired: "Enter a title",
    titleTooLong: "Title is limited to 100 characters",
    contentRequired: "Enter a body",
    contentTooLong: "Body is limited to 5000 characters",
    linkInvalid: "Link must start with / or be a full http(s) URL",
    audienceTypeRequired: "Choose the recipient scope",
    roleRequired: "Select at least one role",
    userRequired: "Select at least one user"
  },

  // System event notifications: the backend stores keys only, values come from data
  auth: {
    registerPending: {
      title: "New account awaiting approval",
      content: "Account {username} has applied to register. Review it in user management"
    },
    passwordChanged: {
      title: "Password changed",
      content: "Your sign-in password was changed. If this was not you, contact an administrator immediately"
    },
    passwordReset: {
      title: "Password reset",
      content: "Your sign-in password was reset through email verification. If this was not you, contact an administrator immediately"
    }
  },
  session: {
    revoked: {
      title: "Session ended",
      content: "An administrator ended your session on another device"
    }
  },
  user: {
    accountDisabled: {
      title: "Account disabled",
      content: "An administrator disabled your account. Contact them if you have questions"
    },
    passwordAdminReset: {
      title: "Password reset by an administrator",
      content: "An administrator reset your password. Sign in with the new one"
    },
    registerApproved: {
      title: "Registration approved",
      content: "Your registration was approved and you can sign in now"
    },
    registerRejected: {
      title: "Registration declined",
      content: "Your registration was declined. Contact an administrator if you have questions"
    }
  }
};
