import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

// 钩子在 V3TM 子目录执行，但 Git 传入的 $1 是相对仓库根目录的路径，需按仓库根解析。
const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const gitPath = execFileSync("git", ["rev-parse", "--git-path", "COMMIT_EDITMSG"], {
  cwd: repoRoot,
  encoding: "utf8"
}).trim();

const arg = process.argv[2];
const candidate = arg ? (isAbsolute(arg) ? arg : resolve(repoRoot, arg)) : "";
const file =
  candidate && existsSync(candidate) ? candidate : isAbsolute(gitPath) ? gitPath : resolve(repoRoot, gitPath);

const message = readFileSync(file, "utf8").trim();
const header = message.split(/\r?\n/)[0] ?? "";

if (/^(Merge|Revert)\b/.test(header)) process.exit(0);

const pattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([\w-]+\))?: .{1,100}$/;

if (!header) {
  console.error("提交信息不能为空");
  process.exit(1);
}

if (header.length > 100) {
  console.error("提交信息第一行不能超过 100 个字符");
  process.exit(1);
}

if (!pattern.test(header)) {
  console.warn("提示：提交信息未使用 Conventional Commits，已放行。推荐格式：<type>(<scope>): <subject>");
}
