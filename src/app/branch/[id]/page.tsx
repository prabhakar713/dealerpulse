import { Suspense } from "react";
import { BranchDashboard } from "@/components/dashboard/BranchDashboard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default async function BranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <BranchDashboard branchId={id} />
    </Suspense>
  );
}
