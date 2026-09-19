import { Suspense } from "react";
import { JoinSetupForm } from "@/modules/partner/components/join-setup-form";

export default function JoinSetupPage() {
  return (
    <Suspense fallback={null}>
      <JoinSetupForm />
    </Suspense>
  );
}
