import type { Database } from "@/shared/types/database";
import type {
  NetworkLocationOption,
  NetworkOrganization,
  NetworkPlaceSupplier,
} from "@/modules/network/types";

type PlaceRow = Database["public"]["Views"]["v_network_place_suppliers"]["Row"];
type OrgRow = Database["public"]["Views"]["v_network_organizations"]["Row"];

export function mapPlaceSupplier(row: PlaceRow): NetworkPlaceSupplier | null {
  if (!row.location_id || !row.organization_id || !row.display_name) return null;
  return {
    locationId: row.location_id,
    locationName: row.location_name ?? "Location",
    locationKind: row.location_kind,
    iata: row.iata,
    icao: row.icao,
    locationCountryCode: row.location_country_code,
    organizationId: row.organization_id,
    displayName: row.display_name,
    legalName: row.legal_name,
    isTest: Boolean(row.is_test),
    relationshipStatus: row.relationship_status,
    operationalStatus: row.operational_status,
    serviceName: row.service_name,
    coverageMode: row.coverage_mode,
    primaryBaseLabel: row.primary_base_label,
    primaryBaseCity: row.primary_base_city,
    primaryBaseLat: row.primary_base_lat,
    primaryBaseLng: row.primary_base_lng,
  };
}

export function mapNetworkOrganization(row: OrgRow): NetworkOrganization | null {
  if (!row.organization_id || !row.display_name) return null;
  return {
    organizationId: row.organization_id,
    displayName: row.display_name,
    isTest: Boolean(row.is_test),
    serviceCode: (row as any).service_code ?? null,
    relationshipStatus: row.relationship_status,
    operationalStatus: row.operational_status,
    legalCountryCode: row.legal_country_code ?? null,
    primaryBaseLabel: row.primary_base_label,
    primaryBaseCity: row.primary_base_city,
    primaryBaseCountryCode: row.primary_base_country_code ?? null,
    primaryBaseLat: row.primary_base_lat,
    primaryBaseLng: row.primary_base_lng,
    coverageCount: row.coverage_count ?? 0,
    coverageAirportIatas: row.coverage_airport_iatas ?? [],
    googleRating: row.google_rating != null ? Number(row.google_rating) : null,
    googleReviewCount:
      row.google_review_count != null ? Number(row.google_review_count) : null,
    googleReviewsNote: row.google_reviews_note ?? null,
  };
}

export function mapNetworkLocation(
  row: Database["public"]["Tables"]["locations"]["Row"],
): NetworkLocationOption {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    iata: row.iata,
    countryCode: row.country_code,
  };
}
