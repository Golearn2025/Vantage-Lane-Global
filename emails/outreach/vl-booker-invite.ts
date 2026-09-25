import {
  ctaButton,
  ctaButtonOutline,
  emailShell,
  EMAIL_BROCHURE_URL_DEFAULT,
  EMAIL_CONTACT,
} from "@/shared/lib/email/brand";

function bodyText(html: string) {
  return `<p style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#b7b0a4;">
      ${html}
    </p>`;
}

function contactRow(label: string, valueHtml: string) {
  return `<tr>
      <td style="padding:7px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6b665c;width:110px;vertical-align:top;">
        ${label}
      </td>
      <td style="padding:7px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#e8e2d6;vertical-align:top;">
        ${valueHtml}
      </td>
    </tr>`;
}

/**
 * VL demand outreach for hotels / concierge desks.
 * Soft ask: additional capacity / specific vehicle — not replacing existing partners.
 * CTAs: brochure + WhatsApp only (no CRM interest funnel).
 */
export function buildBookerDemandEmail(opts: {
  organizationName: string;
  /** Optional; ignored when it is a desk placeholder (most booker leads). */
  contactName?: string | null;
  /** Kept for API compatibility; unused for hotel bookers. */
  interestUrl?: string | null;
  cityHint?: string | null;
  brochureUrl?: string | null;
  unsubscribeUrl?: string | null;
}) {
  const orgRaw = cleanHotelLabel(opts.organizationName) || opts.organizationName || "Team";
  const org = escapeHtml(orgRaw);
  const person = realPersonName(opts.contactName);
  const greeting = person
    ? `Hi ${escapeHtml(person)},`
    : `Hi ${org} team,`;
  const brochureUrl =
    (opts.brochureUrl || process.env.EMAIL_BROCHURE_URL || EMAIL_BROCHURE_URL_DEFAULT).trim();
  const c = EMAIL_CONTACT;

  const bodyHtml = `
    <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#c4a574;text-align:center;">
      Vantage Lane · London
    </p>
    <h1 style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.3;font-weight:500;color:#f5f2eb;text-align:center;">
      A chauffeur partner<br />for ${org}
    </h1>

    ${bodyText(greeting)}
    ${bodyText(
      `I’m reaching out from <span style="color:#e8e2d6;">Vantage Lane</span>, a London-based luxury chauffeur service.`,
    )}
    ${bodyText(
      `We understand that established hotels will often have their own vehicles and trusted chauffeur partners already in place. We’re not looking to replace those relationships — we’d simply appreciate the opportunity to be considered when you need <span style="color:#e8e2d6;">additional capacity</span>, a <span style="color:#e8e2d6;">specific vehicle</span>, or another trusted option for one of your guests.`,
    )}
    ${bodyText(
      `Our London fleet includes Mercedes-Benz S-Class, BMW 7 Series, Range Rover, Mercedes-Benz V-Class and executive vehicles, with professional chauffeurs and 24/7 coordination.`,
    )}
    ${bodyText(
      `We cover airport transfers, hourly and full-day hire, corporate travel, events, private aviation movements and journeys throughout London and across the UK.`,
    )}
    ${bodyText(
      `<span style="color:#e8e2d6;">Even one opportunity</span> is enough for us to demonstrate the standard of service we provide.`,
    )}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;background:#0b0c0e;border:1px solid #2a2d36;border-radius:16px;">
      <tr>
        <td style="padding:24px 22px;text-align:center;">
          <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#8a8478;">
            A quick look at Vantage Lane and how we work:
          </p>
          ${ctaButton(brochureUrl, "View our brochure")}
          <p style="margin:18px 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#8a8478;">
            Save our WhatsApp for guest requests — even at short notice:
          </p>
          ${ctaButtonOutline(c.whatsappUrl, "WhatsApp Vantage Lane")}
        </td>
      </tr>
    </table>

    ${bodyText(
      `If you ever need an additional chauffeur partner, we’d be pleased to assist.`,
    )}

    <p style="margin:8px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#b7b0a4;">
      Kind regards,<br />
      <span style="color:#e8e2d6;">Vantage Lane</span><br />
      <span style="color:#8a8478;font-size:13px;">London</span>
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;border-top:1px solid #2a2d36;">
      <tr>
        <td style="padding:22px 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
            ${contactRow(
              "Phone",
              `<a href="tel:${c.phoneTel}" style="color:#e8e2d6;text-decoration:none;">${c.phoneDisplay}</a>`,
            )}
            ${contactRow(
              "WhatsApp",
              `<a href="${c.whatsappUrl}" style="color:#e8e2d6;text-decoration:none;">${c.whatsappDisplay}</a>`,
            )}
            ${contactRow(
              "Email",
              `<a href="mailto:${c.email}" style="color:#e8e2d6;text-decoration:none;">${c.email}</a>`,
            )}
            ${contactRow(
              "Web",
              `<a href="${c.websiteUrl}" style="color:#c4a574;text-decoration:none;">${c.websiteLabel}</a>`,
            )}
          </table>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: `A chauffeur partner for ${orgRaw}`,
    html: emailShell({
      title: "Vantage Lane",
      preheader: `${orgRaw}: additional chauffeur capacity when you need it — London fleet, 24/7 coordination`,
      bodyHtml,
      footerNote: `Vantage Lane · London · ${c.phoneDisplay} · ${c.websiteLabel}`,
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

/** Strip CRM desk suffixes so emails read as hotel names. */
function cleanHotelLabel(value?: string | null): string {
  let name = (value ?? "").trim();
  if (!name) return "";
  name = name
    .replace(
      /\s+(bookings?\s+desk|guest\s+(experience|services|relations)|concierge|reservations|desk)\s*$/i,
      "",
    )
    .trim();
  return name;
}

/** Desk placeholders from seed data are not personal greetings. */
function realPersonName(value?: string | null): string | null {
  const name = value?.trim();
  if (!name) return null;
  const lower = name.toLowerCase();
  if (
    lower.includes("desk") ||
    lower.includes("concierge") ||
    lower.includes("guest") ||
    lower.includes("reservations") ||
    lower.includes("team") ||
    lower.includes("reception")
  ) {
    return null;
  }
  return name;
}
