import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const root = path.resolve(process.cwd(), "dist-site");
const portArgIndex = process.argv.indexOf("--port");
const port = Number(portArgIndex >= 0 ? process.argv[portArgIndex + 1] : 4180);
const rawBase = process.env.SITE_BASE || "/";
const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

/** 部署在子路径时，把请求前缀剥离后再映射到 dist-site 根目录 */
const stripBase = (pathname) => {
  if (base === "/") return pathname;
  const basePath = base.slice(0, -1);
  if (pathname === basePath) return "/";
  if (pathname.startsWith(base)) return `/${pathname.slice(base.length)}`;
  return pathname;
};

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon"
};

/** 只允许访问 dist-site 内部文件 */
const resolveFile = (pathname) => {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname.split("?")[0]);
  } catch {
    return null;
  }
  const normalized = path.normalize(decoded).replace(/^([/\\])+/, "");
  const candidate = path.resolve(root, normalized);
  const inside = candidate === root || candidate.startsWith(`${root}${path.sep}`);
  return inside ? candidate : null;
};

const pickFile = (pathname) => {
  if (pathname === "/demo-app") return path.join(root, "demo-app", "index.html");
  const target = resolveFile(pathname);
  if (!target) return null;
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return target;
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    const index = path.join(target, "index.html");
    if (fs.existsSync(index)) return index;
  }
  if (!path.extname(target) && fs.existsSync(`${target}.html`)) return `${target}.html`;
  if (pathname.startsWith("/demo-app/")) return path.join(root, "demo-app", "index.html");
  return null;
};

http
  .createServer((req, res) => {
    const file = pickFile(stripBase(req.url || "/"));
    if (!file) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Static site served at http://localhost:${port}/`);
  });
