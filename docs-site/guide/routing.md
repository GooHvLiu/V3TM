# 路由与权限

## 静态路由

`src/router/routes.ts` 只放骨架：布局根、登录页、法务页、错误页。这些不随业务变化。

```ts
LAYOUT.ROOT      布局容器，子路由由菜单生成
AUTH.ROOT        登录、找回密码
LEGAL            隐私政策、服务条款
ERRORS           403 / 404 / 500
```

## 业务路由由菜单决定

页面路径不写在路由表里，而是跟着菜单数据走。菜单项里带 `path`、`name`、`component`、`icon`、`permission`，登录后拉菜单、生成路由、再挂到布局容器下。

这么做的原因很实际：后台的菜单经常增删，如果路径写死在路由表里，每次调整都要改代码、跑构建、发版；菜单驱动之后，改配置就生效。

```ts
{
  path: "/system-settings",
  name: "systemSettings",
  component: "system-settings/index",
  icon: "setting",
  permission: "systemSettings:view"
}
```

`component` 是相对 `src/pages` 的路径，加载时走动态 `import()`，一个页面一个 chunk。

## 权限码

权限码是冒号分隔的三段：`模块:对象:动作`，例如 `role:create`、`menu:update`、`systemSettings:config:update`。后端返回当前用户的权限码集合，前端只做展示层过滤——真正的拦截在后端。

三种用法：

```vue
<!-- 指令：无权限时整个节点不渲染 -->
<AppButton v-permission="'role:create'">新建角色</AppButton>

<!-- 组件属性：省掉外层判断 -->
<AppButton permission="role:create">新建角色</AppButton>

<!-- 脚本里判断 -->
const canEdit = computed(() => hasPermission("role:update"));
```

指令与 `permission` 属性都是「不满足就不渲染」，不是「渲染后禁用」。用户看不到自己无权使用的东西，界面更干净，也不会出现点下去才提示无权限的挫败感。

## 新增一个页面

三步：

1. 在 `src/pages/<业务域>/<页面>/index.vue` 建页面；
2. 在菜单数据里加一条，填 `path`、`component`、`permission`；
3. 在 `src/locales/zh-cn` 里给菜单标题加 key，`name` 字段用它。

菜单标题走 key 而不是中文，是为了后面切英文时不用回改菜单数据。

## 登录态

未登录访问任何业务路径都会被导到登录页，登录成功后回到原路径。令牌过期时请求层会尝试续期，续期失败则登出并跳回登录，同时保留原路径——用户重新登录后不会丢上下文。

需要改密码的账号（首次登录、管理员重置后）会被强制跳到改密页，改完才允许进入其他页面。这个状态由 `PASSWORD_CHANGE_REQUIRED` 标记，存在本地存储里。
