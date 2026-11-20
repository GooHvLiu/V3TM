/**
 * Health checks · copy
 * ------------------------------------------
 * The backend sends labelKey / messageKey plus params; the labels and
 * conclusions are rendered from this file.
 */
export default {
  database: {
    label: "Database",
    ok: "Connected in {durationMs} ms"
  },
  memory: {
    label: "Memory",
    usage: "Heap {usedMB} MB / {totalMB} MB, {percent}% used (warn {warnPercent}%, fail {failPercent}%)"
  },
  disk: {
    label: "Disk",
    ok: "Working, log and data directories are writable",
    dirMissing: "Directory missing: {dir}"
  },
  logger: {
    label: "Logs",
    ok: "{sizeMB} MB of {limitMB} MB, {history} rotations (keeping {maxFiles})",
    empty: "No log file written yet",
    dirMissing: "Log directory missing"
  },
  helpIndex: {
    label: "Knowledge index",
    ok: "{total} documents indexed",
    empty: "Index is empty, rebuild the knowledge index"
  },
  aiDependency: {
    label: "AI dependency",
    notConfigured: "AI service URL or model is not configured",
    ok: "Service reachable in {durationMs} ms",
    httpError: "Service returned status {status}",
    unreachable: "Service unreachable, the help centre falls back to static docs"
  },
  check: {
    failed: "Check failed: {reason}"
  }
};
