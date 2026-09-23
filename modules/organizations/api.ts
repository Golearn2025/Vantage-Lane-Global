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
  OrganizationDocumentRow,
  OrganizationFleetRow,
  OrganizationOverview,
  OrganizationRateCardRow,
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

export async function fetchOrganizationFleet(
  organizationId: string,
): Promise<OrganizationFleetRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gt_fleet_declarations")
    .select(
      "id, vehicle_category_id, make, model_family, year_from, year_to, quantity, compliance_status, declaration_status, vehicle_categories(code, name)",
    )
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((r) => {
    const cat = r.vehicle_categories as
      | { code: string; name: string }
      | { code: string; name: string }[]
      | null;
    const catRow = Array.isArray(cat) ? cat[0] : cat;
    return {
      id: r.id,
      vehicleCategoryId: r.vehicle_category_id,
      categoryCode: catRow?.code ?? null,
      categoryName: catRow?.name ?? null,
      make: r.make,
      modelFamily: r.model_family,
      yearFrom: r.year_from,
      yearTo: r.year_to,
      quantity: r.quantity,
      complianceStatus: r.compliance_status,
      declarationStatus: r.declaration_status,
    };
  });
}

export async function fetchOrganizationRateCards(
  organizationId: string,
): Promise<OrganizationRateCardRow[]> {
  // gt_rate_* tables exist in DB; generated client types lag behind partner module.
  const supabase = createClient() as any;
  const { data: cards, error: cardErr } = await supabase
    .from("gt_rate_cards")
    .select("id, name, currency_code, distance_unit, status")
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  if (cardErr) throw cardErr;
  if (!cards?.length) return [];

  const cardIds = cards.map((c: { id: string }) => c.id);
  const { data: rules, error: rulesErr } = await supabase
    .from("gt_rate_rules")
    .select(
      "id, rate_card_id, rule_type, vehicle_category_id, base_amount, per_unit_amount, minimum_amount, hourly_amount, daily_amount, amount, wait_amount_per_unit, wait_unit, distance_unit, notes, vehicle_categories(code, name)",
    )
    .in("rate_card_id", cardIds)
    .is("archived_at", null);
  if (rulesErr) throw rulesErr;

  const byCard = new Map<string, OrganizationRateCardRow["rules"]>();
  for (const r of rules ?? []) {
    const cat = r.vehicle_categories as
      | { code: string; name: string }
      | { code: string; name: string }[]
      | null;
    const catRow = Array.isArray(cat) ? cat[0] : cat;
    const row = {
      id: r.id as string,
      ruleType: r.rule_type as string,
      vehicleCategoryId: (r.vehicle_category_id as string) ?? null,
      categoryCode: catRow?.code ?? null,
      categoryName: catRow?.name ?? null,
      baseAmount: r.base_amount != null ? Number(r.base_amount) : null,
      perUnitAmount: r.per_unit_amount != null ? Number(r.per_unit_amount) : null,
      minimumAmount: r.minimum_amount != null ? Number(r.minimum_amount) : null,
      hourlyAmount: r.hourly_amount != null ? Number(r.hourly_amount) : null,
      dailyAmount: r.daily_amount != null ? Number(r.daily_amount) : null,
      amount: r.amount != null ? Number(r.amount) : null,
      waitAmountPerUnit:
        r.wait_amount_per_unit != null ? Number(r.wait_amount_per_unit) : null,
      waitUnit: (r.wait_unit as string) ?? null,
      distanceUnit: (r.distance_unit as string) ?? null,
      notes: (r.notes as string) ?? null,
    };
    const list = byCard.get(r.rate_card_id as string) ?? [];
    list.push(row);
    byCard.set(r.rate_card_id as string, list);
  }

  return cards.map((c: Record<string, unknown>) => ({
    id: c.id as string,
    name: (c.name as string) ?? null,
    currencyCode: c.currency_code as string,
    distanceUnit: c.distance_unit as string,
    status: c.status as string,
    rules: byCard.get(c.id as string) ?? [],
  }));
}

export async function fetchOrganizationDocuments(
  organizationId: string,
): Promise<OrganizationDocumentRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("documents")
    .select(
      "id, file_name, verification_status, expires_on, issued_on, storage_path, created_at, document_types(code, name)",
    )
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((r) => {
    const dt = r.document_types as
      | { code: string; name: string }
      | { code: string; name: string }[]
      | null;
    const dtRow = Array.isArray(dt) ? dt[0] : dt;
    return {
      id: r.id,
      fileName: r.file_name,
      documentTypeCode: dtRow?.code ?? null,
      documentTypeName: dtRow?.name ?? null,
      verificationStatus: r.verification_status,
      expiresOn: r.expires_on,
      issuedOn: r.issued_on,
      storagePath: r.storage_path,
      createdAt: r.created_at,
    };
  });
}

export async function createDocumentSignedUrl(
  storagePath: string,
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("partner-documents")
    .createSignedUrl(storagePath, 60 * 10);
  if (error) throw error;
  return data.signedUrl ?? null;
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
