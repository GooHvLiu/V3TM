export default {
  description: "进程内存采集的运行指标，重启归零，不含业务失败",
  refresh: "刷新",
  reset: "重置计数",
  resetConfirm: "仅清空内存统计（自进程启动以来 {n} 次请求），不影响业务数据与日志。",
  resetDone: "已清空统计，清理前累计 {n} 次请求",
  range: { "1h": "近 1 小时", "6h": "近 6 小时", "24h": "近 24 小时" },
  step: { "1m": "1 分钟 / 点", "5m": "5 分钟 / 点", "15m": "15 分钟 / 点" },
  status: { collecting: "采集中", idle: "未采集" },
  summary: "{range}共 {requests} 次请求，{errors} 次 5xx",
  bucketText: "{n} 桶 · {step}",
  metric: {
    requests: "请求数",
    errors: "错误数",
    errorRate: "错误率",
    avg: "平均耗时",
    p95: "P95 耗时",
    qps: "QPS",
    uptime: "已运行",
    buckets: "窗口"
  },
  hint: {
    requests: "含本页轮询请求",
    errors: "仅 HTTP 5xx",
    errorRate: "5xx 占比，非业务失败",
    avg: "区间总耗时 / 请求数",
    p95: "近似值，每桶取样 200",
    qps: "最近一分钟，非实时"
  },
  memory: {
    label: "堆内存占用",
    value: "{used} / {total} MB（{ratio}）",
    rss: "RSS {value} MB"
  },
  unit: { ms: "ms" },
  empty: "暂无采集数据（服务启动后开始累计）",
  loadFailed: "运行指标获取失败，展示的是上次结果"
};
