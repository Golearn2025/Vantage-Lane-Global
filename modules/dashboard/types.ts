export type OutreachDashboardStats = {
  leadsTotal: number;
  leadsWithEmail: number;
  leadsReadyNotSent: number;
  invitesSent: number;
  invitesDelivered: number;
  invitesOpened: number;
  invitesClicked: number;
  invitesSignedUp: number;
  invitesFailed: number;
  contactsWithEmail: number;
  communicationsEmailSent: number;
};

/** VL Bookers (demand) funnel — separate from network partner invites. */
export type BookerDashboardStats = {
  leadsTotal: number;
  leadsWithEmail: number;
  leadsReadyNotSent: number;
  emailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  interested: number;
  emailsFailed: number;
  communicationsEmailSent: number;
};
