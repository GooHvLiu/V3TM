# 快速开始

Node 22.15 以上，包管理用 npm。

```bash
npm install
npm run dev
```

开发服务起在 `http://localhost:5173`，登录用 mock 账号：

| 账号         | 密码                |
| ------------ | ------------------- |
| `superAdmin` | `superAdmin123456@` |

这个账号带超级管理员权限，能看到系统设置与超级面板的全部入口。其他角色账号在 `src/mocks/users` 里，按角色给不同的权限码。

## 常用脚本

| 命令                       | 作用                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `npm run dev`              | 开发服务                                                                              |
| `npm run build`            | 类型检查 + 生产构建                                                                   |
| `npm run preview`          | 预览构建产物                                                                          |
| `npm run type-check`       | 只跑 vue-tsc                                                                          |
| `npm run lint`             | ESLint                                                                                |
| `npm run lint:fix`         | ESLint 自动修复                                                                       |
| `npm run format`           | Prettier 写回                                                                         |
| `npm run test`             | vitest 监听                                                                           |
| `npm run test:run`         | vitest 单次                                                                           |
| `npm run test:coverage`    | 覆盖率，门槛 36 / 35 / 34 / 37                                                        |
| `npm run docs:dev`         | 文档站开发服务                                                                        |
| `npm run docs:build`       | 文档站构建                                                                            |
| `npm run docs:preview`     | 预览文档站                                                                            |
| `npm run site:build`       | 文档站 + 演示站一起构建                                                               |
| `npm run primitives:check` | 检查是否绕过了原语直接写 Element Plus                                                 |
| `npm run spacing:check`    | 检查间距是否走令牌                                                                    |
| `npm run contrast:check`   | 对比度                                                                                |
| `npm run bundle:check`     | 首屏体积预算 920 kB                                                                   |
| `npm run audit:prod`       | 生产依赖审计                                                                          |
| `npm run verify`           | 十步全跑：lint → primitives → spacing → contrast → type-check → 文档站类型 → test → build → bundle → 文档站构建 |

日常改完代码跑 `npm run verify`，提交前它会拦住绝大多数问题。

## 目录在仓库里的位置

```
V3TM/
├─ src/               模板本体：页面、组件、请求层、语言包
├─ docs-site/         文档站，命令都在仓库根执行
├─ docs/images/       README 的界面预览图
├─ e2e/               Playwright 用例
└─ scripts/           守卫脚本与构建辅助
```

## 第一次跑起来会看到什么

登录后落到看板。左侧是菜单树，右侧是页面。看板顶部四张未读卡、最近通知、账号安全、快捷入口；菜单里系统设置与超级面板需要对应权限码，用 mock 账号能全部展开。

数据全部来自 `src/mocks`，不依赖后端。把 `.env.development` 里的 `VITE_USE_MOCK` 改成 `false` 再启动，请求会走 `VITE_APP_PROXY_TARGET` 指向的真实服务。
