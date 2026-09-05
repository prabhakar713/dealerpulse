"use client";

import dynamic from "next/dynamic";
import { use } from "react";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

const RepDashboard = dynamic(
  () => import("@/components/dashboard/RepDashboard").then((m) => m.RepDashboard),
  { ssr: false, loading: () => <DashboardSkeleton /> },
);

export default function RepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <RepDashboard repId={id} />;
}
