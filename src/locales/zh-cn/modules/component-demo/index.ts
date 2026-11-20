/**
 * 组件演示文案
 */
export default {
  title: "组件演示",
  description: "基础组件的常用形态，新页面直接复用这里的封装，不另行拼装",
  group: {
    control: "基础控件",
    feedback: "反馈与状态",
    layout: "布局与容器",
    business: "业务组件"
  },
  demo: {
    button: {
      title: "按钮",
      desc: "语义色配视觉层级，尺寸与状态跟随组件库变量"
    },
    tag: {
      title: "标签",
      desc: "状态标记与分类用标签，颜色取自语义色"
    },
    badge: {
      title: "徽标",
      desc: "数字与红点两种形态，超出上限按最大值显示"
    },
    avatar: {
      title: "头像",
      desc: "圆形与方形两种形状，图标与文字都能承载"
    },
    alert: {
      title: "提示条",
      desc: "页面内的说明与警示，可关闭，也可居中强调"
    },
    empty: {
      title: "空状态",
      desc: "列表无数据时给出下一步动作"
    },
    errorState: {
      title: "错误状态",
      desc: "加载失败时提供重试与返回入口"
    },
    skeleton: {
      title: "骨架屏",
      desc: "按文本、列表、表格、图表四种形态占位"
    },
    card: {
      title: "卡片",
      desc: "页面的基本容器，标题与内边距可调"
    },
    separator: {
      title: "分隔线",
      desc: "横向与纵向两种方向，可带文字说明"
    },
    tabs: {
      title: "标签页",
      desc: "只负责切换，内容由业务页自行组织"
    },
    tooltip: {
      title: "文字提示",
      desc: "悬停补充说明，浅底样式与主题一致"
    },
    dialog: {
      title: "对话框",
      desc: "标题、宽度与底部按钮统一，关闭行为可配置"
    },
    drawer: {
      title: "抽屉",
      desc: "适合编辑表单，可拦截未保存时的关闭"
    },
    table: {
      title: "ProTable",
      desc: "列配置、密度切换、骨架屏与分页内置"
    },
    form: {
      title: "ProForm",
      desc: "字段声明式配置，服务端校验错误自动回填"
    },
    chart: {
      title: "BaseChart",
      desc: "图表容器跟随主题切换，自适应父容器尺寸"
    }
  },
  label: {
    solid: "实心",
    outline: "描边",
    ghost: "幽灵",
    link: "链接",
    sizeSm: "小",
    sizeMd: "中",
    sizeLg: "大",
    avatarText: "阿",
    emptyDesc: "暂无数据，先建一条记录",
    errorDesc: "请求没有返回，检查网络后重试",
    tabOverview: "概览",
    tabConfig: "配置",
    tabStats: "统计",
    tabsBody: "标签栏只负责切换，内容由业务页按需渲染。",
    tooltipContent: "这里的字段由服务端下发",
    dialogTitle: "对话框标题",
    dialogBody: "内容区由业务页填充，底部按钮由组件生成。",
    drawerTitle: "抽屉标题",
    drawerBody: "抽屉从右侧滑出，适合放置编辑表单。",
    openDialog: "打开对话框",
    openDrawer: "打开抽屉",
    docs: "查看文档",
    cardPlain: "默认描边",
    codeButton: '<app-button tone="primary">保存</app-button>',
    codeTag: '<app-tag tone="success" dot>在线</app-tag>'
  }
};
