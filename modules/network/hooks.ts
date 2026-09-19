"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import {
  fetchNetworkOrganizations,
  fetchPlaceSuppliers,
  searchNetworkLocations,
} from "@/modules/network/api";
import { networkKeys } from "@/shared/lib/query/keys";

export function useNetworkLocationSearch(q: string) {
  return useQuery({
    queryKey: networkKeys.locations(q),
    queryFn: () => searchNetworkLocations(q),
  });
}

export function usePlaceSuppliers(locationId: string | null) {
  return useQuery({
    queryKey: networkKeys.place(locationId ?? "none"),
    queryFn: () => fetchPlaceSuppliers(locationId!),
    enabled: Boolean(locationId),
  });
}

export function useNetworkOrganizations(enabled = false) {
  return useQuery({
    queryKey: networkKeys.organizations(),
    queryFn: fetchNetworkOrganizations,
    enabled,
  });
}

export function useNetworkPlaceRealtime(locationId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!locationId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`network-place:${locationId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offering_coverages" },
        () => {
          void queryClient.invalidateQueries({
            queryKey: networkKeys.place(locationId),
          });
          void queryClient.invalidateQueries({
            queryKey: networkKeys.organizations(),
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partnerships" },
        () => {
          void queryClient.invalidateQueries({
            queryKey: networkKeys.place(locationId),
          });
          void queryClient.invalidateQueries({
            queryKey: networkKeys.organizations(),
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offerings" },
        () => {
          void queryClient.invalidateQueries({
            queryKey: networkKeys.place(locationId),
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "organizations" },
        () => {
          void queryClient.invalidateQueries({
            queryKey: networkKeys.place(locationId),
          });
          void queryClient.invalidateQueries({
            queryKey: networkKeys.organizations(),
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [locationId, queryClient]);
}
