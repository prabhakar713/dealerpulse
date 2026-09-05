export function KpiCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const bar =
    tone === "good"
      ? "bg-good"
      : tone === "warn"
        ? "bg-warn"
        : tone === "bad"
          ? "bg-bad"
          : "bg-accent/70";

  return (
    <article className="card relative overflow-hidden p-4">
      <span className={`absolute inset-x-0 top-0 h-0.5 ${bar}`} />
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">{value}</p>
      {hint && <p className="mt-1.5 text-xs leading-5 text-muted">{hint}</p>}
    </article>
  );
}
