import { Suspense } from "react";
import { WorkspaceClient } from "@/components/WorkspaceClient";

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="text-[var(--muted)]">Loading workspace...</p>
        </div>
      }
    >
      <WorkspaceClient />
    </Suspense>
  );
}
