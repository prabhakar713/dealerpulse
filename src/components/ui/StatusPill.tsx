import { statusLabel } from "@/lib/format";
import type { LeadStatus } from "@/lib/types";

const TONE: Record<LeadStatus, string> = {
  new: "bg-sky-400/15 text-sky-300",
  contacted: "bg-indigo-400/15 text-indigo-300",
  test_drive: "bg-violet-400/15 text-violet-300",
  negotiation: "bg-amber-400/15 text-amber-200",
  order_placed: "bg-orange-400/15 text-orange-200",
  delivered: "bg-emerald-400/15 text-emerald-300",
  lost: "bg-rose-400/15 text-rose-300",
};

export function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${TONE[status]}`}>
      {statusLabel(status)}
    </span>
  );
}

export function SeverityPill({ severity }: { severity: "critical" | "high" | "medium" }) {
  const cls =
    severity === "critical"
      ? "bg-bad/15 text-bad"
      : severity === "high"
        ? "bg-warn/15 text-warn"
        : "bg-white/8 text-muted";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {severity}
    </span>
  );
}
