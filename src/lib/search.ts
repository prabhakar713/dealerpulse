import { branchById, dataset, getBranch, getRep, repById } from "./data";
import type { LeadStatus } from "./types";

export type SearchKind = "branch" | "rep" | "customer";

export type SearchHit = {
  kind: SearchKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

function prettyStatus(status: LeadStatus): string {
  return status.replace(/_/g, " ");
}

function haystack(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

export function buildSearchIndex(range: string): SearchHit[] {
  const q = `?range=${range}`;
  const branches: SearchHit[] = dataset.branches.map((b) => ({
    kind: "branch",
    id: b.id,
    title: b.name,
    subtitle: `${b.city} · branch`,
    href: `/branch/${b.id}${q}`,
  }));

  const reps: SearchHit[] = dataset.sales_reps.map((r) => {
    const branch = branchById[r.branch_id];
    return {
      kind: "rep",
      id: r.id,
      title: r.name,
      subtitle: `${r.role.replace("_", " ")} · ${branch?.name ?? r.branch_id}`,
      href: `/rep/${r.id}${q}`,
    };
  });

  const customers: SearchHit[] = dataset.leads.map((l) => {
    const branch = getBranch(l.branch_id);
    const rep = getRep(l.assigned_to);
    return {
      kind: "customer",
      id: l.id,
      title: l.customer_name,
      subtitle: `${l.id} · ${l.phone} · ${l.model_interested} · ${prettyStatus(l.status)} · ${branch?.name ?? ""} · ${rep?.name ?? ""}`,
      href: `/rep/${l.assigned_to}${q}`,
    };
  });

  return [...branches, ...reps, ...customers];
}

export function searchCatalog(query: string, range: string, limit = 8): SearchHit[] {
  const index = buildSearchIndex(range);
  const q = query.trim().toLowerCase();
  if (!q) return index.filter((hit) => hit.kind === "branch").slice(0, 5);

  const scored = index
    .map((hit) => {
      const blob = haystack([hit.title, hit.subtitle, hit.id, hit.kind]);
      const extra = hit.kind === "rep" ? haystack([repById[hit.id]?.id]) : "";
      const text = `${blob} ${extra}`;
      if (!text.includes(q)) return null;
      const starts = hit.title.toLowerCase().startsWith(q) ? 0 : 1;
      const kindRank = hit.kind === "branch" ? 0 : hit.kind === "rep" ? 1 : 2;
      return { hit, starts, kindRank };
    })
    .filter((row): row is { hit: SearchHit; starts: number; kindRank: number } => row !== null)
    .sort((a, b) => a.starts - b.starts || a.kindRank - b.kindRank || a.hit.title.localeCompare(b.hit.title));

  return scored.slice(0, limit).map((row) => row.hit);
}
