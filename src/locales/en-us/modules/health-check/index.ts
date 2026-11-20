export default {
  description: "Runtime checks executed on the server on demand",
  refresh: "Refresh",
  probe: "Probe now",
  probeOne: "Probe again",
  filter: "Checks",
  filterEmpty: "Select at least one check",
  overall: { up: "Healthy", degraded: "Degraded", down: "Down" },
  status: { ok: "OK", warn: "Warning", fail: "Failed", skip: "Skipped" },
  summary: {
    allOk: "All {n} checks passed",
    degraded: "{n} checks reported issues, the rest are fine",
    failed: "{label} failed, the other {n} checks reported no error",
    skippedSuffix: ", {n} checks skipped"
  },
  partialProbe: "Some checks were re-probed individually; the overall state follows the last full run",
  filterTip: "Change the selection, then probe to get a fresh result",
  metric: { checkedAt: "Checked at", duration: "Duration", ago: "{n} s ago" },
  loadFailed: "Could not fetch results, showing the previous run",
  empty: "No results yet"
};
