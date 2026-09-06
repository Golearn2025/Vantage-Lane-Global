import { Suspense } from "react";
import { OrganizationsTable } from "@/modules/organizations/components/organizations-table";
import { Skeleton } from "@/shared/ui/skeleton";

export default function OrganizationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <OrganizationsTable />
    </Suspense>
  );
}
