"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AircraftStep } from "@/modules/partner/components/wizard-steps/aircraft-step";
import { fetchPartnerOrgContext } from "@/modules/partner/api";

export default function PartnerAircraftPage() {
  const router = useRouter();
  const org = useQuery({ queryKey: ["partner", "org"], queryFn: fetchPartnerOrgContext });

  useEffect(() => {
    if (org.data && org.data.serviceCode !== "AVIATION") {
      router.replace("/partner");
    }
  }, [org.data, router]);

  if (org.data && org.data.serviceCode !== "AVIATION") return null;

  return (
    <div className="mx-auto max-w-2xl md:max-w-3xl">
      <AircraftStep />
    </div>
  );
}
