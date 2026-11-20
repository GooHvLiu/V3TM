/**
 * 字典管理 · 数据类型
 * 列表查询复用通用分页契约 PageParams / PageResult
 */

// 引入后端统一返回结构
import type { PageParams, PageResult } from "@/types";

/* 字典类型实体（admin 侧） */
export interface DictTypeInfo {
  id: number;
  typeCode: string;
  typeName: string;
  status: number;
  remark: string;
  dataCount: number;
  createdAt: string;
  updatedAt: string;
}

/* 字典项实体（admin 侧） */
export interface DictItemInfo {
  id: number;
  dictTypeId: number;
  label: string;
  value: string;
  sort: number;
  status: number;
  createdAt: string;
}

/** 字典类型查询参数：分页 + 关键字 + 状态过滤 */
export interface DictTypeQueryParams extends PageParams {
  keyword?: string;
  status?: number;
}

/** 字典项查询参数：分页 + 类型 + 关键字 + 状态过滤 */
export interface DictItemQueryParams extends PageParams {
  typeId: number;
  keyword?: string;
  status?: number;
}

/** 新增字典类型请求参数 */
export interface CreateDictTypeParams {
  typeCode: string;
  typeName: string;
  remark: string;
}

/** 更新字典类型请求参数 */
export interface UpdateDictTypeParams {
  typeName: string;
  remark: string;
  status: number;
}

/** 新增字典项请求参数 */
export interface CreateDictItemParams {
  dictTypeId: number;
  label: string;
  value: string;
  sort: number;
}

/** 更新字典项请求参数 */
export interface UpdateDictItemParams {
  label: string;
  value: string;
  sort: number;
  status: number;
}

/** 字典类型列表分页响应 */
export type DictTypeListResult = PageResult<DictTypeInfo>;

/** 字典项列表分页响应 */
export type DictItemListResult = PageResult<DictItemInfo>;

/** 公开侧字典项 */
export interface DictOptionItem {
  label: string;
  value: string;
}

/** 公开侧字典类型 */
export interface DictAllItem {
  typeCode: string;
  typeName: string;
  items: DictOptionItem[];
}
