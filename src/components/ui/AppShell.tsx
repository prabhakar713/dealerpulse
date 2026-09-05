"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { dataset, getBranch, getRep } from "@/lib/data";
import { RANGE_OPTIONS } from "@/lib/query";
import { CommandSearch } from "./CommandSearch";
import { CopyLink } from "./CopyLink";

export function AppShell({
  children,
  scopeBranchId,
  rangeValue = "2025-12",
}: {
  children: ReactNode;
  scopeBranchId?: string;
  rangeValue?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const crumbs = breadcrumbs(pathname, rangeValue);

  useEffect(() => {
    const current = crumbs[crumbs.length - 1]?.label ?? "Overview";
    document.title = `${current} · DealerPulse`;
  }, [crumbs]);

  function setRange(next: string) {
    router.push(`${pathname}?range=${next}`);
  }

  function setScope(value: string) {
    const q = `range=${rangeValue}`;
    if (value === "ceo") router.push(`/?${q}`);
    else router.push(`/branch/${value}?${q}`);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink" suppressHydrationWarning>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-bg"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-20 border-b border-line/80 bg-bg/85 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href={`/?range=${rangeValue}`} className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-xs font-bold text-bg">
              DP
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight">DealerPulse</span>
              <span className="block text-[11px] text-muted">As of 31 Dec 2025</span>
            </span>
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <CommandSearch rangeValue={rangeValue} />
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-elev px-3 py-2 text-xs sm:w-auto sm:min-w-[16rem]">
              <span className="shrink-0 text-muted">Viewing as</span>
              <select
                className="min-w-0 flex-1 bg-elev text-sm text-ink outline-none"
                value={scopeBranchId ?? "ceo"}
                onChange={(e) => setScope(e.target.value)}
                aria-label="Viewing as"
              >
                <option value="ceo">CEO · all branches</option>
                {dataset.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} · {b.city}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-elev px-3 py-2 text-xs sm:w-auto sm:min-w-[12rem]">
              <span className="shrink-0 text-muted">Period</span>
              <select
                className="min-w-0 flex-1 bg-elev text-sm text-ink outline-none"
                value={rangeValue}
                onChange={(e) => setRange(e.target.value)}
                aria-label="Period"
              >
                {RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <CopyLink />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="pt-5 print:pt-2">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
            {crumbs.map((crumb, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden>/</span>}
                  {last ? (
                    <span className="text-ink" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-ink">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <main id="main" className="py-5 sm:py-6">
          {children}
        </main>
      </div>

      <footer className="mt-auto border-t border-line/80 print:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-[11px] leading-5 text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Jun–Dec 2025 book · {dataset.leads.length} leads · {dataset.branches.length} branches ·{" "}
            {dataset.sales_reps.length} people
          </p>
          <p>Clock is 31 Dec 2025. Period filters history; the live queue is the open book.</p>
        </div>
      </footer>
    </div>
  );
}

function breadcrumbs(pathname: string, range: string) {
  const q = `?range=${range}`;
  const crumbs = [{ href: `/${q}`, label: "Company" }];
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] === "branch" && parts[1]) {
    const branch = getBranch(parts[1]);
    crumbs.push({ href: `/branch/${parts[1]}${q}`, label: branch?.name ?? "Unknown branch" });
  }

  if (parts[0] === "rep" && parts[1]) {
    const rep = getRep(parts[1]);
    const branch = rep ? getBranch(rep.branch_id) : undefined;
    if (branch) crumbs.push({ href: `/branch/${branch.id}${q}`, label: branch.name });
    crumbs.push({ href: `/rep/${parts[1]}${q}`, label: rep?.name ?? "Unknown rep" });
  }

  return crumbs;
}
