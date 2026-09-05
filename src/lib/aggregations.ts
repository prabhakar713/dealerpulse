import {
  ACTIVE_STATUSES,
  FUNNEL_STAGES,
  MID_FUNNEL_STATUSES,
  type DateRange,
  type DealershipData,
  type Delivery,
  type Filters,
  type Lead,
  type LeadStatus,
} from "./types";
import { branchById, dataset, deliveriesByLeadId, NOW, repById } from "./data";

/** Mid-funnel stall: 7 days. First-contact median in this data is ~2 days; 7d is a weekly pipeline review SLA. */
export const STALL_DAYS = 7;
export const CRITICAL_STALL_DAYS = 14;
/** Overdue order: longer than dataset-wide average delivery time (~18 days). */
export const OVERDUE_ORDER_DAYS = 18;
/** New lead SLA: contact within 2 days (dataset median first-contact is 1.9d). */
export const FIRST_CONTACT_SLA_DAYS = 2;

export function daysBetween(fromIso: string, to: Date | string): number {
  const toMs = typeof to === "string" ? new Date(to).getTime() : to.getTime();
  return (toMs - new Date(fromIso).getTime()) / 86_400_000;
}

export function inRange(iso: string, range: DateRange): boolean {
  return iso >= range.start && iso <= range.end;
}

export function filterLeads(data: DealershipData, filters: Filters): Lead[] {
  return data.leads.filter((lead) => {
    if (filters.branchId && lead.branch_id !== filters.branchId) return false;
    if (filters.repId && lead.assigned_to !== filters.repId) return false;
    return inRange(lead.created_at, filters.range);
  });
}

/** Open book as of now, ignoring cohort month — you still have to call June's stuck order in December. */
export function liveLeads(data: DealershipData, filters: Filters): Lead[] {
  return data.leads.filter((lead) => {
    if (filters.branchId && lead.branch_id !== filters.branchId) return false;
    if (filters.repId && lead.assigned_to !== filters.repId) return false;
    if (!ACTIVE_STATUSES.includes(lead.status)) return false;
    return lead.created_at <= filters.range.end;
  });
}

export function lostAt(lead: Lead): string | null {
  if (lead.status !== "lost") return null;
  return lead.status_history.find((s) => s.status === "lost")?.timestamp ?? lead.last_activity_at;
}

export function lostInRange(data: DealershipData, filters: Filters): Lead[] {
  return data.leads.filter((lead) => {
    if (filters.branchId && lead.branch_id !== filters.branchId) return false;
    if (filters.repId && lead.assigned_to !== filters.repId) return false;
    const ts = lostAt(lead);
    return ts ? inRange(ts, filters.range) : false;
  });
}

export function deliveredInRange(lead: Lead, range: DateRange): boolean {
  const ev = lead.status_history.find((s) => s.status === "delivered");
  const ts = ev?.timestamp ?? (lead.status === "delivered" ? lead.last_activity_at : null);
  return ts ? inRange(ts, range) : false;
}

export function eventMonth(iso: string): string {
  return iso.slice(0, 7);
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function firstContactDays(lead: Lead): number | null {
  const contacted = lead.status_history.find((s) => s.status === "contacted");
  if (!contacted) return null;
  return daysBetween(lead.created_at, contacted.timestamp);
}

export function lastNonLostStage(lead: Lead): LeadStatus {
  const hist = lead.status_history.filter((s) => s.status !== "lost");
  return hist[hist.length - 1]?.status ?? "new";
}

export function orderPlacedAt(lead: Lead): string | null {
  return lead.status_history.find((s) => s.status === "order_placed")?.timestamp ?? null;
}

export interface FunnelStageRow {
  stage: LeadStatus;
  reached: number;
  dropped: number;
  conversionFromPrev: number | null;
}

export function funnel(leads: Lead[]): FunnelStageRow[] {
  const reached: Record<string, number> = {};
  for (const stage of FUNNEL_STAGES) reached[stage] = 0;

  for (const lead of leads) {
    const seen = new Set(lead.status_history.map((s) => s.status));
    if (lead.status !== "lost") seen.add(lead.status);
    for (const stage of FUNNEL_STAGES) {
      if (seen.has(stage)) reached[stage]++;
    }
  }

  return FUNNEL_STAGES.map((stage, i) => {
    const prev = i === 0 ? null : reached[FUNNEL_STAGES[i - 1]];
    const n = reached[stage];
    const dropped = prev === null ? 0 : prev - n;
    return {
      stage,
      reached: n,
      dropped,
      conversionFromPrev: prev && prev > 0 ? (n / prev) * 100 : null,
    };
  });
}

export function lostByPriorStage(leads: Lead[]): { stage: LeadStatus; count: number }[] {
  const counts: Partial<Record<LeadStatus, number>> = {};
  for (const lead of leads.filter((l) => l.status === "lost")) {
    const stage = lastNonLostStage(lead);
    counts[stage] = (counts[stage] ?? 0) + 1;
  }
  return FUNNEL_STAGES.filter((s) => s !== "delivered").map((stage) => ({
    stage,
    count: counts[stage] ?? 0,
  }));
}

export function reasonCounts(
  items: Array<string | null | undefined>,
): { reason: string; count: number }[] {
  const map = new Map<string, number>();
  for (const raw of items) {
    if (!raw) continue;
    map.set(raw, (map.get(raw) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

export function lostReasons(leads: Lead[]) {
  return reasonCounts(leads.filter((l) => l.status === "lost").map((l) => l.lost_reason));
}

export function delayReasons(deliveries: Delivery[]) {
  return reasonCounts(deliveries.map((d) => d.delay_reason));
}

export interface AgingBucket {
  key: string;
  label: string;
  min: number;
  max: number;
  count: number;
  value: number;
}

export function agingBuckets(leads: Lead[], now: Date = NOW): AgingBucket[] {
  const defs: Omit<AgingBucket, "count" | "value">[] = [
    { key: "0-3", label: "0–3d", min: 0, max: 3 },
    { key: "4-7", label: "4–7d", min: 3, max: 7 },
    { key: "8-14", label: "8–14d", min: 7, max: 14 },
    { key: "15-30", label: "15–30d", min: 14, max: 30 },
    { key: "30+", label: "30d+", min: 30, max: Infinity },
  ];
  return defs.map((def) => {
    const matched = leads.filter((l) => {
      const idle = daysBetween(l.last_activity_at, now);
      return idle >= def.min && idle < def.max;
    });
    return {
      ...def,
      count: matched.length,
      value: matched.reduce((s, l) => s + l.deal_value, 0),
    };
  });
}

export interface MonthlyPoint {
  month: string;
  units: number;
  revenue: number;
  targetUnits: number;
  targetRevenue: number;
  unitPct: number;
  revPct: number;
}

export function monthlyTrend(data: DealershipData, filters: Filters): MonthlyPoint[] {
  return filters.range.months.map((month) => {
    const monthLeads = data.leads.filter((lead) => {
      if (filters.branchId && lead.branch_id !== filters.branchId) return false;
      if (filters.repId && lead.assigned_to !== filters.repId) return false;
      return deliveredInRange(lead, {
        ...filters.range,
        start: `${month}-01T00:00:00.000Z`,
        end: monthRangeEnd(month),
        months: [month],
        label: month,
      });
    });
    const targets = data.targets.filter((t) => {
      if (t.month !== month) return false;
      if (filters.branchId && t.branch_id !== filters.branchId) return false;
      return true;
    });
    const units = monthLeads.length;
    const revenue = monthLeads.reduce((s, l) => s + l.deal_value, 0);
    const targetUnits = targets.reduce((s, t) => s + t.target_units, 0);
    const targetRevenue = targets.reduce((s, t) => s + t.target_revenue, 0);
    return {
      month,
      units,
      revenue,
      targetUnits,
      targetRevenue,
      unitPct: targetUnits ? (units / targetUnits) * 100 : 0,
      revPct: targetRevenue ? (revenue / targetRevenue) * 100 : 0,
    };
  });
}

function monthRangeEnd(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0, 23, 59, 59, 999)).toISOString();
}

export interface TargetPace {
  units: number;
  revenue: number;
  targetUnits: number;
  targetRevenue: number;
  unitPct: number;
  revPct: number;
  status: "hit" | "miss" | "closed_short";
  gapUnits: number;
  gapRevenue: number;
}

export function targetPace(data: DealershipData, filters: Filters): TargetPace {
  const trend = monthlyTrend(data, filters);
  const units = trend.reduce((s, p) => s + p.units, 0);
  const revenue = trend.reduce((s, p) => s + p.revenue, 0);
  const targetUnits = trend.reduce((s, p) => s + p.targetUnits, 0);
  const targetRevenue = trend.reduce((s, p) => s + p.targetRevenue, 0);
  const unitPct = targetUnits ? (units / targetUnits) * 100 : 0;
  const revPct = targetRevenue ? (revenue / targetRevenue) * 100 : 0;
  const hit = units >= targetUnits && revenue >= targetRevenue;
  return {
    units,
    revenue,
    targetUnits,
    targetRevenue,
    unitPct,
    revPct,
    status: hit ? "hit" : "closed_short",
    gapUnits: Math.max(0, targetUnits - units),
    gapRevenue: Math.max(0, targetRevenue - revenue),
  };
}

export interface BranchSummary {
  id: string;
  name: string;
  city: string;
  leads: number;
  delivered: number;
  lost: number;
  active: number;
  conversion: number;
  lostRate: number;
  deliveredRevenue: number;
  pipelineValue: number;
  avgFirstContact: number;
  topLostReason: string | null;
  topLostCount: number;
  unitPct: number;
  targetUnits: number;
  units: number;
  overdueOrders: number;
  stalledMidFunnel: number;
}

export function branchSummaries(data: DealershipData, filters: Filters): BranchSummary[] {
  const paceAll = new Map<string, TargetPace>();
  for (const branch of data.branches) {
    paceAll.set(branch.id, targetPace(data, { ...filters, branchId: branch.id }));
  }

  return data.branches
    .filter((b) => !filters.branchId || b.id === filters.branchId)
    .map((branch) => {
      const leads = filterLeads(data, { ...filters, branchId: branch.id });
      const lost = lostInRange(data, { ...filters, branchId: branch.id });
      const active = liveLeads(data, { ...filters, branchId: branch.id });
      const reasons = lostReasons(lost);
      const fc = leads.map(firstContactDays).filter((d): d is number => d !== null);
      const pace = paceAll.get(branch.id)!;
      const closed = pace.units + lost.length;
      return {
        id: branch.id,
        name: branch.name,
        city: branch.city,
        leads: leads.length,
        delivered: pace.units,
        lost: lost.length,
        active: active.length,
        conversion: closed ? (pace.units / closed) * 100 : 0,
        lostRate: closed ? (lost.length / closed) * 100 : 0,
        deliveredRevenue: pace.revenue,
        pipelineValue: active.reduce((s, l) => s + l.deal_value, 0),
        avgFirstContact: avg(fc),
        topLostReason: reasons[0]?.reason ?? null,
        topLostCount: reasons[0]?.count ?? 0,
        unitPct: pace.unitPct,
        targetUnits: pace.targetUnits,
        units: pace.units,
        overdueOrders: active.filter((l) => isOverdueOrder(l)).length,
        stalledMidFunnel: active.filter((l) => isStalledMidFunnel(l)).length,
      };
    })
    .sort((a, b) => a.unitPct - b.unitPct);
}

export interface RepSummary {
  id: string;
  name: string;
  role: SalesRepRole;
  branchId: string;
  branchName: string;
  leads: number;
  delivered: number;
  lost: number;
  active: number;
  conversion: number;
  avgFirstContact: number;
  deliveredRevenue: number;
  pipelineValue: number;
  stalled: number;
}

type SalesRepRole = DealershipData["sales_reps"][number]["role"];

export function repSummaries(data: DealershipData, filters: Filters): RepSummary[] {
  const reps = data.sales_reps.filter((r) => {
    if (filters.branchId && r.branch_id !== filters.branchId) return false;
    if (filters.repId && r.id !== filters.repId) return false;
    return true;
  });

  return reps
    .map((rep) => {
      const leads = filterLeads(data, { ...filters, repId: rep.id, branchId: rep.branch_id });
      const delivered = leads.filter((l) => l.status === "delivered");
      const lost = leads.filter((l) => l.status === "lost");
      const active = leads.filter((l) => ACTIVE_STATUSES.includes(l.status));
      const fc = leads.map(firstContactDays).filter((d): d is number => d !== null);
      return {
        id: rep.id,
        name: rep.name,
        role: rep.role,
        branchId: rep.branch_id,
        branchName: branchById[rep.branch_id]?.name ?? "",
        leads: leads.length,
        delivered: delivered.length,
        lost: lost.length,
        active: active.length,
        conversion: leads.length ? (delivered.length / leads.length) * 100 : 0,
        avgFirstContact: avg(fc),
        deliveredRevenue: delivered.reduce((s, l) => s + l.deal_value, 0),
        pipelineValue: active.reduce((s, l) => s + l.deal_value, 0),
        stalled: active.filter((l) => idleDays(l) >= STALL_DAYS).length,
      };
    })
    .sort((a, b) => b.delivered - a.delivered);
}

export function idleDays(lead: Lead, now: Date = NOW): number {
  return daysBetween(lead.last_activity_at, now);
}

export function isOverdueOrder(lead: Lead, now: Date = NOW): boolean {
  if (lead.status !== "order_placed") return false;
  const ordered = orderPlacedAt(lead);
  if (!ordered) return idleDays(lead, now) >= OVERDUE_ORDER_DAYS;
  return daysBetween(ordered, now) >= OVERDUE_ORDER_DAYS;
}

export function isStalledMidFunnel(lead: Lead, now: Date = NOW): boolean {
  return MID_FUNNEL_STATUSES.includes(lead.status) && idleDays(lead, now) >= STALL_DAYS;
}

export function isUncontactedNew(lead: Lead, now: Date = NOW): boolean {
  return lead.status === "new" && idleDays(lead, now) >= FIRST_CONTACT_SLA_DAYS;
}

export interface SourceRow {
  source: string;
  leads: number;
  delivered: number;
  lost: number;
  conversion: number;
}

export function sourceConversion(leads: Lead[]): SourceRow[] {
  const map = new Map<string, SourceRow>();
  for (const lead of leads) {
    const row = map.get(lead.source) ?? {
      source: lead.source,
      leads: 0,
      delivered: 0,
      lost: 0,
      conversion: 0,
    };
    row.leads++;
    if (lead.status === "delivered") row.delivered++;
    if (lead.status === "lost") row.lost++;
    map.set(lead.source, row);
  }
  return [...map.values()]
    .map((r) => ({ ...r, conversion: r.leads ? (r.delivered / r.leads) * 100 : 0 }))
    .sort((a, b) => b.conversion - a.conversion);
}

export interface ActionItem {
  id: string;
  kind: "overdue_order" | "stalled_lead" | "uncontacted" | "weak_rep" | "branch_miss";
  severity: "critical" | "high" | "medium";
  title: string;
  why: string;
  action: string;
  href?: string;
  phone?: string;
  meta: string;
}

export function companyKpis(data: DealershipData, filters: Filters) {
  const leads = filterLeads(data, filters);
  const lost = lostInRange(data, filters);
  const active = liveLeads(data, filters);
  const pace = targetPace(data, filters);
  const fc = leads.map(firstContactDays).filter((d): d is number => d !== null);
  const neverContactedLost = lost.filter((l) => lastNonLostStage(l) === "new").length;
  const deliveries = data.deliveries.filter((d) => {
    const lead = data.leads.find((l) => l.id === d.lead_id);
    if (!lead) return false;
    if (filters.branchId && lead.branch_id !== filters.branchId) return false;
    if (filters.repId && lead.assigned_to !== filters.repId) return false;
    return inRange(`${d.delivery_date}T00:00:00.000Z`, filters.range);
  });
  const delayed = deliveries.filter((d) => d.delay_reason).length;
  const closed = pace.units + lost.length;

  return {
    leads: leads.length,
    delivered: pace.units,
    lost: lost.length,
    active: active.length,
    conversion: closed ? (pace.units / closed) * 100 : 0,
    pipelineValue: active.reduce((s, l) => s + l.deal_value, 0),
    deliveredRevenue: pace.revenue,
    pace,
    avgFirstContact: avg(fc),
    medianFirstContact: median(fc),
    neverContactedLost,
    lostCount: lost.length,
    overdueOrders: active.filter((l) => isOverdueOrder(l)).length,
    stalledMidFunnel: active.filter((l) => isStalledMidFunnel(l)).length,
    delayedDeliveries: delayed,
    deliveries: deliveries.length,
  };
}

export function actionableInsights(data: DealershipData, filters: Filters): ActionItem[] {
  const items: ActionItem[] = [];
  const leads = liveLeads(data, filters);

  for (const lead of leads) {
    const branch = branchById[lead.branch_id];
    const rep = repById[lead.assigned_to];
    if (isOverdueOrder(lead)) {
      const ordered = orderPlacedAt(lead);
      const wait = Math.round(ordered ? daysBetween(ordered, NOW) : idleDays(lead));
      items.push({
        id: `order-${lead.id}`,
        kind: "overdue_order",
        severity: wait >= 60 ? "critical" : "high",
        title: `${lead.customer_name} · ${lead.model_interested}`,
        why: `Order sitting ${wait}d without delivery (avg SLA is ${OVERDUE_ORDER_DAYS}d).`,
        action: "Call customer and chase allocation / RTO / finance.",
        href: `/rep/${lead.assigned_to}`,
        phone: lead.phone,
        meta: `${branch?.name ?? ""} · ${rep?.name ?? ""} · ${formatDeal(lead.deal_value)}`,
      });
    } else if (isUncontactedNew(lead)) {
      items.push({
        id: `new-${lead.id}`,
        kind: "uncontacted",
        severity: "high",
        title: `${lead.customer_name} · still New`,
        why: `No first contact in ${Math.round(idleDays(lead))}d. Median first-contact here is 1.9d.`,
        action: "Call today and log the outcome.",
        href: `/rep/${lead.assigned_to}`,
        phone: lead.phone,
        meta: `${branch?.name ?? ""} · ${rep?.name ?? ""}`,
      });
    } else if (isStalledMidFunnel(lead)) {
      const idle = Math.round(idleDays(lead));
      items.push({
        id: `stall-${lead.id}`,
        kind: "stalled_lead",
        severity: idle >= CRITICAL_STALL_DAYS ? "critical" : "high",
        title: `${lead.customer_name} · ${prettyStatus(lead.status)}`,
        why: `No activity for ${idle}d. This lead is going cold.`,
        action: suggestedNextStep(lead),
        href: `/rep/${lead.assigned_to}`,
        phone: lead.phone,
        meta: `${branch?.name ?? ""} · ${rep?.name ?? ""} · ${formatDeal(lead.deal_value)}`,
      });
    }
  }

  const branches = filters.repId
    ? []
    : branchSummaries(data, { ...filters, branchId: filters.branchId });
  for (const b of branches) {
    if (b.targetUnits > 0 && b.unitPct < 30) {
      items.push({
        id: `branch-${b.id}`,
        kind: "branch_miss",
        severity: b.unitPct < 15 ? "critical" : "high",
        title: `${b.name} is at ${Math.round(b.unitPct)}% of unit target`,
        why: `${b.units} of ${b.targetUnits} units. Top loss reason: ${b.topLostReason ?? "n/a"} (${b.topLostCount}).`,
        action: "Run a branch stand-up this week: lost-reason coaching + stalled-lead blitz.",
        href: `/branch/${b.id}`,
        meta: `${b.city} · ${b.lost} lost / ${b.leads} leads`,
      });
    }
  }

  if (!filters.repId) {
    const reps = repSummaries(data, filters).filter((r) => r.role === "sales_officer" && r.leads >= 8);
    const peerAvg =
      reps.reduce((s, r) => s + r.conversion, 0) / Math.max(1, reps.length);
    for (const r of reps) {
      if (r.conversion <= peerAvg * 0.45 && r.lost >= 8) {
        items.push({
          id: `rep-${r.id}`,
          kind: "weak_rep",
          severity: r.conversion < 10 ? "critical" : "high",
          title: `${r.name} converting at ${Math.round(r.conversion)}%`,
          why: `Peer average is ${Math.round(peerAvg)}%. ${r.lost} lost vs ${r.delivered} delivered.`,
          action: "Pair with a high-converting officer for ride-alongs this week.",
          href: `/rep/${r.id}`,
          meta: `${r.branchName} · ${r.leads} leads in range`,
        });
      }
    }
  }

  const severityRank = { critical: 0, high: 1, medium: 2 };
  return items.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]).slice(0, 12);
}

function prettyStatus(status: LeadStatus): string {
  return status.replace(/_/g, " ");
}

function formatDeal(value: number): string {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)}L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function suggestedNextStep(lead: Lead): string {
  switch (lead.status) {
    case "new":
      return "Make first contact today.";
    case "contacted":
      return "Book a test drive this week.";
    case "test_drive":
      return "Follow up on feedback and move to a written offer.";
    case "negotiation":
      return "Lock discount / finance approval and ask for the booking.";
    default:
      return "Call and update status today.";
  }
}

export function headline(data: DealershipData, filters: Filters): {
  tone: "bad" | "warn" | "good";
  title: string;
  detail: string;
} {
  const kpis = companyKpis(data, filters);
  const branches = branchSummaries(data, { range: filters.range });
  const worst = [...branches].sort((a, b) => a.unitPct - b.unitPct)[0];
  const scope = filters.branchId
    ? branchById[filters.branchId]?.name ?? "This branch"
    : "The group";

  if (kpis.pace.targetUnits > 0 && kpis.pace.unitPct < 50) {
    const why = worst
      ? `${worst.name} is worst at ${Math.round(worst.unitPct)}% (${worst.units}/${worst.targetUnits}), mainly ${worst.topLostReason ?? "mixed losses"}.`
      : "";
    return {
      tone: kpis.pace.unitPct < 25 ? "bad" : "warn",
      title: `${scope} closed ${filters.range.label} at ${Math.round(kpis.pace.unitPct)}% of unit target.`,
      detail: `${kpis.pace.units} of ${kpis.pace.targetUnits} units. ${kpis.overdueOrders} overdue undelivered orders and ${kpis.stalledMidFunnel} stalled mid-funnel leads need a call today. ${why}`,
    };
  }

  if (kpis.overdueOrders + kpis.stalledMidFunnel >= 5) {
    return {
      tone: "warn",
      title: `${kpis.overdueOrders + kpis.stalledMidFunnel} live deals need attention today.`,
      detail: `${kpis.overdueOrders} orders past the ${OVERDUE_ORDER_DAYS}d delivery SLA, ${kpis.stalledMidFunnel} mid-funnel leads idle 7+ days.`,
    };
  }

  return {
    tone: "good",
    title: `${scope} looks stable for ${filters.range.label}.`,
    detail: `${kpis.pace.units} units delivered against a ${kpis.pace.targetUnits} target. ${kpis.active} leads still open.`,
  };
}

export function firstContactStats(leads: Lead[]) {
  const values = leads.map(firstContactDays).filter((d): d is number => d !== null);
  return { n: values.length, avg: avg(values), median: median(values) };
}

export function deliveriesFor(data: DealershipData, filters: Filters): Delivery[] {
  return data.deliveries.filter((d) => {
    const lead = data.leads.find((l) => l.id === d.lead_id);
    if (!lead) return false;
    if (filters.branchId && lead.branch_id !== filters.branchId) return false;
    if (filters.repId && lead.assigned_to !== filters.repId) return false;
    return inRange(`${d.delivery_date}T00:00:00.000Z`, filters.range);
  });
}

export function leadDelivery(leadId: string): Delivery | undefined {
  return deliveriesByLeadId[leadId];
}

export { dataset, NOW };
