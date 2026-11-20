# 变更记录

版本号与 `package.json` 对齐，条目按「基座 / 设计系统 / 组件 / 页面 / 工程 / 文档」分组。

## 0.1.0 — 2026-11-20

### 基座

- 技术栈：Vue 3.5、Vite 8、TypeScript 6、Element Plus 2.14、Pinia、vue-router、vue-i18n、zod
- 路由由后端菜单驱动，静态路由只留布局、认证、法务与错误页，深链有兜底
- 请求层：Axios 封装、单飞续期、失败排队重放、统一错误码；mock 适配器按 `VITE_USE_MOCK` 切换
- 状态按域拆分：用户、菜单、主题、通知、配置

### 设计系统

- Less 令牌：`scale.less` 的间距刻度与 `variables.less` 别名，经 `vite.config.ts` 注入全部样式
- 六档断点（479 / 639 / 767 / 1023 / 1199 / 1599），`use-breakpoint` 与表格、表单联动
- 亮暗两套主题令牌，对比度与间距各有守卫脚本，接进 `verify`

### 组件

- 原子十四件：button、tag、tooltip、alert、drawer、dialog、card、avatar、badge、empty、skeleton、error-state、tabs、separator
- 表格：`ProTable`（列设置、密度、骨架、窄屏关固定列、分页可访问性）、列设置面板、骨架表
- 表单：`ProForm` 与七类控件、`ProSearch`（默认露三个字段、可折叠）
- 图表：`BaseChart` 与 `use-chart-theme`，亮暗切换时按令牌重建主题，ECharts 按需注册

### 页面

- 看板、我的记录、通知中心、日志中心
- 用户、角色、菜单、权限、字典五个中心
- 系统设置、超级设置、帮助中心、知识库
- 运维五页：健康检查、会话管理、运行指标、运维任务、字典中心

### 工程

- `verify` 十步：lint、原子守卫、间距守卫、对比度、类型、文档站类型、单测、构建、首屏预算、文档站构建
- 首屏预算 920 kB，当前 866.68 kB / gzip 299.72 kB
- 覆盖率门槛 36 / 35 / 34 / 37（语句 / 分支 / 函数 / 行），口径限定在公共层
- CI 分两条工作流：质量门禁跑十步与覆盖率门槛、生产依赖审计并留存构建产物；端到端冒烟单独一条
- GitHub Issue 与 PR 模板

### 文档

- `docs/design/ep-primitives.md`：原子层与 Element Plus 原语的边界约定
- `docs-site`：VitePress 文档站，五块内容——指南 5 页、原子组件 14 页、业务组件 4 页、参考 3 页、内嵌演示 1 页

### 已知项

- 文档站暂无英文版，随下一版本补齐
- vitepress 内嵌的旧 vite 有 1 个高危漏洞且无修复版本，只影响文档站工具链，不进产物；生产依赖审计为 0
