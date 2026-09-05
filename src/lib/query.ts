import { ALL_RANGE, DEFAULT_RANGE, MONTHS, RANGE_PRESETS, rangeForMonths } from "./data";
import type { DateRange } from "./types";

export function resolveRange(param: string | null | undefined): DateRange {
  if (!param || param === "dec" || param === "2025-12") return DEFAULT_RANGE;
  if (param === "q4" || param === "oct-dec") {
    return rangeForMonths(["2025-10", "2025-11", "2025-12"], "Oct–Dec 2025");
  }
  if (param === "all") return ALL_RANGE;
  if ((MONTHS as readonly string[]).includes(param)) {
    return RANGE_PRESETS.find((r) => r.months.length === 1 && r.months[0] === param) ?? DEFAULT_RANGE;
  }
  return DEFAULT_RANGE;
}

export function rangeParam(range: DateRange): string {
  if (range.months.length === 7) return "all";
  if (range.months.join(",") === "2025-10,2025-11,2025-12") return "q4";
  if (range.months.length === 1) return range.months[0];
  return "dec";
}

export const RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: "2025-12", label: "Dec 2025" },
  { value: "q4", label: "Oct–Dec 2025" },
  { value: "all", label: "Jun–Dec 2025" },
  { value: "2025-11", label: "Nov 2025" },
  { value: "2025-10", label: "Oct 2025" },
  { value: "2025-09", label: "Sep 2025" },
  { value: "2025-08", label: "Aug 2025" },
  { value: "2025-07", label: "Jul 2025" },
  { value: "2025-06", label: "Jun 2025" },
];
