"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { dataset, NOW_ISO } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { RANGE_OPTIONS } from "@/lib/query";

export function AppShell({
  children,
  scopeBranchId,
}: {
  children: React.ReactNode;
  scopeBranchId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const range = params.get("range") ?? "2025-12";

  function setRange(next: string) {
    const q = new URLSearchParams(params.toString());
    q.set("range", next);
    router.push(`${pathname}?${q.toString()}`);
  }

  function setScope(value: string) {
    const q = new URLSearchParams(params.toString());
    if (!q.get("range")) q.set("range", range);
    if (value === "ceo") router.push(`/?${q.toString()}`);
    else router.push(`/branch/${value}?${q.toString()}`);
  }

  return (
    <div className="min-h-full bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href={`/?range=${range}`} className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-xs font-bold text-bg">
                DP
              </span>
              <span>
                <span className="block text-sm font-semibold tracking-tight">DealerPulse</span>
                <span className="block text-[11px] text-muted">As of {formatDate(NOW_ISO)}</span>
              </span>
            </Link>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-elev px-3 py-2 text-xs sm:flex-none">
              <span className="shrink-0 text-muted">Viewing as</span>
              <select
                className="w-full bg-transparent text-sm text-ink outline-none"
                value={scopeBranchId ?? "ceo"}
                onChange={(e) => setScope(e.target.value)}
              >
                <option value="ceo">CEO · all branches</option>
                {dataset.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} · {b.city}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-elev px-3 py-2 text-xs sm:flex-none">
              <span className="shrink-0 text-muted">Period</span>
              <select
                className="w-full bg-transparent text-sm text-ink outline-none"
                value={range}
                onChange={(e) => setRange(e.target.value)}
              >
                {RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
