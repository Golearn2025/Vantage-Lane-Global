import {
  ctaButton,
  ctaButtonOutline,
  emailShell,
  EMAIL_BROCHURE_URL_DEFAULT,
  EMAIL_CONTACT,
} from "@/shared/lib/email/brand";

function bodyText(html: string) {
  return `<p style="margin:0 0 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#b7b0a4;">
      ${html}
    </p>`;
}

function contactRow(label: string, valueHtml: string) {
  return `<tr>
      <td style="padding:8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b665c;width:110px;vertical-align:top;">
        ${label}
      </td>
      <td style="padding:8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#e8e2d6;vertical-align:top;">
        ${valueHtml}
      </td>
    </tr>`;
}

/**
 * VL demand outreach for hotels / concierge desks.
 * Lead with brand + brochure; soft interest CTA. Not a network-join invite.
 */
export function buildBookerDemandEmail(opts: {
  organizationName: string;
  /** Optional; ignored when it is a desk placeholder (most booker leads). */
  contactName?: string | null;
  interestUrl: string;
  cityHint?: string | null;
  brochureUrl?: string | null;
}) {
  const org = escapeHtml(opts.organizationName);
  const person = realPersonName(opts.contactName);
  const greeting = person
    ? `Dear ${escapeHtml(person)},`
    : `Dear ${org} team,`;
  const place = opts.cityHint?.trim()
    ? escapeHtml(opts.cityHint.trim())
    : "your city";
  const brochureUrl =
    (opts.brochureUrl || process.env.EMAIL_BROCHURE_URL || EMAIL_BROCHURE_URL_DEFAULT).trim();
  const c = EMAIL_CONTACT;

  const bodyHtml = `
    <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#c4a574;text-align:center;">
      An introduction
    </p>
    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.22;font-weight:500;color:#f5f2eb;text-align:center;">
      The standard is<br />different here.
    </h1>
    <p style="margin:0 0 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:#8a8478;text-align:center;">
      Private chauffeur · London and beyond
    </p>

    ${bodyText(greeting)}
    ${bodyText(
      `We are reaching out to <span style="color:#e8e2d6;">${org}</span> because we work with hotels and desks that care how their guests move — airport, private aviation, city, multi-day — with discretion and one point of contact.`,
    )}
    ${bodyText(
      `Vantage Lane is a private chauffeur standard built around the journey: the right vehicle, the right chauffeur, responsive coordination. Not a marketplace of unknown operators.`,
    )}
    ${bodyText(
      `When a guest in ${place} — or travelling onward — needs ground that matches your house standard, we are the team behind it. You keep the guest relationship; we deliver the movement.`,
    )}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 28px;background:#0b0c0e;border:1px solid #2a2d36;border-radius:16px;">
      <tr>
        <td style="padding:26px 24px;text-align:center;">
          <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#c4a574;">
            Our brochure
          </p>
          <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.35;color:#f5f2eb;">
            See who we are — in two minutes.
          </p>
          <p style="margin:0 0 22px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#8a8478;">
            Fleet, chauffeurs, operations, and how we work with partners.
          </p>
          ${ctaButton(brochureUrl, "View our brochure")}
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c4a574;text-align:center;">
      If it resonates
    </p>
    <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#a39e93;text-align:center;">
      Tell us you’re interested — we’ll follow up personally.<br />
      <span style="color:#6b665c;">This is not a supplier signup. No forms to join a network.</span>
    </p>

    ${ctaButtonOutline(opts.interestUrl, "I’m interested")}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 0;border-top:1px solid #2a2d36;">
      <tr>
        <td style="padding:24px 0 0;">
          <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#c4a574;text-align:center;">
            Talk to us
          </p>
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
    subject: `${opts.organizationName} — a note from Vantage Lane`,
    html: emailShell({
      title: "Vantage Lane",
      preheader: `${opts.organizationName}: see the Vantage Lane standard — private chauffeur, London and beyond`,
      bodyHtml,
      footerNote: `Vantage Lane · London · ${c.phoneDisplay} · ${c.websiteLabel}`,
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
