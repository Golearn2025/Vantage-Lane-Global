import type { Database } from "@/shared/types/database";
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

type SummaryRow = Database["public"]["Views"]["v_organization_summary"]["Row"];
type OverviewRow = Database["public"]["Views"]["v_organization_overview"]["Row"];

export function mapOrganizationSummary(row: SummaryRow): OrganizationSummary | null {
  if (!row.organization_id || !row.display_name) return null;
  return {
    organizationId: row.organization_id,
    displayName: row.display_name,
    legalName: row.legal_name,
    legalCountryCode: row.legal_country_code,
    isTest: Boolean(row.is_test),
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    relationshipStatus: row.relationship_status,
    operationalStatus: row.operational_status,
    serviceCode: row.service_code,
    serviceName: row.service_name,
    primaryBaseLabel: row.primary_base_label,
    primaryBaseCity: row.primary_base_city,
    primaryBaseCountryCode: row.primary_base_country_code,
    coverageCount: row.coverage_count ?? 0,
    lastActivityAt: row.last_activity_at,
    nextActionDueAt: row.next_action_due_at,
    nextActionTitle: row.next_action_title,
  };
}

export function mapOrganizationOverview(
  row: OverviewRow,
): OrganizationOverview | null {
  if (!row.organization_id || !row.display_name) return null;
  return {
    organizationId: row.organization_id,
    displayName: row.display_name,
    legalName: row.legal_name,
    legalCountryCode: row.legal_country_code,
    websiteUrl: row.website_url,
    websiteDomain: row.website_domain,
    primaryEmail: row.primary_email,
    primaryPhoneE164: row.primary_phone_e164,
    primaryWhatsappE164: row.primary_whatsapp_e164,
    isTest: Boolean(row.is_test),
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    capabilities: row.capabilities ?? [],
    partnershipId: row.partnership_id,
    relationshipStatus: row.relationship_status,
    relationshipStatusChangedAt: row.relationship_status_changed_at,
    becameActiveAt: row.became_active_at,
    offeringId: row.offering_id,
    operationalStatus: row.operational_status,
    serviceCode: row.service_code,
    serviceName: row.service_name,
    primaryBaseId: row.primary_base_id,
    primaryBaseLabel: row.primary_base_label,
    primaryBaseCity: row.primary_base_city,
    primaryBaseRegion: row.primary_base_region,
    primaryBaseCountryCode: row.primary_base_country_code,
    primaryBaseLat: row.primary_base_lat,
    primaryBaseLng: row.primary_base_lng,
    coverageCount: row.coverage_count ?? 0,
    coverageAirportIatas: row.coverage_airport_iatas ?? [],
    primaryContactId: row.primary_contact_id,
    primaryContactName: row.primary_contact_name,
    primaryContactType: row.primary_contact_type,
    primaryContactEmail: row.primary_contact_email,
    primaryContactPhoneE164: row.primary_contact_phone_e164,
    primaryContactWhatsappE164: row.primary_contact_whatsapp_e164,
    lastActivityAt: row.last_activity_at,
    nextFollowUpId: row.next_follow_up_id,
    nextActionDueAt: row.next_action_due_at,
    nextActionTitle: row.next_action_title,
  };
}

export function mapQuickAddResult(raw: unknown): QuickAddOperatorResult {
  const data = (raw ?? {}) as Record<string, unknown>;
  const duplicates = Array.isArray(data.potential_duplicates)
    ? (data.potential_duplicates as QuickAddOperatorResult["potential_duplicates"])
    : [];

  return {
    created: Boolean(data.created ?? Boolean(data.organization_id)),
    blocked_by_unique_identifiers: Boolean(data.blocked_by_unique_identifiers),
    organization_id: (data.organization_id as string | null) ?? null,
    partnership_id: (data.partnership_id as string | null) ?? null,
    offering_id: (data.offering_id as string | null) ?? null,
    primary_base_id: (data.primary_base_id as string | null) ?? null,
    relationship_status:
      (data.relationship_status as QuickAddOperatorResult["relationship_status"]) ??
      null,
    operational_status:
      (data.operational_status as QuickAddOperatorResult["operational_status"]) ??
      null,
    service_code: (data.service_code as string | null) ?? null,
    potential_duplicates: duplicates.map((d) => ({
      organization_id: d.organization_id,
      display_name: d.display_name,
      match_reasons: d.match_reasons ?? [],
    })),
  };
}

export function toQuickAddPayload(input: QuickAddOperatorInput) {
  return {
    display_name: input.display_name,
    legal_country_code: input.legal_country_code,
    service_code: input.service_code || "GROUND_TRANSPORTATION",
    legal_name: input.legal_name || null,
    website_url: input.website_url || null,
    primary_whatsapp_e164: input.primary_whatsapp_e164 || null,
    primary_email: input.primary_email || null,
    primary_phone_e164: input.primary_phone_e164 || null,
    base_label: input.base_label || null,
    base_city: input.base_city || null,
    base_lat: input.base_lat ?? null,
    base_lng: input.base_lng ?? null,
    google_place_id: input.google_place_id || null,
    lead_source: input.lead_source || null,
    internal_note: input.internal_note || null,
    coverage_location_id: input.coverage_location_id || null,
    coverage_radius_km: input.coverage_radius_km ?? null,
    secondary_coverage_location_ids:
      input.secondary_coverage_location_ids ?? [],
    is_test: input.is_test ?? false,
  };
}

export function mapContact(
  row: Database["public"]["Tables"]["organization_contacts"]["Row"],
): OrganizationContact {
  return {
    id: row.id,
    organizationId: row.organization_id,
    fullName: row.full_name,
    contactType: row.contact_type,
    title: row.title,
    email: row.email,
    phoneE164: row.phone_e164,
    whatsappE164: row.whatsapp_e164,
    isPrimary: row.is_primary,
  };
}

export function mapBase(
  row: Database["public"]["Tables"]["organization_locations"]["Row"],
): OrganizationBase {
  return {
    id: row.id,
    organizationId: row.organization_id,
    label: row.label,
    locationKind: row.location_kind,
    city: row.city,
    region: row.region,
    countryCode: row.country_code,
    addressLine1: row.address_line1,
    isPrimary: row.is_primary,
    googlePlaceId: row.google_place_id,
    lat: row.lat,
    lng: row.lng,
  };
}

export function mapCoverage(
  row: Database["public"]["Tables"]["offering_coverages"]["Row"] & {
    locations?: {
      name: string | null;
      iata: string | null;
      country_code: string | null;
    } | null;
  },
): OrganizationCoverage {
  return {
    id: row.id,
    organizationId: row.organization_id,
    offeringId: row.offering_id,
    coverageMode: row.coverage_mode,
    locationId: row.location_id,
    locationName: row.locations?.name ?? null,
    iata: row.locations?.iata ?? null,
    countryCode: row.locations?.country_code ?? null,
    radiusValue: row.radius_value != null ? Number(row.radius_value) : null,
    radiusUnit: row.radius_unit,
    isInformationalOnly: row.is_informational_only,
  };
}

export function mapActivity(
  row: Database["public"]["Tables"]["activities"]["Row"],
): OrganizationActivity {
  return {
    id: row.id,
    activityType: row.activity_type,
    summary: row.summary,
    body: row.body,
    occurredAt: row.occurred_at,
  };
}

export function mapLocationCatalog(
  row: Database["public"]["Tables"]["locations"]["Row"],
): LocationCatalogItem {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    iata: row.iata,
    countryCode: row.country_code,
    lat: row.lat,
    lng: row.lng,
    googlePlaceId: row.google_place_id,
  };
}
