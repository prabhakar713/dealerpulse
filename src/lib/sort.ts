import { useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

export function useSort<T>(
  rows: T[],
  initial?: { key: string; dir: SortDir; get: (row: T) => string | number },
) {
  const [spec, setSpec] = useState(initial ?? null);

  const sorted = useMemo(() => {
    if (!spec) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = spec.get(a);
      const bv = spec.get(b);
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), "en", { numeric: true, sensitivity: "base" });
      return spec.dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, spec]);

  function toggle(key: string, get: (row: T) => string | number, firstDir: SortDir = "desc") {
    setSpec((prev) => {
      if (prev?.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc", get };
      }
      return { key, dir: firstDir, get };
    });
  }

  return { sorted, spec, toggle };
}
