"use client";

import { use } from "react";
import { RepDashboard } from "@/components/dashboard/RepDashboard";

export default function RepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <RepDashboard repId={id} />;
}
