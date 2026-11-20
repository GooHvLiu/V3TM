# 环境变量与 Mock

配置分两份：`.env.development` 给本地，`.env.example` 是全量清单加注释。生产不在仓库里放密钥，构建时由部署环境注入。

## 变量

| 变量                       | 开发值                  | 说明                                    |
| -------------------------- | ----------------------- | --------------------------------------- |
| `VITE_APP_LOCALE`          | `zh-cn`                 | 默认语言                                |
| `VITE_STORAGE_TYPE`        | `local`                 | 存储驱动，`local` 或 `session`          |
| `VITE_APP_BASE_API`        | `/api`                  | 请求基址                                |
| `VITE_APP_TIME_OUT`        | `10000`                 | 请求超时（毫秒）                        |
| `VITE_USE_MOCK`            | `true`                  | 是否走 mock 表，连后端时改 `false`       |
| `VITE_APP_PROXY_TARGET`    | `http://127.0.0.1:3000` | 开发代理目标                            |
| `VITE_APP_PORT`            | `5173`                  | 开发端口                                |
| `VITE_APP_HELP_AI_TIMEOUT` | `60000`                 | 帮助中心问答超时                        |
| `VITE_APP_BASE`            | `/`                     | 部署前缀，子路径部署时改                |
| `VITE_DEMO_APP_URL`        | 空                      | 文档站演示内嵌地址，留空时回退本机 5173 |

只有 `VITE_` 开头的变量会进客户端代码——其余变量写进 `.env` 也不会被打包，可以放心放构建期配置。

`VITE_USE_MOCK` 没配置时按运行模式走：开发环境开启，构建产物关闭。`npm run dev` 起来直接能看到界面，而 `npm run build` 的包里不带 mock 表。

## Mock 怎么工作

`src/mocks` 导出一张 `url → 处理函数` 的表。`VITE_USE_MOCK=true` 时，请求层的适配器查这张表，命中就走本地处理，返回结构与真实后端一致：`{ code, msg, data }`。

```ts
// src/mocks/apis/role.ts
export const roleApis = {
  "GET /api/v1/role": ({ page, pageSize, keyword }) => ({ list: filter(keyword).slice(…), total }),
  "POST /api/v1/role": (payload) => ({ id: nextId(), ...payload })
};
```

好处是路径、查询参数、返回字段与真实接口完全同形。后端上线时只需要把开关关掉，api 层与页面一行都不用改。

## 假数据的边界

mock 只负责形状与分页语义，不模拟延迟与失败。要测加载态用组件的 `loading`，要测错误态用 `useTable` 的 `error`——不要把 `setTimeout` 塞进 mock 里，那样每个页面的等待时间都不一样。

## 演示账号

`superAdmin / superAdmin123456@`。密码错误时后端返回 `USER_PASSWORD_ERROR`，前端按标识翻成「账号或密码错误」。

## 本地连着真后端

```bash
VITE_USE_MOCK=false
VITE_APP_PROXY_TARGET=http://127.0.0.1:3000
```

代理把 `/api` 前缀转到目标服务。跨域问题在开发期由代理解决，不要在后端开 `*`。
