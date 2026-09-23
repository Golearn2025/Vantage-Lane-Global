import { Suspense } from "react";
import { CoverageWorkspace } from "@/modules/coverage/components/coverage-workspace";
import { Skeleton } from "@/shared/ui/skeleton";

export default function CoveragePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <CoverageWorkspace />
    </Suspense>
  );
}
