"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase/client";
import { organizationsKeys } from "@/shared/lib/query/keys";

function invalidateOrgLists(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() });
}

export function useOrganizationsListRealtime(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    const channel = supabase
      .channel("organizations-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "organizations" },
        () => invalidateOrgLists(queryClient),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partnerships" },
        () => invalidateOrgLists(queryClient),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offerings" },
        () => invalidateOrgLists(queryClient),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "follow_ups" },
        () => invalidateOrgLists(queryClient),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}

export function useOrganizationProfileRealtime(organizationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!organizationId) return;
    const supabase = createClient();
    const filter = `organization_id=eq.${organizationId}`;

    const invalidateDetail = () => {
      void queryClient.invalidateQueries({
        queryKey: organizationsKeys.detail(organizationId),
      });
    };

    const channel = supabase
      .channel(`organization-profile:${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "organizations",
          filter: `id=eq.${organizationId}`,
        },
        invalidateDetail,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partnerships", filter },
        () => {
          invalidateDetail();
          void queryClient.invalidateQueries({
            queryKey: organizationsKeys.lists(),
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offerings", filter },
        invalidateDetail,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "organization_contacts", filter },
        () => {
          void queryClient.invalidateQueries({
            queryKey: organizationsKeys.contacts(organizationId),
          });
          invalidateDetail();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "organization_locations",
          filter,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: organizationsKeys.bases(organizationId),
          });
          invalidateDetail();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offering_coverages", filter },
        () => {
          void queryClient.invalidateQueries({
            queryKey: organizationsKeys.coverage(organizationId),
          });
          invalidateDetail();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activities", filter },
        () => {
          void queryClient.invalidateQueries({
            queryKey: organizationsKeys.activities(organizationId),
          });
          invalidateDetail();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "communications", filter },
        () => {
          void queryClient.invalidateQueries({
            queryKey: organizationsKeys.activities(organizationId),
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "follow_ups", filter },
        invalidateDetail,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [organizationId, queryClient]);
}
