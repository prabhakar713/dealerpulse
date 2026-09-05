"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { actionableInsights } from "@/lib/aggregations";
import { dataset } from "@/lib/data";
import type { Filters } from "@/lib/types";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { SeverityPill } from "../ui/StatusPill";

export function ActionQueue({ filters }: { filters: Filters }) {
  const params = useSearchParams();
  const range = params.get("range") ?? "2025-12";
  const withRange = (href?: string) =>
    href ? `${href}${href.includes("?") ? "&" : "?"}range=${range}` : undefined;
  const items = actionableInsights(dataset, filters);
  const soWhat = items.length
    ? `${items.length} named actions — call, chase delivery, or coach. Not a chart.`
    : "No stalled leads or missed-target branches in this slice.";

  return (
    <Card title="Do this today" soWhat={soWhat}>
      {items.length === 0 ? (
        <EmptyState
          title="Queue is clear for this filter"
          detail="Try a wider date range, or switch to CEO view to see group-wide follow-ups."
        />
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-line bg-soft/50 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <SeverityPill severity={item.severity} />
              </div>
              <p className="mt-1 text-xs leading-5 text-muted">{item.why}</p>
              <p className="mt-1.5 text-xs font-medium text-accent">{item.action}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                <span>{item.meta}</span>
                {item.phone && (
                  <a className="rounded-full bg-accent/15 px-2 py-0.5 text-accent" href={`tel:${item.phone}`}>
                    Call {item.phone}
                  </a>
                )}
                {item.href && (
                  <Link className="underline decoration-line underline-offset-2 hover:text-ink" href={withRange(item.href)!}>
                    Open scorecard
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
