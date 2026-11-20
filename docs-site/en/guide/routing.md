# Routing and permissions

## Static routes

`src/router/routes.ts` holds the shell only: the layout root, the login page, the legal pages and the error pages. None of it moves with the business.

```ts
LAYOUT.ROOT      layout container, children generated from the menu
AUTH.ROOT        sign in and password recovery
LEGAL            privacy policy, terms of service
ERRORS           403 / 404 / 500
```

## Business routes come from the menu

Page paths are not written into the route table; they travel with the menu data. A menu item carries `path`, `name`, `component`, `icon` and `permission`. After sign-in the app fetches the menu, builds routes, then mounts them under the layout container.

The reason is practical: back-office menus change constantly. Hard-coded paths mean code edits, builds and releases every time the tree shifts. Once the menu drives it, a configuration change is enough.

```ts
{
  path: "/system-settings",
  name: "systemSettings",
  component: "system-settings/index",
  icon: "setting",
  permission: "systemSettings:view"
}
```

`component` is resolved relative to `src/pages` and loaded through a dynamic `import()`, one chunk per page.

## Permission codes

Codes are colon-separated triples, `module:object:action`, such as `role:create`, `menu:update`, `systemSettings:config:update`. The backend returns the current user's set, and the front end only filters what is displayed — enforcement belongs to the backend.

Three ways to use them:

```vue
<!-- Directive: the node is not rendered without the permission -->
<AppButton v-permission="'role:create'">New role</AppButton>

<!-- Component prop: skips the wrapper check -->
<AppButton permission="role:create">New role</AppButton>

<!-- In script -->
const canEdit = computed(() => hasPermission("role:update"));
```

Both the directive and the prop mean "render nothing", not "render then disable". Users never see controls they cannot use, and nobody clicks a button only to be told it is forbidden.

## Adding a page

Three steps:

1. Create `src/pages/<domain>/<page>/index.vue`;
2. Add a menu entry with `path`, `component` and `permission`;
3. Add a key for the menu title in `src/locales/zh-cn` and point `name` at it.

Menu titles are keys rather than literal Chinese so that switching to English later does not require editing the menu data.

## Session state

Any business path visited while signed out redirects to the login page, and signing in returns you to where you were. When a token expires the request layer tries to renew it; a failed renewal signs you out, keeps the original path and brings you back after the next sign-in.

Accounts that must change their password — first sign-in, or after an administrator resets it — are pushed to the password page and allowed nowhere else until they finish. The flag is `PASSWORD_CHANGE_REQUIRED`, stored locally.
