import { Suspense } from "react";
import { InvitesWorkspace } from "@/modules/invites/components/invites-workspace";

export default function InvitesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <Suspense fallback={null}>
        <InvitesWorkspace />
      </Suspense>
    </div>
  );
}
