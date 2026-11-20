import { execFileSync } from "node:child_process";
import { relative, resolve } from "node:path";

const hooksDir = resolve(process.cwd(), ".husky");

try {
  const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  const hooksPath = relative(repoRoot, hooksDir).split("\\").join("/");
  execFileSync("git", ["config", "core.hooksPath", hooksPath], { stdio: "inherit" });
  console.log(`[hooks] core.hooksPath=${hooksPath}`);
} catch {
  console.log("[hooks] 未检测到 Git 仓库，跳过钩子安装");
}
