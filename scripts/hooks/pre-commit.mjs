import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const cwd = process.cwd();

const run = (command, args) => {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

let staged = [];
let prefix = "";
try {
  prefix = execFileSync("git", ["rev-parse", "--show-prefix"], { cwd, encoding: "utf8" }).trim();
  staged = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
    cwd,
    encoding: "utf8"
  })
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => file.startsWith(prefix) && /\.(ts|vue|json|md|ya?ml)$/.test(file))
    .map((file) => file.slice(prefix.length));
} catch {
  process.exit(0);
}

if (!staged.length) process.exit(0);

const eslint = resolve(cwd, "node_modules/eslint/bin/eslint.js");
const prettier = resolve(cwd, "node_modules/prettier/bin/prettier.cjs");
const sourceFiles = staged.filter((file) => /\.(ts|vue)$/.test(file)).filter((file) => !file.endsWith(".d.ts"));
const textFiles = staged.filter((file) => /\.(json|md|ya?ml)$/.test(file));

if (sourceFiles.length && existsSync(eslint)) {
  run(process.execPath, [eslint, "--fix", "--no-warn-ignored", ...sourceFiles]);
}

if (textFiles.length && existsSync(prettier)) {
  run(process.execPath, [prettier, "--write", ...textFiles]);
}

console.log(`[pre-commit] checked ${staged.length} staged file(s)`);
