# Layout and layers

```
src/
├── api/            one file per backend module
├── assets/         styles, icons, images
├── components/     components
│   ├── common/     base atoms plus form, table, search, chart, feedback, layout
│   ├── header/     top bar and its dropdowns
│   ├── settings/   settings panels
│   └── ...
├── composables/    state and logic shared across pages
├── constants/      constants and enums
├── directives/     custom directives
├── layout/         layout shell
├── locales/        language packs
├── mocks/          mock data behind the same interfaces
├── pages/          pages
├── router/         routing
├── stores/         global state
├── types/          types
└── utils/          helpers
```

## Dependency direction

```
pages → components → composables → utils
  ↓         ↓
 api      constants / types
```

Four rules:

**Pages never write Element Plus.** Buttons, tags, tables and forms all go through the project's own primitives and composites. An `el-button` inside a page is a leak, and `npm run primitives:check` fails on it. Styles follow the same rule: a page references token variables and never reaches into a component's internals.

**Components never call the api directly.** A component takes data and emits events; fetching happens in a page or a composable. ProTable does not know which endpoint feeds it — it only reads `data` and `loading`.

**The api layer is the only exit.** One file per backend module, and each function returns the unwrapped type. Mock and real endpoints share the same shape, so switching happens through an environment variable and never rewrites the api layer.

**Composables hold state, utils hold pure functions.** `useTable` owns pagination and race handling; `formatDate` only formats and can be tested on its own. Logic that would be reused with reactivity and lifecycle goes into a composable; everything else goes into utils.

## Pages group by business domain

Thirteen folders under `pages` map to domains: `dashboard`, `data-search`, `design-tasks`, `projects`, `system-settings`, `admin-center`, `about`, `profile`, `auth`, `legal`, `errors`, `super-settings`, `super-admin`. A folder can hold nested pages, and the route path comes from the menu configuration rather than the folder layout.

## The four kinds of components

| Folder          | What lives there                            | Examples                     |
| --------------- | ------------------------------------------- | ---------------------------- |
| `common/base`   | atoms: semantics on top of Element Plus     | AppButton, AppTag, AppDialog |
| `common/form`   | form composites and controls                | ProForm, ProFormControl      |
| `common/table`  | table composites, column settings, skeleton | ProTable, ColumnSettings     |
| `common/search` | search composite                            | ProSearch                    |

An atom qualifies when any page can use it as-is and it carries no business meaning. Components with business fields stay in the page that owns them, not in `common`.

## Styles

`assets/styles` has four layers: `tokens` (palette, type scale, spacing, radius, shadow), `reset` (reset and Element Plus overrides), `layout` (layout variables), `variables` (Less variables and breakpoints). Component styles are written in Less, and the variable file is injected through `additionalData` in `vite.config.ts`, so no manual import is needed.

Where a folder holds both a `.less` source and a built `.css`, the build reads the `.less`; the `.css` exists for the docs site, which does not run the Less pipeline.
