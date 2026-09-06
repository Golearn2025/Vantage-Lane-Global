# MVP scope

MVP is the smallest system that lets VL staff **build a Ground Transportation network in one country** and be ready to route work later.

It is not a public marketplace. It is not a driver app. It is not a complete jobs engine.

## In scope

### Network building (must have)

- VL admins create organizations manually (table / form).
- VL admins record company details, contacts, WhatsApp, email, website, address, coordinates, Google Place ID when available.
- VL admins record countries, cities/regions, airports covered, coverage radius.
- Organizations can exist as leads before they become partners.
- Partnership lifecycle is tracked, with history.
- Internal notes, follow-up dates, next actions, activity timeline.
- Organization / partnership / activity are visible to VL only unless we later grant supplier access.

### Two onboarding doors (must have in the model; portal can be thin)

- Manual admin create.
- Secure onboarding link so the operator can complete its own profile.
- Both write the same Organization + Offering + Coverage + Contacts model.

### Ground Transportation facts (must have)

- Fleet by vehicle category and quantity, plus year / quality hints.
- Services / products the company offers.
- Pricing:
  - fixed rates by category / product
  - and/or distance-based: base fare + per mile or km + minimum price
- Documents (at least as records + files, even if the checklist is small).
- Operational standards (at least a VL-controlled checklist + pass/fail).
- Status that can distinguish “we know them” from “they can receive jobs”.

### Map and search (must have at a basic level)

- Search / navigate Country → Region/City → Airport, **and** jump directly to an airport or place.
- Organizations plotted by coordinates.
- Query of the form: “which job-eligible GT suppliers cover this airport / city?”

### Communications (V1 = manual open/copy/log)

- Email and WhatsApp templates.
- Actions: Open WhatsApp, Copy WhatsApp template, Open Email, Copy Email template, log outreach.
- WhatsApp Desktop/Web launch for the contact/org number when available.
- **No WhatsApp Business API in MVP.**
- Every outreach action is stored on the activity timeline.

### Platform foundations (must have)

- Multi-tenant `organization_id` on tenant data.
- Platform admin vs organization member.
- Permission-based RBAC (even if the first role catalog is small).
- Server-side / RLS authorization.
- Versioned migrations.
- Strong TypeScript types.

## Out of scope for MVP

- Jobs / Requests UI and assignment engine. Architecture must not block them.
- Auto-dispatch.
- Driver accounts, driver apps, live GPS tracking.
- Public supplier directory.
- Payments, invoicing, supplier payouts.
- Buyer self-serve booking portal.
- Private Aviation / Security / Hospitality / Concierge modules.
- Full Google Maps product (Places IDs and coordinates can be stored; rich map UX can follow).
- Complex SLA / quality scoring (store a place for it later).
- Multi-language supplier portal.
- Custom role builder UI (the permission model must allow it later).

## Explicitly deferred but designed for

| Later capability | What we must not break now |
|---|---|
| Jobs | Coverage, eligibility, pricing and contacts must be queryable. |
| Auto-quote vs RFQ | Pricing must be structured enough to say “can we quote this?” |
| Other verticals | Core tables must not be named or shaped around cars. |
| Org users (dispatcher, finance, …) | Memberships + permissions, not a single “owner email” field. |
| Dual-role orgs | Supplier/buyer is a capability, not a single exclusive type. |

## MVP operating assumption

The first users of the software are **VL administrators**, not hundreds of supplier logins.

That matters. We should not overbuild a supplier SaaS workspace before the network table, CRM and onboarding loop work.

Self-onboarding is still required, but it can be a focused profile form behind a link, not a full product.

## Pricing in MVP — what “good” means

GT-specific rate cards (not a universal pricing engine). The model must support:

- fixed transfer and airport transfer pricing
- base fare + price per mile **or** km + minimum price
- hourly and daily by vehicle category
- waiting, parking, meet & greet, extra stop charges

Currency on the rate card. Incomplete prices are allowed. Missing applicable prices ⇒ future RFQ / manual quotation.

## First market

**United Kingdom** — London and surrounding major commercial/private aviation airports. Architecture and schema must not be UK-specific.

## First-country test

The architecture is validated when VL can start in the UK, add a handful of companies by hand, contact them (open/copy/log), onboard them, mark them appropriately, and answer:

> Which eligible GT suppliers can cover this airport, with this vehicle category, and can we quote or must we ask?

If the schema cannot answer that without a rewrite, it is the wrong schema.
