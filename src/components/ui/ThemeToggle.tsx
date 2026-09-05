"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

const LABEL = {
  system: "Auto",
  light: "Light",
  dark: "Dark",
} as const;

export function ThemeToggle() {
  const { theme, resolved, cycle } = useTheme();
  const [ready, setReady] = useState(false);
  const next = theme === "system" ? "light" : theme === "light" ? "dark" : "auto";

  useEffect(() => setReady(true), []);

  return (
    <button
      type="button"
      onClick={cycle}
      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-elev px-3 py-2 text-sm text-muted hover:border-accent/40 hover:text-ink print:hidden"
      aria-label={ready ? `Theme ${LABEL[theme]}. Click for ${next}.` : "Theme"}
      title={ready ? `Theme: ${LABEL[theme]}. Next: ${next}.` : "Theme"}
      suppressHydrationWarning
    >
      {ready ? resolved === "light" ? <SunIcon /> : <MoonIcon /> : <span className="h-4 w-4" />}
      <span className="hidden sm:inline">{ready ? LABEL[theme] : "Theme"}</span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="M10 6.25a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5m0-4.5a.75.75 0 0 1 .75.75v1.25a.75.75 0 0 1-1.5 0V2.5A.75.75 0 0 1 10 1.75m0 14a.75.75 0 0 1 .75.75v1.25a.75.75 0 0 1-1.5 0V16.5a.75.75 0 0 1 .75-.75M2.5 9.25h1.25a.75.75 0 0 1 0 1.5H2.5a.75.75 0 0 1 0-1.5m14 0H17.75a.75.75 0 0 1 0 1.5H16.5a.75.75 0 0 1 0-1.5M4.22 4.22a.75.75 0 0 1 1.06 0l.88.88a.75.75 0 1 1-1.06 1.06l-.88-.88a.75.75 0 0 1 0-1.06m9.56 9.56a.75.75 0 0 1 1.06 0l.88.88a.75.75 0 1 1-1.06 1.06l-.88-.88a.75.75 0 0 1 0-1.06M4.22 15.78a.75.75 0 0 1 0-1.06l.88-.88a.75.75 0 1 1 1.06 1.06l-.88.88a.75.75 0 0 1-1.06 0m9.56-9.56a.75.75 0 0 1 0-1.06l.88-.88a.75.75 0 1 1 1.06 1.06l-.88.88a.75.75 0 0 1-1.06 0"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="M8.2 3.2a.7.7 0 0 1 .08.86 6.2 6.2 0 0 0 7.66 7.66.7.7 0 0 1 .94.94A7.6 7.6 0 1 1 7.34 3.12a.7.7 0 0 1 .86.08M6.7 5.16a6.2 6.2 0 1 0 8.14 8.14A7.6 7.6 0 0 1 6.7 5.16"
      />
    </svg>
  );
}
