import { Suspense } from "react";
import { JoinCheckEmail } from "@/modules/partner/components/join-check-email";

export default function JoinCheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <JoinCheckEmail />
    </Suspense>
  );
}
