import Link from "next/link";
import type { BranchSummary } from "@/lib/aggregations";
import { formatINR, formatPct } from "@/lib/format";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";

export function BranchTable({
  rows,
  query,
}: {
  rows: BranchSummary[];
  query: string;
}) {
  const worst = rows[0];
  const soWhat = worst
    ? `${worst.name} is the problem: ${Math.round(worst.unitPct)}% of target, ${worst.lost} lost. ${worst.topLostReason ? `Biggest leak: ${worst.topLostReason}.` : ""}`
    : "No branch activity in this range.";

  return (
    <Card title="Where is it breaking?" soWhat={soWhat}>
      {rows.length === 0 ? (
        <EmptyState title="No branch data" detail="Widen the date range to see branch comparison." />
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Branch</th>
                <th className="py-2 font-medium">Target pace</th>
                <th className="py-2 font-medium">Conv.</th>
                <th className="py-2 font-medium">Open</th>
                <th className="py-2 font-medium">Why they lose</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className="border-b border-line/70 last:border-0">
                  <td className="py-3 pr-3">
                    <Link href={`/branch/${row.id}${query}`} className="font-medium text-ink hover:text-accent">
                      {row.name}
                    </Link>
                    <p className="text-[11px] text-muted">
                      {row.city}
                      {i === 0 && row.unitPct < 40 ? " · needs intervention" : ""}
                    </p>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-xs tabular-nums">{Math.round(row.unitPct)}%</span>
                      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-soft">
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
                    {row.topLostReason ?? "—"}
                    {row.topLostCount ? ` (${row.topLostCount})` : ""}
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
