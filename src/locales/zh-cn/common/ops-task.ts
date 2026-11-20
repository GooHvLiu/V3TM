/**
 * 运维任务 · 文案
 * ------------------------------------------
 * 任务定义与执行结果都由后端下发 key，名称、说明、结论在此维护。
 */
export default {
  sessionCleanup: {
    label: "清理过期会话",
    description: "物理删除已过期或已吊销且超过阈值天数的刷新令牌记录",
    success: "已清理 {deleted} 条过期会话（阈值 {beforeDays} 天）"
  },
  helpReindex: {
    label: "知识库索引重建",
    description: "扫描帮助文档并幂等重建全文索引",
    success: "索引重建完成，共 {count} 篇文档"
  },
  dbBackup: {
    label: "数据库备份",
    description: "按数据库类型导出备份文件，只保留最近若干份",
    success: "备份完成：{file}，当前保留 {kept} 份"
  },
  dbReseed: {
    label: "种子数据重建",
    description: "重新执行初始化脚本写入基础数据，不影响已有会话记录",
    success: "种子数据已重建"
  },
  failed: "执行失败：{reason}"
};
