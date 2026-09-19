"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listInviteLeads, sendNetworkInvites } from "@/modules/invites/api";

export function useInviteLeads(filters: {
  serviceCode?: string;
  q?: string;
  onlyWithEmail?: boolean;
}) {
  return useQuery({
    queryKey: ["invite-leads", filters],
    queryFn: () => listInviteLeads(filters),
  });
}

export function useSendNetworkInvites() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendNetworkInvites,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["invite-leads"] });
    },
  });
}
