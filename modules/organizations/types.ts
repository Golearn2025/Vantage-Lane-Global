import type { Database } from "@/shared/types/database";
import type {
  OperationalStatus,
  RelationshipStatus,
} from "@/shared/types/domain";

export type OrganizationSummary = {
  organizationId: string;
  displayName: string;
  legalName: string | null;
  legalCountryCode: string | null;
  isTest: boolean;
  archivedAt: string | null;
  createdAt: string | null;
  relationshipStatus: RelationshipStatus | null;
  operationalStatus: OperationalStatus | null;
  serviceCode: string | null;
  serviceName: string | null;
  primaryBaseLabel: string | null;
  primaryBaseCity: string | null;
  primaryBaseCountryCode: string | null;
  coverageCount: number;
  lastActivityAt: string | null;
  nextActionDueAt: string | null;
  nextActionTitle: string | null;
};

export type OrganizationOverview = {
  organizationId: string;
  displayName: string;
  legalName: string | null;
  legalCountryCode: string | null;
  websiteUrl: string | null;
  websiteDomain: string | null;
  primaryEmail: string | null;
  primaryPhoneE164: string | null;
  primaryWhatsappE164: string | null;
  isTest: boolean;
  archivedAt: string | null;
  createdAt: string | null;
  capabilities: string[];
  partnershipId: string | null;
  relationshipStatus: RelationshipStatus | null;
  relationshipStatusChangedAt: string | null;
  becameActiveAt: string | null;
  offeringId: string | null;
  operationalStatus: OperationalStatus | null;
  serviceCode: string | null;
  serviceName: string | null;
  primaryBaseId: string | null;
  primaryBaseLabel: string | null;
  primaryBaseCity: string | null;
  primaryBaseRegion: string | null;
  primaryBaseCountryCode: string | null;
  primaryBaseLat: number | null;
  primaryBaseLng: number | null;
  coverageCount: number;
  coverageAirportIatas: string[];
  primaryContactId: string | null;
  primaryContactName: string | null;
  primaryContactType: string | null;
  primaryContactEmail: string | null;
  primaryContactPhoneE164: string | null;
  primaryContactWhatsappE164: string | null;
  lastActivityAt: string | null;
  nextFollowUpId: string | null;
  nextActionDueAt: string | null;
  nextActionTitle: string | null;
};

export type QuickAddOperatorInput = {
  display_name: string;
  legal_country_code: string;
  service_code?: string;
  legal_name?: string;
  website_url?: string;
  primary_whatsapp_e164?: string;
  primary_email?: string;
  primary_phone_e164?: string;
  base_label?: string;
  base_city?: string;
  base_lat?: number | null;
  base_lng?: number | null;
  google_place_id?: string;
  lead_source?: string;
  internal_note?: string;
  coverage_location_id?: string;
  coverage_radius_km?: number | null;
  secondary_coverage_location_ids?: string[];
  is_test?: boolean;
};

export type DuplicateMatch = {
  organization_id: string;
  display_name: string;
  match_reasons: string[];
};

export type QuickAddOperatorResult = {
  created: boolean;
  blocked_by_unique_identifiers: boolean;
  organization_id: string | null;
  partnership_id?: string | null;
  offering_id?: string | null;
  primary_base_id?: string | null;
  relationship_status: RelationshipStatus | null;
  operational_status?: OperationalStatus | null;
  service_code?: string | null;
  potential_duplicates: DuplicateMatch[];
};

export type OrganizationContact = {
  id: string;
  organizationId: string;
  fullName: string;
  contactType: string | null;
  title: string | null;
  email: string | null;
  phoneE164: string | null;
  whatsappE164: string | null;
  isPrimary: boolean;
};

export type OrganizationBase = {
  id: string;
  organizationId: string;
  label: string;
  locationKind: Database["public"]["Enums"]["org_location_kind"];
  city: string | null;
  region: string | null;
  countryCode: string | null;
  addressLine1: string | null;
  isPrimary: boolean;
  googlePlaceId: string | null;
  lat: number | null;
  lng: number | null;
};

export type OrganizationCoverage = {
  id: string;
  organizationId: string;
  offeringId: string;
  coverageMode: Database["public"]["Enums"]["coverage_mode"];
  locationId: string | null;
  locationName: string | null;
  iata: string | null;
  countryCode: string | null;
  radiusValue: number | null;
  radiusUnit: Database["public"]["Enums"]["distance_unit"] | null;
  isInformationalOnly: boolean;
};

export type OrganizationActivity = {
  id: string;
  activityType: string;
  summary: string;
  body: string | null;
  occurredAt: string;
};

export type LocationCatalogItem = {
  id: string;
  name: string;
  kind: Database["public"]["Enums"]["location_kind"];
  iata: string | null;
  countryCode: string | null;
  lat: number | null;
  lng: number | null;
  googlePlaceId: string | null;
};
