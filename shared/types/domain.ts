import type { Database } from "@/shared/types/database";

export type RelationshipStatus = Database["public"]["Enums"]["relationship_status"];
export type OperationalStatus = Database["public"]["Enums"]["operational_status"];
export type CoverageMode = Database["public"]["Enums"]["coverage_mode"];
export type OrgLocationKind = Database["public"]["Enums"]["org_location_kind"];

export const RELATIONSHIP_STATUSES: RelationshipStatus[] = [
  "LEAD",
  "CONTACTED",
  "INTERESTED",
  "ONBOARDING",
  "UNDER_REVIEW",
  "ACTIVE",
  "PAUSED",
  "REJECTED",
  "INACTIVE",
];

export const OPERATIONAL_STATUSES: OperationalStatus[] = [
  "AVAILABLE",
  "LIMITED",
  "UNAVAILABLE",
  "UNKNOWN",
];

export const CONTACT_TYPES = [
  "Owner",
  "Reservations",
  "Dispatcher",
  "24/7 Operations",
  "Accounts",
  "Other",
] as const;

export type ContactType = (typeof CONTACT_TYPES)[number];
