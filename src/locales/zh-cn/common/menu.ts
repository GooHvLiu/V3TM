/**
 * 菜单文案
 */
export default {
  // 菜单展示
  menu: {
    // 常规菜单
    dashBoard: "我的看板",
    dataSearch: "我的记录",
    // 项目任务
    designTasks: {
      title: "设计任务",
      cuttingMachine: "裁切设备",
      testMachine: "测试设备"
    },
    projects: {
      title: "项目管理",
      tickets: "购票系统",
      orders: "订单管理"
    },
    // 系统设置
    systemSettings: "系统设置",
    // 组件演示
    componentDemo: "组件演示",
    // 管理中心
    adminCenter: {
      title: "管理中心",
      // 用户中心
      userCenter: "用户中心",
      // 日志中心
      logsCenter: "日志中心",
      // 通知中心
      noticeCenter: "通知中心"
    },
    // 关于系统
    about: {
      title: "关于系统",
      githubPage: "开源仓库",
      appDown: "软件下载",
      credits: "鸣谢支持",
      help: "帮助中心"
    },
    // 超级设置
    superSettings: "超级设置",
    // 超级面板
    superAdmin: {
      title: "超级面板",
      // 健康检查
      healthCheck: "健康检查",
      // 会话管理
      sessionCenter: "会话管理",
      // 运行指标
      metricsCenter: "运行指标",
      // 运维任务
      taskCenter: "运维任务",
      // 字典中心
      dictCenter: {
        title: "字典中心",
        dictDate: "字典数据"
      },
      // 角色中心
      roleCenter: "角色中心",
      // 菜单中心
      menuCenter: "菜单中心",
      // 知识管理
      knowledgeCenter: "知识管理",
      // 权限中心
      permissionCenter: "权限中心"
    }
  },
  // 按钮级权限
  button: {
    user: { list: "查询", create: "新增", update: "修改", delete: "删除" },
    role: { list: "查询", create: "新增", update: "修改", delete: "删除" },
    permission: { assign: "分配" },
    dict: { update: "维护" },
    config: { list: "查询", update: "修改" },
    log: { list: "查询", cleanup: "清理日志" },
    notice: { send: "发送通知", manage: "发送记录" },
    menu: { list: "查询", create: "新增", update: "修改", delete: "删除", restore: "恢复菜单" },
    health: { list: "查询", probe: "探测" },
    session: { list: "查询", revoke: "强制下线", cleanup: "清理失效" },
    metrics: { reset: "重置统计" },
    task: { run: "执行", danger: "高危操作" },
    help: { list: "查询", reindex: "重建索引" }
  },

  // 分组标签
  group: {
    General: "常规展示",
    Tasks: "项目任务",
    Settings: "系统操作",
    superAdmin: "超级面板",
    misc: "其他分类"
  }
};
