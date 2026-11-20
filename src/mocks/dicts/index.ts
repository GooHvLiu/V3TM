/**
 * 字典管理 · Mock 数据
 * 与后端 /api/v1/dict 契约严格一致：类型/数据两级，公开 all + admin CRUD
 * 注：正式工作时接口类型迁移至 src/types/dicts
 */

import type { DictTypeInfo, DictItemInfo, DictAllItem, DictTypeListResult, DictItemListResult } from "@/types";
import { parseBody } from "../utils";

/** 字典类型 mock 数据集（内存态：增删改会变更） */
const dictTypes: DictTypeInfo[] = [
  {
    id: 1,
    typeCode: "system_status",
    typeName: "通用状态",
    status: 1,
    remark: "启停状态字典，业务通用",
    dataCount: 2,
    createdAt: "2026-11-01T02:00:00.000Z",
    updatedAt: "2026-11-01T02:00:00.000Z"
  },
  {
    id: 2,
    typeCode: "notification_type",
    typeName: "通知类型",
    status: 1,
    remark: "通知中心消息分类",
    dataCount: 3,
    createdAt: "2026-11-01T02:00:00.000Z",
    updatedAt: "2026-11-01T02:00:00.000Z"
  },
  {
    id: 3,
    typeCode: "log_level",
    typeName: "日志级别",
    status: 1,
    remark: "日志中心级别筛选",
    dataCount: 4,
    createdAt: "2026-11-01T02:00:00.000Z",
    updatedAt: "2026-11-01T02:00:00.000Z"
  }
];

/** 字典项 mock 数据集 */
const dictItems: DictItemInfo[] = [
  { id: 1, dictTypeId: 1, label: "启用", value: "1", sort: 1, status: 1, createdAt: "2026-11-01T02:00:00.000Z" },
  { id: 2, dictTypeId: 1, label: "停用", value: "0", sort: 2, status: 1, createdAt: "2026-11-01T02:00:00.000Z" },
  {
    id: 3,
    dictTypeId: 2,
    label: "系统公告",
    value: "system",
    sort: 1,
    status: 1,
    createdAt: "2026-11-01T02:00:00.000Z"
  },
  {
    id: 4,
    dictTypeId: 2,
    label: "告警提醒",
    value: "alert",
    sort: 2,
    status: 1,
    createdAt: "2026-11-01T02:00:00.000Z"
  },
  {
    id: 5,
    dictTypeId: 2,
    label: "版本更新",
    value: "update",
    sort: 3,
    status: 1,
    createdAt: "2026-11-01T02:00:00.000Z"
  },
  { id: 6, dictTypeId: 3, label: "调试", value: "debug", sort: 1, status: 1, createdAt: "2026-11-01T02:00:00.000Z" },
  { id: 7, dictTypeId: 3, label: "信息", value: "info", sort: 2, status: 1, createdAt: "2026-11-01T02:00:00.000Z" },
  { id: 8, dictTypeId: 3, label: "警告", value: "warn", sort: 3, status: 1, createdAt: "2026-11-01T02:00:00.000Z" },
  { id: 9, dictTypeId: 3, label: "错误", value: "error", sort: 4, status: 1, createdAt: "2026-11-01T02:00:00.000Z" }
];

/** GET /v1/dict/all：公开侧，仅启用项，items 按 sort 升序 */
export const mockDictAll = (): DictAllItem[] =>
  dictTypes
    .filter((t) => t.status === 1)
    .map((t) => ({
      typeCode: t.typeCode,
      typeName: t.typeName,
      items: dictItems
        .filter((i) => i.dictTypeId === t.id && i.status === 1)
        .sort((a, b) => a.sort - b.sort)
        .map((i) => ({ label: i.label, value: i.value }))
    }));

/** POST /v1/dict/type：新增字典类型（typeCode 创建后不可改） */
export const mockDictTypeCreate = (config: { data?: unknown }): DictTypeInfo => {
  // 从请求体取前端表单提交的值（与 mockUserCreate 同形态）
  const body = parseBody<{ typeCode: string; typeName: string; remark: string }>(config);
  const now = new Date().toISOString();
  const newType: DictTypeInfo = {
    id: dictTypes.length + 1,
    typeCode: body.typeCode,
    typeName: body.typeName,
    status: 1,
    remark: body.remark,
    dataCount: 0,
    createdAt: now,
    updatedAt: now
  };
  dictTypes.push(newType);
  return newType;
};

/** PUT /v1/dict/type/{id}：更新类型（typeCode 不可改） */
export const mockDictTypeUpdate = (config: { params?: { id?: string }; data?: unknown }): string => {
  const id = Number((config.params as { id?: string })?.id);
  const body = parseBody<{ typeName: string; remark: string; status: number }>(config);
  const target = dictTypes.find((t) => t.id === id);
  if (!target) return "DICT_TYPE_NOT_FOUND";
  target.typeName = body.typeName;
  target.remark = body.remark;
  target.status = body.status;
  target.updatedAt = new Date().toISOString();
  return "SUCCESS";
};

/** DELETE /v1/dict/type/{id}：删除类型（级联删字典项） */
export const mockDictTypeDelete = (config: { params?: { id?: string } }): string => {
  const id = Number((config.params as { id?: string })?.id);
  const index = dictTypes.findIndex((t) => t.id === id);
  if (index === -1) return "DICT_TYPE_NOT_FOUND";
  dictTypes.splice(index, 1);
  for (let i = dictItems.length - 1; i >= 0; i--) {
    if (dictItems[i].dictTypeId === id) dictItems.splice(i, 1);
  }
  return "SUCCESS";
};

/** GET /v1/dict/type/{typeCode}：按类型编码查启用项（公开，前端下拉框用） */
export const mockDictItemsByCode = (config: { params?: { typeCode?: string } }): { label: string; value: string }[] => {
  // 路径参数：/v1/dict/type/{typeCode}，typeCode 落在 config.params.typeCode
  const typeCode = (config.params as { typeCode?: string })?.typeCode ?? "";
  const type = dictTypes.find((t) => t.typeCode === typeCode && t.status === 1);
  if (!type) return [];
  return dictItems
    .filter((i) => i.dictTypeId === type.id && i.status === 1)
    .sort((a, b) => a.sort - b.sort)
    .map((i) => ({ label: i.label, value: i.value }));
};

/** POST /v1/dict/data：新增字典项 */
export const mockDictDataCreate = (config: { data?: unknown }): DictItemInfo => {
  const body = parseBody<{ dictTypeId: number; label: string; value: string; sort: number }>(config);
  const newItem: DictItemInfo = {
    id: dictItems.length + 1,
    dictTypeId: body.dictTypeId,
    label: body.label,
    value: body.value,
    sort: body.sort,
    status: 1,
    createdAt: new Date().toISOString()
  };
  dictItems.push(newItem);
  return newItem;
};

/** PUT /v1/dict/data/{id}：更新字典项（契约疑点见下） */
export const mockDictDataUpdate = (config: { params?: { id?: string }; data?: unknown }): string => {
  const id = Number((config.params as { id?: string })?.id);
  const body = parseBody<{ label: string; value: string; sort: number; status: number }>(config);
  const target = dictItems.find((i) => i.id === id);
  if (!target) return "DICT_DATA_NOT_FOUND";
  target.label = body.label;
  target.value = body.value;
  target.sort = body.sort;
  target.status = body.status;
  return "SUCCESS";
};

/** DELETE /v1/dict/data/{id}：删除字典项 */
export const mockDictDataDelete = (config: { params?: { id?: string } }): string => {
  const id = Number((config.params as { id?: string })?.id);
  const index = dictItems.findIndex((i) => i.id === id);
  if (index === -1) return "DICT_DATA_NOT_FOUND";
  dictItems.splice(index, 1);
  return "SUCCESS";
};

/** GET /v1/dict/admin/types：管理端类型分页列表（keyword 命中 typeCode/typeName，status 过滤，含停用） */
export const mockDictAdminTypes = (config: { params?: Record<string, unknown> }): DictTypeListResult => {
  const params = (config.params ?? {}) as {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: number | string;
  };

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, params.pageSize ?? 10);
  let filtered = dictTypes;
  if (params.keyword) {
    const kw = params.keyword;
    filtered = filtered.filter((t) => t.typeCode.includes(kw) || t.typeName.includes(kw));
  }
  if (params.status !== undefined && params.status !== null && params.status !== "") {
    filtered = filtered.filter((t) => t.status === Number(params.status));
  }
  const start = (page - 1) * pageSize;
  return {
    list: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize
  };
};

/** GET /v1/dict/admin/data：管理端字典项分页列表（typeId 必传，keyword 命中 label/value） */
export const mockDictAdminData = (config: { params?: Record<string, unknown> }): DictItemListResult => {
  const params = (config.params ?? {}) as {
    typeId?: number;
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: number | string;
  };
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.max(1, params.pageSize ?? 10);
  let filtered = dictItems.filter((i) => i.dictTypeId === Number(params.typeId));
  if (params.keyword) {
    const kw = params.keyword;
    filtered = filtered.filter((i) => i.label.includes(kw) || i.value.includes(kw));
  }
  if (params.status !== undefined && params.status !== null && params.status !== "") {
    filtered = filtered.filter((i) => i.status === Number(params.status));
  }
  const start = (page - 1) * pageSize;
  return {
    list: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize
  };
};
