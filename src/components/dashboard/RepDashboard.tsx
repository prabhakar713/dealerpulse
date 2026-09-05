"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  companyKpis,
  filterLeads,
  firstContactStats,
  lostReasons,
  repSummaries,
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

  const me = useMemo(() => repSummaries(dataset, filters)[0], [filters]);
  const branchKpis = useMemo(
    () => (rep ? companyKpis(dataset, { range, branchId: rep.branch_id }) : null),
    [range, rep],
  );
  const groupKpis = useMemo(() => companyKpis(dataset, { range }), [range]);
  const leads = useMemo(() => filterLeads(dataset, filters), [filters]);
  const lost = useMemo(() => lostReasons(leads), [leads]);
  const fc = useMemo(() => firstContactStats(leads), [leads]);

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
          <div className="flex flex-wrap gap-3 text-xs text-muted">
            <Link href={`/${query}`} className="hover:text-ink">
              Company
            </Link>
            <span>/</span>
            <Link href={`/branch/${rep.branch_id}${query}`} className="hover:text-ink">
              {branch.name}
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {rep.name}
            <span className="ml-2 text-base font-normal capitalize text-muted">
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
                value={formatPct(me?.conversion ?? 0)}
                hint={`Branch ${formatPct(branchKpis?.conversion ?? 0)} · Group ${formatPct(groupKpis.conversion)}`}
                tone={(me?.conversion ?? 0) + 8 < (branchKpis?.conversion ?? 0) ? "bad" : "good"}
              />
              <KpiCard
                label="Delivered"
                value={String(me?.delivered ?? 0)}
                hint={`${formatINR(me?.deliveredRevenue ?? 0)} · ${me?.leads ?? 0} leads in range`}
              />
              <KpiCard
                label="First contact"
                value={fc.n ? formatDays(fc.avg) : "—"}
                hint={
                  fc.n
                    ? `Median ${formatDays(fc.median)} · branch ${formatDays(branchKpis?.avgFirstContact ?? 0)}`
                    : "No contacted leads in range"
                }
              />
              <KpiCard
                label="Needs a call"
                value={String(me?.stalled ?? 0)}
                hint={`${me?.active ?? 0} still open · ${me?.lost ?? 0} lost`}
                tone={(me?.stalled ?? 0) > 0 ? "warn" : "good"}
              />
            </section>

            <section className="grid items-start gap-3 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <LeadTable leads={leads} />
              </div>
              <div className="lg:col-span-2">
                <ActionQueue filters={filters} />
              </div>
            </section>

            <FunnelChart leads={leads} periodLabel={range.label} />

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
