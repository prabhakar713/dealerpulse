"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  agingBuckets,
  branchSummaries,
  companyKpis,
  delayReasons,
  deliveriesFor,
  filterLeads,
  liveLeads,
  lostInRange,
  lostReasons,
  monthlyTrend,
  repSummaries,
} from "@/lib/aggregations";
import { dataset, getBranch } from "@/lib/data";
import { formatINR, formatPct } from "@/lib/format";
import { rangeParam, resolveRange } from "@/lib/query";
import type { Filters } from "@/lib/types";
import { AgingChart, FunnelChart, ReasonBars, TrendChart } from "../charts";
import { ActionQueue } from "../insights/ActionQueue";
import { Headline } from "../insights/Headline";
import { AppShell } from "../ui/AppShell";
import { EmptyState } from "../ui/EmptyState";
import { KpiCard } from "../ui/KpiCard";
import { LeadTable } from "./LeadTable";
import { RepTable } from "./RepTable";

export function BranchDashboard({ branchId }: { branchId: string }) {
  const params = useSearchParams();
  const range = useMemo(() => resolveRange(params.get("range")), [params]);
  const branch = getBranch(branchId);
  const filters: Filters = useMemo(() => ({ range, branchId }), [range, branchId]);
  const query = `?range=${rangeParam(range)}`;

  const kpis = useMemo(() => companyKpis(dataset, filters), [filters]);
  const group = useMemo(() => companyKpis(dataset, { range }), [range]);
  const summary = useMemo(
    () => branchSummaries(dataset, filters)[0],
    [filters],
  );
  const leads = useMemo(() => filterLeads(dataset, filters), [filters]);
  const reps = useMemo(() => repSummaries(dataset, filters), [filters]);
  const trend = useMemo(() => monthlyTrend(dataset, filters), [filters]);
  const periodLost = useMemo(() => lostInRange(dataset, filters), [filters]);
  const lost = useMemo(() => lostReasons(periodLost), [periodLost]);
  const delays = useMemo(() => delayReasons(deliveriesFor(dataset, filters)), [filters]);
  const openBook = useMemo(() => liveLeads(dataset, filters), [filters]);
  const aging = useMemo(() => agingBuckets(openBook), [openBook]);

  if (!branch) {
    return (
      <AppShell rangeValue={rangeParam(range)}>
        <EmptyState
          title="Branch not found"
          detail="That id is not in the dealership file."
          action={
            <Link href={`/${query}`} className="text-sm text-accent">
              Back to company overview
            </Link>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell scopeBranchId={branchId} rangeValue={rangeParam(range)}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link href={`/${query}`} className="text-xs text-muted hover:text-ink">
              ← Company overview
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {branch.name}
              <span className="ml-2 text-base font-normal text-muted">{branch.city}</span>
            </h1>
          </div>
          <p className="text-xs text-muted">
            vs group conversion {formatPct(group.conversion)} · group target {formatPct(group.pace.unitPct)}
          </p>
        </div>

        <Headline filters={filters} />

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Target pace"
            value={formatPct(kpis.pace.unitPct)}
            hint={`${kpis.pace.units}/${kpis.pace.targetUnits} units · gap ${kpis.pace.gapUnits}`}
            tone={kpis.pace.unitPct < 30 ? "bad" : kpis.pace.unitPct < 70 ? "warn" : "good"}
          />
          <KpiCard
            label="Conversion"
            value={formatPct(kpis.conversion)}
            hint={`${kpis.delivered} delivered · ${kpis.lost} lost`}
            tone={summary && summary.conversion + 8 < group.conversion ? "bad" : "neutral"}
          />
          <KpiCard
            label="Pipeline"
            value={formatINR(kpis.pipelineValue)}
            hint={`${kpis.active} open · ${kpis.overdueOrders} overdue orders`}
          />
          <KpiCard
            label="Top loss reason"
            value={summary?.topLostReason ? truncate(summary.topLostReason, 18) : "—"}
            hint={summary?.topLostCount ? `${summary.topLostCount} losses on this reason` : "No losses"}
            tone="warn"
          />
        </section>

        <section className="grid gap-3 lg:grid-cols-5">
          <div className="min-w-0 lg:col-span-3">
            <RepTable rows={reps} query={query} companyConv={kpis.conversion || group.conversion} />
          </div>
          <div className="min-w-0 lg:col-span-2">
            <ActionQueue filters={filters} />
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <FunnelChart leads={leads} periodLabel={range.label} />
          <TrendChart points={trend} />
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <AgingChart buckets={aging} />
          <ReasonBars
            title="Lost reasons at this branch"
            soWhat={
              lost[0]
                ? `${lost[0].reason} is the local pattern — coach against this, not a generic script.`
                : "No losses in this slice."
            }
            rows={lost}
          />
        </section>

        <ReasonBars
          title="Delivery delays"
          soWhat={delays[0] ? `Most common delay: ${delays[0].reason}.` : "No delayed deliveries here."}
          rows={delays}
        />

        <LeadTable leads={openBook} title="Open book" />
      </div>
    </AppShell>
  );
}

function truncate(value: string, n: number) {
  return value.length > n ? `${value.slice(0, n)}…` : value;
}
