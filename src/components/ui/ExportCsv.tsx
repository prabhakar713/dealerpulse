"use client";

import { downloadCsv } from "@/lib/csv";

export function ExportCsv({
  filename,
  rows,
}: {
  filename: string;
  rows: Array<Record<string, string | number>>;
}) {
  return (
    <button
      type="button"
      onClick={() => downloadCsv(filename, rows)}
      disabled={rows.length === 0}
      className="shrink-0 rounded-lg border border-line px-2 py-1 text-[11px] text-muted hover:border-accent/40 hover:text-ink disabled:opacity-40 print:hidden"
    >
      CSV
    </button>
  );
}
