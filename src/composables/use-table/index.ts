/**
 * 列表状态机 · 通用组合式
 * 职责：分页/加载/列表/选择 状态 + 查询联动
 * 约定：query 变化 → 自动重置 page=1 → 重新拉取（单一触发器，不手写联动）
 */
import { ref, watch, type Ref } from "vue";

/** 分页查询参数最小形态 */
export interface PageQuery {
  page: number;
  pageSize: number;
}

interface UseTableOptions<Q extends PageQuery, T> {
  /** 数据源注入：页面传 api 层函数，mock/后端切换只发生在 api 层 */
  fetcher: (params: Q) => Promise<{ list: T[]; total: number }>;
  /** 查询条件：变化即触发重置+拉取 */
  query?: () => Omit<Q, "page" | "pageSize">;
  /** 初始分页大小 */
  initialPageSize?: number;
}

export function useTable<Q extends PageQuery, T>(options: UseTableOptions<Q, T>) {
  const { fetcher, query, initialPageSize = 10 } = options;

  // —— 状态变量 ——
  const page = ref(1);
  const pageSize = ref(initialPageSize);
  const total = ref(0);
  const list = ref<T[]>([]) as Ref<T[]>;
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const selectedRows = ref<T[]>([]);

  /** 请求序号：只允许最后一次请求回写，避免快速切页时旧响应覆盖新数据 */
  let latestRequestId = 0;

  /** 组装完整查询参数（分页 + 条件） */
  const buildParams = (): Q => ({ ...(query?.() ?? {}), page: page.value, pageSize: pageSize.value }) as Q;

  /** 拉取数据：始终以当前 page/pageSize 为准 */
  const fetchData = async () => {
    const requestId = ++latestRequestId;
    loading.value = true;
    error.value = null;

    try {
      const result = await fetcher(buildParams());

      // 旧请求直接丢弃，不参与 loading / 数据 / 错误状态收尾
      if (requestId !== latestRequestId) return;

      // 删除末页最后一条后，页码可能已经越界，直接回到最后一个有效页
      const lastPage = Math.max(1, Math.ceil(result.total / pageSize.value));
      if (page.value > lastPage) {
        page.value = lastPage;
        total.value = result.total;
        await fetchData();
        return;
      }

      list.value = result.list;
      total.value = result.total;
    } catch (err) {
      if (requestId !== latestRequestId) return;
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      if (requestId === latestRequestId) loading.value = false;
    }
  };

  // —— 对外动作 ——
  /** 刷新：保持当前页（增删后回显） */
  const refresh = () => fetchData();

  /** 翻页 */
  const changePage = (p: number) => {
    page.value = p;
    fetchData();
  };

  /** 改每页条数：回到第 1 页 */
  const changePageSize = (size: number) => {
    pageSize.value = size;
    page.value = 1;
    fetchData();
  };

  /** 条件变化 → 重置到第 1 页再拉（搜索/筛选统一入口） */
  const search = () => {
    page.value = 1;
    fetchData();
  };

  const setSelected = (rows: T[]) => {
    selectedRows.value = rows;
  };

  const clearSelection = () => {
    selectedRows.value = [];
  };

  // 查询条件变化
  if (query) {
    watch(query, () => search());
  }

  return {
    page,
    pageSize,
    total,
    list,
    loading,
    error,
    selectedRows,
    fetchData,
    refresh,
    changePage,
    changePageSize,
    search,
    setSelected,
    clearSelection
  };
}
