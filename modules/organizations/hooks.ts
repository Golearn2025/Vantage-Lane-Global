"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeRelationshipStatus,
  fetchOrganizationActivities,
  fetchOrganizationBases,
  fetchOrganizationContacts,
  fetchOrganizationCoverage,
  fetchOrganizationDocuments,
  fetchOrganizationFilterCountries,
  fetchOrganizationFleet,
  fetchOrganizationOverview,
  fetchOrganizationRateCards,
  fetchOrganizationSummaries,
  fetchOrganizationSummaryPage,
  quickAddOperator,
  searchLocationsCatalog,
  type OrganizationListFilters,
} from "@/modules/organizations/api";
import { organizationsKeys } from "@/shared/lib/query/keys";
import type { QuickAddOperatorInput } from "@/modules/organizations/types";
import type { RelationshipStatus } from "@/shared/types/domain";
import { createClient } from "@/shared/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/shared/types/database";

export function useOrganizationSummaries(filters: OrganizationListFilters) {
  return useQuery({
    queryKey: organizationsKeys.list(filters),
    queryFn: () => fetchOrganizationSummaries(filters),
  });
}

export function useOrganizationSummaryPage(filters: OrganizationListFilters) {
  return useQuery({
    queryKey: organizationsKeys.list(filters),
    queryFn: () => fetchOrganizationSummaryPage(filters),
  });
}

export function useOrganizationFilterCountries() {
  return useQuery({
    queryKey: [...organizationsKeys.all, "filter-countries"] as const,
    queryFn: fetchOrganizationFilterCountries,
    staleTime: 5 * 60_000,
  });
}

export function useOrganizationOverview(organizationId: string) {
  return useQuery({
    queryKey: organizationsKeys.detail(organizationId),
    queryFn: () => fetchOrganizationOverview(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useOrganizationContacts(organizationId: string) {
  return useQuery({
    queryKey: organizationsKeys.contacts(organizationId),
    queryFn: () => fetchOrganizationContacts(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useOrganizationBases(organizationId: string) {
  return useQuery({
    queryKey: organizationsKeys.bases(organizationId),
    queryFn: () => fetchOrganizationBases(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useOrganizationCoverage(organizationId: string) {
  return useQuery({
    queryKey: organizationsKeys.coverage(organizationId),
    queryFn: () => fetchOrganizationCoverage(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useOrganizationActivities(organizationId: string) {
  return useQuery({
    queryKey: organizationsKeys.activities(organizationId),
    queryFn: () => fetchOrganizationActivities(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useOrganizationFleet(organizationId: string) {
  return useQuery({
    queryKey: organizationsKeys.fleet(organizationId),
    queryFn: () => fetchOrganizationFleet(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useOrganizationRateCards(organizationId: string) {
  return useQuery({
    queryKey: organizationsKeys.pricing(organizationId),
    queryFn: () => fetchOrganizationRateCards(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useOrganizationDocuments(organizationId: string) {
  return useQuery({
    queryKey: organizationsKeys.documents(organizationId),
    queryFn: () => fetchOrganizationDocuments(organizationId),
    enabled: Boolean(organizationId),
  });
}

export function useLocationsCatalog(q: string) {
  return useQuery({
    queryKey: organizationsKeys.locationsCatalog(q),
    queryFn: () => searchLocationsCatalog(q),
  });
}

export function useQuickAddOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: QuickAddOperatorInput) => quickAddOperator(input),
    onSuccess: async (result) => {
      if (result.created) {
        await queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
      }
    },
  });
}

export function useChangeRelationshipStatus(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { newStatus: RelationshipStatus; note?: string }) =>
      changeRelationshipStatus({
        organizationId,
        newStatus: params.newStatus,
        note: params.note,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.detail(organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.activities(organizationId),
        }),
        queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() }),
      ]);
      toast.success("Relationship status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not update relationship status");
    },
  });
}

export function useUpsertContact(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id?: string;
      full_name: string;
      contact_type?: string | null;
      title?: string | null;
      email?: string | null;
      phone_e164?: string | null;
      whatsapp_e164?: string | null;
      is_primary?: boolean;
    }) => {
      const supabase = createClient();
      if (payload.id) {
        const { error } = await supabase
          .from("organization_contacts")
          .update({
            full_name: payload.full_name,
            contact_type: payload.contact_type ?? undefined,
            title: payload.title ?? undefined,
            email: payload.email ?? undefined,
            phone_e164: payload.phone_e164 ?? undefined,
            whatsapp_e164: payload.whatsapp_e164 ?? undefined,
            is_primary: payload.is_primary ?? false,
          })
          .eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("organization_contacts").insert({
          organization_id: organizationId,
          full_name: payload.full_name,
          contact_type: payload.contact_type || "Other",
          title: payload.title ?? undefined,
          email: payload.email ?? undefined,
          phone_e164: payload.phone_e164 ?? undefined,
          whatsapp_e164: payload.whatsapp_e164 ?? undefined,
          is_primary: payload.is_primary ?? false,
        });
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.contacts(organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.detail(organizationId),
        }),
      ]);
      toast.success("Contact saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useArchiveContact(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contactId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("organization_contacts")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", contactId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationsKeys.contacts(organizationId),
      });
      toast.success("Contact archived");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpsertBase(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id?: string;
      label: string;
      city?: string | null;
      country_code?: string | null;
      address_line1?: string | null;
      is_primary?: boolean;
      location_kind?: "HQ" | "OPS_BASE" | "DEPOT" | "OTHER";
      lat?: number | null;
      lng?: number | null;
      google_place_id?: string | null;
    }) => {
      const supabase = createClient();
      if (payload.is_primary) {
        await supabase
          .from("organization_locations")
          .update({ is_primary: false })
          .eq("organization_id", organizationId)
          .is("archived_at", null);
      }
      const row = {
        label: payload.label,
        city: payload.city ?? null,
        country_code: payload.country_code ?? null,
        address_line1: payload.address_line1 ?? null,
        is_primary: payload.is_primary ?? false,
        location_kind: payload.location_kind ?? "OPS_BASE",
        lat: payload.lat ?? null,
        lng: payload.lng ?? null,
        google_place_id: payload.google_place_id ?? null,
      };
      if (payload.id) {
        const { error } = await supabase
          .from("organization_locations")
          .update(row)
          .eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("organization_locations").insert({
          organization_id: organizationId,
          ...row,
        });
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.bases(organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.detail(organizationId),
        }),
        queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() }),
      ]);
      toast.success("Base saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useArchiveBase(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (baseId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("organization_locations")
        .update({ archived_at: new Date().toISOString(), is_primary: false })
        .eq("id", baseId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.bases(organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.detail(organizationId),
        }),
        queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() }),
      ]);
      toast.success("Base archived");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAddCoverage(organizationId: string, offeringId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      locationId: string;
      coverageMode: Database["public"]["Enums"]["coverage_mode"];
      radiusKm?: number | null;
    }) => {
      if (!offeringId) throw new Error("No offering available for coverage");
      const supabase = createClient();
      const radiusKm = payload.radiusKm ?? null;
      const { error } = await supabase.from("offering_coverages").insert({
        organization_id: organizationId,
        offering_id: offeringId,
        location_id: payload.locationId,
        coverage_mode: payload.coverageMode,
        radius_value: radiusKm,
        radius_unit: radiusKm != null ? "KM" : null,
        is_informational_only: false,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.coverage(organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.detail(organizationId),
        }),
        queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() }),
      ]);
      toast.success("Coverage added");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useArchiveCoverage(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coverageId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("offering_coverages")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", coverageId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.coverage(organizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: organizationsKeys.detail(organizationId),
        }),
      ]);
      toast.success("Coverage archived");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const supabase = createClient();
      // Delete child records first (cascade may not cover all tables in RLS context)
      await supabase.from("offering_coverages").delete().eq("organization_id", organizationId);
      await supabase.from("organization_locations").delete().eq("organization_id", organizationId);
      await supabase.from("organization_contacts").delete().eq("organization_id", organizationId);
      await supabase.from("activities").delete().eq("organization_id", organizationId);
      await supabase.from("communications").delete().eq("organization_id", organizationId);
      // Delete offerings then org
      const { data: offerings } = await supabase
        .from("offerings")
        .select("id")
        .eq("organization_id", organizationId);
      if (offerings?.length) {
        for (const offering of offerings) {
          await supabase.from("offering_coverages").delete().eq("offering_id", offering.id);
        }
        await supabase.from("offerings").delete().eq("organization_id", organizationId);
      }
      const { error } = await supabase
        .from("organizations")
        .delete()
        .eq("id", organizationId);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
      toast.success("Organization deleted permanently");
    },
    onError: (error: Error) => toast.error(error.message || "Could not delete organization"),
  });
}

export function useLogCommunication(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      channel: "WHATSAPP" | "EMAIL";
      action_type:
        | "OPEN_WHATSAPP"
        | "COPY_WHATSAPP"
        | "OPEN_EMAIL"
        | "COPY_EMAIL";
      contact_id?: string | null;
      body_snapshot?: string | null;
      subject?: string | null;
    }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: communication, error } = await supabase
        .from("communications")
        .insert({
          organization_id: organizationId,
          channel: payload.channel,
          action_type: payload.action_type,
          contact_id: payload.contact_id ?? null,
          body_snapshot: payload.body_snapshot ?? null,
          subject: payload.subject ?? null,
          actor_user_id: user.id,
        })
        .select("id")
        .single();
      if (error) throw error;

      await supabase.from("activities").insert({
        organization_id: organizationId,
        actor_user_id: user.id,
        activity_type: "communication.logged",
        summary: `${payload.action_type.replaceAll("_", " ").toLowerCase()}`,
        visibility: "VL_ONLY",
        communication_id: communication.id,
        contact_id: payload.contact_id ?? null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: organizationsKeys.activities(organizationId),
      });
    },
  });
}
