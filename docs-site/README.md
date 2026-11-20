# docs-site 维护说明

这个目录是 VitePress 站点，读 `.vitepress/config.mts` 里的配置，正文是各目录下的 Markdown。站点与主应用共用 Element Plus 和项目主题，组件示例用的就是 `src/components` 里那一份，不另做副本。

## 本地怎么看

```bash
npm run docs:dev        # 开发模式，改动即时刷新
npm run docs:build      # 产出到 docs-site/.vitepress/dist
npm run docs:preview    # 预览已构建的产物
```

开发模式默认用 5173，和主应用撞端口时指定一个空位；预览同理会抢 5173：

```bash
npm run docs:dev -- --port 5174
npm run docs:preview -- --port 5175
```

站点默认只监听本机，要让同网段其他机器打开，dev 脚本已经带了 `--host`，预览则加 `--host 0.0.0.0`。

## 目录

```
docs-site/
├─ index.md                 首页
├─ guide/                   指南五页
├─ components/              原子组件：总览加十四页
├─ business/                业务组件五页
├─ reference/               参考三页：后端缺口、间距、断点
├─ playground/index.md      内嵌演示
└─ .vitepress/
   ├─ config.mts            导航、侧栏、搜索、构建参数
   ├─ theme/index.ts        主题、i18n、注入键、样式引入顺序
   ├─ theme/custom.css      示例容器与内嵌画框
   └─ dist/                 构建产物，不进版本库
```

`config.mts` 的侧栏是页面清单的唯一出处：站点里能看到哪些页，以它为准。

## 加一页组件文档

1. 新建 `components/<组件名>.md`，开头写：

   ```md
   <script setup>
   import { ref } from "vue";
   import AppXxx from "@/components/common/base/app-xxx/index.vue";
   
   const visible = ref(false);
   </script>
   ```

2. 正文按四段写：一句用途说明、可交互示例（`<div class="demo-block">` 包住）、一段 `vue` 代码块、Props 与 Events 表。
3. 在 `config.mts` 的 `/components/` 侧栏加一条链接，再到 `components/index.md` 的卡片格里补一格。

三处都改完，侧栏、总览、页面本身才对得上。

## 改已有页面

组件 props 或事件变了，对应页的 Props 表、Events 表、示例一起改；只调样式不需要动文档。业务组件页讲的是用法与约束（列宽预算、折叠策略、请求错误处理），接口字段变了要同步。

## 常见坑

- **正文不要交给 prettier。** 它会把示例里的内联组件标签拆行，`>` 单独占一行，编译直接报 `Invalid end tag`。`format` 脚本的范围里已经排除了 docs-site 正文，只留 `.vitepress` 下的 ts 与 css。
- 示例容器用 `<div class="demo-block">`，不要用 `<p>`：块级组件套在 `<p>` 里，浏览器会提前闭合段落。
- 组件页的 `<script setup>` 不许留空块。空块在服务端渲染阶段会报 `document is not defined`。
- 构建完不要在终端里 `cd` 进 `dist` 或 `dist/assets`，目录被占用会让下一次构建清不掉产物，报 `EPERM`。
- Element Plus 单块约 1 MB 属正常，它是项目既有的公共依赖，`chunkSizeWarningLimit` 已放到 1100，不要为消警告去硬拆。
- 站内链接不写 `.html`，配置开了 `cleanUrls`。

## 部署

`docs-site/.vitepress/dist` 是纯静态产物，丢给 Nginx、Vercel、GitHub Pages 都能跑。部署在子路径时用环境变量 `DOCS_BASE` 传前缀，例如 `DOCS_BASE=/V3TM/ npm run docs:build`；不传就挂在根路径。

`.github/workflows/docs.yml` 把文档站与 Mock 应用一起发到 Pages，基址按仓库名自动取。首次发布前，到仓库 Settings → Pages 把 Source 选成 GitHub Actions。

## 内容口径

命令、账号、环境变量以仓库现状为准。这几处变了，对应页面要跟着改。
