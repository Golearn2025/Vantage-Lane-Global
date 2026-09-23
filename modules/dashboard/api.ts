import { createClient } from "@/shared/lib/supabase/client";
import type { OutreachDashboardStats } from "@/modules/dashboard/types";

type StatsRow = {
  leads_total?: number;
  leads_with_email?: number;
  leads_ready_not_sent?: number;
  invites_sent?: number;
  invites_delivered?: number;
  invites_opened?: number;
  invites_clicked?: number;
  invites_signed_up?: number;
  invites_failed?: number;
  contacts_with_email?: number;
  communications_email_sent?: number;
};

function n(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export async function fetchOutreachDashboardStats(): Promise<OutreachDashboardStats> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_outreach_dashboard_stats");
  if (error) throw error;

  const row = (data ?? {}) as StatsRow;
  return {
    leadsTotal: n(row.leads_total),
    leadsWithEmail: n(row.leads_with_email),
    leadsReadyNotSent: n(row.leads_ready_not_sent),
    invitesSent: n(row.invites_sent),
    invitesDelivered: n(row.invites_delivered),
    invitesOpened: n(row.invites_opened),
    invitesClicked: n(row.invites_clicked),
    invitesSignedUp: n(row.invites_signed_up),
    invitesFailed: n(row.invites_failed),
    contactsWithEmail: n(row.contacts_with_email),
    communicationsEmailSent: n(row.communications_email_sent),
  };
}
