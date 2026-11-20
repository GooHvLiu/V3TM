export default {
  description: "服务端即时执行的运行状态检查",
  refresh: "刷新",
  probe: "立即探测",
  probeOne: "重探",
  filter: "检查项",
  filterEmpty: "至少选择一项检查",
  overall: { up: "系统正常", degraded: "系统降级", down: "系统故障" },
  status: { ok: "正常", warn: "警告", fail: "故障", skip: "已跳过" },
  summary: {
    allOk: "{n} 项检查全部正常",
    degraded: "{n} 项异常，其余正常",
    failed: "{label} 异常，其余 {n} 项未报错",
    skippedSuffix: "，{n} 项已跳过"
  },
  partialProbe: "部分项已单独重探，整体状态以最近一次全量结果为准",
  filterTip: "勾选变更后点击「立即探测」获取结果",
  metric: { checkedAt: "检查时间", duration: "总耗时", ago: "{n} 秒前" },
  loadFailed: "检查结果获取失败，展示的是上次结果",
  empty: "暂无检查结果"
};
