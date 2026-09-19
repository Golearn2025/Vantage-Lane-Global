import { Suspense } from "react";
import { ContactsWorkspace } from "@/modules/contacts/components/contacts-workspace";
import { Skeleton } from "@/shared/ui/skeleton";

export default function ContactsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-72 w-full" />
        </div>
      }
    >
      <ContactsWorkspace />
    </Suspense>
  );
}
