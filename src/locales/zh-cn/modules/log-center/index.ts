export default {
  description: "查看操作、登录与邮件三类日志，按时间区间统计并清理历史记录",
  refresh: "刷新",

  category: { operation: "操作日志", login: "登录日志", mail: "邮件日志" },
  result: { success: "成功", failed: "失败", blocked: "拦截" },

  action: {
    CREATE: "新增",
    UPDATE: "修改",
    DELETE: "删除",
    APPROVE: "审核通过",
    REJECT: "审核驳回",
    REVOKE: "强制下线",
    CLEANUP: "数据清理",
    REINDEX: "重建索引",
    TEST: "连通测试",
    SEND: "发送",
    LOGIN: "登录",
    LOGOUT: "退出",
    RESET_PASSWORD: "重置密码"
  },

  module: {
    auth: "认证",
    user: "用户",
    role: "角色",
    menu: "菜单",
    dict: "字典",
    config: "系统设置",
    mail: "邮件服务",
    notification: "通知",
    "notice-center": "通知中心",
    "log-center": "日志中心",
    session: "会话",
    help: "帮助中心",
    unknown: "未知模块"
  },

  summary: {
    rangeTip: "统计区间为最近 N 个 24 小时，非自然日",
    startAt: "统计起点 {time}",
    range: { "24h": "近 24 小时", "7d": "近 7 天", "30d": "近 30 天" },
    total: "全部记录",
    operation: "操作",
    login: "登录",
    mail: "邮件",
    success: "成功",
    failed: "失败",
    blocked: "拦截",
    statusTip: "邮件待发送与已接收计入总数，不计入三种结果，故三者之和可能小于总数",
    filteredTip: "已按当前账号权限过滤，不含超级管理员的操作与邮件"
  },

  filter: {
    allModule: "全部模块",
    allAction: "全部动作",
    allResult: "全部结果",
    username: "按用户名搜索",
    keyword: "搜索模块、动作、对象或摘要",
    dateStart: "开始日期",
    dateEnd: "结束日期",
    mailModuleFixed: "邮件日志的模块固定为邮件服务，用户名与动作不可筛选",
    noExport: "日志不提供导出，请在页面内筛选后逐条查阅"
  },

  columns: {
    createdAt: "时间",
    username: "操作人",
    module: "模块",
    action: "动作",
    result: "结果",
    target: "对象",
    description: "摘要",
    reason: "失败原因",
    ip: "IP",
    userAgent: "客户端",
    requestId: "请求编号",
    toEmail: "收件邮箱",
    subject: "邮件主题",
    template: "模板",
    messageId: "消息编号"
  },

  detail: {
    title: "日志详情",
    tip: "邮件模板与请求编号保留原始值，便于与服务端日志对照"
  },

  cleanup: {
    title: "清理日志",
    tip: "物理删除早于设定天数的操作与邮件日志，操作不可恢复；默认天数取自系统配置",
    days: "保留天数",
    daysPlaceholder: "1 - 3650",
    confirmLabel: "输入 CLEANUP 以确认",
    confirmPlaceholder: "CLEANUP",
    submit: "确认清理",
    done: "已清理操作日志 {operation} 条、邮件日志 {mail} 条，保留 {days} 天内的记录",
    none: "没有早于设定天数的日志，未删除任何记录",
    daysInvalid: "保留天数需为 1 到 3650 之间的整数",
    confirmInvalid: "请输入 CLEANUP 后再提交"
  },

  loadFailed: "日志获取失败，展示的是上次结果"
};
