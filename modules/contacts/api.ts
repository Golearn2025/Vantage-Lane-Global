"use client";

import { createClient } from "@/shared/lib/supabase/client";
import type { ContactListFilters, ContactRow } from "@/modules/contacts/types";
import type { RelationshipStatus } from "@/shared/types/domain";

function isMobileWhatsapp(value: string | null | undefined): boolean {
  if (!value) return false;
  const digits = value.replace(/[^\d+]/g, "");
  // UK +447, IE +3538, FR +336/+337, DE +4915/16/17, CH +417, NL +316, IT +393, ES +346, BE +324, AT +436, PT +3519
  return (
    digits.startsWith("+447") ||
    digits.startsWith("+3538") ||
    digits.startsWith("+336") ||
    digits.startsWith("+337") ||
    digits.startsWith("+4915") ||
    digits.startsWith("+4916") ||
    digits.startsWith("+4917") ||
    digits.startsWith("+417") ||
    digits.startsWith("+316") ||
    digits.startsWith("+393") ||
    digits.startsWith("+346") ||
    digits.startsWith("+324") ||
    digits.startsWith("+436") ||
    digits.startsWith("+3519") ||
    digits.startsWith("+4206") ||
    digits.startsWith("+485")
  );
}

type OrgContactQueryRow = {
  id: string;
  display_name: string;
  legal_country_code: string | null;
  primary_email: string | null;
  primary_phone_e164: string | null;
  primary_whatsapp_e164: string | null;
  google_rating: number | string | null;
  google_review_count: number | null;
  website_url: string | null;
  is_test: boolean | null;
  partnerships:
    | { relationship_status: RelationshipStatus | null }
    | { relationship_status: RelationshipStatus | null }[]
    | null;
  organization_locations:
    | {
        city: string | null;
        is_primary: boolean | null;
        archived_at: string | null;
      }
    | {
        city: string | null;
        is_primary: boolean | null;
        archived_at: string | null;
      }[]
    | null;
};

export async function fetchContactRows(
  filters: ContactListFilters = {},
): Promise<ContactRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(
      `
      id,
      display_name,
      legal_country_code,
      primary_email,
      primary_phone_e164,
      primary_whatsapp_e164,
      google_rating,
      google_review_count,
      website_url,
      is_test,
      partnerships ( relationship_status ),
      organization_locations ( city, is_primary, archived_at )
    `,
    )
    .is("archived_at", null)
    .order("display_name");

  if (error) throw error;

  let rows: ContactRow[] = ((data ?? []) as OrgContactQueryRow[]).map((row) => {
    const partnership = Array.isArray(row.partnerships)
      ? row.partnerships[0]
      : row.partnerships;
    const locs = (
      Array.isArray(row.organization_locations)
        ? row.organization_locations
        : row.organization_locations
          ? [row.organization_locations]
          : []
    ).filter((l) => l && l.is_primary && !l.archived_at);
    const primary = locs[0];

    return {
      organizationId: row.id,
      displayName: row.display_name,
      legalCountryCode: row.legal_country_code,
      city: primary?.city ?? null,
      email: row.primary_email,
      phoneE164: row.primary_phone_e164,
      whatsappE164: row.primary_whatsapp_e164,
      relationshipStatus: partnership?.relationship_status ?? null,
      googleRating:
        row.google_rating != null ? Number(row.google_rating) : null,
      googleReviewCount: row.google_review_count,
      websiteUrl: row.website_url,
      isTest: Boolean(row.is_test),
    };
  });

  if (filters.country && filters.country !== "all") {
    rows = rows.filter((r) => r.legalCountryCode === filters.country);
  }
  if (filters.city && filters.city !== "all") {
    rows = rows.filter(
      (r) => (r.city ?? "").toLowerCase() === filters.city!.toLowerCase(),
    );
  }
  if (filters.channel && filters.channel !== "all") {
    rows = rows.filter((r) => {
      const hasWa = isMobileWhatsapp(r.whatsappE164);
      const hasEmail = Boolean(r.email?.trim());
      switch (filters.channel) {
        case "whatsapp":
          return hasWa;
        case "email":
          return hasEmail;
        case "both":
          return hasWa && hasEmail;
        case "none":
          return !hasWa && !hasEmail;
        default:
          return true;
      }
    });
  }
  if (filters.q?.trim()) {
    const needle = filters.q.trim().toLowerCase();
    rows = rows.filter((r) =>
      [r.displayName, r.city, r.email, r.whatsappE164, r.phoneE164]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle)),
    );
  }

  return rows;
}

export function toWaMeUrl(e164: string, text?: string): string {
  const digits = e164.replace(/[^\d]/g, "");
  const base = `https://wa.me/${digits}`;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text.trim())}`;
}

export function toMailtoBcc(emails: string[], subject: string, body: string): string {
  const unique = [...new Set(emails.map((e) => e.trim()).filter(Boolean))];
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  if (unique.length) params.set("bcc", unique.join(","));
  return `mailto:?${params.toString()}`;
}
