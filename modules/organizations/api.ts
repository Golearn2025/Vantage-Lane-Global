"use client";

import { createClient } from "@/shared/lib/supabase/client";
import {
  mapActivity,
  mapBase,
  mapContact,
  mapCoverage,
  mapLocationCatalog,
  mapOrganizationOverview,
  mapOrganizationSummary,
  mapQuickAddResult,
  toQuickAddPayload,
} from "@/modules/organizations/mappers";
import type {
  OrganizationActivity,
  OrganizationBase,
  OrganizationContact,
  OrganizationCoverage,
  OrganizationOverview,
  OrganizationSummary,
  QuickAddOperatorInput,
  QuickAddOperatorResult,
  LocationCatalogItem,
} from "@/modules/organizations/types";
import type {
  OperationalStatus,
  RelationshipStatus,
} from "@/shared/types/domain";

export type OrganizationListFilters = {
  q?: string;
  relationshipStatus?: RelationshipStatus | "all";
  operationalStatus?: OperationalStatus | "all";
  country?: string | "all";
  testFilter?: "all" | "test" | "real";
  includeArchived?: boolean;
};

export async function fetchOrganizationSummaries(
  filters: OrganizationListFilters = {},
): Promise<OrganizationSummary[]> {
  const supabase = createClient();
  let query = supabase.from("v_organization_summary").select("*");

  if (!filters.includeArchived) {
    query = query.is("archived_at", null);
  }

  if (filters.relationshipStatus && filters.relationshipStatus !== "all") {
    query = query.eq("relationship_status", filters.relationshipStatus);
  }
  if (filters.operationalStatus && filters.operationalStatus !== "all") {
    query = query.eq("operational_status", filters.operationalStatus);
  }
  if (filters.country && filters.country !== "all") {
    query = query.eq("legal_country_code", filters.country);
  }
  if (filters.testFilter === "test") {
    query = query.eq("is_test", true);
  } else if (filters.testFilter === "real") {
    query = query.eq("is_test", false);
  }

  const { data, error } = await query.order("display_name", { ascending: true });
  if (error) throw error;

  let rows = (data ?? [])
    .map(mapOrganizationSummary)
    .filter((row): row is OrganizationSummary => row !== null);

  if (filters.q?.trim()) {
    const needle = filters.q.trim().toLowerCase();
    rows = rows.filter((row) => {
      const haystack = [
        row.displayName,
        row.legalName,
        row.primaryBaseCity,
        row.primaryBaseLabel,
        row.nextActionTitle,
        row.serviceName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }

  return rows;
}

export async function fetchOrganizationOverview(
  organizationId: string,
): Promise<OrganizationOverview | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("v_organization_overview")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrganizationOverview(data) : null;
}

export async function fetchOrganizationContacts(
  organizationId: string,
): Promise<OrganizationContact[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("organization_contacts")
    .select("*")
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .order("is_primary", { ascending: false })
    .order("full_name");
  if (error) throw error;
  return (data ?? []).map(mapContact);
}

export async function fetchOrganizationBases(
  organizationId: string,
): Promise<OrganizationBase[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("organization_locations")
    .select("*")
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .order("is_primary", { ascending: false })
    .order("label");
  if (error) throw error;
  return (data ?? []).map(mapBase);
}

export async function fetchOrganizationCoverage(
  organizationId: string,
): Promise<OrganizationCoverage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("offering_coverages")
    .select("*, locations(name, iata, country_code)")
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapCoverage);
}

export async function fetchOrganizationActivities(
  organizationId: string,
): Promise<OrganizationActivity[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .order("occurred_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []).map(mapActivity);
}

export async function searchLocationsCatalog(
  q: string,
): Promise<LocationCatalogItem[]> {
  const supabase = createClient();
  let query = supabase
    .from("locations")
    .select("*")
    .eq("is_active", true)
    .order("name")
    .limit(25);

  if (q.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(`name.ilike.${term},iata.ilike.${term},icao.ilike.${term}`);
  } else {
    query = query.eq("kind", "AIRPORT");
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapLocationCatalog);
}

export async function quickAddOperator(
  input: QuickAddOperatorInput,
): Promise<QuickAddOperatorResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("rpc_quick_add_operator", {
    p_payload: toQuickAddPayload(input),
  });
  if (error) throw error;
  return mapQuickAddResult(data);
}

export async function changeRelationshipStatus(params: {
  organizationId: string;
  newStatus: RelationshipStatus;
  note?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("rpc_change_relationship_status", {
    p_organization_id: params.organizationId,
    p_new_status: params.newStatus,
    p_note: params.note ?? undefined,
  });
  if (error) throw error;
  return data;
}
