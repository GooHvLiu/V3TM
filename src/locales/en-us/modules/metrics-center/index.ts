export default {
  description: "In-process metrics collected from memory; reset on restart, business failures excluded",
  refresh: "Refresh",
  reset: "Reset counters",
  resetConfirm: "Clears in-memory counters only ({n} requests since process start). Business data and logs are untouched.",
  resetDone: "Counters cleared, {n} requests before reset",
  range: { "1h": "Last hour", "6h": "Last 6 hours", "24h": "Last 24 hours" },
  step: { "1m": "1 min / point", "5m": "5 min / point", "15m": "15 min / point" },
  status: { collecting: "Collecting", idle: "No samples" },
  summary: "{range}: {requests} requests, {errors} 5xx",
  bucketText: "{n} buckets · {step}",
  metric: {
    requests: "Requests",
    errors: "Errors",
    errorRate: "Error rate",
    avg: "Average",
    p95: "P95",
    qps: "QPS",
    uptime: "Uptime",
    buckets: "Window"
  },
  hint: {
    requests: "Includes this page's polling",
    errors: "HTTP 5xx only",
    errorRate: "Share of 5xx, not business failures",
    avg: "Total duration / requests",
    p95: "Approximate, 200 samples per bucket",
    qps: "Last minute, not real time"
  },
  memory: {
    label: "Heap usage",
    value: "{used} / {total} MB ({ratio})",
    rss: "RSS {value} MB"
  },
  unit: { ms: "ms" },
  empty: "No samples yet (collection starts with the process)",
  loadFailed: "Could not load metrics, showing the previous result"
};
