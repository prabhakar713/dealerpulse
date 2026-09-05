"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme-boot";

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const ThemeContext = createContext<{
  theme: ThemeChoice;
  resolved: ResolvedTheme;
  setTheme: (next: ThemeChoice) => void;
  cycle: () => void;
} | null>(null);

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function readChoice(): ThemeChoice {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function apply(choice: ThemeChoice): ResolvedTheme {
  const resolved = choice === "system" ? systemTheme() : choice;
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolved === "light" ? "#f3f4f7" : "#0b0d11");
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");

  useEffect(() => {
    const choice = readChoice();
    setThemeState(choice);
    setResolved(apply(choice));

    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      const current = readChoice();
      if (current === "system") setResolved(apply(current));
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next: ThemeChoice) => {
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setThemeState(next);
    setResolved(apply(next));
  }, []);

  const cycle = useCallback(() => {
    setTheme(theme === "system" ? "light" : theme === "light" ? "dark" : "system");
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, resolved, setTheme, cycle }),
    [theme, resolved, setTheme, cycle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export function useChartTheme() {
  const { resolved } = useTheme();
  return useMemo(() => {
    if (typeof window === "undefined") {
      return {
        background: resolved === "light" ? "#ffffff" : "#12151c",
        border: `1px solid ${resolved === "light" ? "#d5dae3" : "#262c38"}`,
        borderRadius: 12,
        color: resolved === "light" ? "#141820" : "#eef1f6",
        muted: resolved === "light" ? "#5c6578" : "#8b93a7",
      };
    }
    const s = getComputedStyle(document.documentElement);
    return {
      background: s.getPropertyValue("--bg-elev").trim(),
      border: `1px solid ${s.getPropertyValue("--line").trim()}`,
      borderRadius: 12,
      color: s.getPropertyValue("--text").trim(),
      muted: s.getPropertyValue("--muted").trim(),
    };
  }, [resolved]);
}
