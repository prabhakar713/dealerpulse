export function downloadCsv(
  filename: string,
  rows: Array<Record<string, string | number>>,
) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const esc = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const lines = [
    headers.map(esc).join(","),
    ...rows.map((row) => headers.map((key) => esc(row[key] ?? "")).join(",")),
  ];
  const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
