// 原语守卫：已经封成原子的标签，不允许再在业务代码里直接写
// 例外只有两种：原子自身内部要落到 Element Plus；个别保留原语登记在 ALLOW 里
import fs from "node:fs";
import path from "node:path";

const ROOT = "src";
const ATOM_ROOT = "src/components/common/base";

// 标签 -> 该用的原子
const REPLACEMENT = {
  "el-alert": "AppAlert",
  "el-tooltip": "AppTooltip",
  "el-button": "AppButton",
  "el-dialog": "AppDialog",
  "el-drawer": "AppDrawer",
  "el-tag": "AppTag",
  "el-empty": "AppEmpty",
  "el-tabs": "AppTabs",
  "el-tab-pane": "AppTabs",
  "el-card": "AppCard",
  "el-avatar": "AppAvatar",
  "el-badge": "AppBadge",
  "el-divider": "AppSeparator"
};

// 登记过的保留用法，键为“相对路径#标签”
const ALLOW = new Set([
  // 顶栏移动端的磨砂搜索层：整块自绘遮罩，弹窗行为与 AppDialog 不同
  "src/components/header/actions/header-search/search-mobile.vue#el-dialog"
]);

const TAG = /<el-([a-z-]+)/g;

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (entry.name.endsWith(".vue")) out.push(full);
  }
}

const files = [];
walk(ROOT, files);

const violations = [];

for (const file of files) {
  const rel = file.split(path.sep).join("/");
  if (rel.startsWith(ATOM_ROOT)) continue;

  const text = fs.readFileSync(file, "utf8");
  const lines = text.split("\n");

  lines.forEach((line, index) => {
    if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) return;
    TAG.lastIndex = 0;
    for (const match of line.matchAll(TAG)) {
      const tag = `el-${match[1]}`;
      const atom = REPLACEMENT[tag];
      if (!atom) continue;
      if (ALLOW.has(`${rel}#${tag}`)) continue;
      violations.push({ file: rel, line: index + 1, tag, atom });
    }
  });
}

if (!violations.length) {
  console.log(`原语守卫：${files.length} 个 .vue 无越界用法`);
} else {
  console.log(`原语守卫：${violations.length} 处越界`);
  for (const item of violations) {
    console.log(`  ${item.file}:${item.line}  <${item.tag}> 应改用 <${item.atom}>`);
  }
  process.exitCode = 1;
}
