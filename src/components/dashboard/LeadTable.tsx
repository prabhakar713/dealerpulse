"use client";

import { idleDays, isOverdueOrder, leadDelivery } from "@/lib/aggregations";
import { formatDate, formatDays, formatINR } from "@/lib/format";
import { useSort } from "@/lib/sort";
import type { Lead } from "@/lib/types";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { ExportCsv } from "../ui/ExportCsv";
import { SortHeader } from "../ui/SortHeader";
import { StatusPill } from "../ui/StatusPill";

export function LeadTable({
  leads,
  title = "Leads in this period",
}: {
  leads: Lead[];
  title?: string;
}) {
  const { sorted, spec, toggle } = useSort(leads, {
    key: "idle",
    dir: "desc",
    get: (lead) => idleDays(lead),
  });

  return (
    <Card
      title={title}
      soWhat={
        leads.length
          ? spec?.key === "idle"
            ? "Sorted by days since last activity — the top of this list is who to call first."
            : "Click a column to change the sort. CSV is the visible list."
          : "Nothing matched this filter."
      }
      action={
        <ExportCsv
          filename="dealerpulse-leads.csv"
          rows={sorted.map((lead) => ({
            Id: lead.id,
            Customer: lead.customer_name,
            Phone: lead.phone,
            Status: lead.status,
            Source: lead.source,
            Model: lead.model_interested,
            Value: lead.deal_value,
            Created: lead.created_at,
            "Last activity": lead.last_activity_at,
            "Idle days": idleDays(lead),
            "Lost reason": lead.lost_reason ?? "",
          }))}
        />
      }
    >
      {leads.length === 0 ? (
        <EmptyState
          title="No leads in this range"
          detail="This is intentional, not a broken page. Widen the period or check another rep."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] table-fixed text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-muted">
              <tr className="border-b border-line">
                <SortHeader
                  label="Customer"
                  active={spec?.key === "name"}
                  dir={spec?.dir ?? "asc"}
                  onClick={() => toggle("name", (l) => l.customer_name, "asc")}
                />
                <SortHeader
                  label="Status"
                  active={spec?.key === "status"}
                  dir={spec?.dir ?? "asc"}
                  onClick={() => toggle("status", (l) => l.status, "asc")}
                />
                <SortHeader
                  label="Model"
                  active={spec?.key === "model"}
                  dir={spec?.dir ?? "asc"}
                  onClick={() => toggle("model", (l) => l.model_interested, "asc")}
                />
                <SortHeader
                  label="Value"
                  active={spec?.key === "value"}
                  dir={spec?.dir ?? "desc"}
                  onClick={() => toggle("value", (l) => l.deal_value)}
                />
                <SortHeader
                  label="Idle"
                  active={spec?.key === "idle"}
                  dir={spec?.dir ?? "desc"}
                  onClick={() => toggle("idle", (l) => idleDays(l))}
                />
                <th className="py-2 font-medium">Contact</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((lead) => {
                const delivery = leadDelivery(lead.id);
                return (
                  <tr key={lead.id} className="border-b border-line/70 last:border-0">
                    <td className="py-3 pr-3">
                      <p className="font-medium text-ink">{lead.customer_name}</p>
                      <p className="text-[11px] text-muted">
                        {lead.id} · {formatDate(lead.created_at)}
                        {lead.lost_reason ? ` · ${lead.lost_reason}` : ""}
                        {delivery?.delay_reason ? ` · delay: ${delivery.delay_reason}` : ""}
                      </p>
                    </td>
                    <td className="py-3 pr-3">
                      <StatusPill status={lead.status} />
                    </td>
                    <td className="py-3 pr-3 text-xs text-muted">{lead.model_interested}</td>
                    <td className="py-3 pr-3 tabular-nums">{formatINR(lead.deal_value)}</td>
                    <td className={`py-3 pr-3 text-xs ${idleDays(lead) >= 7 || isOverdueOrder(lead) ? "text-warn" : "text-muted"}`}>
                      {formatDays(idleDays(lead))}
                    </td>
                    <td className="py-3">
                      <a className="text-xs text-accent hover:underline" href={`tel:${lead.phone}`}>
                        {lead.phone}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
