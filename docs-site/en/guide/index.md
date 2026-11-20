# Getting started

Node 22.15 or newer, with npm as the package manager.

```bash
npm install
npm run dev
```

The dev server listens on `http://localhost:5173`. Either mock account signs in:

| Account      | Password            | Role        |
| ------------ | ------------------- | ----------- |
| `superAdmin` | `superAdmin123456@` | Super admin |
| `admin`      | `admin123456@`      | Admin       |

`superAdmin` reaches every entry point, system settings and the super panel included. `admin` sits one level below, which makes it the quickest way to watch the permission gate work. The rest of the accounts live in `src/mocks/users`, each carrying a different set of permission codes.

## Scripts

| Command                    | What it does                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`              | Dev server                                                                                                           |
| `npm run build`            | Type check plus production build                                                                                     |
| `npm run preview`          | Preview the built output                                                                                             |
| `npm run type-check`       | vue-tsc only                                                                                                         |
| `npm run lint`             | ESLint                                                                                                               |
| `npm run lint:fix`         | ESLint with autofix                                                                                                  |
| `npm run format`           | Prettier, writing changes back                                                                                       |
| `npm run test`             | Vitest in watch mode                                                                                                 |
| `npm run test:run`         | Vitest, single run                                                                                                   |
| `npm run test:coverage`    | Coverage, threshold 36 / 35 / 34 / 37                                                                                |
| `npm run docs:dev`         | Docs site dev server                                                                                                 |
| `npm run docs:build`       | Build the docs site                                                                                                  |
| `npm run docs:preview`     | Preview the docs site                                                                                                |
| `npm run site:build`       | Docs site and demo app in one go                                                                                     |
| `npm run primitives:check` | Fails when Element Plus is used directly instead of through a primitive                                              |
| `npm run spacing:check`    | Checks that spacing comes from tokens                                                                                |
| `npm run contrast:check`   | Contrast ratios                                                                                                      |
| `npm run bundle:check`     | First-screen budget, 920 kB                                                                                          |
| `npm run audit:prod`       | Production dependency audit                                                                                          |
| `npm run verify`           | All ten steps: lint → primitives → spacing → contrast → type-check → docs types → test → build → bundle → docs build |

Run `npm run verify` before pushing. It catches most of what would otherwise reach CI.

## Where things live

```
V3TM/
├─ src/               the template: pages, components, request layer, locales
├─ docs-site/         this site; its commands run from the repo root
├─ docs/images/       screenshots used by the README
├─ e2e/               Playwright specs
└─ scripts/           guard scripts and build helpers
```

## What the first run looks like

You land on the dashboard after signing in. The menu tree sits on the left, the page on the right. The dashboard carries four unread cards, recent notifications, account security and quick entries. System settings and the super panel need their permission codes, and the mock accounts hold all of them.

Every piece of data comes from `src/mocks`, so no backend is required. Set `VITE_USE_MOCK` to `false` in `.env.development` and restart, and requests follow `VITE_APP_PROXY_TARGET` to the real service.
