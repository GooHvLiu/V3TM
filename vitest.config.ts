import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src")
    }
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "html"],
      reportsDirectory: "coverage",
      include: [
        "src/components/common/**/*.{ts,vue}",
        "src/composables/**/*.ts",
        "src/utils/**/*.ts",
        "src/stores/**/*.ts"
      ],
      // api 层是请求壳与类型定义，行为由 e2e 与联调覆盖，不计入行覆盖率
      exclude: ["src/**/*.test.ts", "src/**/*.d.ts", "src/api/**"],
      // 口径含 stores 与 composables 后重新校准，留出回归余量
      thresholds: {
        statements: 36,
        branches: 35,
        functions: 34,
        lines: 37
      }
    }
  }
});
