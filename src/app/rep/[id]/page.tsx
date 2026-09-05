import { Suspense } from "react";
import { RepDashboard } from "@/components/dashboard/RepDashboard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default async function RepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <RepDashboard repId={id} />
    </Suspense>
  );
}
