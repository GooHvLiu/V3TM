/**
 * Dashboard copy
 * Covers only what the signed-in account can see: its own notifications and
 * profile. No global metrics, ops or health fields belong here.
 */
export default {
  description: "Notifications and account overview for the signed-in user",
  action: {
    refresh: "Refresh"
  },
  section: {
    stats: "Notifications"
  },
  trend: {
    title: "Activity, last 7 days",
    subtitle: "Operations performed by this account, per day",
    series: "Operations",
    failed: "Could not load the trend",
    viewLabel: "Chart type",
    view: {
      line: "Line",
      bar: "Bar"
    }
  },
  stats: {
    unread: "Unread",
    security: "Security alerts",
    business: "Business messages",
    announcement: "Announcements",
    unreadHint: "All unread",
    categoryHint: "unread"
  },
  notice: {
    title: "Recent notifications",
    subtitle: "In-app messages received by this account",
    viewAll: "View all",
    empty: "No notifications",
    emptyHint: "New in-app messages appear here",
    failed: "Could not load notifications"
  },
  security: {
    title: "Account security",
    subtitle: "Account status and sign-in details",
    status: "Status",
    role: "Current role",
    email: "Email",
    lastLogin: "Last sign-in",
    tip: "To change your password or update details, open the profile page."
  },
  quick: {
    title: "Shortcuts",
    subtitle: "Frequently used pages",
    notice: "Notifications",
    records: "My records",
    profile: "Profile",
    help: "Help centre"
  }
};
