import { ctaButton, emailShell } from "@/shared/lib/email/brand";

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

/**
 * Demand / booker outreach — hotels, concierge desks, travel desks.
 * Not a partner join invite; CTA opens interest link + reply.
 */
export function buildBookerDemandEmail(opts: {
  organizationName: string;
  contactName?: string | null;
  interestUrl: string;
  cityHint?: string | null;
}) {
  const name = escapeHtml(opts.organizationName);
  const greeting = opts.contactName?.trim()
    ? `Dear ${escapeHtml(opts.contactName.trim())},`
    : `Dear ${name} team,`;
  const place = opts.cityHint?.trim()
    ? escapeHtml(opts.cityHint.trim())
    : "your market";

  const bodyHtml = `
    <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.35;color:#e8e2d6;text-align:left;">
      Coverage for your guests — without building a fleet
    </p>
    <p style="margin:0 0 22px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#c4a574;">
      Vantage Lane · Booker network
    </p>

    ${bodyText(greeting)}
    ${bodyText(
      `When a guest needs a chauffeur, airport transfer, or discreet ground support in ${place} — or in another city — you shouldn’t have to scramble across unknown operators.`,
    )}
    ${bodyText(
      `<span style="color:#e8e2d6;">Vantage Lane</span> connects trusted bookers (hotels, concierge and travel desks) to a curated partner network: vetted ground transportation and specialist services, coordinated under one relationship.`,
    )}

    ${sectionLabel("What you get")}
    <p style="margin:0 0 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#8a8478;text-align:left;">
      • Reliable coverage for guest transfers and VIP movements<br />
      • A single point of contact for multi-city requests<br />
      • Partners held to network standards — you keep the guest relationship
    </p>

    ${sectionLabel("No supplier onboarding")}
    ${bodyText(
      `This is not an invitation to join as an operator. It’s an introduction for desks that <span style="color:#e8e2d6;">book</span> services for guests. If it fits, reply to this email or tap below — we’ll follow up personally.`,
    )}

    ${ctaButton(opts.interestUrl, "I’m interested")}

    <p style="margin:22px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:#6b665c;text-align:center;">
      Or reply to partnerships@vantage-lane.com — no obligation.
    </p>
  `;

  return {
    subject: `${opts.organizationName} — guest coverage via Vantage Lane`,
    html: emailShell({
      title: "Guest coverage · Vantage Lane",
      preheader: `${opts.organizationName}: book vetted transfers for your guests`,
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
