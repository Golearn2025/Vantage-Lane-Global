"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PartnerRatesForm } from "@/modules/partner/components/rates-form";
import { useAviationPartnerRole } from "@/modules/partner/hooks/use-aviation-partner-role";

export default function PartnerRatesPage() {
  const router = useRouter();
  const { isAviation, role, isLoading } = useAviationPartnerRole();

  useEffect(() => {
    if (isLoading || !isAviation) return;
    if (!role) {
      router.replace("/partner/aviation-role");
    } else if (role === "BROKER") {
      router.replace("/partner");
    }
  }, [isAviation, role, isLoading, router]);

  if (isAviation && (isLoading || !role || role === "BROKER")) return null;

  return (
    <div className="mx-auto max-w-2xl md:max-w-3xl">
      <PartnerRatesForm />
    </div>
  );
}
