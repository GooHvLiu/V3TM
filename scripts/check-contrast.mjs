import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const themes = [
  {
    name: "亮色",
    file: path.join(root, "src/assets/styles/tokens/theme-light/theme-light.less")
  },
  {
    name: "暗色",
    file: path.join(root, "src/assets/styles/tokens/theme-dark/theme-dark.less")
  }
];

const pairs = [
  ["--color-text-primary", "--color-bg-page", "主要文字 / 页面背景"],
  ["--color-text-regular", "--color-bg-page", "常规文字 / 页面背景"],
  ["--color-text-secondary", "--color-bg-page", "次要文字 / 页面背景"],
  ["--color-text-placeholder", "--color-bg-page", "占位文字 / 页面背景"],
  ["--color-primary-text", "--color-bg-page", "主色文字 / 页面背景"],
  ["--color-success-text", "--color-bg-page", "成功文字 / 页面背景"],
  ["--color-warning-text", "--color-bg-page", "警告文字 / 页面背景"],
  ["--color-danger-text", "--color-bg-page", "危险文字 / 页面背景"]
];

const readTokens = (file) => {
  const source = fs.readFileSync(file, "utf8");
  const map = new Map();
  for (const match of source.matchAll(/--[a-z0-9-]+\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))/g)) {
    const [name, value] = match[0].split(":");
    map.set(name.trim(), value.trim());
  }
  return map;
};

const channel = (value) => {
  const normalized = value.length === 4 ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}` : value;
  return [1, 3, 5].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16) / 255);
};

const luminance = (hex) => {
  const [r, g, b] = channel(hex).map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (foreground, background) => {
  const a = luminance(foreground);
  const b = luminance(background);
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
};

let failed = 0;
for (const theme of themes) {
  const tokens = readTokens(theme.file);
  console.log(`[contrast] ${theme.name}`);
  for (const [foreground, background, label] of pairs) {
    const fg = tokens.get(foreground);
    const bg = tokens.get(background);
    if (!fg || !bg || !fg.startsWith("#") || !bg.startsWith("#")) {
      console.error(`  缺少十六进制令牌：${foreground} / ${background}`);
      failed += 1;
      continue;
    }
    const value = ratio(fg, bg);
    const status = value >= 4.5 ? "PASS" : "FAIL";
    if (status === "FAIL") failed += 1;
    console.log(`  ${status} ${label}: ${value.toFixed(2)}:1 (${fg} / ${bg})`);
  }
}

if (failed) {
  console.error(`[contrast] ${failed} 项未达到 4.5:1`);
  process.exit(1);
}
console.log("[contrast] 全部达到 4.5:1");
