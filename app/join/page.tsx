import { Suspense } from "react";
import JoinSignupClient from "@/modules/partner/components/join-signup-form";

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinSignupClient />
    </Suspense>
  );
}
