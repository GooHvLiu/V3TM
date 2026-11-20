# 构建阶段：Node 22 跑类型检查与打包
FROM node:22.15-alpine AS build

WORKDIR /app

# 先只拷依赖清单，改代码时不重装依赖
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# 子路径部署时传 --build-arg VITE_APP_BASE=/v3tm/
ARG VITE_APP_BASE=/
ENV VITE_APP_BASE=${VITE_APP_BASE}

RUN npm run build

# 运行阶段：产物交给 nginx
FROM nginx:1.27-alpine AS runtime

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
