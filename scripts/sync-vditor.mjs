// Vditor 运行时资源同步
// 编辑器初始化时 cdn 指向 /vditor，运行时按该前缀请求 lute、图标、语言包等资源，
// 因此把 dist 中被请求的子集复制到 public/vditor/dist，避免依赖外网 unpkg。
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

const SOURCE = path.resolve("node_modules/vditor/dist");
const TARGET = path.resolve("public/vditor/dist");

// 只同步编辑器实际会加载的部分；流程图、图表类资源按需再补
const ITEMS = ["index.css", "images", "js/lute", "js/highlight.js", "js/i18n", "js/icons", "js/katex"];

if (!existsSync(SOURCE)) {
  console.error("[vditor] 缺少 node_modules/vditor/dist，请先执行 npm i vditor");
  process.exit(1);
}

await rm(TARGET, { recursive: true, force: true });
await mkdir(TARGET, { recursive: true });

for (const item of ITEMS) {
  const from = path.join(SOURCE, item);
  if (!existsSync(from)) {
    console.warn(`[vditor] 资源缺失，已跳过：${item}`);
    continue;
  }
  await cp(from, path.join(TARGET, item), { recursive: true });
}

const entries = await readdir(TARGET, { recursive: true, withFileTypes: true });
const count = entries.filter((entry) => entry.isFile()).length;

console.log(`[vditor] 资源同步完成：${count} 个文件 -> public/vditor/dist`);
