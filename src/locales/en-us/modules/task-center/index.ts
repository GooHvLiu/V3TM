export default {
  description: "Run maintenance, indexing, backup and destructive tasks by hand; run history is kept in memory only",
  refresh: "Refresh",
  stats: { total: "Tasks", success: "Succeeded", failed: "Failed", idle: "Not run" },
  statsTip: "Run history lives in memory and is cleared on restart",
  status: { success: "Succeeded", failed: "Failed", idle: "Not run" },
  lastRun: { empty: "Not run yet" },
  run: "Run",
  rerun: "Run again",
  running: "Running",
  detail: "Details",
  detailTitle: "Run detail",
  close: "Close",
  runFailed: "Task failed, see the run history for details",
  empty: "No tasks",
  danger: {
    zone: "Destructive actions",
    tip: "Irreversible. Make sure no heavy writes are in flight before running",
    title: "Reseed database",
    prompt: "This runs the seed script again and writes base data. It cannot be undone. Type RESEED to confirm.",
    wrong: "Type RESEED exactly, upper case",
    note: "Takes up to about 10 minutes; avoid peak hours. Issued sign-in credentials stay valid afterwards."
  },
  loadFailed: "Could not load ops tasks"
};
