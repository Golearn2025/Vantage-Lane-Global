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

function sectionLabel(text: string) {
  return `<p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c4a574;">
      ${text}
    </p>`;
}

function bodyText(html: string) {
  return `<p style="margin:0 0 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#a39e93;">
      ${html}
    </p>`;
}

export function buildNetworkInviteEmail(opts: {
  organizationName: string;
  serviceCode: string;
  inviteUrl: string;
  unsubscribeUrl?: string | null;
}) {
  const service = serviceLabel(opts.serviceCode);
  const org = escapeHtml(opts.organizationName);
  const svc = escapeHtml(service);
  const blurb = escapeHtml(serviceBlurb(opts.serviceCode));

  const bodyHtml = `
    <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#c4a574;text-align:center;">
      Partner invitation
    </p>
    <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;font-weight:500;color:#f5f2eb;text-align:center;">
      You’re invited to join<br />Vantage Lane
    </h1>

    ${sectionLabel("What we build")}
    ${bodyText(
      `<span style="color:#e8e2d6;font-weight:600;">Vantage Lane Group</span> is building a <span style="color:#e8e2d6;">Partner Network</span> for premium travel and lifestyle. When a client comes to us — for an event or a complex trip — they work with <span style="color:#e8e2d6;">one contact: Vantage Lane</span>, and can cover what they need from the network: for example a <span style="color:#e8e2d6;">private jet, ground cars and a hotel</span>, plus security, concierge, medical or events support where required. One trusted point of contact. Fast coordination.`,
    )}
    ${bodyText(
      `Behind the network sits a <span style="color:#e8e2d6;">complete software ecosystem built in-house</span> by Vantage Lane Group — and <span style="color:#e8e2d6;">continuously developed</span> — so partners, profiles, coverage and jobs stay in one system as we grow.`,
    )}

    ${sectionLabel("How partners work with us")}
    ${bodyText(
      `Accepted partners complete a profile with their <span style="color:#e8e2d6;">service line, coverage, rates and professional details</span>. When a request comes in, we match it to the right partners, select the best fit, and fulfil the job through the network.`,
    )}
    ${bodyText(
      `We’re growing across <span style="color:#e8e2d6;">key markets</span> where we already operate and expand — city by city — not a claim that we cover everywhere today.`,
    )}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#0b0c0e;border:1px solid #2a2d36;border-radius:14px;">
      <tr>
        <td style="padding:18px 20px;">
          ${sectionLabel("Why we’re reaching out")}
          <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:#cfc8bc;">
            This invitation is for <span style="color:#f5f2eb;font-weight:600;">${org}</span>,
            focused on <span style="color:#c4a574;font-weight:600;">${svc}</span>
            — ${blurb}.
          </p>
        </td>
      </tr>
    </table>

    ${sectionLabel("A two-way network")}
    ${bodyText(
      `Once you’re in the network, you don’t only receive work — <span style="color:#e8e2d6;">you can also use the network</span> for your own clients. If they need support in another city or country, or a service you don’t offer yourself, you can pull from the Partner Network — and we can help deliver the trip or event end to end.`,
    )}

    <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c4a574;">
      What happens next
    </p>
    <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#8a8478;text-align:left;">
      1. Create your account (about a minute)<br />
      2. Add your company and service line<br />
      3. Complete your profile, rates &amp; documents in the guided partner area<br />
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
      preheader: `${opts.organizationName}: join the Vantage Lane Partner Network`,
      bodyHtml,
      footerNote:
        "Questions? Reply to this email · partnerships@vantage-lane.com · vantage-lane.com",
      unsubscribeUrl: opts.unsubscribeUrl,
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
