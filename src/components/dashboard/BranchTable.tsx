"use client";

import Link from "next/link";
import type { BranchSummary } from "@/lib/aggregations";
import { formatINR, formatPct } from "@/lib/format";
import { useSort } from "@/lib/sort";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { ExportCsv } from "../ui/ExportCsv";
import { SortHeader } from "../ui/SortHeader";

export function BranchTable({
  rows,
  query,
}: {
  rows: BranchSummary[];
  query: string;
}) {
  const { sorted, spec, toggle } = useSort(rows);
  const worst = rows[0];
  const soWhat = worst
    ? `${worst.name} is the problem: ${Math.round(worst.unitPct)}% of target, ${worst.lost} lost. ${worst.topLostReason ? `Biggest leak: ${worst.topLostReason}.` : ""}`
    : "No branch activity in this range.";

  return (
    <Card
      title="Where is it breaking?"
      soWhat={soWhat}
      action={
        <ExportCsv
          filename="dealerpulse-branches.csv"
          rows={sorted.map((row) => ({
            Branch: row.name,
            City: row.city,
            Units: row.units,
            Target: row.targetUnits,
            "Pace %": Math.round(row.unitPct),
            Delivered: row.delivered,
            Lost: row.lost,
            "Close %": Math.round(row.conversion),
            Open: row.active,
            Overdue: row.overdueOrders,
            Stalled: row.stalledMidFunnel,
            "Top lost reason": row.topLostReason ?? "",
            Revenue: row.deliveredRevenue,
          }))}
        />
      }
    >
      {rows.length === 0 ? (
        <EmptyState title="No branch data" detail="Widen the date range to see branch comparison." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] table-fixed text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-muted">
              <tr className="border-b border-line">
                <SortHeader
                  className="w-[22%]"
                  label="Branch"
                  active={spec?.key === "name"}
                  dir={spec?.dir ?? "asc"}
                  onClick={() => toggle("name", (r) => r.name, "asc")}
                />
                <SortHeader
                  className="w-[24%]"
                  label="Target pace"
                  active={spec?.key === "pace"}
                  dir={spec?.dir ?? "asc"}
                  onClick={() => toggle("pace", (r) => r.unitPct, "asc")}
                />
                <SortHeader
                  className="w-[14%]"
                  label="Conv."
                  active={spec?.key === "conv"}
                  dir={spec?.dir ?? "desc"}
                  onClick={() => toggle("conv", (r) => r.conversion)}
                />
                <SortHeader
                  className="w-[18%]"
                  label="Open"
                  active={spec?.key === "open"}
                  dir={spec?.dir ?? "desc"}
                  onClick={() => toggle("open", (r) => r.active)}
                />
                <th className="w-[22%] py-2 font-medium">Why they lose</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.id} className="border-b border-line/70 last:border-0">
                  <td className="py-3 pr-3">
                    <Link href={`/branch/${row.id}${query}`} className="font-medium text-ink hover:text-accent">
                      {row.name}
                    </Link>
                    <p className="text-[11px] text-muted">
                      {row.city}
                      {row.id === worst?.id && row.unitPct < 40 ? " · needs intervention" : ""}
                    </p>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 shrink-0 text-xs tabular-nums">{Math.round(row.unitPct)}%</span>
                      <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-soft">
                        <span
                          className={`block h-full ${row.unitPct < 30 ? "bg-bad" : row.unitPct < 60 ? "bg-warn" : "bg-good"}`}
                          style={{ width: `${Math.min(100, row.unitPct)}%` }}
                        />
                      </span>
                    </div>
                    <p className="text-[11px] text-muted">
                      {row.units}/{row.targetUnits} units
                    </p>
                  </td>
                  <td className="py-3 pr-3 tabular-nums">
                    {formatPct(row.conversion)}
                    <p className="text-[11px] text-muted">{row.delivered} delivered</p>
                  </td>
                  <td className="py-3 pr-3 text-xs text-muted">
                    {row.active} live
                    <p>
                      {row.overdueOrders} overdue · {row.stalledMidFunnel} stalled
                    </p>
                  </td>
                  <td className="py-3 text-xs text-muted">
                    <p className="truncate" title={row.topLostReason ?? undefined}>
                      {row.topLostReason ?? "—"}
                      {row.topLostCount ? ` (${row.topLostCount})` : ""}
                    </p>
                    <p>{formatINR(row.deliveredRevenue)} delivered</p>
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
