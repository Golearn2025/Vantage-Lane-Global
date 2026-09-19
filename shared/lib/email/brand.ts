export const EMAIL_LOGO_URL =
  "https://zbzfbloiodcfjxbrdynl.supabase.co/storage/v1/object/public/assets/logo.png";

export const EMAIL_FROM_DEFAULT = "Vantage Lane Network <partnerships@vantage-lane.com>";
export const EMAIL_REPLY_TO_DEFAULT = "partnerships@vantage-lane.com";

const SERVICE_LABELS: Record<string, string> = {
  GROUND_TRANSPORTATION: "Ground Transportation",
  AVIATION: "Aviation",
  SECURITY: "Security",
  HOSPITALITY: "Hospitality",
  CONCIERGE: "Concierge",
  YACHT: "Yacht & Marine",
  MEDICAL: "Medical & Wellness",
  EVENTS: "Events",
  PRIVATE_AVIATION: "Private Aviation",
};

export function serviceLabel(code: string | null | undefined) {
  if (!code) return "Partner Network";
  return SERVICE_LABELS[code] ?? code.replaceAll("_", " ");
}

/** Shared dark/gold shell for transactional + outreach emails. */
export function emailShell(opts: {
  title: string;
  preheader?: string;
  bodyHtml: string;
  footerNote?: string;
}) {
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#0b0c0e;-webkit-font-smoothing:antialiased;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b0c0e;width:100%;">
    <tr>
      <td align="center" style="padding:48px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">
          <tr>
            <td align="center" style="padding:0 0 28px;">
              <img src="${EMAIL_LOGO_URL}" width="56" height="56" alt="Vantage Lane" style="display:block;width:56px;height:56px;border:0;" />
              <p style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#c4a574;">
                Vantage Lane
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#12141a;border:1px solid #2a2d36;border-radius:20px;padding:36px 32px;">
              ${opts.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 12px 0;text-align:center;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;color:#5c574e;">
                ${opts.footerNote ?? "© Vantage Lane · Partner Network"}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function ctaButton(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto 0;">
  <tr>
    <td align="center" style="border-radius:999px;background:#c4a574;">
      <a href="${href}" style="display:inline-block;padding:16px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#0b0c0e;text-decoration:none;border-radius:999px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}
