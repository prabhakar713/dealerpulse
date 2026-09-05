"use client";

import dynamic from "next/dynamic";
import { use } from "react";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

const BranchDashboard = dynamic(
  () => import("@/components/dashboard/BranchDashboard").then((m) => m.BranchDashboard),
  { ssr: false, loading: () => <DashboardSkeleton /> },
);

export default function BranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <BranchDashboard branchId={id} />;
}
