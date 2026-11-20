# EP 原语与原子层的边界

前端界面全部落在 Element Plus 上，但页面不该直接写 `<el-button>`、`<el-alert>` 这类标签。
能被复用的形态已经收进 `src/components/common/base`，其余原语各有各的用途，登记保留，不做封装。
这份清单说明哪一层归谁，以及新增页面时怎么落笔。

## 一、什么情况下才封装

三条同时成立才进原子层：

1. **形态同构**：多处的标签、属性、插槽结构基本一致，差异只剩下取值。
2. **有项目级口径**：默认值、语义色、尺寸、间距需要由设计令牌统一，而不是各页各写。
3. **有可替换性**：调用点改标签就能换掉，不需要按页面写迁移逻辑。

只有一两处出现、且形态随场景变化的，留在原语里。硬封装会把差异压成一层插槽矩阵，页面更难读。

## 二、原子层现有成员

| 原子            | 承接的原语                | 职责                                                                            |
| --------------- | ------------------------- | ------------------------------------------------------------------------------- |
| `AppButton`     | `el-button`               | `tone` + `variant` + `block` + `iconOnly`，旧 `type/plain/text/link` 仍参与推导 |
| `AppTag`        | `el-tag`                  | `tone` + `variant`（soft/outline/solid）+ `dot`                                 |
| `AppEmpty`      | `el-empty`                | 空态文案走语言包，插画尺寸默认交给 EP                                           |
| `AppAlert`      | `el-alert`                | `tone` 六档映射 EP 四类型，边框取语义浅色                                       |
| `AppTooltip`    | `el-tooltip`              | 全站浅底，默认 `max-width` 与 `show-after`；支持 `#content`                     |
| `AppDialog`     | `el-dialog`               | 页脚按钮、加载态、`open/close/closed` 事件与受控显隐                            |
| `AppDrawer`     | `el-drawer`               | 关闭时不销毁、默认无页脚、页脚按需出现                                          |
| `AppTabs`       | `el-tabs` + `el-tab-pane` | 泛型 `items` 驱动，`#label` / `#content`                                        |
| `AppCard`       | `el-card`                 | `padding` 五档 + `shadow` + 边框开关                                            |
| `AppAvatar`     | `el-avatar`               | 语义色与尺寸                                                                    |
| `AppBadge`      | `el-badge`                | 语义色与计数形态                                                                |
| `AppSeparator`  | `el-divider`              | 间距与色调                                                                      |
| `AppSkeleton`   | `el-skeleton`             | `text/list/table/page` 四种骨架形态                                             |
| `AppErrorState` | —                         | 错误页与失败态，图标、标题、动作区                                              |

`scripts/check-primitives.mjs` 守着这张表：除原子自身内部，业务代码里再出现上表任一原语即失败。

## 三、登记保留的原语

### 表单与输入

`el-form`、`el-form-item`、`el-input`、`el-select`、`el-option`、`el-input-number`、`el-radio-group`、`el-radio-button`、`el-radio`、`el-switch`、`el-checkbox`、`el-date-picker`、`el-upload`、`el-tree-select`。

这些是 `ProForm` 的渲染底座，校验、受控值、错误回填都依赖 Element Plus 的 form-item 上下文。单独包一层只会把 `prop`、`rules`、`validate` 的调用链切断，`ProForm` 自己在 `controls/index.vue` 里按控件类型分发，已经是正确的一层。
`el-checkbox` 只在 `ProTable` 的列设置里出现一处，`el-date-picker` 只剩系统设置的时间范围一处（查询区的日期区间由 `ProForm` 的 `daterange` 分支渲染），`el-upload` 只在知识库上传里用。

### 数据展示

`el-table` + `el-table-column`、`el-descriptions` + `el-descriptions-item`、`el-tree`、`el-progress`、`el-scrollbar`、`el-carousel`、`el-icon`、`el-breadcrumb`、`el-config-provider`、`el-skeleton` + `el-skeleton-item`。

表格页一律走 `ProTable`；这四处 `el-table` 是轻量只读表，没有分页、列设置、密度这些框架能力，套 `ProTable` 反而重。
`el-tree` 两处分别是知识库文档树与权限树面板，加载异步、勾选语义各不相同；`el-icon` 是图标载体，包一层没有意义。
骨架屏的 `el-skeleton` 块只出现在 `AppSkeleton` 与 `ProTable` 的表格骨架内部——后者要按列自适应，形态与 `AppSkeleton` 的 `table` 分支不同。

### 浮层

`el-popover` 四处、`el-dropdown` 四处、`el-segmented` 两处。

下拉四处逐个看过，没有同构属性集：

| 位置                          | 定位与触发                                    | 菜单内容                                                     |
| ----------------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| `header/actions/header-lang`  | `bottom-end`、点击触发、监听 `visible-change` | 语言列表 `v-for`，含国旗图标与当前语言禁用                   |
| `header/actions/header-theme` | 同上                                          | 主题列表 `v-for`，含图标与当前主题禁用                       |
| `sidebar/user`                | `top-start`、折叠时悬停展开                   | 首项是 `UserInfo` 组件，其后五项为图标 + 文案，末项 `logout` |
| `super-admin/menu-center`     | 默认定位、点击触发                            | 动作菜单三项，`divided` 分隔、条件图标、按状态禁用           |

前两处是「单值选择列表」，后两处是「动作菜单」；定位、触发方式、项内容全不同。共同点只有 `#dropdown` + `el-dropdown-menu` + `el-dropdown-item` 这三层壳，壳本身没有项目级定制。真要收，就得为「列表型」和「动作型」各开一套插槽，比直接用原语更难写。

`el-popover` 同样是四种用途（顶栏工具、通知预览、样式定制说明、字段解释），锚点与内容形态都不同。
`el-segmented` 两处：关于页的帮助中心开关，以及看板趋势的读法切换。两处都走默认尺寸，单项热区 50×28，
选中块跟主色走；`size="small"` 会把热区压到 42×20，不要用。
项目里的 `SegmentedOptions` 是设置面板用的双列按钮组，带 `grid` 与主色块，和 EP 带滑块的分段控制器不是同一个控件，不能互换。

## 四、`el-card` 的收口

登录卡与找回密码卡原本各写一个 `el-card`，正文区靠 `:deep(.el-card__body)` 覆盖成纵向 flex。现在两处都换成 `AppCard`：

- 传 `padding="xl"`，正文内边距仍是 20px，卡内 20px 的 `gap` 与「返回入口上移 6px」的补偿不变；
- 传 `shadow="always"`，保留原来 EP 默认的投影；
- 圆角改由 `@radius-card` 提供，从 EP 默认的 4px 变为 8px，与全站其余卡片一致。

## 五、查询区的收口

列表页上方的筛选条只有一个实现：`ProSearch`。它把字段配置交给 `ProForm` 的 `inline` 布局渲染，动作区固定是搜索、重置与折叠展开，页面只负责给字段和拿模型。

八处使用位置：`log-center/log-table`、`role-center`、`user-center`、`dict-type`、`dict-date`、`data-search/log-pane`、`data-search/message-pane`、`notice-center/batch-table`。`data-search` 两处原先各写一套 `FilterBar` + 裸 `el-select` / `el-date-picker` / `el-input`，宽度、可访问名、重置行为都在页面里重复一遍；收口后 `pages/data-search/filter-bar` 已删除。通知中心的四个筛选控件与两个按钮同样整段换掉，分类与类型的选项标签改由 `computed` 直接产出，不在模板里再拼 `labelKey`。

动作区的搜索与重置走默认尺寸（60×32）。展开/收起是链接样式，EP 默认只给文字行高，热区 34×20，手指一按容易偏出；组件里给它补了 `display: inline-flex`、`min-height: var(--el-component-size)` 与左右内边距，实测 46×32，与两个按钮齐平。

字段配置里三件事要注意：

- `width` 决定查询区里这一格的宽度。`ProForm` 把它写成 `--pro-form-item-width` 变量，样式表里 `width: var(--pro-form-item-width, 200px)` 取用；窄屏的 `width: 100%` 因此在同一处生效，不需要页面再写媒体查询，也不会被内联样式压住。
- `ariaLabel` 是控件无可见标签时的可访问名称，取值顺序是 `ariaLabel → placeholder → label`。查询区没有可见标签，条件语义（「搜索关键字」「结果」「日期范围」）只能靠它表达，配置时不要省。
- 下拉的「全部」项用 `value: ""` 显式列出，页面读值时统一 `|| undefined`：空串、未选都按「不限」处理，不把空串发给接口。

## 六、重置后的空值

`clearFormModel` 是重置的唯一出口，清空结果按控件类型固定：

| 控件                              | 重置后的值  | 理由                                               |
| --------------------------------- | ----------- | -------------------------------------------------- |
| `daterange`                       | `null`      | EP 区间选择器的「未选」就是 `null`                 |
| `input` / `password` / `textarea` | `""`        | 文本字段保持字符串类型，页面读值不必防 `undefined` |
| `select` / `switch` / `number`    | `undefined` | 选择与数值没有自然空串，EP 未选即 `undefined`      |

这张表是页面读值的前提。文本字段恒为字符串，所以 `filter.keyword.trim()` 这类写法在任何时候都成立；
选择类字段可能是 `undefined`，读的时候用 `|| undefined` 或 `?? ""` 归一，不要假设它一定是空串。

## 七、文案收口

对话框的「取消 / 确定」不再各模块各存一份，统一取 `common.cancel` 与 `common.confirm`。这两个键在 `src/locales/zh-cn/common/common.ts` 里是唯一出口，新增对话框直接引用，不要往模块语言包里再补一遍。

确认框的第二参是标题，不是按钮文案。原先有 8 处把「确定」当标题填了进去，现在按操作给出各自的标题：

| 位置              | 标题键                            | 文案         |
| ----------------- | --------------------------------- | ------------ |
| 用户中心·删除     | `users.confirmDeleteTitle`        | 删除用户     |
| 用户中心·重置密码 | `users.confirmResetPasswordTitle` | 重置密码     |
| 用户中心·通过审核 | `users.confirmApproveTitle`       | 通过审核     |
| 用户中心·驳回     | `users.confirmRejectTitle`        | 驳回账号     |
| 用户中心·批量删除 | `users.confirmBatchDeleteTitle`   | 批量删除用户 |
| 角色中心·删除     | `roles.confirmDeleteTitle`        | 删除角色     |
| 字典类型·删除     | `dicts.confirmDeleteTypeTitle`    | 删除字典类型 |
| 字典数据·删除     | `dicts.confirmDeleteDataTitle`    | 删除字典项   |

按钮文案显式给 `confirmButtonText` 与 `cancelButtonText`，都走 common。EP 自带语言包里的按钮文案会随版本和 locale 变，显式给一次就不必跟着它漂。

清掉的重复键共 15 个：`users`、`roles`、`dicts` 各一组 `dialog.cancel` / `dialog.confirm`，`knowledgeCenter.action.cancel` / `.confirm`，`logCenter.cancel`，`menuCenter.cancel` 与 `menuCenter.form.cancel`，`sessionCenter.cancel`，`taskCenter.cancel`，`profile.dialog.cancel` / `dialog.confirm`。

## 八、执行

```bash
npm run primitives:check
```

守卫扫 `src` 下所有 `.vue`，跳过 `src/components/common/base` 里的原子本体；个别确需保留的用法写进脚本的 `ALLOW` 集合，键为「相对路径#标签」。新增例外必须有理由，否则就改回原子。

`npm run verify` 已把它排在 `lint` 之后、类型检查之前，越界会在本地提交前就暴露。

`verify` 当前是十步：lint、primitives:check、spacing:check、contrast:check、type-check、
type-check:docs、test:run、build、bundle:check、docs:build。对比度原先只在 CI 里单列一步，
现在并入本地门禁，CI 侧不再重复跑；文档站的类型检查与构建也已挂回链上。
