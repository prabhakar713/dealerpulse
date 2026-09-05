"use client";

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
  lostReasons,
  monthlyTrend,
  sourceConversion,
} from "@/lib/aggregations";
import { dataset } from "@/lib/data";
import { formatINR, formatPct, sourceLabel } from "@/lib/format";
import { rangeParam, resolveRange } from "@/lib/query";
import type { Filters } from "@/lib/types";
import { AgingChart } from "../charts/AgingChart";
import { FunnelChart } from "../charts/FunnelChart";
import { ReasonBars } from "../charts/ReasonBars";
import { TrendChart } from "../charts/TrendChart";
import { ActionQueue } from "../insights/ActionQueue";
import { Headline } from "../insights/Headline";
import { AppShell } from "../ui/AppShell";
import { KpiCard } from "../ui/KpiCard";
import { BranchTable } from "./BranchTable";

export function OverviewDashboard() {
  const params = useSearchParams();
  const range = useMemo(() => resolveRange(params.get("range")), [params]);
  const filters: Filters = useMemo(() => ({ range }), [range]);
  const query = `?range=${rangeParam(range)}`;

  const kpis = useMemo(() => companyKpis(dataset, filters), [filters]);
  const branches = useMemo(() => branchSummaries(dataset, filters), [filters]);
  const leads = useMemo(() => filterLeads(dataset, filters), [filters]);
  const trend = useMemo(() => monthlyTrend(dataset, filters), [filters]);
  const lost = useMemo(() => lostReasons(leads), [leads]);
  const deliveries = useMemo(() => deliveriesFor(dataset, filters), [filters]);
  const delays = useMemo(() => delayReasons(deliveries), [deliveries]);
  const sources = useMemo(() => sourceConversion(leads), [leads]);
  const openBook = useMemo(() => liveLeads(dataset, filters), [filters]);
  const aging = useMemo(() => agingBuckets(openBook), [openBook]);
  const bestSource = sources[0];
  const worstSource = sources[sources.length - 1];

  return (
    <AppShell>
      <div className="space-y-4">
        <Headline filters={filters} />

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Target attainment"
            value={formatPct(kpis.pace.unitPct)}
            hint={`${kpis.pace.units} of ${kpis.pace.targetUnits} units · ${formatINR(kpis.pace.revenue)} vs ${formatINR(kpis.pace.targetRevenue)}`}
            tone={kpis.pace.unitPct < 30 ? "bad" : kpis.pace.unitPct < 70 ? "warn" : "good"}
          />
          <KpiCard
            label="Open pipeline"
            value={formatINR(kpis.pipelineValue)}
            hint={`${kpis.active} live deals · ${kpis.overdueOrders} overdue orders`}
            tone={kpis.overdueOrders > 5 ? "warn" : "neutral"}
          />
          <KpiCard
            label="Close rate"
            value={formatPct(kpis.conversion)}
            hint={`${kpis.delivered} won · ${kpis.lost} lost this period · ${kpis.neverContactedLost} never contacted`}
            tone={kpis.conversion < 30 ? "bad" : "neutral"}
          />
          <KpiCard
            label="Do now"
            value={String(kpis.overdueOrders + kpis.stalledMidFunnel)}
            hint={`${kpis.stalledMidFunnel} stalled mid-funnel · ${kpis.overdueOrders} undelivered orders past 18d`}
            tone={kpis.overdueOrders + kpis.stalledMidFunnel > 0 ? "bad" : "good"}
          />
        </section>

        <section className="grid gap-3 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <BranchTable rows={branches} query={query} />
          </div>
          <div className="lg:col-span-2">
            <ActionQueue filters={filters} />
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <FunnelChart leads={leads} />
          <TrendChart points={trend} />
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <AgingChart buckets={aging} />
          <ReasonBars
            title="Why deals die"
            soWhat={
              lost[0]
                ? `No single killer — ${lost[0].reason} leads (${lost[0].count}), but financing, price, and follow-up sit in a near-tie. Fix the process, not one objection.`
                : "No losses in this slice."
            }
            rows={lost}
          />
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <ReasonBars
            title="Delivery delays"
            soWhat={
              delays[0]
                ? `${deliveries.length} deliveries in range; top delay is ${delays[0].reason} (${delays[0].count}). Avg SLA in the full file is 18 days.`
                : "No delayed deliveries in this slice."
            }
            rows={delays}
          />
          <SourceStrip best={bestSource} worst={worstSource} />
        </section>
      </div>
    </AppShell>
  );
}

function SourceStrip({
  best,
  worst,
}: {
  best?: { source: string; conversion: number; leads: number };
  worst?: { source: string; conversion: number; leads: number };
}) {
  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">Which source is worth the spend?</h2>
      <p className="mt-1 text-xs leading-5 text-muted">
        Walk-ins reliably outperform paid attention. If social stays this weak, stop feeding it unqualified leads.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-good/10 p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted">Best source</p>
          <p className="mt-1 text-lg font-semibold">{best ? sourceLabel(best.source) : "—"}</p>
          <p className="text-xs text-muted">
            {best ? `${Math.round(best.conversion)}% conversion · ${best.leads} leads` : ""}
          </p>
        </div>
        <div className="rounded-xl bg-bad/10 p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted">Worst source</p>
          <p className="mt-1 text-lg font-semibold">{worst ? sourceLabel(worst.source) : "—"}</p>
          <p className="text-xs text-muted">
            {worst ? `${Math.round(worst.conversion)}% conversion · ${worst.leads} leads` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
