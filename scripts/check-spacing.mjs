// 间距守卫：令牌尺度内的间距必须走 @space-*，不允许再写字面像素
// 只查 <style> 块里的间距属性；细线（1px）、归零与非尺度值（13px 这类微调）不动
import fs from "node:fs";
import path from "node:path";

const ROOT = "src";

// 与 tokens/scale/scale.less 的 --space-* 一一对应
const SCALE = {
  2: "@space-0-5",
  4: "@space-1",
  6: "@space-1-5",
  8: "@space-2",
  10: "@space-2-5",
  12: "@space-3",
  16: "@space-4",
  20: "@space-5",
  24: "@space-6",
  32: "@space-8",
  40: "@space-10",
  48: "@space-12"
};

const PROPS = new Set([
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "gap",
  "row-gap",
  "column-gap"
]);

// 登记过的保留字面值，键为“相对路径#属性”
const ALLOW = new Set([]);

const STYLE_OPEN = /<style[\s>]/;
const STYLE_CLOSE = /<\/style>/;
const DECL = /^(\s*)([a-z-]+):\s*([^;]+);/;

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
let located = 0;

for (const file of files) {
  const rel = file.split(path.sep).join("/");
  const lines = fs.readFileSync(file, "utf8").split("\n");
  let inStyle = false;

  lines.forEach((line, index) => {
    if (STYLE_OPEN.test(line)) {
      inStyle = true;
      return;
    }
    if (STYLE_CLOSE.test(line)) {
      inStyle = false;
      return;
    }
    if (!inStyle) return;

    const match = line.match(DECL);
    if (!match) return;
    const prop = match[2];
    if (!PROPS.has(prop)) return;

    const value = match[3].trim();
    if (value.includes("@") || value.includes("var(") || value.includes("calc(")) {
      located += 1;
      return;
    }

    // 只有整条值都能落到令牌时才要求改写；含非尺度值或负偏移的声明原样保留
    const tokens = value.split(/\s+/);
    let token = null;
    for (const raw of tokens) {
      if (raw === "0") continue;
      if (raw.startsWith("-")) {
        token = null;
        break;
      }
      const hit = raw.match(/^(\d+)px$/);
      if (!hit || !SCALE[Number(hit[1])]) {
        token = null;
        break;
      }
      token = token ?? Number(hit[1]);
    }
    if (token === null) return;
    if (ALLOW.has(`${rel}#${prop}`)) return;
    violations.push({ file: rel, line: index + 1, prop, value, alias: SCALE[token] });
  });
}

if (!violations.length) {
  console.log(`间距守卫：${files.length} 个 .vue 的间距均走令牌（已接 ${located} 处）`);
} else {
  console.log(`间距守卫：${violations.length} 处字面值`);
  for (const item of violations) {
    console.log(`  ${item.file}:${item.line}  ${item.prop}: ${item.value}  应改用 ${item.alias}`);
  }
  process.exitCode = 1;
}
