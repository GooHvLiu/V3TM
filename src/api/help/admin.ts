/**
 * 知识库管理 API
 */
import { http } from "@/utils/request";
import type {
  AdminAssetResult,
  AdminDocClearResult,
  AdminDocContentResult,
  AdminDocDetail,
  AdminDocSaveResult,
  AdminFileOptionsResult,
  AdminIndexStatusResult,
  AdminLocaleDeleteResult,
  AdminLocaleInitResult,
  AdminLocaleListResult,
  AdminLocaleUpdateBody,
  AdminLocaleUpdateResult,
  AdminReindexResult,
  AdminSlotCreateBody,
  AdminSlotDeleteResult,
  AdminSlotListResult,
  AdminSlotUpdateBody,
  HelpFileType
} from "@/types/help/admin";

enum API {
  LOCALES = "/v1/help/admin/locales",
  SLOTS = "/v1/help/admin/slots",
  FILE_OPTIONS = "/v1/help/admin/slots/file-options",
  ASSETS = "/v1/help/admin/assets",
  REINDEX = "/v1/help/admin/reindex",
  INDEX_STATUS = "/v1/help/admin/index/status"
}

/** 语言列表；manifest 非法或缺失也返回列表项，不报错 */
export function fetchLocales(): Promise<AdminLocaleListResult> {
  return http.get<AdminLocaleListResult>(API.LOCALES);
}

/** 初始化语言目录与空 manifest；已存在时不覆盖，created=false */
export function initLocale(locale: string, title?: string): Promise<AdminLocaleInitResult> {
  return http.post<AdminLocaleInitResult>(`${API.LOCALES}/${locale}/init`, title ? { title } : {});
}

/** 语言改名 / 改展示名；只传 title 时目录与索引都不动 */
export function updateLocale(locale: string, body: AdminLocaleUpdateBody): Promise<AdminLocaleUpdateResult> {
  return http.patch<AdminLocaleUpdateResult>(`${API.LOCALES}/${locale}`, body);
}

/** 物理删除语言目录与索引；不备份、不落回收站 */
export function removeLocale(locale: string): Promise<AdminLocaleDeleteResult> {
  return http.delete<AdminLocaleDeleteResult>(`${API.LOCALES}/${locale}`, {
    params: { confirm: locale }
  });
}

/** 文档位树、孤儿文件、统计与索引概况 */
export function fetchSlots(locale: string): Promise<AdminSlotListResult> {
  return http.get<AdminSlotListResult>(API.SLOTS, { params: { locale } });
}

/** 文件名候选：仅列该语言目录下已存在的 md / pdf */
export function fetchFileOptions(query: {
  locale: string;
  keyword?: string;
  contentType?: HelpFileType;
  page?: number;
  pageSize?: number;
}): Promise<AdminFileOptionsResult> {
  return http.get<AdminFileOptionsResult>(API.FILE_OPTIONS, { params: query });
}

/** 新建文档位：版块、章节随文档一并落地，只写 manifest 不建文件 */
export function createSlot(body: AdminSlotCreateBody): Promise<AdminDocDetail> {
  return http.post<AdminDocDetail>(API.SLOTS, body);
}

/** 修改文档位展示信息 */
export function updateSlot(locale: string, docKey: string, body: AdminSlotUpdateBody): Promise<AdminDocDetail> {
  return http.put<AdminDocDetail>(`${API.SLOTS}/${docKey}`, body, { params: { locale } });
}

/** 删除文档位；confirm 必须与 docKey 一致 */
export function removeSlot(locale: string, docKey: string): Promise<AdminSlotDeleteResult> {
  return http.delete<AdminSlotDeleteResult>(`${API.SLOTS}/${docKey}`, {
    params: { locale, confirm: docKey }
  });
}

/** 文档详情 */
export function fetchSlotDetail(locale: string, docKey: string): Promise<AdminDocDetail> {
  return http.get<AdminDocDetail>(`${API.SLOTS}/${docKey}`, { params: { locale } });
}

/** 文档正文与并发基线 */
export function fetchDocContent(locale: string, docKey: string): Promise<AdminDocContentResult> {
  return http.get<AdminDocContentResult>(`${API.SLOTS}/${docKey}/content`, { params: { locale } });
}

/** 文档原始文件；pdf 预览与 frontmatter 还原都用它 */
export function fetchDocFile(locale: string, docKey: string): Promise<Blob> {
  return http.getBlob(`${API.SLOTS}/${docKey}/file`, { params: { locale } });
}

/** 上传正文；空位首传需 help:doc:create，其余需 help:doc:update */
export function saveDocContent(
  locale: string,
  docKey: string,
  file: File,
  baseHash?: string
): Promise<AdminDocSaveResult> {
  const form = new FormData();
  form.append("file", file);
  if (baseHash) form.append("baseHash", baseHash);
  return http.putForm<AdminDocSaveResult>(`${API.SLOTS}/${docKey}/content`, form, { params: { locale } });
}

/** 清空正文；保留文档位，状态转为 empty */
export function clearDocContent(locale: string, docKey: string): Promise<AdminDocClearResult> {
  return http.delete<AdminDocClearResult>(`${API.SLOTS}/${docKey}/content`, {
    params: { locale, confirm: docKey }
  });
}

/** 上传正文内引用的图片，返回可直接写进 markdown 的地址 */
export function uploadAsset(file: File): Promise<AdminAssetResult> {
  const form = new FormData();
  form.append("file", file);
  return http.postForm<AdminAssetResult>(API.ASSETS, form);
}

/** 全量重建索引；并发重建返回 30015 */
export function reindex(): Promise<AdminReindexResult> {
  return http.post<AdminReindexResult>(API.REINDEX);
}

/** 索引状态；不传 locale 统计全部语言 */
export function fetchIndexStatus(locale?: string): Promise<AdminIndexStatusResult> {
  return http.get<AdminIndexStatusResult>(API.INDEX_STATUS, { params: locale ? { locale } : {} });
}
