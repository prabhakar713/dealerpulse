import { idleDays, isOverdueOrder, leadDelivery } from "@/lib/aggregations";
import { formatDate, formatDays, formatINR } from "@/lib/format";
import type { Lead } from "@/lib/types";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { StatusPill } from "../ui/StatusPill";

export function LeadTable({
  leads,
  title = "Leads in this period",
}: {
  leads: Lead[];
  title?: string;
}) {
  const sorted = [...leads].sort((a, b) => idleDays(b) - idleDays(a));
  return (
    <Card
      title={title}
      soWhat={
        leads.length
          ? "Sorted by days since last activity — the top of this list is who to call first."
          : "Nothing matched this filter."
      }
    >
      {leads.length === 0 ? (
        <EmptyState
          title="No leads in this range"
          detail="This is intentional, not a broken page. Widen the period or check another rep."
        />
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-muted">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">Customer</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Model</th>
                <th className="py-2 font-medium">Value</th>
                <th className="py-2 font-medium">Idle</th>
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
