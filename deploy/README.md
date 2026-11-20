# 部署样例

自托管一份构建好的静态产物，nginx 只做三件事：把深链交回入口页、给带 hash 的资源长缓存、给入口页短缓存。

## 起容器

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

起来后访问 `http://localhost:8080`。镜像里是 `npm run build` 的产物，构建阶段会顺带跑 `vue-tsc`，类型不过就不会出镜像。

## 单独构建

```bash
docker build -f deploy/Dockerfile -t v3tm:0.2.0 .
docker run --rm -p 8080:80 v3tm:0.2.0
```

## 子路径部署

挂在 `https://example.com/v3tm/` 下时，构建前把前缀传进去：

```bash
docker build -f deploy/Dockerfile --build-arg VITE_APP_BASE=/v3tm/ -t v3tm:0.2.0 .
```

`Dockerfile` 里 `VITE_APP_BASE` 由 Vite 读进产物；nginx 那边不用再改 `root`，前缀天然落在 URL 里。不传时默认 `/`。

## 不用容器

把 `dist` 拷到任意静态目录，`nginx.conf` 直接引用即可：

```nginx
server {
    root /srv/v3tm;
    include /path/to/deploy/nginx.conf;
}
```

## 健康检查

容器内置 `HEALTHCHECK` 打 `/healthz`，返回 `ok`。K8s 或别的编排系统可以把它当就绪探针，路径不需要鉴权。

## 注意

- 别把 `dist` 与 `docs-site/.vitepress/dist` 混在一起部署，后者是文档站，两者 base 不同。
- 演示环境用 mock 数据；接真后端时改 `.env` 的 `VITE_USE_MOCK=false` 与 `VITE_APP_PROXY_TARGET`，再重新构建。
