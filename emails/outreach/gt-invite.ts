import {
  ctaButton,
  emailShell,
  serviceLabel,
} from "@/shared/lib/email/brand";

export function buildNetworkInviteEmail(opts: {
  organizationName: string;
  serviceCode: string;
  inviteUrl: string;
}) {
  const service = serviceLabel(opts.serviceCode);
  const bodyHtml = `
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#c4a574;text-align:center;">
      Partner invitation
    </p>
    <h1 style="margin:0 0 14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:26px;line-height:1.25;font-weight:600;color:#f5f2eb;text-align:center;">
      Join the Vantage Lane Network
    </h1>
    <p style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#a39e93;text-align:center;">
      We’re building a premium partner network across
      <span style="color:#e8e2d6;">Ground Transportation</span>,
      Security, Aviation, Hospitality, and more.
    </p>
    <p style="margin:0 0 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#a39e93;text-align:center;">
      This invitation is for
      <span style="color:#e8e2d6;">${escapeHtml(opts.organizationName)}</span>
      — focused on
      <span style="color:#c4a574;">${escapeHtml(service)}</span>.
    </p>
    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#8a8478;text-align:center;">
      Create your account, choose your service, and complete your company profile.
      You’ll appear in our live network once onboarding is done.
    </p>
    ${ctaButton(opts.inviteUrl, "Join the network")}
    <p style="margin:24px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:#6b665c;text-align:center;">
      Or open this link:<br />
      <a href="${opts.inviteUrl}" style="color:#c4a574;text-decoration:none;word-break:break-all;">${opts.inviteUrl}</a>
    </p>
  `;

  return {
    subject: `Join Vantage Lane — ${service} partner invitation`,
    html: emailShell({
      title: "Join Vantage Lane",
      preheader: `Invitation for ${opts.organizationName} · ${service}`,
      bodyHtml,
      footerNote: "Questions? Reply to this email or write network@vantage-lane.com",
    }),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
