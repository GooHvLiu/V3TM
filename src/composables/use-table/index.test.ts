import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useTable, type PageQuery } from "./index";

const nextMacrotask = () => new Promise((resolve) => setTimeout(resolve, 0));

interface Row {
  id: number;
  name: string;
}

describe("useTable", () => {
  const createTable = (total = 30) => {
    const query = ref({ keyword: "" });
    const fetcher = vi.fn(async (params: PageQuery & { keyword: string }) => ({
      list: [{ id: params.page, name: params.keyword }],
      total
    }));

    const table = useTable<PageQuery & { keyword: string }, Row>({
      fetcher,
      query: () => ({ keyword: query.value.keyword }),
      initialPageSize: 10
    });

    return { query, fetcher, table };
  };

  it("首次拉取按默认分页组装参数", async () => {
    const { table, fetcher } = createTable();

    await table.fetchData();

    expect(fetcher).toHaveBeenCalledWith({ keyword: "", page: 1, pageSize: 10 });
    expect(table.list.value).toEqual([{ id: 1, name: "" }]);
    expect(table.total.value).toBe(30);
    expect(table.loading.value).toBe(false);
  });

  it("翻页与改每页条数会重新拉取", async () => {
    const { table, fetcher } = createTable();

    table.changePage(2);
    await nextMacrotask();
    expect(fetcher).toHaveBeenLastCalledWith({ keyword: "", page: 2, pageSize: 10 });

    table.changePageSize(20);
    await nextMacrotask();
    expect(fetcher).toHaveBeenLastCalledWith({ keyword: "", page: 1, pageSize: 20 });
  });

  it("查询条件变化自动回到第一页", async () => {
    const { table, query, fetcher } = createTable();

    table.changePage(3);
    await nextMacrotask();

    query.value.keyword = "订单";
    await nextTick();
    await nextMacrotask();

    expect(fetcher).toHaveBeenLastCalledWith({ keyword: "订单", page: 1, pageSize: 10 });
    expect(table.page.value).toBe(1);
  });

  it("快速切页时只接受最后一次响应", async () => {
    let resolveFirst!: (value: { list: Row[]; total: number }) => void;
    const fetcher = vi.fn((params: PageQuery & { keyword: string }) => {
      if (params.page === 1) {
        return new Promise<{ list: Row[]; total: number }>((resolve) => {
          resolveFirst = resolve;
        });
      }
      return Promise.resolve({ list: [{ id: 2, name: "page-2" }], total: 30 });
    });

    const table = useTable<PageQuery & { keyword: string }, Row>({
      fetcher,
      query: () => ({ keyword: "" })
    });

    const first = table.fetchData();
    table.changePage(2);
    await nextMacrotask();

    expect(table.list.value).toEqual([{ id: 2, name: "page-2" }]);
    expect(table.loading.value).toBe(false);

    resolveFirst({ list: [{ id: 1, name: "page-1" }], total: 30 });
    await first;

    expect(table.list.value).toEqual([{ id: 2, name: "page-2" }]);
  });

  it("删除末页最后一条后自动回退到有效页", async () => {
    const fetcher = vi.fn(async (params: PageQuery) => {
      if (params.page === 2) {
        return { list: [], total: 10 };
      }
      return { list: [{ id: 1, name: "row" }], total: 10 };
    });

    const table = useTable<PageQuery, Row>({ fetcher });

    table.changePage(2);
    await nextMacrotask();
    await nextMacrotask();

    expect(table.page.value).toBe(1);
    expect(table.list.value).toHaveLength(1);
    expect(fetcher).toHaveBeenLastCalledWith({ page: 1, pageSize: 10 });
  });

  it("拉取失败时记录错误并复位 loading", async () => {
    const fetcher = vi.fn(async () => {
      throw new Error("network");
    });
    const table = useTable<PageQuery, Row>({ fetcher });

    await table.fetchData();

    expect(table.error.value?.message).toBe("network");
    expect(table.loading.value).toBe(false);
  });
});
