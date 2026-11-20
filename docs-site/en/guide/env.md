# Environment and mock

Configuration comes in two files: `.env.development` for local work, and `.env.example` as the full list with comments. Secrets stay out of the repository and are injected by the deployment environment at build time.

## Variables

| Variable                   | Development value       | Purpose                                                            |
| -------------------------- | ----------------------- | ------------------------------------------------------------------ |
| `VITE_APP_LOCALE`          | `zh-cn`                 | Default locale                                                     |
| `VITE_STORAGE_TYPE`        | `local`                 | Storage driver, `local` or `session`                               |
| `VITE_APP_BASE_API`        | `/api`                  | Request base path                                                  |
| `VITE_APP_TIME_OUT`        | `10000`                 | Request timeout in milliseconds                                    |
| `VITE_USE_MOCK`            | `true`                  | Serve requests from the mock table; set `false` for a real backend |
| `VITE_APP_PROXY_TARGET`    | `http://127.0.0.1:3000` | Dev proxy target                                                   |
| `VITE_APP_PORT`            | `5173`                  | Dev port                                                           |
| `VITE_APP_HELP_AI_TIMEOUT` | `60000`                 | Help center Q&A timeout                                            |
| `VITE_APP_BASE`            | `/`                     | Deployment prefix, changed for sub-path hosting                    |
| `VITE_DEMO_APP_URL`        | empty                   | Embedded demo address on the docs site; falls back to local 5173   |

Only variables prefixed with `VITE_` reach the client bundle. Anything else stays in `.env` and is never packaged, which makes it a safe place for build-time configuration.

When `VITE_USE_MOCK` is absent, the running mode decides: development turns it on, a production build leaves it off. `npm run dev` shows a working interface immediately, while the bundle produced by `npm run build` carries no mock table.

## How the mock works

`src/mocks` exports a `url → handler` table. With `VITE_USE_MOCK=true`, the adapter in the request layer consults that table, and a hit is answered locally in the same shape the real backend returns: `{ code, msg, data }`.

```ts
// src/mocks/apis/role.ts
export const roleApis = {
  "GET /api/v1/role": ({ page, pageSize, keyword }) => ({ list: filter(keyword).slice(…), total }),
  "POST /api/v1/role": (payload) => ({ id: nextId(), ...payload })
};
```

Paths, query parameters and response fields match the real endpoints exactly. When the backend goes live you flip the switch, and neither the api layer nor the pages change a line.

## Where fake data stops

The mock reproduces shape and pagination semantics, not latency or failure. Loading states come from a component's `loading`, error states from `error` on `useTable` — dropping a `setTimeout` into the mock makes every page wait for a different amount of time.

## Demo accounts

`superAdmin / superAdmin123456@`, plus `admin / admin123456@` for a regular administrator. The mock matches the account by username and checks its status; it does not verify the password. Against a real backend a wrong password comes back as `USER_PASSWORD_ERROR`, which the client renders as "Incorrect account or password".

## Pointing at a real backend

```bash
VITE_USE_MOCK=false
VITE_APP_PROXY_TARGET=http://127.0.0.1:3000
```

The proxy forwards the `/api` prefix to the target service. CORS is a dev-time proxy concern; opening `*` on the backend is not the answer.
