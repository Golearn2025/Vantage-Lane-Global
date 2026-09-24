import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchOnboardingInventory,
  fetchPartnerOrgContext,
  saveOnboardingInventoryStep,
} from "@/modules/partner/api";

export function useOnboardingInventoryStep<T>(stepKey: string, defaults: T) {
  const queryClient = useQueryClient();
  const orgQ = useQuery({
    queryKey: ["partner", "org"],
    queryFn: fetchPartnerOrgContext,
  });
  const offeringId = orgQ.data?.offeringId;
  const invQ = useQuery({
    queryKey: ["partner", "inventory", offeringId],
    queryFn: () => fetchOnboardingInventory(offeringId!),
    enabled: Boolean(offeringId),
  });

  const [value, setValue] = useState<T>(defaults);
  const hydrated = useRef(false);

  useEffect(() => {
    hydrated.current = false;
  }, [offeringId, stepKey]);

  useEffect(() => {
    if (hydrated.current || !invQ.data) return;
    const saved = invQ.data[stepKey];
    if (saved != null) {
      setValue(saved as T);
    }
    hydrated.current = true;
  }, [invQ.data, stepKey]);

  const save = useMutation({
    mutationFn: async () => {
      if (!offeringId) throw new Error("No offering");
      return saveOnboardingInventoryStep(offeringId, stepKey, value);
    },
    onSuccess: async () => {
      toast.success("Saved");
      await queryClient.invalidateQueries({
        queryKey: ["partner", "inventory", offeringId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not save");
    },
  });

  return {
    value,
    setValue,
    save,
    isLoading: orgQ.isLoading || invQ.isLoading,
    isReady: Boolean(offeringId) && !invQ.isLoading,
  };
}
