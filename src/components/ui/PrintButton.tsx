"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl border border-line bg-elev px-3 py-2 text-sm text-muted hover:border-accent/40 hover:text-ink print:hidden"
    >
      Print
    </button>
  );
}
