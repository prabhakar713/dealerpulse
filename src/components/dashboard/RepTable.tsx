"use client";

import Link from "next/link";
import type { RepSummary } from "@/lib/aggregations";
import { formatDays, formatINR, formatPct, initials } from "@/lib/format";
import { useSort } from "@/lib/sort";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { ExportCsv } from "../ui/ExportCsv";
import { SortHeader } from "../ui/SortHeader";

export function RepTable({
  rows,
  query,
  companyConv,
}: {
  rows: RepSummary[];
  query: string;
  companyConv: number;
}) {
  const officers = rows.filter((r) => r.role === "sales_officer");
  const { sorted, spec, toggle } = useSort(officers);
  const worst = [...officers].sort((a, b) => a.conversion - b.conversion)[0];
  const soWhat = worst
    ? `${worst.name} is weakest at ${Math.round(worst.conversion)}% vs ${Math.round(companyConv)}% company conversion. Managers have no personal book — skip them.`
    : "No sales officers in this view.";

  return (
    <Card
      title="Rep scoreboard"
      soWhat={soWhat}
      action={
        <ExportCsv
          filename="dealerpulse-reps.csv"
          rows={sorted.map((row) => ({
            Rep: row.name,
            Branch: row.branchName,
            Delivered: row.delivered,
            Lost: row.lost,
            "Close %": Math.round(row.conversion),
            Revenue: row.deliveredRevenue,
            "First contact days": row.avgFirstContact ? Number(row.avgFirstContact.toFixed(2)) : "",
            Stalled: row.stalled,
            Open: row.active,
          }))}
        />
      }
    >
      {officers.length === 0 ? (
        <EmptyState
          title="No assigned leads in this range"
          detail="Branch managers are not given a personal book. Widen the period or pick another branch."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] table-fixed text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-muted">
              <tr className="border-b border-line">
                <SortHeader
                  label="Rep"
                  active={spec?.key === "name"}
                  dir={spec?.dir ?? "asc"}
                  onClick={() => toggle("name", (r) => r.name, "asc")}
                />
                <SortHeader
                  label="Delivered"
                  active={spec?.key === "delivered"}
                  dir={spec?.dir ?? "desc"}
                  onClick={() => toggle("delivered", (r) => r.delivered)}
                />
                <SortHeader
                  label="Conv."
                  active={spec?.key === "conv"}
                  dir={spec?.dir ?? "asc"}
                  onClick={() => toggle("conv", (r) => r.conversion, "asc")}
                />
                <SortHeader
                  label="1st contact"
                  active={spec?.key === "fc"}
                  dir={spec?.dir ?? "asc"}
                  onClick={() => toggle("fc", (r) => r.avgFirstContact ?? 99, "asc")}
                />
                <SortHeader
                  label="Needs action"
                  active={spec?.key === "stalled"}
                  dir={spec?.dir ?? "desc"}
                  onClick={() => toggle("stalled", (r) => r.stalled)}
                />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.id} className="border-b border-line/70 last:border-0">
                  <td className="py-3 pr-3">
                    <Link href={`/rep/${row.id}${query}`} className="flex items-center gap-2 hover:text-accent">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-soft text-[10px] font-semibold">
                        {initials(row.name)}
                      </span>
                      <span>
                        <span className="block font-medium text-ink">{row.name}</span>
                        <span className="block text-[11px] text-muted">{row.branchName}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 pr-3 tabular-nums">
                    {row.delivered}
                    <p className="text-[11px] text-muted">{formatINR(row.deliveredRevenue)}</p>
                  </td>
                  <td className={`py-3 pr-3 tabular-nums ${row.conversion < companyConv / 2 ? "text-bad" : ""}`}>
                    {row.delivered + row.lost ? formatPct(row.conversion) : "—"}
                    <p className="text-[11px] text-muted">
                      {row.delivered} won · {row.lost} lost
                    </p>
                  </td>
                  <td className="py-3 pr-3 text-xs text-muted">
                    {row.avgFirstContact ? formatDays(row.avgFirstContact) : "—"}
                  </td>
                  <td className="py-3 text-xs text-muted">
                    {row.stalled} stalled · {row.active} open
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
