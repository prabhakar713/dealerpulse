"use client";

import dynamic from "next/dynamic";

const fallback = <div className="card h-72 animate-pulse" />;

export const FunnelChart = dynamic(
  () => import("./FunnelChart").then((m) => m.FunnelChart),
  { ssr: false, loading: () => fallback },
);

export const TrendChart = dynamic(
  () => import("./TrendChart").then((m) => m.TrendChart),
  { ssr: false, loading: () => fallback },
);

export const ReasonBars = dynamic(
  () => import("./ReasonBars").then((m) => m.ReasonBars),
  { ssr: false, loading: () => fallback },
);

export const AgingChart = dynamic(
  () => import("./AgingChart").then((m) => m.AgingChart),
  { ssr: false, loading: () => fallback },
);
