"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchContactRows } from "@/modules/contacts/api";
import type { ContactListFilters } from "@/modules/contacts/types";

export const contactsKeys = {
  all: ["contacts"] as const,
  list: (filters: ContactListFilters) =>
    [...contactsKeys.all, "list", filters] as const,
};

export function useContactRows(filters: ContactListFilters) {
  return useQuery({
    queryKey: contactsKeys.list(filters),
    queryFn: () => fetchContactRows(filters),
  });
}
