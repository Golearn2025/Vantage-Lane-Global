"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { VesselsStep } from "@/modules/partner/components/wizard-steps/vessels-step";
import { fetchPartnerOrgContext } from "@/modules/partner/api";

export default function PartnerVesselsPage() {
  const router = useRouter();
  const org = useQuery({ queryKey: ["partner", "org"], queryFn: fetchPartnerOrgContext });

  useEffect(() => {
    if (org.data && org.data.serviceCode !== "YACHT") {
      router.replace("/partner");
    }
  }, [org.data, router]);

  if (org.data && org.data.serviceCode !== "YACHT") return null;

  return (
    <div className="mx-auto max-w-2xl md:max-w-3xl">
      <VesselsStep />
    </div>
  );
}
