import type {
  OperationalStatus,
  RelationshipStatus,
} from "@/shared/types/domain";
import type { Database } from "@/shared/types/database";

export type NetworkPlaceSupplier = {
  locationId: string;
  locationName: string;
  locationKind: Database["public"]["Enums"]["location_kind"] | null;
  iata: string | null;
  icao: string | null;
  locationCountryCode: string | null;
  organizationId: string;
  displayName: string;
  legalName: string | null;
  isTest: boolean;
  relationshipStatus: RelationshipStatus | null;
  operationalStatus: OperationalStatus | null;
  serviceName: string | null;
  coverageMode: Database["public"]["Enums"]["coverage_mode"] | null;
  primaryBaseLabel: string | null;
  primaryBaseCity: string | null;
  primaryBaseLat: number | null;
  primaryBaseLng: number | null;
};

export type NetworkOrganization = {
  organizationId: string;
  displayName: string;
  isTest: boolean;
  serviceCode: string | null;
  relationshipStatus: RelationshipStatus | null;
  operationalStatus: OperationalStatus | null;
  legalCountryCode: string | null;
  primaryBaseLabel: string | null;
  primaryBaseCity: string | null;
  primaryBaseCountryCode: string | null;
  primaryBaseLat: number | null;
  primaryBaseLng: number | null;
  coverageCount: number;
  coverageAirportIatas: string[];
  googleRating: number | null;
  googleReviewCount: number | null;
  googleReviewsNote: string | null;
};

export type NetworkLocationOption = {
  id: string;
  name: string;
  kind: Database["public"]["Enums"]["location_kind"];
  iata: string | null;
  countryCode: string | null;
  lat: number | null;
  lng: number | null;
};
