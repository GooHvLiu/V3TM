# Request layer

Every request leaves through `@/utils/request`, and there is no second exit. Business code never imports `axios`.

## Contract

A successful response is HTTP 200 with `code: 200`. Transport problems are expressed by HTTP status codes and never folded into the business code.

```ts
interface ApiResponse<T> {
  code: number;
  msg: string; // an identifier, not copy
  params?: Record<string, unknown>;
  data: T;
  requestId?: string;
}
```

**`msg` is an identifier, not text meant for humans.** The backend returns `ROLE_NAME_TAKEN`, and the client renders "Role name already exists". Values that need interpolating travel in `params`; `{ field: "name" }` becomes "Role name already exists: name". The backend then needs no notion of locales, and the client parses no strings.

A missing entry falls back to "Unknown error", so a technical identifier never reaches the interface.

## Four request flags

Four flags on the request config steer the interceptors:

| Flag         | Effect                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------- |
| `_retry`     | A replay already happened; prevents endless retries                                       |
| `_isRefresh` | A renewal call; on its own failure it signs out instead of looping                        |
| `_silent`    | Business errors raise no toast; the caller handles them (explicit sign-out, for instance) |
| `_public`    | Public endpoint: no credentials, no renewal, no sign-out                                  |

```ts
request.post("/v1/auth/logout", null, { _silent: true });
request.get("/v1/help/manifest", { _public: true });
```

## Error notices

`RequestErrorNotice` renders business errors once: the message as the title, the request id alongside it, ready to copy for the backend. Pages do not write a `catch` plus `ElMessage` for every endpoint.

Where a caller wants the error, pass `_silent` or read `error.message` in the catch — the interceptor has already translated the identifier into the current language.

## Request ids

The body carries `requestId`, and the response header carries `X-Request-ID`. When the body lacks one, the header is used. Handing that string to the backend from a user report points straight at the log entry.

## Loading states

The request layer emits no `loading` event. Lists use `loading` from `useTable`, forms use the button's `loading`, whole pages use a skeleton. Each of the three stays local, which beats a global overlay: a global spinner leaves the user guessing which action is stuck.

## Adding an endpoint

Three steps, in order:

1. Add a function under `src/api/<module>` with typed parameters and return value;
2. Add the matching handler in `src/mocks`, with paths, query parameters and fields identical to the real endpoint;
3. Call it from a page or a composable.

Step 2 is not optional. Because mock and real endpoints share a shape, wiring up the backend means flipping `VITE_USE_MOCK` and nothing else — neither the api layer nor the pages move.

## Timeouts and cancellation

The default timeout comes from `VITE_APP_TIME_OUT` at ten seconds; the help center Q&A gets sixty. Navigating away does not require cancelling a request — `useTable` tags each call with a sequence number and discards stale responses, so a late reply never overwrites fresher data.
