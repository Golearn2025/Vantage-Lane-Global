/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/shared/lib/supabase/client";

function db() {
  return createClient() as any;
}

export type PartnerOrgContext = {
  organizationId: string;
  displayName: string;
  legalName: string | null;
  logoUrl: string | null;
  offeringId: string;
  serviceCode: string;
  relationshipStatus: string | null;
  partnershipId: string | null;
  standardAcknowledgedAt: string | null;
  primaryPhone: string | null;
  legalCountryCode: string | null;
  legalCity: string | null;
};

export type PartnerHQLocation = {
  id: string;
  formattedAddress: string | null;
  city: string | null;
  countryCode: string | null;
  lat: number | null;
  lng: number | null;
  placeId: string | null;
};

export type VehicleCategoryRow = {
  id: string;
  code: string;
  name: string;
  exampleModels: string | null;
  sortOrder: number;
};

export type RateCardRow = {
  id: string;
  organizationId: string;
  offeringId: string;
  currencyCode: string;
  distanceUnit: "KM" | "MILE";
  status: string;
  name: string | null;
};

export type RateRuleRow = {
  id: string;
  rateCardId: string;
  ruleType: string;
  vehicleCategoryId: string | null;
  baseAmount: number | null;
  perUnitAmount: number | null;
  minimumAmount: number | null;
  hourlyAmount: number | null;
  dailyAmount: number | null;
  amount: number | null;
  waitAmountPerUnit: number | null;
  waitUnit: string | null;
  notes: string | null;
};

export type BenchmarkBand = {
  id: string;
  marketKey: string;
  routeKey: string;
  vehicleCategoryId: string | null;
  currencyCode: string;
  lowAmount: number;
  highAmount: number;
  referenceDistance: number | null;
  referenceDistanceUnit: "KM" | "MILE" | null;
  notes: string | null;
};

export type FleetDeclarationRow = {
  id: string;
  vehicleCategoryId: string;
  make: string | null;
  modelFamily: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  quantity: number;
};

export type DocumentTypeRow = {
  id: string;
  code: string;
  name: string;
  defaultScope: string;
};

export type DocumentRow = {
  id: string;
  documentTypeId: string;
  fileName: string | null;
  verificationStatus: string;
  storagePath: string;
  expiresOn: string | null;
  issuedOn: string | null;
  mimeType: string | null;
};

export async function fetchPartnerOrgContext(): Promise<PartnerOrgContext | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership, error: memErr } = await supabase
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("status", "ACTIVE")
    .is("archived_at", null)
    .limit(1)
    .maybeSingle();
  if (memErr) throw memErr;
  if (!membership) return null;

  const orgId = membership.organization_id;

  const { data: org, error: orgErr } = await supabase
    .from("organizations")
    .select("id, display_name, legal_name, logo_url, primary_phone_e164, legal_country_code, legal_city")
    .eq("id", orgId)
    .single();
  if (orgErr) throw orgErr;

  const { data: offering, error: offErr } = await supabase
    .from("offerings")
    .select("id, service_types ( code )")
    .eq("organization_id", orgId)
    .limit(1)
    .maybeSingle();
  if (offErr) throw offErr;
  if (!offering) return null;

  const serviceTypes = offering.service_types as
    | { code: string }
    | { code: string }[]
    | null;
  const serviceCode = Array.isArray(serviceTypes)
    ? serviceTypes[0]?.code
    : serviceTypes?.code;

  const { data: partnership } = await db()
    .from("partnerships")
    .select("id, relationship_status, standard_acknowledged_at")
    .eq("organization_id", orgId)
    .maybeSingle();

  const p = partnership as Record<string, unknown> | null;

  const o = org as any;
  return {
    organizationId: o.id as string,
    displayName: o.display_name as string,
    legalName: (o.legal_name as string | null) ?? null,
    logoUrl: (o.logo_url as string | null) ?? null,
    offeringId: offering.id,
    serviceCode: serviceCode ?? "GROUND_TRANSPORTATION",
    relationshipStatus: (p?.relationship_status as string) ?? null,
    partnershipId: (p?.id as string) ?? null,
    standardAcknowledgedAt: (p?.standard_acknowledged_at as string) ?? null,
    primaryPhone: (o.primary_phone_e164 as string | null) ?? null,
    legalCountryCode: (o.legal_country_code as string | null) ?? null,
    legalCity: (o.legal_city as string | null) ?? null,
  };
}

export async function fetchPartnerHQLocation(orgId: string): Promise<PartnerHQLocation | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("organization_locations")
    .select("id, formatted_address, city, country_code, lat, lng, place_id")
    .eq("organization_id", orgId)
    .eq("location_kind", "OPS_BASE")
    .eq("is_primary", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const d = data as any;
  return {
    id: d.id,
    formattedAddress: d.formatted_address ?? null,
    city: d.city ?? null,
    countryCode: d.country_code ?? null,
    lat: d.lat ?? null,
    lng: d.lng ?? null,
    placeId: d.place_id ?? null,
  };
}

export async function updatePartnerOrgDetails(input: {
  orgId: string;
  displayName: string;
  legalName: string | null;
  phone: string | null;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      display_name: input.displayName,
      legal_name: input.legalName || null,
      primary_phone_e164: input.phone || null,
      primary_whatsapp_e164: input.phone || null,
    })
    .eq("id", input.orgId);
  if (error) throw error;
}

export async function updatePartnerHQLocation(input: {
  orgId: string;
  locationId: string | null;
  formattedAddress: string;
  city: string;
  countryCode: string;
  lat: number | null;
  lng: number | null;
  placeId: string | null;
}): Promise<void> {
  const supabase = createClient();
  const payload = {
    formatted_address: input.formattedAddress,
    city: input.city,
    country_code: input.countryCode,
    lat: input.lat,
    lng: input.lng,
    place_id: input.placeId,
    google_place_id: input.placeId,
    label: input.formattedAddress || `${input.city} base`,
    location_kind: "OPS_BASE" as const,
    is_primary: true,
  };

  if (input.locationId) {
    const { error } = await supabase
      .from("organization_locations")
      .update(payload as any)
      .eq("id", input.locationId);
    if (error) throw error;
    return;
  }

  // Bootstrap may have created a city-only row — prefer update primary, else insert
  const { data: existing } = await supabase
    .from("organization_locations")
    .select("id")
    .eq("organization_id", input.orgId)
    .eq("is_primary", true)
    .is("archived_at", null)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("organization_locations")
      .update(payload as any)
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("organization_locations").insert({
    organization_id: input.orgId,
    ...payload,
  } as any);
  if (error) throw error;
}

export type PartnerCoverageRow = {
  id: string;
  locationId: string | null;
  locationName: string | null;
  iata: string | null;
  countryCode: string | null;
  coverageMode: string;
  radiusValue: number | null;
  radiusUnit: string | null;
};

export async function fetchPartnerCoverages(
  organizationId: string,
): Promise<PartnerCoverageRow[]> {
  const { data, error } = await db()
    .from("offering_coverages")
    .select("id, location_id, coverage_mode, radius_value, radius_unit, locations(name, iata, country_code)")
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((r: Record<string, unknown>) => {
    const loc = r.locations as
      | { name: string | null; iata: string | null; country_code: string | null }
      | { name: string | null; iata: string | null; country_code: string | null }[]
      | null;
    const locRow = Array.isArray(loc) ? loc[0] : loc;
    return {
      id: r.id as string,
      locationId: (r.location_id as string) ?? null,
      locationName: locRow?.name ?? null,
      iata: locRow?.iata ?? null,
      countryCode: locRow?.country_code ?? null,
      coverageMode: r.coverage_mode as string,
      radiusValue: r.radius_value != null ? Number(r.radius_value) : null,
      radiusUnit: (r.radius_unit as string) ?? null,
    };
  });
}

export async function savePartnerCoverages(input: {
  organizationId: string;
  offeringId: string;
  items: Array<{
    locationId: string;
    coverageMode: "AIRPORT_EXPLICIT" | "CITY_OR_REGION" | "RADIUS";
    radiusKm: number | null;
  }>;
}): Promise<void> {
  if (input.items.length === 0) {
    throw new Error("Pick at least a primary coverage zone from the catalog");
  }

  // Replace strategy (same org ownership as Add Operator → offering_coverages)
  const { error: delErr } = await db()
    .from("offering_coverages")
    .delete()
    .eq("organization_id", input.organizationId);
  if (delErr) throw delErr;

  const rows = input.items.map((item) => ({
    organization_id: input.organizationId,
    offering_id: input.offeringId,
    location_id: item.locationId,
    coverage_mode: item.coverageMode,
    radius_value: item.radiusKm,
    radius_unit: item.radiusKm != null ? ("KM" as const) : null,
    is_informational_only: false,
  }));

  const { error: insErr } = await db().from("offering_coverages").insert(rows);
  if (insErr) throw insErr;
}

export async function fetchVehicleCategories(): Promise<VehicleCategoryRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicle_categories")
    .select("id, code, name, example_models, sort_order")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    exampleModels: r.example_models,
    sortOrder: r.sort_order,
  }));
}

export async function fetchMinVehicleYear(): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from("standard_definitions")
    .select("parameters")
    .eq("code", "GT_MIN_VEHICLE_YEAR")
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const params = data?.parameters as { min_vehicle_year?: number } | null;
  return params?.min_vehicle_year ?? 2023;
}

export async function fetchDraftRateCard(
  organizationId: string,
  offeringId: string,
): Promise<{ card: RateCardRow | null; rules: RateRuleRow[] }> {
  const { data: cardRow, error: cardErr } = await db()
    .from("gt_rate_cards")
    .select(
      "id, organization_id, offering_id, currency_code, distance_unit, status, name",
    )
    .eq("organization_id", organizationId)
    .eq("offering_id", offeringId)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cardErr) throw cardErr;
  if (!cardRow) return { card: null, rules: [] };

  const { data: rules, error: rulesErr } = await db()
    .from("gt_rate_rules")
    .select(
      "id, rate_card_id, rule_type, vehicle_category_id, base_amount, per_unit_amount, minimum_amount, hourly_amount, daily_amount, amount, wait_amount_per_unit, wait_unit, notes",
    )
    .eq("rate_card_id", cardRow.id)
    .is("archived_at", null);

  if (rulesErr) throw rulesErr;

  return {
    card: {
      id: cardRow.id,
      organizationId: cardRow.organization_id,
      offeringId: cardRow.offering_id,
      currencyCode: cardRow.currency_code,
      distanceUnit: cardRow.distance_unit,
      status: cardRow.status,
      name: cardRow.name,
    },
    rules: (rules ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      rateCardId: r.rate_card_id as string,
      ruleType: r.rule_type as string,
      vehicleCategoryId: (r.vehicle_category_id as string) ?? null,
      baseAmount: r.base_amount != null ? Number(r.base_amount) : null,
      perUnitAmount: r.per_unit_amount != null ? Number(r.per_unit_amount) : null,
      minimumAmount: r.minimum_amount != null ? Number(r.minimum_amount) : null,
      hourlyAmount: r.hourly_amount != null ? Number(r.hourly_amount) : null,
      dailyAmount: r.daily_amount != null ? Number(r.daily_amount) : null,
      amount: r.amount != null ? Number(r.amount) : null,
      waitAmountPerUnit:
        r.wait_amount_per_unit != null ? Number(r.wait_amount_per_unit) : null,
      waitUnit: (r.wait_unit as string) ?? null,
      notes: (r.notes as string) ?? null,
    })),
  };
}

function rateCardError(error: { message?: string; code?: string; details?: string } | null): Error {
  const msg = [error?.message, error?.details].filter(Boolean).join(" — ");
  return new Error(msg || "Could not save rate card");
}

export async function upsertPartnerRateCard(input: {
  organizationId: string;
  offeringId: string;
  cardId?: string | null;
  currencyCode: string;
  distanceUnit: "KM" | "MILE";
  categoryRates: Array<{
    /** Null = service-level rate (Security / Yacht / Aviation). */
    vehicleCategoryId: string | null;
    baseAmount: number | null;
    perUnitAmount: number | null;
    minimumAmount: number | null;
    hourlyAmount: number | null;
    dailyAmount: number | null;
    fixedTransferAmount: number | null;
    /** Per-minute travel rate (stored as WAITING / MINUTE). */
    perMinuteAmount?: number | null;
    notes: string | null;
  }>;
}): Promise<string> {
  // Same class of bug as fleet: reject unknown category IDs before insert.
  // Null is allowed for non-GT service-level hourly/daily rates.
  const catalog = await fetchVehicleCategories();
  const validCategoryIds = new Set(catalog.map((c) => c.id));
  for (const cat of input.categoryRates) {
    if (
      cat.vehicleCategoryId != null &&
      !validCategoryIds.has(cat.vehicleCategoryId)
    ) {
      throw new Error(
        "One or more vehicle categories are invalid. Refresh the page and try again.",
      );
    }
  }

  let cardId = input.cardId ?? null;

  if (cardId) {
    const { error } = await db()
      .from("gt_rate_cards")
      .update({
        currency_code: input.currencyCode,
        distance_unit: input.distanceUnit,
        status: "DRAFT",
        name: "Partner draft",
      })
      .eq("id", cardId);
    if (error) throw rateCardError(error);
  } else {
    const { data, error } = await db()
      .from("gt_rate_cards")
      .insert({
        organization_id: input.organizationId,
        offering_id: input.offeringId,
        currency_code: input.currencyCode,
        distance_unit: input.distanceUnit,
        status: "DRAFT",
        name: "Partner draft",
      })
      .select("id")
      .single();
    if (error) throw rateCardError(error);
    cardId = data.id as string;
  }

  const { error: delErr } = await db()
    .from("gt_rate_rules")
    .delete()
    .eq("rate_card_id", cardId)
    .in("rule_type", [
      "DISTANCE",
      "HOURLY",
      "DAILY",
      "AIRPORT_TRANSFER",
      "WAITING",
    ]);
  if (delErr) throw rateCardError(delErr);

  const rows: Record<string, unknown>[] = [];
  for (const cat of input.categoryRates) {
    if (
      cat.baseAmount != null ||
      cat.perUnitAmount != null ||
      cat.minimumAmount != null
    ) {
      rows.push({
        organization_id: input.organizationId,
        rate_card_id: cardId,
        rule_type: "DISTANCE",
        vehicle_category_id: cat.vehicleCategoryId || null,
        base_amount: cat.baseAmount,
        per_unit_amount: cat.perUnitAmount,
        minimum_amount: cat.minimumAmount,
        distance_unit: input.distanceUnit,
        notes: cat.notes,
      });
    }
    if (cat.hourlyAmount != null) {
      rows.push({
        organization_id: input.organizationId,
        rate_card_id: cardId,
        rule_type: "HOURLY",
        vehicle_category_id: cat.vehicleCategoryId || null,
        hourly_amount: cat.hourlyAmount,
      });
    }
    if (cat.dailyAmount != null) {
      rows.push({
        organization_id: input.organizationId,
        rate_card_id: cardId,
        rule_type: "DAILY",
        vehicle_category_id: cat.vehicleCategoryId || null,
        daily_amount: cat.dailyAmount,
      });
    }
    if (cat.fixedTransferAmount != null) {
      rows.push({
        organization_id: input.organizationId,
        rate_card_id: cardId,
        rule_type: "AIRPORT_TRANSFER",
        vehicle_category_id: cat.vehicleCategoryId || null,
        amount: cat.fixedTransferAmount,
        notes: "Airport ↔ city centre (partner declared)",
      });
    }
    // Per-minute travel rate from the partner rates UI → WAITING / MINUTE
    if (cat.perMinuteAmount != null) {
      rows.push({
        organization_id: input.organizationId,
        rate_card_id: cardId,
        rule_type: "WAITING",
        vehicle_category_id: cat.vehicleCategoryId || null,
        wait_amount_per_unit: cat.perMinuteAmount,
        wait_unit: "MINUTE",
        notes: "Per-minute travel rate (partner declared)",
      });
    }
  }

  if (rows.length > 0) {
    const { error: insErr } = await db().from("gt_rate_rules").insert(rows);
    if (insErr) throw rateCardError(insErr);
  }

  return cardId!;
}

export async function deletePartnerRateCard(cardId: string): Promise<void> {
  // Rules are deleted via CASCADE on the DB, or we delete manually
  const { error: rulesErr } = await db()
    .from("gt_rate_rules")
    .delete()
    .eq("rate_card_id", cardId);
  if (rulesErr) throw rulesErr;

  const { error: cardErr } = await db()
    .from("gt_rate_cards")
    .delete()
    .eq("id", cardId);
  if (cardErr) throw cardErr;
}

export async function fetchBenchmarkBands(
  marketKey = "london_uk",
): Promise<BenchmarkBand[]> {
  const { data, error } = await db()
    .from("gt_rate_benchmark_bands")
    .select(
      "id, market_key, route_key, vehicle_category_id, currency_code, low_amount, high_amount, reference_distance, reference_distance_unit, notes",
    )
    .eq("market_key", marketKey)
    .eq("is_active", true);
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    marketKey: r.market_key as string,
    routeKey: r.route_key as string,
    vehicleCategoryId: (r.vehicle_category_id as string) ?? null,
    currencyCode: r.currency_code as string,
    lowAmount: Number(r.low_amount),
    highAmount: Number(r.high_amount),
    referenceDistance:
      r.reference_distance != null ? Number(r.reference_distance) : null,
    referenceDistanceUnit: (r.reference_distance_unit as "KM" | "MILE") ?? null,
    notes: (r.notes as string) ?? null,
  }));
}

export async function fetchFleetDeclarations(
  organizationId: string,
  offeringId: string,
): Promise<FleetDeclarationRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gt_fleet_declarations")
    .select(
      "id, vehicle_category_id, make, model_family, year_from, year_to, quantity",
    )
    .eq("organization_id", organizationId)
    .eq("offering_id", offeringId)
    .is("archived_at", null);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    vehicleCategoryId: r.vehicle_category_id,
    make: r.make,
    modelFamily: r.model_family,
    yearFrom: r.year_from,
    yearTo: r.year_to,
    quantity: r.quantity,
  }));
}

export async function saveFleetDeclaration(input: {
  id?: string | null;
  organizationId: string;
  offeringId: string;
  vehicleCategoryId: string;
  make: string;
  modelFamily: string;
  yearFrom: number;
  quantity: number;
}): Promise<void> {
  const supabase = createClient();
  const payload = {
    organization_id: input.organizationId,
    offering_id: input.offeringId,
    vehicle_category_id: input.vehicleCategoryId,
    make: input.make,
    model_family: input.modelFamily,
    year_from: input.yearFrom,
    year_to: input.yearFrom,
    quantity: input.quantity,
    source: "OPERATOR_CLAIM" as const,
    declaration_status: "DECLARED" as const,
  };
  if (input.id) {
    const { error } = await supabase
      .from("gt_fleet_declarations")
      .update(payload)
      .eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("gt_fleet_declarations").insert(payload);
    if (error) throw error;
  }
}

export async function fetchDocumentTypes(): Promise<DocumentTypeRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("document_types")
    .select("id, code, name, default_scope")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    defaultScope: r.default_scope,
  }));
}

export async function fetchOrgDocuments(
  organizationId: string,
): Promise<DocumentRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id, document_type_id, file_name, verification_status, storage_path, expires_on, issued_on, mime_type")
    .eq("organization_id", organizationId)
    .is("archived_at", null);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    documentTypeId: r.document_type_id,
    fileName: r.file_name,
    verificationStatus: r.verification_status,
    storagePath: r.storage_path,
    expiresOn: r.expires_on ?? null,
    issuedOn: r.issued_on ?? null,
    mimeType: r.mime_type ?? null,
  }));
}

export function impliedDistancePrice(input: {
  base: number | null;
  perUnit: number | null;
  minimum: number | null;
  distance: number;
}): number | null {
  if (input.base == null && input.perUnit == null) return null;
  const raw = (input.base ?? 0) + (input.perUnit ?? 0) * input.distance;
  if (input.minimum != null) return Math.max(input.minimum, raw);
  return raw;
}

export function bandStatus(
  amount: number | null,
  low: number,
  high: number,
): "low" | "ok" | "high" | "unknown" {
  if (amount == null) return "unknown";
  if (amount < low) return "low";
  if (amount > high) return "high";
  return "ok";
}

// ─── Documents per service type ──────────────────────────────
// Each service has its own required + recommended document codes.
// COMPANY_REGISTRATION is required for all services.

export type ServiceDocConfig = {
  required: string[];
  recommended: string[];
};

export const SERVICE_DOC_CONFIG: Record<string, ServiceDocConfig> = {
  GROUND_TRANSPORTATION: {
    required: ["COMPANY_REGISTRATION", "OPERATOR_LICENCE", "COMMERCIAL_INSURANCE"],
    recommended: ["FLEET_PHOTO_SET"],
  },
  AVIATION: {
    required: ["COMPANY_REGISTRATION", "AOC_CERTIFICATE", "COMMERCIAL_INSURANCE"],
    recommended: ["FLEET_PHOTO_SET"],
  },
  SECURITY: {
    required: ["COMPANY_REGISTRATION", "SIA_LICENCE", "COMMERCIAL_INSURANCE"],
    recommended: ["VETTING_CERTIFICATE"],
  },
  HOSPITALITY: {
    required: ["COMPANY_REGISTRATION", "FOOD_HYGIENE_CERTIFICATE", "PUBLIC_LIABILITY_INSURANCE"],
    recommended: ["VENUE_PHOTOS"],
  },
  CONCIERGE: {
    required: ["COMPANY_REGISTRATION", "PUBLIC_LIABILITY_INSURANCE"],
    recommended: ["PORTFOLIO"],
  },
  YACHT: {
    required: ["COMPANY_REGISTRATION", "MARITIME_LICENCE", "COMMERCIAL_INSURANCE"],
    recommended: ["VESSEL_PHOTOS"],
  },
  MEDICAL: {
    required: ["COMPANY_REGISTRATION", "MEDICAL_REGISTRATION", "PUBLIC_LIABILITY_INSURANCE"],
    recommended: ["CLINICAL_GOVERNANCE_CERTIFICATE"],
  },
  EVENTS: {
    required: ["COMPANY_REGISTRATION", "PUBLIC_LIABILITY_INSURANCE"],
    recommended: ["PORTFOLIO"],
  },
};

// Fallback for unknown service codes
export const DEFAULT_DOC_CONFIG: ServiceDocConfig = {
  required: ["COMPANY_REGISTRATION"],
  recommended: [],
};

export function getServiceDocConfig(serviceCode: string): ServiceDocConfig {
  return SERVICE_DOC_CONFIG[serviceCode] ?? DEFAULT_DOC_CONFIG;
}

// Legacy exports kept for backward compatibility
export const PARTNER_DOC_CODES_REQUIRED = [
  "COMPANY_REGISTRATION",
  "OPERATOR_LICENCE",
  "COMMERCIAL_INSURANCE",
] as const;

export const PARTNER_DOC_CODES_RECOMMENDED = [
  "FLEET_PHOTO_SET",
] as const;

export type WizardStepConfig = {
  key: string;
  label: string;
};

export async function uploadPartnerDocument(params: {
  organizationId: string;
  documentTypeId: string;
  file: File;
  expiresOn: string | null;
  issuedOn: string | null;
}): Promise<void> {
  const supabase = createClient();
  const ext = params.file.name.split(".").pop() ?? "bin";
  const path = `${params.organizationId}/${params.documentTypeId}/${Date.now()}.${ext}`;

  // Upload file to storage
  const { error: upErr } = await supabase.storage
    .from("partner-documents")
    .upload(path, params.file, { upsert: true, contentType: params.file.type });
  if (upErr) throw upErr;

  // Archive any existing document for this org+type
  await supabase
    .from("documents")
    .update({ archived_at: new Date().toISOString() })
    .eq("organization_id", params.organizationId)
    .eq("document_type_id", params.documentTypeId)
    .eq("scope", "ORGANIZATION")
    .is("archived_at", null);

  // Insert new document record
  const { error: dbErr } = await supabase.from("documents").insert({
    organization_id: params.organizationId,
    document_type_id: params.documentTypeId,
    storage_path: path,
    file_name: params.file.name,
    mime_type: params.file.type,
    expires_on: params.expiresOn ?? null,
    issued_on: params.issuedOn ?? null,
    verification_status: "PENDING",
    scope: "ORGANIZATION",
  });
  if (dbErr) throw dbErr;
}

export type ServiceTypeConfig = {
  code: string;
  name: string;
  wizardSteps: WizardStepConfig[];
  requiresFleet: boolean;
  requiresRateCard: boolean;
};

export async function fetchServiceTypeConfig(
  serviceCode: string,
): Promise<ServiceTypeConfig | null> {
  const { data, error } = await db()
    .from("service_types")
    .select("code, name, wizard_steps, requires_fleet, requires_rate_card")
    .eq("code", serviceCode)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as Record<string, unknown>;
  const steps = (row.wizard_steps as WizardStepConfig[] | null) ?? [];
  return {
    code: row.code as string,
    name: row.name as string,
    wizardSteps: steps,
    requiresFleet: Boolean(row.requires_fleet),
    requiresRateCard: Boolean(row.requires_rate_card),
  };
}

/** Partners cannot UPDATE partnerships directly (platform-only RLS). Use RPC. */
export async function submitForReview(organizationId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("rpc_partner_submit_for_review", {
    p_organization_id: organizationId,
  });
  if (error) throw error;
}

export async function acknowledgePartnerStandard(
  organizationId: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("rpc_partner_acknowledge_standard", {
    p_organization_id: organizationId,
  });
  if (error) throw error;
}
