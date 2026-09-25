export type BookerLead = {
  organizationId: string;
  displayName: string;
  countryCode: string | null;
  city: string | null;
  serviceCode: string | null;
  serviceName: string | null;
  inviteEmail: string | null;
  contactName: string | null;
  invitedAt: string | null;
  inviteAcceptedAt: string | null;
  convertedOrganizationId: string | null;
  lastEmailStatus: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  unsubscribedAt: string | null;
  outreachRejectedAt: string | null;
  isTest: boolean;
  primaryBaseLabel: string | null;
  primaryBaseCity: string | null;
  primaryBaseAddress: string | null;
  primaryBaseLat: number | null;
  primaryBaseLng: number | null;
};

export type BookerStatus =
  | "not_sent"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "signed_up"
  | "failed"
  | "bounced"
  | "rejected";

export function deriveBookerStatus(row: BookerLead): BookerStatus {
  if (row.outreachRejectedAt || row.unsubscribedAt) return "rejected";
  if (row.inviteAcceptedAt || row.convertedOrganizationId) return "signed_up";
  const s = (row.lastEmailStatus || "").toLowerCase();
  if (s === "rejected" || s === "unsubscribed") return "rejected";
  if (s === "clicked" || row.clickedAt) return "clicked";
  if (s === "opened" || row.openedAt) return "opened";
  if (s === "delivered") return "delivered";
  if (s === "failed" || s === "bounced") return s as BookerStatus;
  if (s === "sent" || s === "queued" || row.invitedAt) return "sent";
  return "not_sent";
}
