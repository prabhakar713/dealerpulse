"use client";

import { use } from "react";
import { BranchDashboard } from "@/components/dashboard/BranchDashboard";

export default function BranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <BranchDashboard branchId={id} />;
}
