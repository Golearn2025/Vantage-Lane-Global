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
  isTest: boolean;
};

export type BookerStatus =
  | "not_sent"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "signed_up"
  | "failed"
  | "bounced";

export function deriveBookerStatus(row: BookerLead): BookerStatus {
  if (row.inviteAcceptedAt || row.convertedOrganizationId) return "signed_up";
  const s = (row.lastEmailStatus || "").toLowerCase();
  if (s === "clicked" || row.clickedAt) return "clicked";
  if (s === "opened" || row.openedAt) return "opened";
  if (s === "delivered") return "delivered";
  if (s === "failed" || s === "bounced") return s as BookerStatus;
  if (s === "sent" || s === "queued" || row.invitedAt) return "sent";
  return "not_sent";
}
