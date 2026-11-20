export default {
  pageDesc: "配置系统级参数与常量，改动即时生效",
  saved: "保存成功",
  saveFailed: "保存失败，请重试",
  lang: {
    switched: "默认语言已更新",
    noPermission: "默认语言由管理员统一设置，当前账号无修改权限",
    switchFailed: "语言切换失败，已保持当前语言"
  },
  source: {
    db: "库值",
    env: "环境变量",
    default: "默认值"
  },
  sections: {
    general: { title: "常规设置", desc: "系统级基础参数，影响全局展示与前端请求行为" },
    help: { title: "帮助中心", desc: "帮助中心的默认模式与回答策略" }
  },
  options: {
    default_locale: { "zh-cn": "简体中文", "en-us": "English" },
    help_mode: { static: "静态文档", ai: "智能问答" },
    help_answer_policy: { strict: "严格：未命中不回答", lenient: "宽松：未命中交模型作答" }
  },
  items: {
    default_locale: "默认语言",
    default_localeTip: "全站默认语言，由顶栏语言切换写入；后端保存成功后才生效，本页只读",
    request_timeout: "接口超时",
    request_timeoutTip: "前端接口请求的超时时间，单位毫秒；仅浏览器端消费，后端不读取该值",
    register_enabled: "开放自助注册",
    register_enabledTip: "关闭后登录页不展示注册入口，自助注册也会被拒绝；管理员创建账号不受影响",
    help_mode: "帮助模式",
    help_modeTip: "帮助中心默认展示方式：静态文档按关键词检索，智能问答交模型回答",
    help_answer_policy: "未命中策略",
    help_answer_policyTip: "智能问答未检索到内容时的处理方式，严格模式直接回复未找到"
  }
};
