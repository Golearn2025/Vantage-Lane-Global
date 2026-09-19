"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PartnerRatesForm } from "@/modules/partner/components/rates-form";
import { fetchPartnerOrgContext } from "@/modules/partner/api";

export default function PartnerRatesPage() {
  const router = useRouter();
  const org = useQuery({
    queryKey: ["partner", "org"],
    queryFn: fetchPartnerOrgContext,
  });

  useEffect(() => {
    if (
      org.data &&
      org.data.serviceCode !== "GROUND_TRANSPORTATION"
    ) {
      router.replace("/partner");
    }
  }, [org.data, router]);

  if (
    org.data &&
    org.data.serviceCode !== "GROUND_TRANSPORTATION"
  ) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl md:max-w-3xl">
      <PartnerRatesForm />
    </div>
  );
}
