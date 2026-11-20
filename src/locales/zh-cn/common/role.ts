/**
 * 内置角色 · 名称与说明
 * ------------------------------------------
 * 内置角色在种子数据里直接写入 role.<code>.name / .description 标识，
 * 管理员自建角色仍存普通字符串，展示前需判断是否命中本表。
 */
export default {
  superAdmin: {
    name: "超级管理员",
    description: "模板设计者使用，拥有全部权限"
  },
  admin: {
    name: "系统管理员",
    description: "维护系统参数、用户与业务数据"
  },
  operator: {
    name: "操作员",
    description: "处理日常业务数据，不具备系统配置权限"
  },
  viewer: {
    name: "只读用户",
    description: "仅可查看数据，不能执行写操作"
  }
};
