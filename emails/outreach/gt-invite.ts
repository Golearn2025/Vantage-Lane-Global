import {
  ctaButton,
  emailShell,
  serviceLabel,
} from "@/shared/lib/email/brand";

const SERVICE_BLURBS: Record<string, string> = {
  GROUND_TRANSPORTATION:
    "chauffeur and airport transfer operators who meet premium fleet and service standards",
  AVIATION: "private aviation and charter partners for high-touch itineraries",
  SECURITY: "close protection and executive security teams for discreet coverage",
  HOSPITALITY: "hotels, dining and venues that fit a luxury travel stack",
  CONCIERGE: "lifestyle and access partners who deliver white-glove requests",
  YACHT: "yacht charter and marine handling for coastal and event travel",
  MEDICAL: "medical escort and wellness partners for sensitive journeys",
  EVENTS: "events and protocol partners for galas, corporate and VIP production",
  PRIVATE_AVIATION: "private aviation partners for charter and handling",
};

function serviceBlurb(code: string) {
  return (
    SERVICE_BLURBS[code] ||
    "specialist operators who uphold Vantage Lane network standards"
  );
}

export function buildNetworkInviteEmail(opts: {
  organizationName: string;
  serviceCode: string;
  inviteUrl: string;
}) {
  const service = serviceLabel(opts.serviceCode);
  const org = escapeHtml(opts.organizationName);
  const svc = escapeHtml(service);
  const blurb = escapeHtml(serviceBlurb(opts.serviceCode));

  const bodyHtml = `
    <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#c4a574;text-align:center;">
      Partner invitation
    </p>
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;font-weight:500;color:#f5f2eb;text-align:center;">
      You’re invited to join<br />Vantage Lane
    </h1>
    <p style="margin:0 0 22px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#a39e93;text-align:center;">
      Vantage Lane is building a <span style="color:#e8e2d6;">premium Partner Network</span>
      for high-end travel and lifestyle — one place where trusted operators
      across different services work to shared standards.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#0b0c0e;border:1px solid #2a2d36;border-radius:14px;">
      <tr>
        <td style="padding:18px 20px;">
          <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c4a574;">
            Why we’re reaching out
          </p>
          <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:#cfc8bc;">
            This invitation is for <span style="color:#f5f2eb;font-weight:600;">${org}</span>,
            focused on <span style="color:#c4a574;font-weight:600;">${svc}</span>
            — ${blurb}.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a7468;text-align:center;">
      One network · many services
    </p>
    <p style="margin:0 0 22px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.7;color:#8a8478;text-align:center;">
      Ground Transportation · Security · Aviation · Hospitality<br />
      Concierge · Yacht · Medical · Events
    </p>

    <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#a39e93;text-align:center;">
      <span style="color:#e8e2d6;">What happens next</span>
    </p>
    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#8a8478;text-align:left;">
      1. Create your account (about a minute)<br />
      2. Choose your service line and company details<br />
      3. Complete your partner profile &amp; standards<br />
      4. Go live in the network when you’re ready
    </p>

    ${ctaButton(opts.inviteUrl, "Join the network")}

    <p style="margin:22px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:#6b665c;text-align:center;">
      No obligation — you control what you share and when you go live.
    </p>
    <p style="margin:14px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;color:#5c574e;text-align:center;word-break:break-all;">
      Or open this link:<br />
      <a href="${opts.inviteUrl}" style="color:#c4a574;text-decoration:none;">${opts.inviteUrl}</a>
    </p>
  `;

  return {
    subject: `${opts.organizationName} — invitation to the Vantage Lane Network`,
    html: emailShell({
      title: "Join Vantage Lane",
      preheader: `${opts.organizationName}: join our premium ${service} partner network`,
      bodyHtml,
      footerNote:
        "Questions? Reply to this email · partnerships@vantage-lane.com · vantage-lane.com",
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
