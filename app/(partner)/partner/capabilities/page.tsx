"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CapabilitiesStep } from "@/modules/partner/components/wizard-steps/capabilities-step";
import { fetchPartnerOrgContext } from "@/modules/partner/api";

export default function PartnerCapabilitiesPage() {
  const router = useRouter();
  const org = useQuery({ queryKey: ["partner", "org"], queryFn: fetchPartnerOrgContext });

  useEffect(() => {
    if (org.data && org.data.serviceCode !== "EVENTS") {
      router.replace("/partner");
    }
  }, [org.data, router]);

  if (org.data && org.data.serviceCode !== "EVENTS") return null;

  return (
    <div className="mx-auto max-w-2xl md:max-w-3xl">
      <CapabilitiesStep />
    </div>
  );
}
