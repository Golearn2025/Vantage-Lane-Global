# Proposed Supabase implementation plan

**Status:** Plan only. Do **not** create project tables, run migrations, implement auth, or build UI until this plan is approved after domain review.

## Goals

1. Versioned SQL migrations from day one.
2. Hybrid tenancy with RLS.
3. Seed UK market + catalogs + roles + GT standards.
4. Support org-without-users and invitation-based access.
5. Leave Jobs and WhatsApp API and billing out of the first slices.

## Phase 0 — Project bootstrap (no product tables yet)

- Create Supabase project (when approved).
- Local Supabase CLI + `supabase/migrations/`.
- Environments: local / staging / production discipline.
- Decide: Next.js App Router + `@supabase/ssr` patterns (doc only until implementation).

## Phase 1 — Foundations migration

**Tables / objects**

- `profiles`
- `permissions`, `roles`, `role_permissions`
- `platform_role_assignments`
- `organizations`
- `organization_memberships` (+ role link)
- Helper SQL functions: `auth_is_platform_user()`, `auth_has_permission(...)`, `auth_org_ids()`

**RLS**

- Platform permission bypass patterns
- Deny-by-default on tenant tables

**Seeds**

- Platform roles: Super Admin, Platform Admin, Platform Operations
- Org roles: Owner, Admin, Dispatcher, Operations, Finance, Driver Coordinator, Viewer
- Permission keys (initial set)

**Auth**

- Design invite / set-password using Supabase Auth (implement in a later phase).
- No shared passwords.

## Phase 2 — Network CRM

- `organization_partnerships` (relationship_status, …)
- `organization_contacts`
- `organization_locations`
- `organization_notes`, `organization_follow_ups`
- `activities` and/or `audit_events`

**Capability:** VL admin can add UK leads to a table with WhatsApp/email, notes, follow-ups — still zero users.

## Phase 3 — Catalog & geography

- `service_types` (seed ground_transportation)
- `locations` + optional `location_edges`
- Seed: United Kingdom, London / surrounding localities as needed, major commercial + private aviation airports (LHR, LGW, STN, LTN, LCY, SEN, SOU, BOH, FAB, etc. — exact list OPEN)
- Search indexes: name, iata, icao, country_code

## Phase 4 — Offerings & coverage

- `offerings` (operational_status)
- `offering_coverages` (airport / city-region / radius + unit)
- Link radius to `organization_locations` where applicable

**Capability:** “Which orgs claim explicit coverage of Farnborough?”

## Phase 5 — GT pack: fleet & pricing

- `vehicle_categories` seed (7 categories)
- `gt_fleet_vehicles`
- `gt_rate_cards`, `gt_rate_rules` (rule types per ADR-006)
- Distance unit on rules

**Capability:** Store fixed / distance / hourly / surcharge-style rules; empty card allowed (future RFQ).

## Phase 6 — Documents, standards, eligibility

- `document_types`, `documents` + Storage buckets + policies
- `standard_definitions` seed (GT pack, levels REQUIRED/RECOMMENDED/OPTIONAL)
- `offering_standard_compliances`
- Policy parameter for min vehicle year = 2023
- Eligibility view or function (derived)
- Expiry warning query (in-app first)

## Phase 7 — Invitations & membership activation

- `organization_invitations`
- Admin invite-by-email + self-onboarding link flows
- Create membership on accept; optional link contact → user
- Audit invitation lifecycle

**Still no** billing.

## Phase 8 — Communications V1

- `message_templates`
- `communications` (channel, template_id, contact_id, action_type: open_whatsapp | copy_whatsapp | open_email | copy_email | logged_note, body snapshot)
- Activity entries on log

**Explicitly not:** WhatsApp Business API webhooks.

## Phase 9 — Admin application (after migrations exist)

Order of UI (when implementation is allowed):

1. Auth for platform staff
2. Organizations table / pipeline
3. Org detail: contacts, bases, notes, activity
4. Locations search
5. Coverage + map later
6. Fleet + rates
7. Documents + standards checklist
8. Invite flows
9. Template open/copy/log

## Phase 10 — Stop and validate

Run the UK London-airport network loop with real operators before Jobs.

## Explicitly deferred implementations

| Item | When |
|---|---|
| Jobs / quotes / RFQ automation | After Phase 10 validation |
| WhatsApp API | Post-MVP |
| Subscriptions / Stripe | Post-MVP |
| Buyer portal | Post-MVP |
| PostGIS | If radius volume/accuracy demands |
| Custom role UI | Post-MVP |
| Other verticals | After GT loop proven |

## Migration rules

- One concern per migration where practical.
- Seeds idempotent.
- No manual production schema edits.
- RLS enabled before any real org data.
- Storage policies reviewed with document uploads.

## Approval gate

Do not start Phase 0/1 until stakeholder accepts:

1. Domain model
2. Tables vs config split
3. This phased plan
4. Answers to critical OPEN items O1–O4 in contradictions doc (at least)
