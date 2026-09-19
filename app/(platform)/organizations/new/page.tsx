import { Suspense } from "react";
import { QuickAddOperatorForm } from "@/modules/organizations/components/quick-add-form";
import { Skeleton } from "@/shared/ui/skeleton";

export default function NewOrganizationPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <QuickAddOperatorForm />
    </Suspense>
  );
}
