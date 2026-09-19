# Email templates

## Auth (paste into Supabase Dashboard)

Project `zbzfbloiodcfjxbrdynl` → Authentication → Email Templates.

Logo used in all templates:
`https://zbzfbloiodcfjxbrdynl.supabase.co/storage/v1/object/public/assets/logo.png`

Copy HTML from `emails/auth/*.html` into the matching dashboard template.

## Outreach (CRM → Resend)

Built in `emails/outreach/gt-invite.ts`, sent via `POST /api/crm/invites`.

CTA: `/join?invite={token}` — partner creates a **new** org; LEAD stays LEAD with soft attribution.

### Env
- `RESEND_API_KEY`
- `EMAIL_FROM` / `EMAIL_REPLY_TO`
- `NEXT_PUBLIC_APP_URL=https://crm.vantage-lane.com`
- `SUPABASE_SERVICE_ROLE_KEY` (for Resend webhook)

### Resend webhook
`https://crm.vantage-lane.com/api/webhooks/resend`  
Subscribe: delivered, opened, clicked, bounced.
