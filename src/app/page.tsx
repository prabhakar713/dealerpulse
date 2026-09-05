import { Suspense } from "react";
import { OverviewDashboard } from "@/components/dashboard/OverviewDashboard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function Home() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <OverviewDashboard />
    </Suspense>
  );
}
