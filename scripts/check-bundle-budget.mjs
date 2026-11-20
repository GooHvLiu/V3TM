import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const dist = path.join(root, "dist");
const html = path.join(dist, "index.html");
// 首屏预算：Mock 接口表目前随请求层一起进首屏（约 200 kB），
// 改成按需加载后可回到 900 kB，届时把这里调回去
const budgetKb = Number(process.env.BUNDLE_BUDGET_KB || 920);

if (!fs.existsSync(html)) {
  console.error("[bundle] 缺少 dist/index.html，请先执行 npm run build");
  process.exit(1);
}

const source = fs.readFileSync(html, "utf8");
const refs = new Set();
for (const match of source.matchAll(/["'(]([^"'()]*?assets\/[^"'()]+)["')]/g)) {
  refs.add(match[1].replace(/^\/+/, "").replace(/^demo-app\//, ""));
}

const assets = [];
for (const ref of refs) {
  const file = path.join(dist, ref.replace(/^assets\//, "assets/"));
  if (!fs.existsSync(file)) {
    console.error(`[bundle] HTML 引用了不存在的资源：${ref}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(file);
  assets.push({ ref, raw: raw.length, gzip: zlib.gzipSync(raw).length });
}

const totalRaw = assets.reduce((sum, asset) => sum + asset.raw, 0);
const totalGzip = assets.reduce((sum, asset) => sum + asset.gzip, 0);
const kb = (value) => (value / 1024).toFixed(2);

console.log(`[bundle] 首屏资源 ${assets.length} 个`);
for (const asset of assets.sort((a, b) => b.raw - a.raw).slice(0, 5)) {
  console.log(`  ${kb(asset.raw).padStart(8)} kB  ${asset.ref}`);
}
console.log(`[bundle] 原始 ${kb(totalRaw)} kB / gzip ${kb(totalGzip)} kB，预算 ${budgetKb} kB`);

if (totalRaw / 1024 > budgetKb) {
  console.error(`[bundle] 超出预算 ${kb(totalRaw - budgetKb * 1024)} kB`);
  process.exit(1);
}
console.log("[bundle] 预算通过");
