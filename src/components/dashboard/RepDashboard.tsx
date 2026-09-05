"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  companyKpis,
  filterLeads,
  firstContactStats,
  liveLeads,
  lostInRange,
  lostReasons,
} from "@/lib/aggregations";
import { dataset, getBranch, getRep } from "@/lib/data";
import { formatDays, formatINR, formatPct } from "@/lib/format";
import { rangeParam, resolveRange } from "@/lib/query";
import type { Filters } from "@/lib/types";
import { FunnelChart, ReasonBars } from "../charts";
import { ActionQueue } from "../insights/ActionQueue";
import { AppShell } from "../ui/AppShell";
import { EmptyState } from "../ui/EmptyState";
import { KpiCard } from "../ui/KpiCard";
import { LeadTable } from "./LeadTable";

export function RepDashboard({ repId }: { repId: string }) {
  const params = useSearchParams();
  const range = useMemo(() => resolveRange(params.get("range")), [params]);
  const rep = getRep(repId);
  const branch = rep ? getBranch(rep.branch_id) : undefined;
  const filters: Filters = useMemo(
    () => ({ range, branchId: rep?.branch_id, repId }),
    [range, rep?.branch_id, repId],
  );
  const query = `?range=${rangeParam(range)}`;

  const kpis = useMemo(() => companyKpis(dataset, filters), [filters]);
  const branchKpis = useMemo(
    () => (rep ? companyKpis(dataset, { range, branchId: rep.branch_id }) : null),
    [range, rep],
  );
  const groupKpis = useMemo(() => companyKpis(dataset, { range }), [range]);
  const intake = useMemo(() => filterLeads(dataset, filters), [filters]);
  const openBook = useMemo(() => liveLeads(dataset, filters), [filters]);
  const periodLost = useMemo(() => lostInRange(dataset, filters), [filters]);
  const lost = useMemo(() => lostReasons(periodLost), [periodLost]);
  const fc = useMemo(() => firstContactStats(intake), [intake]);
  const closed = kpis.delivered + kpis.lost;

  if (!rep || !branch) {
    return (
      <AppShell rangeValue={rangeParam(range)}>
        <EmptyState
          title="Rep not found"
          detail="That sales rep id is not in the file."
          action={
            <Link href={`/${query}`} className="text-sm text-accent">
              Back to overview
            </Link>
          }
        />
      </AppShell>
    );
  }

  const isManager = rep.role === "branch_manager";

  return (
    <AppShell scopeBranchId={rep.branch_id} rangeValue={rangeParam(range)}>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {rep.name}
            <span className="ml-2 text-base font-normal capitalize text-muted">
              {" "}
              {rep.role.replace("_", " ")}
            </span>
          </h1>
        </div>

        {isManager ? (
          <EmptyState
            title="Branch managers are not assigned a personal book"
            detail={`${rep.name} has zero leads in the dataset. Use the ${branch.name} scorecard for their team.`}
            action={
              <Link
                href={`/branch/${rep.branch_id}${query}`}
                className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-bg"
              >
                Open {branch.name}
              </Link>
            }
          />
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiCard
                label="Conversion"
                value={closed ? formatPct(kpis.conversion) : "—"}
                hint={
                  closed
                    ? `${kpis.delivered} won · ${kpis.lost} lost in ${range.label} · branch ${formatPct(branchKpis?.conversion ?? 0)} · group ${formatPct(groupKpis.conversion)}`
                    : `No closed deals in ${range.label} · branch ${formatPct(branchKpis?.conversion ?? 0)}`
                }
                tone={!closed ? "neutral" : kpis.conversion + 8 < (branchKpis?.conversion ?? 0) ? "bad" : "good"}
              />
              <KpiCard
                label="Delivered"
                value={String(kpis.delivered)}
                hint={`${formatINR(kpis.deliveredRevenue)} closed in ${range.label}`}
              />
              <KpiCard
                label="First contact"
                value={fc.n ? formatDays(fc.avg) : "—"}
                hint={
                  fc.n
                    ? `Median ${formatDays(fc.median)} on ${range.label} intake · branch ${formatDays(branchKpis?.avgFirstContact ?? 0)}`
                    : `No ${range.label} intake to time`
                }
              />
              <KpiCard
                label="Needs a call"
                value={String(kpis.overdueOrders + kpis.stalledMidFunnel)}
                hint={`${kpis.active} still open · ${kpis.overdueOrders} overdue orders`}
                tone={kpis.overdueOrders + kpis.stalledMidFunnel > 0 ? "warn" : "good"}
              />
            </section>

            <section className="grid gap-3 lg:grid-cols-5 lg:items-stretch">
              <div className="min-w-0 lg:col-span-3">
                <LeadTable leads={openBook} title="Open book" />
              </div>
              <div className="min-w-0 lg:relative lg:col-span-2 lg:min-h-0">
                <div className="lg:absolute lg:inset-0 lg:overflow-hidden">
                  <ActionQueue filters={filters} />
                </div>
              </div>
            </section>

            <FunnelChart leads={intake} periodLabel={range.label} />

            <ReasonBars
              title="This rep's lost reasons"
              soWhat={
                lost[0]
                  ? `They lose most often to ${lost[0].reason}. Compare that to the branch pattern on the branch page.`
                  : "No losses in this slice — either a clean book or no volume."
              }
              rows={lost}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
