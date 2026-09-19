import type { RelationshipStatus } from "@/shared/types/domain";

export type ContactRow = {
  organizationId: string;
  displayName: string;
  legalCountryCode: string | null;
  city: string | null;
  email: string | null;
  phoneE164: string | null;
  whatsappE164: string | null;
  relationshipStatus: RelationshipStatus | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  websiteUrl: string | null;
  isTest: boolean;
};

export type ContactListFilters = {
  q?: string;
  city?: string | "all";
  country?: string | "all";
  channel?: "all" | "whatsapp" | "email" | "both" | "none";
};
