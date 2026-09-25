import { createClient } from "@/shared/lib/supabase/client";
import { fetchAllPages } from "@/shared/lib/supabase/fetch-all";
import { looseDb } from "@/shared/lib/supabase/loose";
import type { BookerLead } from "@/modules/bookers/types";

type BookerLeadRow = {
  organization_id: string;
  display_name: string | null;
  legal_country_code: string | null;
  legal_city: string | null;
  service_code: string | null;
  service_name: string | null;
  invite_email: string | null;
  contact_name: string | null;
  invited_at: string | null;
  invite_accepted_at: string | null;
  converted_organization_id: string | null;
  last_email_status: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  is_test: boolean | null;
  primary_base_label: string | null;
  primary_base_city: string | null;
  primary_base_address: string | null;
  primary_base_lat: number | string | null;
  primary_base_lng: number | string | null;
  unsubscribed_at: string | null;
  outreach_rejected_at: string | null;
};

export async function listBookerLeads(filters?: {
  serviceCode?: string;
  q?: string;
  onlyWithEmail?: boolean;
}): Promise<BookerLead[]> {
  const supabase = createClient();
  let rows = await fetchAllPages<BookerLeadRow>((from, to) => {
    let query = looseDb(supabase)
      .from<BookerLeadRow>("v_booker_leads")
      .select(
        "organization_id, display_name, legal_country_code, legal_city, service_code, service_name, invite_email, contact_name, invited_at, invite_accepted_at, converted_organization_id, last_email_status, opened_at, clicked_at, is_test, primary_base_label, primary_base_city, primary_base_address, primary_base_lat, primary_base_lng, unsubscribed_at, outreach_rejected_at",
      )
      .order("created_at", { ascending: false });

    if (filters?.serviceCode && filters.serviceCode !== "all") {
      query = query.eq("service_code", filters.serviceCode);
    }
    if (filters?.onlyWithEmail) {
      query = query.not("invite_email", "is", null);
    }

    return query.range(from, to);
  });

  const q = filters?.q?.trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (r) =>
        (r.display_name || "").toLowerCase().includes(q) ||
        (r.invite_email || "").toLowerCase().includes(q) ||
        (r.legal_city || "").toLowerCase().includes(q),
    );
  }

  return rows.map((r) => ({
    organizationId: r.organization_id,
    displayName: r.display_name || "Untitled",
    countryCode: r.legal_country_code,
    city: r.legal_city,
    serviceCode: r.service_code,
    serviceName: r.service_name,
    inviteEmail: r.invite_email,
    contactName: r.contact_name,
    invitedAt: r.invited_at,
    inviteAcceptedAt: r.invite_accepted_at,
    convertedOrganizationId: r.converted_organization_id,
    lastEmailStatus: r.last_email_status,
    openedAt: r.opened_at,
    clickedAt: r.clicked_at,
    unsubscribedAt: r.unsubscribed_at,
    outreachRejectedAt: r.outreach_rejected_at,
    isTest: Boolean(r.is_test),
    primaryBaseLabel: r.primary_base_label,
    primaryBaseCity: r.primary_base_city,
    primaryBaseAddress: r.primary_base_address,
    primaryBaseLat:
      r.primary_base_lat == null ? null : Number(r.primary_base_lat),
    primaryBaseLng:
      r.primary_base_lng == null ? null : Number(r.primary_base_lng),
  }));
}

export async function sendBookerEmails(opts: {
  organizationIds: string[];
  serviceCode?: string;
  skipAlreadyInvited?: boolean;
  forceResend?: boolean;
}) {
  const res = await fetch("/api/crm/bookers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      organizationIds: opts.organizationIds,
      serviceCode: opts.serviceCode,
      skipAlreadyInvited: opts.skipAlreadyInvited,
      forceResend: opts.forceResend,
    }),
  });
  const json = (await res.json()) as { error?: string };
  if (!res.ok) {
    throw new Error(json.error || "Failed to send booker emails");
  }
  return json as {
    sent: number;
    failed: number;
    skipped?: number;
    results: Array<{
      organizationId: string;
      ok: boolean;
      error?: string;
      skipped?: boolean;
    }>;
  };
}
