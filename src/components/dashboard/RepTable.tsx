import Link from "next/link";
import type { RepSummary } from "@/lib/aggregations";
import { formatDays, formatINR, formatPct, initials } from "@/lib/format";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";

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
  const worst = [...officers].sort((a, b) => a.conversion - b.conversion)[0];
  const soWhat = worst
    ? `${worst.name} is weakest at ${Math.round(worst.conversion)}% vs ${Math.round(companyConv)}% company conversion. Managers have no personal book — skip them.`
    : "No sales officers in this view.";

  return (
    <Card title="Rep scoreboard" soWhat={soWhat}>
      {officers.length === 0 ? (
        <EmptyState
          title="No assigned leads in this range"
          detail="Branch managers are not given a personal book. Widen the period or pick another branch."
        />
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Rep</th>
                <th className="py-2 font-medium">Delivered</th>
                <th className="py-2 font-medium">Conv.</th>
                <th className="py-2 font-medium">1st contact</th>
                <th className="py-2 font-medium">Needs action</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((row) => (
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
                    {formatPct(row.conversion)}
                    <p className="text-[11px] text-muted">{row.leads} leads</p>
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
