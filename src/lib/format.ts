import type { LeadStatus } from "./types";

export function formatINR(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10_000_000) {
    const cr = abs / 10_000_000;
    return `${sign}₹${trimNum(cr)} Cr`;
  }
  if (abs >= 100_000) {
    const lakh = abs / 100_000;
    return `${sign}₹${trimNum(lakh)}L`;
  }
  if (abs >= 1_000) {
    return `${sign}₹${indianInt(abs)}`;
  }
  return `${sign}₹${Math.round(abs)}`;
}

export function formatINRFull(value: number): string {
  return `₹${indianInt(value)}`;
}

function indianInt(value: number): string {
  const digits = Math.round(Math.abs(value)).toString();
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${grouped},${last3}`;
}

function trimNum(n: number): string {
  const rounded = n >= 10 ? n.toFixed(1) : n.toFixed(2);
  return rounded.replace(/\.0+$/, "").replace(/(\.\d)0$/, "$1");
}

export function formatPct(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function formatDays(days: number): string {
  if (!Number.isFinite(days)) return "—";
  if (days < 1) return `${Math.round(days * 24)}h`;
  const rounded = Math.round(days);
  return `${rounded}d`;
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS_SHORT[m - 1]} ${y}`;
}

const SOURCE_LABELS: Record<string, string> = {
  walk_in: "Walk-in",
  website: "Website",
  referral: "Referral",
  social_media: "Social media",
  phone_enquiry: "Phone enquiry",
  auto_expo: "Auto expo",
};

export function sourceLabel(source: string): string {
  if (SOURCE_LABELS[source]) return SOURCE_LABELS[source];
  return source
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  test_drive: "Test drive",
  negotiation: "Negotiation",
  order_placed: "Order placed",
  delivered: "Delivered",
  lost: "Lost",
};

export function statusLabel(status: LeadStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
