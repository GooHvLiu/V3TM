import { http } from "@/utils/request";
import type { RequestConfig } from "@/utils/request";
import type {
  DictTypeInfo,
  DictItemInfo,
  DictTypeQueryParams,
  DictItemQueryParams,
  DictTypeListResult,
  DictItemListResult,
  CreateDictTypeParams,
  UpdateDictTypeParams,
  CreateDictItemParams,
  UpdateDictItemParams,
  DictAllItem,
  DictOptionItem
} from "@/types";

enum API {
  DICT_TYPE_LIST = "/v1/dict/admin/types",
  DICT_DATA_LIST = "/v1/dict/admin/data",
  DICT_TYPE_CREATE = "/v1/dict/type",
  DICT_TYPE_UPDATE = "/v1/dict/type/",
  DICT_TYPE_DELETE = "/v1/dict/type/",
  DICT_DATA_CREATE = "/v1/dict/data",
  DICT_DATA_UPDATE = "/v1/dict/data/",
  DICT_DATA_DELETE = "/v1/dict/data/",
  DICT_ALL = "/v1/dict/all",
  DICT_ITEMS_BY_CODE = "/v1/dict/type/"
}

/** 获取字典类型分页列表（管理端） */
export function fetchDictTypeList(params: DictTypeQueryParams): Promise<DictTypeListResult> {
  return http.get<DictTypeListResult>(API.DICT_TYPE_LIST, { params });
}

/** 获取字典项分页列表（管理端） */
export function fetchDictItemList(params: DictItemQueryParams): Promise<DictItemListResult> {
  return http.get<DictItemListResult>(API.DICT_DATA_LIST, { params });
}

/** 新增字典类型 */
export function createDictType(data: CreateDictTypeParams, config?: RequestConfig): Promise<DictTypeInfo> {
  return http.post<DictTypeInfo>(API.DICT_TYPE_CREATE, data, config);
}

/** 更新字典类型 */
export function updateDictType(id: number, data: UpdateDictTypeParams, config?: RequestConfig): Promise<string> {
  return http.put<string>(`${API.DICT_TYPE_UPDATE}${id}`, data, config);
}

/** 删除字典类型（级联删字典项） */
export function deleteDictType(id: number): Promise<string> {
  return http.delete<string>(`${API.DICT_TYPE_DELETE}${id}`);
}

/** 新增字典项 */
export function createDictItem(data: CreateDictItemParams, config?: RequestConfig): Promise<DictItemInfo> {
  return http.post<DictItemInfo>(API.DICT_DATA_CREATE, data, config);
}

/** 更新字典项 */
export function updateDictItem(id: number, data: UpdateDictItemParams, config?: RequestConfig): Promise<string> {
  return http.put<string>(`${API.DICT_DATA_UPDATE}${id}`, data, config);
}

/** 删除字典项 */
export function deleteDictItem(id: number): Promise<string> {
  return http.delete<string>(`${API.DICT_DATA_DELETE}${id}`);
}

/** 获取全部字典（公开，前端启动拉取） */
export function fetchDictAll(): Promise<DictAllItem[]> {
  return http.get<DictAllItem[]>(API.DICT_ALL);
}

/** 按类型编码查字典项（公开，下拉框用） */
export function fetchDictItemsByCode(typeCode: string): Promise<DictOptionItem[]> {
  return http.get<DictOptionItem[]>(`${API.DICT_ITEMS_BY_CODE}${typeCode}`);
}
