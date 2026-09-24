"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchOnboardingInventory,
  fetchPartnerOrgContext,
} from "@/modules/partner/api";
import {
  AVIATION_ROLE_STEP_KEY,
  type AviationPartnerRole,
  type AviationRoleInventory,
} from "@/modules/partner/aviation-role";

export function useAviationPartnerRole() {
  const orgQ = useQuery({
    queryKey: ["partner", "org"],
    queryFn: fetchPartnerOrgContext,
  });
  const offeringId = orgQ.data?.offeringId;
  const isAviation = orgQ.data?.serviceCode === "AVIATION";

  const invQ = useQuery({
    queryKey: ["partner", "inventory", offeringId],
    queryFn: () => fetchOnboardingInventory(offeringId!),
    enabled: Boolean(offeringId) && isAviation,
  });

  const raw = invQ.data?.[AVIATION_ROLE_STEP_KEY] as
    | AviationRoleInventory
    | undefined;
  const role = (raw?.role || "") as AviationPartnerRole | "";

  return {
    role,
    inventory: raw ?? null,
    isLoading: orgQ.isLoading || (isAviation && invQ.isLoading),
    isAviation,
    organizationId: orgQ.data?.organizationId,
  };
}
