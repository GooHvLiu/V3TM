/**
 * 我的记录 页面文案
 * 操作 / 登录 / 通知邮件来自个人日志接口，消息记录来自通知接口
 */
export default {
  description: "查看当前账号的操作、登录、通知邮件与消息记录",
  action: {
    refresh: "刷新"
  },
  tab: {
    message: "消息记录"
  },
  filter: {
    keyword: "搜索对象、说明或邮件主题",
    keywordLabel: "搜索关键字",
    result: "结果",
    allResult: "全部结果",
    dateRange: "日期范围",
    reset: "重置",
    search: "查询",
    dateStart: "开始日期",
    dateEnd: "结束日期",
    to: "至",
    allCategory: "全部分类",
    allStatus: "全部状态"
  },
  logTip: "操作、登录与通知邮件均按当前登录账号查询；邮件页签仅展示通知邮件，不含验证码与测试邮件",
  message: {
    title: "消息详情",
    content: "正文",
    category: "分类",
    type: "级别",
    createdAt: "接收时间",
    readAt: "阅读时间",
    source: "来源",
    link: "关联页面",
    openLink: "打开链接",
    unread: "未读",
    read: "已读",
    permissionTip: "消息记录展示发给自己的站内通知；操作、登录与通知邮件按当前账号隔离。",
    tip: "消息记录按接收账号查询，未读状态与右上角红点同步。",
    empty: "暂无消息记录",
    detail: "详情"
  },
  table: {
    createdAt: "时间",
    module: "模块",
    action: "动作",
    result: "结果",
    target: "对象",
    description: "说明",
    reason: "原因",
    ip: "IP",
    userAgent: "终端",
    detail: "详情",
    category: "分类",
    title: "标题",
    type: "级别",
    status: "状态",
    subject: "邮件主题",
    toEmail: "收件邮箱",
    template: "邮件模板",
    messageId: "消息编号"
  },
  empty: {
    log: "暂无符合条件的记录",
    message: "暂无符合条件的消息"
  },
  detail: {
    title: "记录详情"
  }
};
