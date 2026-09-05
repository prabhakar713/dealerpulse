"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { searchCatalog, type SearchHit } from "@/lib/search";

export function CommandSearch({ rangeValue }: { rangeValue: string }) {
  const router = useRouter();
  const dialogId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [chord, setChord] = useState("Ctrl+K");

  const hits = useMemo(() => searchCatalog(query, rangeValue), [query, rangeValue]);

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setChord("⌘K");
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const inField = e.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "/" && !inField && !open) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
      triggerRef.current?.focus();
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  function go(hit: SearchHit) {
    setOpen(false);
    router.push(hit.href);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-elev px-3 py-2 text-left text-sm text-muted hover:border-accent/40 hover:text-ink sm:min-w-[14rem]"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
      >
        <SearchIcon />
        <span className="min-w-0 flex-1 truncate">Search</span>
        <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[10px] text-muted sm:inline">
          {chord}
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-bg/70 px-4 pt-[12vh] backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-label="Search DealerPulse"
            className="card relative z-10 mx-auto w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-line px-3">
              <SearchIcon />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((i) => Math.min(hits.length - 1, i + 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((i) => Math.max(0, i - 1));
                  } else if (e.key === "Enter" && hits[active]) {
                    e.preventDefault();
                    go(hits[active]);
                  }
                }}
                placeholder="Branch, rep, customer, phone…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted"
                aria-autocomplete="list"
                aria-controls={`${dialogId}-list`}
                aria-activedescendant={hits[active] ? `${dialogId}-${hits[active].id}` : undefined}
              />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-muted">Esc</kbd>
            </div>
            <ul id={`${dialogId}-list`} role="listbox" className="max-h-80 overflow-y-auto p-2">
              {hits.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted">No matches in this book.</li>
              ) : (
                hits.map((hit, i) => (
                  <li key={`${hit.kind}-${hit.id}`} role="option" id={`${dialogId}-${hit.id}`} aria-selected={i === active}>
                    <Link
                      href={hit.href}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActive(i)}
                      className={`block rounded-xl px-3 py-2 ${i === active ? "bg-soft" : ""}`}
                    >
                      <p className="text-sm font-medium text-ink">{hit.title}</p>
                      <p className="text-[11px] capitalize text-muted">{hit.subtitle}</p>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            <p className="border-t border-line px-3 py-2 text-[11px] text-muted">
              {query ? "Customers open their assigned rep." : "Type to find a branch, officer, or customer."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-muted" aria-hidden>
      <path
        fill="currentColor"
        d="M8.5 3a5.5 5.5 0 0 1 4.38 8.82l3.15 3.15a.75.75 0 1 1-1.06 1.06l-3.15-3.15A5.5 5.5 0 1 1 8.5 3m0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8"
      />
    </svg>
  );
}
