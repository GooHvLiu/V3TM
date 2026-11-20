/**
 * ==========================================
 * 菜单数据 mocks 数据 TS版
 * ------------------------------------------
 * 菜单支持分组，分组字段为 menu_group
 * 第一层菜单 menu_group 不为空，sort 字段必须 2 位，第一位为同一 group 识别字段；第 2 位为相同 group 排序字段
 * 第二层及以下，menu_group 必须为 '',当 menu_group 为 '' 时，不再将 sort 分为，则直接排序
 * ------------------------------------------
 * ① 预处理层（拿到数据后，渲染前）
   ├─ 有 menu_group → 按组聚合 + 组间按 sort 十位排 + 组内按个位排
   └─ 没有 menu_group → 不分组，直接输出（无标签）
   ↓ 产出 NavGroup[]（标签 + items）

② 渲染层（index.vue + menu-item.vue 递归）
   ├─ 遍历 NavGroup → 渲染分组标签 + 组内菜单
   └─ 递归：DIR → 箭头子菜单（shadcn 样式）；MENU → 直接项；BUTTON → 不渲染
 * ------------------------------------------
 * menu_group  = 分组身份（决定归哪组、标签文案）
 * sort        = 排序（组间看十位、组内看个位）
 * ------------------------------------------
 * 入参: MenuItems（后端返回的扁平菜单数组）
 * 出参: NavGroup[] = { title: string, items: Menu[] }[]
 * ------------------------------------------
 * 流程:
 * ① 遍历，menu_group 非空串 → 进对应组；空串/null → 进 ungrouped 兜底数组
 * ② 组间顺序: 无 group 的组排最下方；有 group 的组按组内最小 sort 十位升序
 * ③ 组内排序: 按 sort 个位升序
 * ④ 校验: 同组 sort 十位必须一致，不一致 console.error（不 throw）
 * ⑤ 递归: DIR 的 children 按 sort 升序，逐层下钻（子层无分组概念）
 * ==========================================
 */
import type { MenuItems } from "@/types/index";

// 数据与后端种子（scripts/seed.ts · BUILTIN_MENUS）逐条对应：id 即种子 mockId，
// 业务菜单 29 条 + 隐藏权限点 29 条（BUTTON + visible=0，仅供权限码，不进菜单树）
// 分组归属：General=1 / Tasks=2 / Settings=3 / superAdmin=4（sort 十位即组序）
export const mockMenuData: MenuItems = [
  // ===== General 组 dashBoard + dataSearch =====
  // dashBoard
  {
    id: 1,
    parentId: 0,
    name: "menu.menu.dashBoard",
    type: "MENU",
    menu_group: "menu.group.General",
    path: "/dashboard",
    component: "@/pages/dashboard/index.vue",
    icon: "FullScreen",
    permission: "dashBoard:list",
    sort: 11,
    status: 1,
    visible: 1
  },
  // dataSearch
  {
    id: 2,
    parentId: 0,
    name: "menu.menu.dataSearch",
    type: "MENU",
    menu_group: "menu.group.General",
    path: "/data-search",
    component: "@/pages/data-search/index.vue",
    icon: "DataLine",
    permission: "dataSearch:list",
    sort: 12,
    status: 1,
    visible: 1
  },
  // ===== Tasks 组 designTasks（cuttingMachine + testMachine）+ projects（tickets + orders） =====
  // designTasks
  {
    id: 3,
    parentId: 0,
    name: "menu.menu.designTasks.title",
    type: "DIR",
    menu_group: "menu.group.Tasks",
    path: "/design-tasks",
    component: "@/pages/design-tasks/index.vue",
    icon: "Postcard",
    permission: "designTasks:list",
    sort: 21,
    status: 1,
    visible: 1,
    children: [
      {
        id: 31,
        parentId: 3,
        name: "menu.menu.designTasks.cuttingMachine",
        type: "MENU",
        menu_group: "",
        path: "/design-tasks/cutting-machine",
        component: "@/pages/design-tasks/cutting-machine/index.vue",
        icon: "",
        permission: "designTasks:cuttingMachine:list",
        sort: 1,
        status: 1,
        visible: 1
      },
      {
        id: 32,
        parentId: 3,
        name: "menu.menu.designTasks.testMachine",
        type: "MENU",
        menu_group: "",
        path: "/design-tasks/test-machine",
        component: "@/pages/design-tasks/test-machine/index.vue",
        icon: "",
        permission: "designTasks:testMachine:list",
        sort: 2,
        status: 1,
        visible: 1
      }
    ]
  },
  // projects
  {
    id: 4,
    parentId: 0,
    name: "menu.menu.projects.title",
    type: "DIR",
    menu_group: "menu.group.Tasks",
    path: "/projects",
    component: "@/pages/projects/index.vue",
    icon: "Tickets",
    permission: "projects:list",
    sort: 22,
    status: 1,
    visible: 1,
    children: [
      {
        id: 41,
        parentId: 4,
        name: "menu.menu.projects.tickets",
        type: "MENU",
        menu_group: "",
        path: "/projects/tickets",
        component: "@/pages/projects/tickets/index.vue",
        icon: "",
        permission: "projects:tickets:list",
        sort: 1,
        status: 1,
        visible: 1
      },
      {
        id: 42,
        parentId: 4,
        name: "menu.menu.projects.orders",
        type: "MENU",
        menu_group: "",
        path: "/projects/orders",
        component: "@/pages/projects/orders/index.vue",
        icon: "",
        permission: "projects:orders:list",
        sort: 2,
        status: 1,
        visible: 1
      }
    ]
  },
  // ===== Settings 组 systemSettings（config 按钮）+ adminCenter（user/logs/notice）+ about =====
  // systemSettings
  {
    id: 5,
    parentId: 0,
    name: "menu.menu.systemSettings",
    type: "MENU",
    menu_group: "menu.group.Settings",
    path: "/system-settings",
    component: "@/pages/system-settings/index.vue",
    icon: "Setting",
    permission: "systemSettings:list",
    sort: 31,
    status: 1,
    visible: 1,
    children: [
      {
        id: 2015,
        parentId: 5,
        name: "menu.button.config.list",
        type: "BUTTON",
        menu_group: "",
        path: "",
        component: "",
        icon: "",
        permission: "systemSettings:config:list",
        sort: 1,
        status: 1,
        visible: 0
      },
      {
        id: 2016,
        parentId: 5,
        name: "menu.button.config.update",
        type: "BUTTON",
        menu_group: "",
        path: "",
        component: "",
        icon: "",
        permission: "systemSettings:config:update",
        sort: 2,
        status: 1,
        visible: 0
      }
    ]
  },
  // adminCenter
  {
    id: 6,
    parentId: 0,
    name: "menu.menu.adminCenter.title",
    type: "DIR",
    menu_group: "menu.group.Settings",
    path: "/admin-center",
    component: "@/pages/admin-center/index.vue",
    icon: "Aim",
    permission: "adminCenter:list",
    sort: 32,
    status: 1,
    visible: 1,
    children: [
      {
        id: 62,
        parentId: 6,
        name: "menu.menu.adminCenter.userCenter",
        type: "MENU",
        menu_group: "",
        path: "/admin-center/user-center",
        component: "@/pages/admin-center/user-center/index.vue",
        icon: "",
        permission: "adminCenter:userCenter:list",
        sort: 1,
        status: 1,
        visible: 1,
        children: [
          {
            id: 2001,
            parentId: 62,
            name: "menu.button.user.list",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "adminCenter:user:list",
            sort: 1,
            status: 1,
            visible: 0
          },
          {
            id: 2002,
            parentId: 62,
            name: "menu.button.user.create",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "adminCenter:user:create",
            sort: 2,
            status: 1,
            visible: 0
          },
          {
            id: 2003,
            parentId: 62,
            name: "menu.button.user.update",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "adminCenter:user:update",
            sort: 3,
            status: 1,
            visible: 0
          },
          {
            id: 2004,
            parentId: 62,
            name: "menu.button.user.delete",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "adminCenter:user:delete",
            sort: 4,
            status: 1,
            visible: 0
          }
        ]
      },
      {
        id: 65,
        parentId: 6,
        name: "menu.menu.adminCenter.logsCenter",
        type: "MENU",
        menu_group: "",
        path: "/admin-center/logs-center",
        component: "@/pages/admin-center/logs-center/index.vue",
        icon: "",
        permission: "adminCenter:logsCenter:list",
        sort: 2,
        status: 1,
        visible: 1,
        children: [
          {
            id: 2017,
            parentId: 65,
            name: "menu.button.log.list",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "adminCenter:log:list",
            sort: 1,
            status: 1,
            visible: 0
          },
          {
            id: 2038,
            parentId: 65,
            name: "menu.button.log.cleanup",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "adminCenter:log:cleanup",
            sort: 2,
            status: 1,
            visible: 0
          }
        ]
      },
      {
        id: 66,
        parentId: 6,
        name: "menu.menu.adminCenter.noticeCenter",
        type: "MENU",
        menu_group: "",
        path: "/admin-center/notice-center",
        component: "@/pages/admin-center/notice-center/index.vue",
        icon: "",
        permission: "adminCenter:noticeCenter:list",
        sort: 3,
        status: 1,
        visible: 1,
        children: [
          {
            id: 2036,
            parentId: 66,
            name: "menu.button.notice.send",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "adminCenter:notice:send",
            sort: 1,
            status: 1,
            visible: 0
          },
          {
            id: 2037,
            parentId: 66,
            name: "menu.button.notice.manage",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "adminCenter:notice:manage",
            sort: 2,
            status: 1,
            visible: 0
          }
        ]
      }
    ]
  },
  // about
  {
    id: 7,
    parentId: 0,
    name: "menu.menu.about.title",
    type: "DIR",
    menu_group: "menu.group.Settings",
    path: "/about",
    component: "@/pages/about/index.vue",
    icon: "Warning",
    permission: "about:list",
    sort: 33,
    status: 1,
    visible: 1,
    children: [
      {
        id: 71,
        parentId: 7,
        name: "menu.menu.about.githubPage",
        type: "MENU",
        menu_group: "",
        path: "https://github.com/GooHvLiu/V3TM",
        component: "",
        icon: "",
        permission: "about:githubPage:list",
        sort: 1,
        status: 1,
        visible: 1
      },
      {
        id: 72,
        parentId: 7,
        name: "menu.menu.about.appDown",
        type: "MENU",
        menu_group: "",
        path: "/about/app-down",
        component: "@/pages/about/app-down/index.vue",
        icon: "",
        permission: "about:appDown:list",
        sort: 2,
        status: 1,
        visible: 1
      },
      {
        id: 73,
        parentId: 7,
        name: "menu.menu.about.credits",
        type: "MENU",
        menu_group: "",
        path: "/about/credits",
        component: "@/pages/about/credits/index.vue",
        icon: "",
        permission: "about:credits:list",
        sort: 3,
        status: 1,
        visible: 1
      },
      {
        id: 74,
        parentId: 7,
        name: "menu.menu.about.help",
        type: "MENU",
        menu_group: "",
        path: "/about/help",
        component: "@/pages/about/help/index.vue",
        icon: "",
        permission: "about:help:list",
        sort: 4,
        status: 1,
        visible: 1
      }
    ]
  },
  // ===== 组件演示（独立页，对外展示基础组件的常用形态） =====
  {
    id: 8,
    parentId: 0,
    name: "menu.menu.componentDemo",
    type: "MENU",
    menu_group: "menu.group.Settings",
    path: "/design-system",
    component: "@/pages/design-system/index.vue",
    icon: "Grid",
    permission: "designSystem:list",
    sort: 34,
    status: 1,
    visible: 1
  },
  // ===== superAdmin 组「超级面板」：超级设置（独立页，复用系统参数接口） =====
  {
    id: 86,
    parentId: 0,
    name: "menu.menu.superSettings",
    type: "MENU",
    menu_group: "menu.group.superAdmin",
    path: "/super-settings",
    component: "@/pages/super-settings/index.vue",
    icon: "Crop",
    permission: "superAdmin:settings:list",
    sort: 41,
    status: 1,
    visible: 1,
    children: [
      // 超级设置-保存（与后端 seed 的 2031 一致，隐藏按钮）
      {
        id: 2031,
        parentId: 86,
        name: "menu.button.superSettings.update",
        type: "BUTTON",
        menu_group: "",
        path: "",
        component: "",
        icon: "",
        permission: "superAdmin:settings:update",
        sort: 1,
        status: 1,
        visible: 0
      }
    ]
  },
  // ===== superAdmin 组「超级面板」：超级管理（九个业务页的父容器） =====
  {
    id: 87,
    parentId: 0,
    name: "menu.menu.superAdmin.title",
    type: "DIR",
    menu_group: "menu.group.superAdmin",
    path: "/super-admin",
    component: "@/pages/super-admin/index.vue",
    icon: "Odometer",
    permission: "superAdmin:center:list",
    sort: 42,
    status: 1,
    visible: 1,
    children: [
      // 健康检查
      {
        id: 83,
        parentId: 87,
        name: "menu.menu.superAdmin.healthCheck",
        type: "MENU",
        menu_group: "",
        path: "/super-admin/health-check",
        component: "@/pages/super-admin/health-check/index.vue",
        icon: "",
        permission: "superAdmin:healthCheck:list",
        sort: 1,
        status: 1,
        visible: 1,
        children: [
          {
            id: 2023,
            parentId: 83,
            name: "menu.button.health.list",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:health:list",
            sort: 1,
            status: 1,
            visible: 0
          },
          {
            id: 2024,
            parentId: 83,
            name: "menu.button.health.probe",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:health:probe",
            sort: 2,
            status: 1,
            visible: 0
          }
        ]
      },
      // 会话中心
      {
        id: 81,
        parentId: 87,
        name: "menu.menu.superAdmin.sessionCenter",
        type: "MENU",
        menu_group: "",
        path: "/super-admin/session-center",
        component: "@/pages/super-admin/session-center/index.vue",
        icon: "",
        permission: "superAdmin:sessionCenter:list",
        sort: 2,
        status: 1,
        visible: 1,
        children: [
          {
            id: 2018,
            parentId: 81,
            name: "menu.button.session.list",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:session:list",
            sort: 1,
            status: 1,
            visible: 0
          },
          {
            id: 2019,
            parentId: 81,
            name: "menu.button.session.revoke",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:session:revoke",
            sort: 2,
            status: 1,
            visible: 0
          },
          {
            id: 2020,
            parentId: 81,
            name: "menu.button.session.cleanup",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:session:cleanup",
            sort: 3,
            status: 1,
            visible: 0
          }
        ]
      },
      // 运行指标
      {
        id: 84,
        parentId: 87,
        name: "menu.menu.superAdmin.metricsCenter",
        type: "MENU",
        menu_group: "",
        path: "/super-admin/metrics-center",
        component: "@/pages/super-admin/metrics-center/index.vue",
        icon: "",
        permission: "superAdmin:metricsCenter:list",
        sort: 3,
        status: 1,
        visible: 1,
        children: [
          {
            id: 2026,
            parentId: 84,
            name: "menu.button.metrics.reset",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:metrics:reset",
            sort: 1,
            status: 1,
            visible: 0
          }
        ]
      },
      // 运维任务
      {
        id: 85,
        parentId: 87,
        name: "menu.menu.superAdmin.taskCenter",
        type: "MENU",
        menu_group: "",
        path: "/super-admin/task-center",
        component: "@/pages/super-admin/task-center/index.vue",
        icon: "",
        permission: "superAdmin:taskCenter:list",
        sort: 4,
        status: 1,
        visible: 1,
        children: [
          {
            id: 2028,
            parentId: 85,
            name: "menu.button.task.run",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:task:run",
            sort: 1,
            status: 1,
            visible: 0
          },
          {
            id: 2029,
            parentId: 85,
            name: "menu.button.task.danger",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:task:danger",
            sort: 2,
            status: 1,
            visible: 0
          }
        ]
      },
      // 字典中心（字典数据页由 dict-type 点击跳转，不单独挂菜单节点）
      {
        id: 61,
        parentId: 87,
        name: "menu.menu.superAdmin.dictCenter.title",
        type: "MENU",
        menu_group: "",
        path: "/super-admin/dict-center",
        component: "@/pages/super-admin/dict-center/dict-type/index.vue",
        icon: "",
        permission: "superAdmin:dictCenter:list",
        sort: 5,
        status: 1,
        visible: 1,
        children: [
          {
            id: 2014,
            parentId: 61,
            name: "menu.button.dict.update",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:dict:update",
            sort: 1,
            status: 1,
            visible: 0
          }
        ]
      },
      // 角色中心
      {
        id: 63,
        parentId: 87,
        name: "menu.menu.superAdmin.roleCenter",
        type: "MENU",
        menu_group: "",
        path: "/super-admin/role-center",
        component: "@/pages/super-admin/role-center/index.vue",
        icon: "",
        permission: "superAdmin:roleCenter:list",
        sort: 6,
        status: 1,
        visible: 1,
        children: [
          {
            id: 2005,
            parentId: 63,
            name: "menu.button.role.list",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:role:list",
            sort: 1,
            status: 1,
            visible: 0
          },
          {
            id: 2006,
            parentId: 63,
            name: "menu.button.role.create",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:role:create",
            sort: 2,
            status: 1,
            visible: 0
          },
          {
            id: 2007,
            parentId: 63,
            name: "menu.button.role.update",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:role:update",
            sort: 3,
            status: 1,
            visible: 0
          },
          {
            id: 2008,
            parentId: 63,
            name: "menu.button.role.delete",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:role:delete",
            sort: 4,
            status: 1,
            visible: 0
          }
        ]
      },
      // 菜单中心
      {
        id: 67,
        parentId: 87,
        name: "menu.menu.superAdmin.menuCenter",
        type: "MENU",
        menu_group: "",
        path: "/super-admin/menu-center",
        component: "@/pages/super-admin/menu-center/index.vue",
        icon: "",
        permission: "superAdmin:menuCenter:list",
        sort: 7,
        status: 1,
        visible: 1,
        children: [
          {
            id: 2010,
            parentId: 67,
            name: "menu.button.menu.list",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:menu:list",
            sort: 1,
            status: 1,
            visible: 0
          },
          {
            id: 2011,
            parentId: 67,
            name: "menu.button.menu.create",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:menu:create",
            sort: 2,
            status: 1,
            visible: 0
          },
          {
            id: 2012,
            parentId: 67,
            name: "menu.button.menu.update",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:menu:update",
            sort: 3,
            status: 1,
            visible: 0
          },
          {
            id: 2013,
            parentId: 67,
            name: "menu.button.menu.delete",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:menu:delete",
            sort: 4,
            status: 1,
            visible: 0
          },
          {
            id: 2030,
            parentId: 67,
            name: "menu.button.menu.restore",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:menu:restore",
            sort: 5,
            status: 1,
            visible: 0
          }
        ]
      },
      // 知识运维
      {
        id: 82,
        parentId: 87,
        name: "menu.menu.superAdmin.knowledgeCenter",
        type: "MENU",
        menu_group: "",
        path: "/super-admin/knowledge-center",
        component: "@/pages/super-admin/knowledge-center/index.vue",
        icon: "",
        permission: "superAdmin:knowledgeCenter:list",
        sort: 8,
        status: 1,
        visible: 1,
        children: [
          {
            id: 2021,
            parentId: 82,
            name: "menu.button.help.list",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:help:list",
            sort: 1,
            status: 1,
            visible: 0
          },
          {
            id: 2022,
            parentId: 82,
            name: "menu.button.help.reindex",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:help:reindex",
            sort: 2,
            status: 1,
            visible: 0
          },
          {
            id: 2023,
            parentId: 82,
            name: "menu.button.help.slotManage",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:help:slot:manage",
            sort: 3,
            status: 1,
            visible: 0
          },
          {
            id: 2024,
            parentId: 82,
            name: "menu.button.help.docCreate",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:help:doc:create",
            sort: 4,
            status: 1,
            visible: 0
          },
          {
            id: 2025,
            parentId: 82,
            name: "menu.button.help.docUpdate",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:help:doc:update",
            sort: 5,
            status: 1,
            visible: 0
          },
          {
            id: 2026,
            parentId: 82,
            name: "menu.button.help.docDelete",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:help:doc:delete",
            sort: 6,
            status: 1,
            visible: 0
          }
        ]
      },
      // 权限中心
      {
        id: 64,
        parentId: 87,
        name: "menu.menu.superAdmin.permissionCenter",
        type: "MENU",
        menu_group: "",
        path: "/super-admin/permission-center",
        component: "@/pages/super-admin/permission-center/index.vue",
        icon: "",
        permission: "superAdmin:permissionCenter:list",
        sort: 9,
        status: 1,
        visible: 1,
        children: [
          {
            id: 2009,
            parentId: 64,
            name: "menu.button.permission.assign",
            type: "BUTTON",
            menu_group: "",
            path: "",
            component: "",
            icon: "",
            permission: "superAdmin:role:assign",
            sort: 1,
            status: 1,
            visible: 0
          }
        ]
      }
    ]
  }
];
