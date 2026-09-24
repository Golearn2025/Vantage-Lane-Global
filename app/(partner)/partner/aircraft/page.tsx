"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AircraftStep } from "@/modules/partner/components/wizard-steps/aircraft-step";
import { fetchPartnerOrgContext } from "@/modules/partner/api";
import { useAviationPartnerRole } from "@/modules/partner/hooks/use-aviation-partner-role";

export default function PartnerAircraftPage() {
  const router = useRouter();
  const org = useQuery({ queryKey: ["partner", "org"], queryFn: fetchPartnerOrgContext });
  const { role, isLoading: roleLoading } = useAviationPartnerRole();

  useEffect(() => {
    if (org.data && org.data.serviceCode !== "AVIATION") {
      router.replace("/partner");
      return;
    }
    if (!roleLoading && org.data?.serviceCode === "AVIATION") {
      if (!role) {
        router.replace("/partner/aviation-role");
      } else if (role === "BROKER") {
        router.replace("/partner");
      }
    }
  }, [org.data, role, roleLoading, router]);

  if (org.data && org.data.serviceCode !== "AVIATION") return null;
  if (roleLoading || !role || role === "BROKER") return null;

  return (
    <div className="mx-auto max-w-2xl md:max-w-3xl">
      <AircraftStep />
    </div>
  );
}
