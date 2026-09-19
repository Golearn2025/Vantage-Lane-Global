import { Suspense } from "react";
import { NetworkExplorer } from "@/modules/network/components/network-explorer";
import { Skeleton } from "@/shared/ui/skeleton";

export default function NetworkPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-72 w-full" />
        </div>
      }
    >
      <NetworkExplorer />
    </Suspense>
  );
}
