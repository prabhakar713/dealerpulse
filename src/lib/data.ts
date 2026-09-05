import raw from "../../data/dealership_data.json";
import type { DealershipData, DateRange, Lead, SalesRep, Branch } from "./types";

export const dataset = raw as DealershipData;

function maxIso(values: string[]): string {
  return values.reduce((max, v) => (v > max ? v : max), values[0]);
}

export const NOW_ISO = maxIso([
  ...dataset.leads.map((l) => l.last_activity_at),
  ...dataset.leads.map((l) => l.created_at),
]);

export const NOW = new Date(NOW_ISO);

export const MONTHS = [
  "2025-06",
  "2025-07",
  "2025-08",
  "2025-09",
  "2025-10",
  "2025-11",
  "2025-12",
] as const;

export function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  return { start: start.toISOString(), end: end.toISOString() };
}

export function rangeForMonths(months: string[], label: string): DateRange {
  const first = monthRange(months[0]);
  const last = monthRange(months[months.length - 1]);
  return { start: first.start, end: last.end, label, months: [...months] };
}

export const ALL_RANGE = rangeForMonths([...MONTHS], "Jun–Dec 2025");
export const LATEST_MONTH = MONTHS[MONTHS.length - 1];
export const DEFAULT_RANGE = rangeForMonths([LATEST_MONTH], "Dec 2025");

export const RANGE_PRESETS: DateRange[] = [
  DEFAULT_RANGE,
  rangeForMonths(["2025-10", "2025-11", "2025-12"], "Oct–Dec 2025"),
  ALL_RANGE,
  ...MONTHS.slice(0, -1)
    .reverse()
    .map((m) => rangeForMonths([m], monthStamp(m))),
];

function monthStamp(ym: string): string {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, mo] = ym.split("-").map(Number);
  return `${names[mo - 1]} ${y}`;
}

export const branchById: Record<string, Branch> = Object.fromEntries(
  dataset.branches.map((b) => [b.id, b]),
);

export const repById: Record<string, SalesRep> = Object.fromEntries(
  dataset.sales_reps.map((r) => [r.id, r]),
);

export const leadById: Record<string, Lead> = Object.fromEntries(
  dataset.leads.map((l) => [l.id, l]),
);

export const deliveriesByLeadId: Record<string, DealershipData["deliveries"][number]> =
  Object.fromEntries(dataset.deliveries.map((d) => [d.lead_id, d]));

export function getBranch(id: string): Branch | undefined {
  return branchById[id];
}

export function getRep(id: string): SalesRep | undefined {
  return repById[id];
}

export function repsForBranch(branchId: string): SalesRep[] {
  return dataset.sales_reps.filter((r) => r.branch_id === branchId);
}
