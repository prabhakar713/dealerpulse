"use client";

import dynamic from "next/dynamic";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

const OverviewDashboard = dynamic(
  () => import("@/components/dashboard/OverviewDashboard").then((m) => m.OverviewDashboard),
  { ssr: false, loading: () => <DashboardSkeleton /> },
);

export default function Home() {
  return <OverviewDashboard />;
}
