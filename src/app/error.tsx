"use client";

import { AppShell } from "@/components/ui/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <AppShell>
      <EmptyState
        title="This view failed to load"
        detail="Reload the page or go back to the company overview. The dataset is local, so this is a UI fault, not a missing feed."
        action={
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-bg"
          >
            Try again
          </button>
        }
      />
    </AppShell>
  );
}
