export default {
  description: "接收系统通知，向指定用户或角色发送消息并跟踪发送结果",
  refresh: "刷新",
  tab: { mine: "我的通知", send: "发送通知", record: "发送记录" },

  category: { system: "系统", security: "安全", business: "业务", announcement: "公告" },
  type: { info: "提示", success: "成功", warning: "警告", error: "错误" },
  email: { none: "未请求", pending: "待发送", sent: "已发送", failed: "发送失败", skipped: "已跳过" },

  mine: {
    allCategory: "全部分类",
    allType: "全部类型",
    allStatus: "全部状态",
    unread: "未读",
    read: "已读",
    markAll: "全部已读",
    markAllConfirm: "把 {n} 条未读通知标记为已读？",
    markAllDone: "已标记 {n} 条为已读",
    empty: "没有符合条件的通知",
    unreadTag: "未读",
    viewDetail: "查看详情",
    unreadTip: "红点每 60 秒自动刷新，点击通知即标记为已读",
    loadMore: "加载更多",
    noMore: "没有更多了",
    loadFailed: "通知列表获取失败，展示的是上次结果"
  },

  audience: {
    label: "接收人",
    all: "全部用户",
    role: "按角色",
    user: "按用户",
    allTip: "发送给全部启用账号（自动排除超级管理员）",
    roleTip: "按角色编码匹配，命中多个角色的账号只会收到一条",
    userTip: "逐个勾选账号，已停用账号不会出现在列表里",
    rolePlaceholder: "请选择角色",
    userPlaceholder: "请选择用户",
    roleEmpty: "没有可选角色",
    userEmpty: "没有可选用户",
    emailMissing: "未配置邮箱，邮件会被跳过",
    loading: "加载中",
    loadFailed: "接收人选项获取失败，请刷新重试",
    userLimit: "仅列出前 {n} 个启用账号（共 {total} 个），可用用户名搜索定位"
  },

  form: {
    title: "标题",
    titlePlaceholder: "请输入通知标题，最多 100 字",
    content: "正文",
    contentPlaceholder: "请输入通知正文，纯文本，最多 5000 字，不支持富文本",
    category: "分类",
    type: "类型",
    link: "跳转链接",
    linkPlaceholder: "选填，站内路径以 / 开头，或完整 http(s) 地址",
    sendEmail: "同时发送邮件",
    sendEmailTip: "邮件为异步发送，返回成功只代表已进入发送队列",
    preview: "预览",
    previewTitle: "通知预览",
    reset: "重置",
    submit: "发送"
  },

  send: {
    done: "已发送给 {n} 人，邮件入队 {queued} 封，跳过 {skipped} 封",
    doneNoEmail: "已发送给 {n} 人",
    mailDisabledTip: "邮件总开关当前为关闭状态，本次只发站内通知；如需邮件请先在超级设置中开启",
    confirm: "确认发送这条通知？发送后不可撤回；邮件为异步排队，返回成功不代表已送达。"
  },

  record: {
    allCategory: "全部分类",
    allType: "全部类型",
    keyword: "按标题搜索",
    filter: {
      category: "通知分类",
      type: "通知类型",
      source: "来源",
      keyword: "标题关键词"
    },
    empty: "还没有发送记录",
    detail: "查看收件人",
    retry: "重试失败邮件",
    retryDone: "已重试 {retried} 封，成功 {sent} 封，仍失败 {failed} 封",
    columns: {
      title: "标题",
      category: "分类",
      recipientCount: "收件人",
      readCount: "已读",
      email: "邮件",
      source: "来源",
      createdAt: "发送时间",
      action: "操作"
    },
    emailSummary: "待发 {pending} · 已发 {sent} · 失败 {failed} · 跳过 {skipped}",
    loadFailed: "发送记录获取失败，展示的是上次结果"
  },

  detail: {
    title: "批次详情",
    batchId: "批次编号",
    createdAt: "发送时间",
    source: "来源",
    readProgress: "已读 {read}/{total}",
    statRecipient: "收件人",
    statRead: "已读",
    statUnread: "未读",
    statEmail: "邮件",
    empty: "该批次没有收件人记录",
    columns: {
      userId: "用户 ID",
      isRead: "阅读状态",
      emailStatus: "邮件状态",
      emailError: "失败原因",
      readAt: "阅读时间"
    },
    recipientTip: "阅读状态与邮件状态由服务端回填；邮件失败时原始错误可展开查看",
    loadFailed: "批次详情获取失败"
  },

  header: {
    title: "消息通知",
    markAll: "全部已读",
    viewAll: "查看全部",
    empty: "暂无新通知",
    unreadTip: "{n} 条未读",
    loadFailed: "通知预览获取失败"
  },

  validate: {
    titleRequired: "请填写通知标题",
    titleTooLong: "标题不能超过 100 字",
    contentRequired: "请填写通知正文",
    contentTooLong: "正文不能超过 5000 字",
    linkInvalid: "跳转链接需以 / 开头，或为 http(s) 完整地址",
    audienceTypeRequired: "请选择接收人范围",
    roleRequired: "请至少选择一个角色",
    userRequired: "请至少选择一个用户"
  },

  // 系统事件通知：后端只存 key，展示时按 data 插值
  auth: {
    registerPending: {
      title: "新账号待审核",
      content: "账号 {username} 已提交注册申请，请前往用户管理审核"
    },
    passwordChanged: {
      title: "登录密码已修改",
      content: "你的登录密码已修改，如非本人操作请立即联系管理员"
    },
    passwordReset: {
      title: "登录密码已重置",
      content: "你的登录密码已通过邮箱验证重置，如非本人操作请立即联系管理员"
    }
  },
  session: {
    revoked: {
      title: "会话已终止",
      content: "你的账号在其它设备上的登录已被管理员终止"
    }
  },
  user: {
    accountDisabled: {
      title: "账号已停用",
      content: "你的账号已被管理员停用，如有疑问请联系管理员"
    },
    passwordAdminReset: {
      title: "密码已被重置",
      content: "管理员已重置你的登录密码，请使用新密码重新登录"
    },
    registerApproved: {
      title: "注册申请已通过",
      content: "你的注册申请已通过审核，现在可以登录"
    },
    registerRejected: {
      title: "注册申请未通过",
      content: "你的注册申请未通过审核，如有疑问请联系管理员"
    }
  }
};
