import { beforeEach, describe, expect, it } from "vitest";
import { useTablePreferences } from "./index";
import type { ProTableColumn } from "@/components/common/table/pro-table/types";

const columns: ProTableColumn[] = [
  { prop: "id", label: "ID" },
  { prop: "username", label: "账号" },
  { prop: "status", label: "状态" }
];

const KEY = "test/list";

describe("useTablePreferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("没有存储记录时全部列可见，密度为默认", () => {
    const { columnVisibility, density } = useTablePreferences(KEY, () => columns);

    expect(columnVisibility.value).toEqual({ id: true, username: true, status: true });
    expect(density.value).toBe("default");
  });

  it("按存储恢复列显隐，存储里缺的列默认可见", () => {
    localStorage.setItem("v3:table:" + KEY, JSON.stringify({ density: "compact", columnVisibility: { username: false } }));

    const { columnVisibility, density } = useTablePreferences(KEY, () => columns);

    expect(columnVisibility.value).toEqual({ id: true, username: false, status: true });
    expect(density.value).toBe("compact");
  });

  it("修改列显隐后写回存储", () => {
    const { setColumnVisibility } = useTablePreferences(KEY, () => columns);

    setColumnVisibility({ id: true, username: false, status: true });

    const raw = localStorage.getItem("v3:table:" + KEY);
    expect(JSON.parse(raw!)).toEqual({ density: "default", columnVisibility: { id: true, username: false, status: true } });
  });

  it("修改密度后写回存储，非法取值回落默认", () => {
    const { density, setDensity } = useTablePreferences(KEY, () => columns);

    setDensity("compact");
    expect(density.value).toBe("compact");

    setDensity("loose" as "default");
    expect(density.value).toBe("default");

    const raw = localStorage.getItem("v3:table:" + KEY);
    expect(JSON.parse(raw!).density).toBe("default");
  });

  it("存储内容损坏时按没有记录处理", () => {
    localStorage.setItem("v3:table:" + KEY, "{oops");

    const { columnVisibility, density } = useTablePreferences(KEY, () => columns);

    expect(density.value).toBe("default");
    expect(columnVisibility.value).toEqual({ id: true, username: true, status: true });
  });

  it("同一张表按分类换列定义时，别的分类的隐藏项不被覆盖", () => {
    const loginColumns: ProTableColumn[] = [
      { prop: "id", label: "ID" },
      { prop: "username", label: "账号" },
      { prop: "ip", label: "IP" }
    ];
    const mailColumns: ProTableColumn[] = [
      { prop: "id", label: "ID" },
      { prop: "username", label: "账号" },
      { prop: "subject", label: "主题" }
    ];

    const login = useTablePreferences(KEY, () => loginColumns);
    login.setColumnVisibility({ id: true, username: true, ip: false });

    const mail = useTablePreferences(KEY, () => mailColumns);
    mail.setColumnVisibility({ id: true, username: false, subject: true });

    const raw = JSON.parse(localStorage.getItem("v3:table:" + KEY)!);
    expect(raw.columnVisibility).toEqual({ id: true, username: false, ip: false, subject: true });

    // 切回登录分类：本分类之外的项留在存储里，本分类的列照自己那份还原
    const loginAgain = useTablePreferences(KEY, () => loginColumns);
    expect(loginAgain.columnVisibility.value).toEqual({ id: true, username: false, ip: false });
  });
});
