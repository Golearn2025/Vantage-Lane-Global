"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listBookerLeads, sendBookerEmails } from "@/modules/bookers/api";

export function useBookerLeads(filters: {
  serviceCode?: string;
  q?: string;
  onlyWithEmail?: boolean;
}) {
  return useQuery({
    queryKey: ["booker-leads", filters],
    queryFn: () => listBookerLeads(filters),
  });
}

export function useSendBookerEmails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendBookerEmails,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["booker-leads"] });
    },
  });
}
