# 参与贡献

## 环境

- Node.js 22.15.0 及以上，npm 10.9.0 及以上
- 包管理器统一用 npm，仓库里有 `.nvmrc`，`nvm use` 就能对齐版本

```
npm install
cp .env.example .env.development
npm run dev
```

## 分支与提交

- 从 `main` 切分支，命名用 `feat/xxx`、`fix/xxx`、`docs/xxx`
- 提交信息走 Conventional Commits：`feat:`、`fix:`、`docs:`、`refactor:`、`chore:`，`commit-msg` 钩子会校验
- 一次提交只做一件事，格式化与业务改动分开提交

## 提交前

```
npm run verify
```

十步全过再开 PR：lint、原子守卫、间距守卫、对比度、类型检查、文档站类型、单测、构建、首屏预算、文档站构建。

改动涉及下面这些内容时，同时把文档改掉：

- 新增或修改接口：`src/api` 的类型与 `src/mocks` 的模拟处理同时补上，路径与真实接口保持一致
- 组件 Props 或用法变化：更新 `docs-site` 对应页面
- 间距、颜色等令牌：更新 `docs-site/reference/spacing`
- 原子层增删：更新 `docs/design/ep-primitives.md` 与 `scripts/check-primitives.mjs` 的保留集合

## 代码约定

- 文案一律走 `src/locales`，模板里不写中文字面量
- 页面不直接写 `el-button`、`el-alert` 这类原子，走 `src/components/common/base`
- props 只读，子组件要改数据就 `emit("update:modelValue")` 上抛
- 不留死代码，不用 `any`，注释只写约束与理由
- 目录按业务域组织，新增文件放进已有目录，不另起一层
