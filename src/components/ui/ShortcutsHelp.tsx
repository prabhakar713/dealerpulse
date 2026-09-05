"use client";

import { useEffect, useId, useState } from "react";

const ROWS = [
  { keys: "Ctrl K / ⌘K", action: "Search branches, reps, customers" },
  { keys: "/", action: "Open search" },
  { keys: "?", action: "This list" },
  { keys: "Esc", action: "Close a dialog" },
];

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const dialogId = useId();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const inField =
        e.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName);
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !inField) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-bg/70 px-4 pt-[18vh] backdrop-blur-sm print:hidden">
      <button
        type="button"
        aria-label="Close shortcuts"
        className="absolute inset-0 cursor-default"
        onClick={() => setOpen(false)}
      />
      <div
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        className="card relative z-10 mx-auto w-full max-w-sm p-4 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Shortcuts</h2>
          <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-muted">Esc</kbd>
        </div>
        <ul className="space-y-2 text-sm">
          {ROWS.map((row) => (
            <li key={row.keys} className="flex items-center justify-between gap-3">
              <span className="text-muted">{row.action}</span>
              <kbd className="shrink-0 rounded-md border border-line px-1.5 py-0.5 text-[11px] text-ink">
                {row.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
