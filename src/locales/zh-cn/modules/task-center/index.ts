export default {
  description: "手动触发维护、索引、备份与危险操作，执行记录仅存内存",
  refresh: "刷新",
  stats: { total: "任务", success: "已成功", failed: "已失败", idle: "未执行" },
  statsTip: "执行记录仅存内存，重启后清空",
  status: { success: "成功", failed: "失败", idle: "未执行" },
  lastRun: { empty: "暂无执行记录" },
  run: "执行",
  rerun: "重新执行",
  running: "执行中",
  detail: "查看详情",
  detailTitle: "执行详情",
  close: "关闭",
  runFailed: "任务执行失败，详情见执行记录",
  empty: "暂无任务",
  danger: {
    zone: "危险操作",
    tip: "不可逆操作，执行前请确认无高并发写入",
    title: "种子数据重建",
    prompt: "该操作会重新执行 seed 脚本写入基础数据，不可撤销。请输入 RESEED 确认。",
    wrong: "请输入 RESEED 四个字母（区分大小写）",
    note: "最长约 10 分钟，请勿在业务高峰执行；成功后已签发的登录凭证仍然有效，无需重新登录。"
  },
  loadFailed: "运维任务获取失败"
};
