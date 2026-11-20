import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const docsDist = path.join(root, "docs-site", ".vitepress", "dist");
const appDist = path.join(root, "dist");
const siteDist = path.join(root, "dist-site");
// 站点基址：SITE_BASE 为主，DOCS_BASE 作为同义写法兼容
const rawBase = process.env.SITE_BASE || process.env.DOCS_BASE || "/";
const docsBase = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
const routeRoot = `${docsBase}demo-app/`;

/** 构建阶段使用的 npm 入口；Windows 下 .cmd 需要 shell 解析 */
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const run = (args, extraEnv) => {
  const result = spawnSync(npm, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
    shell: process.platform === "win32"
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const ensureDir = (target) => fs.mkdirSync(target, { recursive: true });

console.log("[site] 构建文档站");
run(["run", "docs:build"], {
  DOCS_BASE: docsBase,
  VITE_DEMO_APP_URL: routeRoot
});

console.log("[site] 构建 Mock 应用");
run(["run", "build"], {
  VITE_APP_BASE: routeRoot,
  VITE_USE_MOCK: "true"
});

console.log("[site] 组装静态站点");
fs.rmSync(siteDist, { recursive: true, force: true });
fs.cpSync(docsDist, siteDist, { recursive: true });
ensureDir(path.join(siteDist, "demo-app"));
fs.cpSync(appDist, path.join(siteDist, "demo-app"), { recursive: true });

// Cloudflare Pages 与 Netlify 读取该文件；应用内路由回退到自身入口
fs.writeFileSync(
  path.join(siteDist, "_redirects"),
  `${routeRoot}* ${routeRoot}index.html 200\n`,
  "utf8"
);

console.log(`[site] 输出 ${siteDist}`);
