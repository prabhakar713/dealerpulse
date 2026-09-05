"use client";

import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <AppShell>
      <EmptyState
        title="This page is not in DealerPulse"
        detail="That route does not exist. Use search or go back to the company overview."
        action={
          <Link href="/?range=2025-12" className="text-sm text-accent hover:underline">
            Company overview
          </Link>
        }
      />
    </AppShell>
  );
}
