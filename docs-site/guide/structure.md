# 目录与分层

```
src/
├── api/            接口定义，一个模块一个文件
├── assets/         样式、图标、图片
├── components/     组件
│   ├── common/     base 原子件、form、table、search、chart、feedback、layout
│   ├── header/     顶栏与其下拉
│   ├── settings/   设置面板
│   └── ...
├── composables/    跨页面复用的状态与逻辑
├── constants/      常量与枚举
├── directives/     自定义指令
├── layout/         布局骨架
├── locales/        语言包
├── mocks/          接口模拟数据
├── pages/          页面
├── router/         路由
├── stores/         全局状态
├── types/          类型
└── utils/          工具
```

## 依赖方向

```
pages → components → composables → utils
  ↓         ↓
 api      constants / types
```

四条规则：

**页面不写 Element Plus。** 按钮、标签、表格、表单都走自己的原语与复合件。页面里出现 `el-button` 就是漏网，`npm run primitives:check` 会拦下来。样式同理——页面只引用令牌变量，不改组件内部结构。

**组件不直连 api。** 组件接收数据、抛出事件，取数发生在页面或 composable 里。ProTable 不知道数据来自哪个接口，只认 `data` 与 `loading`。

**api 是唯一出口。** 每个后端模块一个文件，函数返回解包后的类型。mock 与真实接口同形，切换只发生在环境变量，不改 api 层。

**composable 承状态，utils 承纯函数。** `useTable` 管分页与竞态，`formatDate` 只做格式化且可直接单测。能被顺手复用的逻辑放 utils，需要响应式与生命周期的放 composable。

## 页面按业务域分目录

`pages` 下 13 个目录对应业务域：`dashboard`、`data-search`、`design-tasks`、`projects`、`system-settings`、`admin-center`、`about`、`profile`、`auth`、`legal`、`errors`、`super-settings`、`super-admin`。一个目录里可以有多级页面，路由路径由菜单配置决定，不以目录结构为准。

## 组件的四类

| 目录            | 内容                                     | 例子                         |
| --------------- | ---------------------------------------- | ---------------------------- |
| `common/base`   | 原子件，一层 Element Plus 之上的语义封装 | AppButton、AppTag、AppDialog |
| `common/form`   | 表单复合件与控件                         | ProForm、ProFormControl      |
| `common/table`  | 表格复合件与列设置、骨架                 | ProTable、ColumnSettings     |
| `common/search` | 查询复合件                               | ProSearch                    |

原子件的判断标准是「能不能被任意页面直接用，且不带业务语义」。带业务字段的组件放页面自己的目录下，不进 `common`。

## 样式

`assets/styles` 下分四层：`tokens`（色板、字号、间距、圆角、阴影）、`reset`（重置与 Element Plus 覆盖）、`layout`（布局变量）、`variables`（Less 变量与断点）。组件样式用 Less，通过 `vite.config.ts` 的 `additionalData` 自动注入变量文件，写样式时不需要手动 import。

同一目录里同时有 `.less` 源与 `.css` 产物的是历史遗留，构建以 `.less` 为准，`.css` 供文档站直接引用（文档站不走 Less 编译链）。
