/**
 * Ops tasks · copy
 * ------------------------------------------
 * Task definitions and results arrive as keys; names, descriptions and
 * outcomes are maintained here.
 */
export default {
  sessionCleanup: {
    label: "Clean up expired sessions",
    description: "Permanently delete refresh tokens that expired or were revoked longer ago than the threshold",
    success: "Removed {deleted} expired sessions (threshold {beforeDays} days)"
  },
  helpReindex: {
    label: "Rebuild knowledge index",
    description: "Scan help documents and rebuild the full-text index idempotently",
    success: "Index rebuilt, {count} documents"
  },
  dbBackup: {
    label: "Database backup",
    description: "Export a backup for the current database type, keeping only the most recent files",
    success: "Backup created: {file}, {kept} files kept"
  },
  dbReseed: {
    label: "Reseed database",
    description: "Run the seed script again to write base data without touching existing sessions",
    success: "Seed data rebuilt"
  },
  failed: "Failed: {reason}"
};
