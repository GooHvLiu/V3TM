# 请求层

所有请求从 `@/utils/request` 出去，没有第二个出口。业务代码里不出现 `axios`。

## 契约

成功响应固定是 HTTP 200 加 `code: 200`。传输层的问题用 HTTP 状态码表达，不塞进业务码里。

```ts
interface ApiResponse<T> {
  code: number;
  msg: string; // 标识，不是文案
  params?: Record<string, unknown>;
  data: T;
  requestId?: string;
}
```

**`msg` 是标识，不是给人看的文案。** 后端返回 `ROLE_NAME_TAKEN`，前端翻成「角色名已存在」；需要插值的部分放 `params`，例如 `{ field: "name" }` 会拼成「角色名已存在：角色名称」。这样后端不用管多语言，前端也不用解析字符串。

缺词条时统一兜底成「未知错误」，不会把后端的技术标识泄漏到界面上。

## 四个扩展标记

请求配置上可以带四个标记，控制拦截器的行为：

| 标记         | 作用                                         |
| ------------ | -------------------------------------------- |
| `_retry`     | 已经重放过，避免无限重试                     |
| `_isRefresh` | 续期请求，自身失效时直接登出，防止自锁       |
| `_silent`    | 业务错误不弹提示，由调用方处理（主动登出等） |
| `_public`    | 公开接口，不带凭证、不续期、不登出           |

```ts
request.post("/v1/auth/logout", null, { _silent: true });
request.get("/v1/help/manifest", { _public: true });
```

## 错误提示

业务错误由 `RequestErrorNotice` 统一渲染：标题是错误文案，附带请求编号，可以复制给后端排查。页面不需要为每个接口写 `catch` 加 `ElMessage`。

需要自己处理错误的场景传 `_silent`，或者在 catch 里读 `error.message`——拦截器已经把标识翻成了当前语言的文案。

## 请求编号

响应体会带 `requestId`，响应头里同时写 `X-Request-ID`。响应体缺失时用响应头兜底。用户反馈问题时把这串编号给后端，能直接定位到那一条日志。

## 加载态

请求层不发 `loading` 事件。列表用 `useTable` 的 `loading`，表单用按钮的 `loading`，页面级用骨架屏。三处各管各的，比全局遮罩更清楚——全局 loading 会让用户不知道是哪个动作卡住了。

## 新增一个接口

顺序是三步：

1. `src/api/<模块>` 下加函数，写好入参与返回类型；
2. `src/mocks` 里加对应的模拟处理，路径、查询参数与返回字段跟真实接口一致；
3. 页面用 composable 或直接调用。

第 2 步不能省。mock 与真实接口同形，后端接上时只改 `VITE_USE_MOCK` 一个开关，api 层与页面不用动。

## 超时与取消

默认超时 `VITE_APP_TIME_OUT` 是 10 秒，帮助中心的 AI 问答单独给到 60 秒。切页时不需要手动取消请求——`useTable` 用请求序号丢弃过期响应，旧响应回来也不会覆盖新数据。
