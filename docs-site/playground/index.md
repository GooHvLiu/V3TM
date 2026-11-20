<script setup>
// 本地指向开发服务；线上回退到同站 demo-app 子路径，避免访客浏览器去连自己的 5173
const demoUrl =
  import.meta.env.VITE_DEMO_APP_URL ||
  (import.meta.env.DEV ? "http://localhost:5173" : `${import.meta.env.BASE_URL}demo-app/`);
</script>

# 在线演示

下面内嵌的是模板本体的开发服务。先在项目根目录跑起 `npm run dev`，再看这一页——内嵌的是真实页面，不是静态截图。

<div class="demo-frame">
  <iframe :src="demoUrl" title="V3TM 演示" loading="lazy" />
</div>

```bash
npm run dev          # 另开一个终端
npm run docs:dev     # 再看这一页
```

默认地址是 `http://localhost:5173`。部署到别处时，在 `.env` 里配 `VITE_DEMO_APP_URL`，文档站构建时会读它。留空则回退到本机 5173。

## 为什么用内嵌而不是截图

截图会过期。组件改一次，截图就得重拍一次，而且没人知道它是什么时候拍的。内嵌的是正在运行的应用，看到的永远是最新状态——代价是打开这一页需要有开发服务在跑。

触发登录时会在内嵌窗口里看到登录页，用 `superAdmin / superAdmin123456@`（或 `admin / admin123456@`）登录即可。

## 内嵌窗口里能试什么

- 顶栏的语言与主题切换，两套色板实时生效；
- 看板上的图表随主题换色；
- 表格的密度切换、列设置、列偏好保存；
- 设置面板的三级导航与滚动定位；
- 窄屏行为——把内嵌窗口拖窄，或者在浏览器里缩小窗口。

## 结构

```html
<div class="demo-frame">
  <iframe src="http://localhost:5173" title="V3TM 演示" loading="lazy" />
</div>
```

`.demo-frame` 的样式在 `custom.css` 里：16:9 比例、圆角、描边、窄屏降到 4:3。iframe 没有固定高度，靠 `aspect-ratio` 跟随宽度。
