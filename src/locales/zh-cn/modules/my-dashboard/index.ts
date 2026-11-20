/**
 * 我的看板 页面文案
 * 只描述当前账号可见的通知与资料，不出现全局指标、运维与健康检查字段
 */
export default {
  description: "查看当前账号的通知与资料概览",
  action: {
    refresh: "刷新"
  },
  section: {
    stats: "通知概览"
  },
  trend: {
    title: "近七日操作",
    subtitle: "按天统计当前账号的操作条数",
    series: "操作条数",
    failed: "趋势加载失败",
    viewLabel: "趋势展示方式",
    view: {
      line: "折线",
      bar: "柱状"
    }
  },
  stats: {
    unread: "未读通知",
    security: "安全提醒",
    business: "业务消息",
    announcement: "公告",
    unreadHint: "全部未读",
    categoryHint: "条未读"
  },
  notice: {
    title: "最近通知",
    subtitle: "当前账号收到的站内通知",
    viewAll: "查看全部",
    empty: "暂无通知",
    emptyHint: "新的站内通知会显示在这里",
    failed: "通知加载失败"
  },
  security: {
    title: "账号安全",
    subtitle: "账号状态与登录信息",
    status: "账号状态",
    role: "当前角色",
    email: "邮箱",
    lastLogin: "最后登录",
    tip: "如需修改密码或完善资料，请前往个人中心。"
  },
  quick: {
    title: "快捷入口",
    subtitle: "常用页面入口",
    notice: "通知中心",
    records: "我的记录",
    profile: "个人中心",
    help: "帮助中心"
  }
};
