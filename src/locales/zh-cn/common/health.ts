/**
 * 健康检查 · 文案
 * ------------------------------------------
 * 后端只下发 labelKey / messageKey 与 params，
 * 检查项名称与结论文案统一在此渲染。
 */
export default {
  database: {
    label: "数据库",
    ok: "连接正常，耗时 {durationMs} ms"
  },
  memory: {
    label: "内存",
    usage: "堆内存 {usedMB} MB / {totalMB} MB，占用 {percent}%（告警 {warnPercent}%，故障 {failPercent}%）"
  },
  disk: {
    label: "磁盘",
    ok: "工作目录、日志目录、数据目录均可写",
    dirMissing: "目录不存在：{dir}"
  },
  logger: {
    label: "日志",
    ok: "当前 {sizeMB} MB / 上限 {limitMB} MB，已轮转 {history} 份（保留 {maxFiles} 份）",
    empty: "日志文件尚未写入",
    dirMissing: "日志目录不存在"
  },
  helpIndex: {
    label: "知识库索引",
    ok: "已索引 {total} 篇文档",
    empty: "索引为空，请执行知识库索引重建"
  },
  aiDependency: {
    label: "AI 依赖",
    notConfigured: "未配置 AI 服务地址或模型",
    ok: "服务可达，耗时 {durationMs} ms",
    httpError: "服务返回异常状态 {status}",
    unreachable: "服务不可达，帮助中心将退回静态文档"
  },
  check: {
    failed: "检查执行失败：{reason}"
  }
};
