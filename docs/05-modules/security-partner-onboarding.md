# Security partner onboarding — architecture

**Status:** Design for implementation (2026-09-24). Do not invent a universal pricing engine.  
**Aligns with:** [ADR-006](../07-decisions/adr-006-gt-pricing-module.md) (GT pricing is GT-only), [partner-service-matrix.md](partner-service-matrix.md), [data-access-realtime-architecture.md](../02-architecture/data-access-realtime-architecture.md).

## Problem

GT onboarding works because partners declare **what they have** (fleet categories) and **prices per category**.

Security today is wrong for industry:

- One global **hourly + daily** on the whole firm
- Operatives step = SIA / headcount / ACS (compliance), **not** “what services we sell”
- Partners cannot add offerings VL did not list (residential for HNW homes, clubs, restaurants, etc.)

## Industry model (what we are modelling)

A security supplier sells **service lines** (mission types), not a single rate:

| Code (catalog) | Label | Typical sell unit |
|---|---|---|
| `CLOSE_PROTECTION` | Close Protection / bodyguard | hourly, daily, shift_12h |
| `RESIDENTIAL_ESTATE` | Residential / estate | per_post hourly/daily/monthly |
| `STATIC_GUARDING` | Static guarding | per_post hourly/night |
| `DOOR_VENUE` | Door / venue (club, restaurant, hotel) | hourly, per_event |
| `EVENT_SECURITY` | Event security | per_event, hourly × headcount |
| `CCTV_MONITORING` | CCTV / control room | hourly, monthly |
| `SECURE_TRANSPORT` | Secure transport / CP + vehicle | daily, transfer package |
| `TRAVEL_ADVANCE` | Travel / advance work | daily, flat |
| `OTHER` | Custom (partner-defined label) | partner picks unit |

Compliance (SIA categories, BS7858, ACS) stays **separate** from commercial catalog — same as GT driver licences ≠ vehicle categories.

## Product decision (accepted direction)

1. **Catalog** of VL security service lines (platform data, like `vehicle_categories`).
2. Partner **selects** lines they offer + may **add Other** with free-text label.
3. **Rates per selected line** (currency once on card; amount + unit per line).
4. Optional later: night/weekend uplift, min hours — not MVP blockers.
5. SIA / operatives / docs remain their own wizard steps.

## Stack we already use (reuse — do not add new libraries)

Same path as GT fleet + rates partner UI:

| Concern | Library / mechanism | Where today |
|---|---|---|
| App shell | **Next.js 15** App Router | `app/(partner)/…` |
| UI state + server sync | **TanStack Query v5** | `modules/partner/*` query keys `["partner", …]` |
| Forms (where complex) | **react-hook-form** + **zod** | join/setup, some CRM forms |
| Rates Security MVP UI | local `useState` + Query mutations | `service-rates-form.tsx` (to be replaced/extended) |
| Supabase client | **@supabase/supabase-js** + **@supabase/ssr** | `shared/lib/supabase/*` |
| Auth session | Supabase Auth | `/login` → `/partner` |
| Toasts | **sonner** | save success/error |
| Icons | **lucide-react** | partner shell |
| Styling | existing design tokens / shadcn-style UI | `shared/ui/*` |

**Do not** introduce a new pricing DSL, PDF parser, or separate REST API. Follow data-access rules: tables + RLS, views for read models, RPC only for multi-row atomic writes.

## Data architecture (proposed)

Mirror GT, Security-scoped names — **not** overload `vehicle_categories`.

### Platform catalog

`security_service_lines` (or `service_offering_types` scoped by `service_types.code = SECURITY`):

| Column | Notes |
|---|---|
| `id` uuid PK | |
| `code` text unique | e.g. `CLOSE_PROTECTION` |
| `name` text | UI label |
| `allowed_units` text[] | `hourly`, `daily`, `shift_12h`, `per_event`, `per_post`, `monthly`, `flat` |
| `sort_order` int | |
| `is_active` bool | |
| `allows_custom_label` bool | true only for `OTHER` |

### Partner declaration

Option A (preferred — parallel to fleet declarations):

- `security_service_declarations`  
  `organization_id`, `offering_id`, `service_line_id` (nullable if custom), `custom_label`, `notes`, `archived_at`

Option B (faster MVP): store selected lines + rates in structured JSON on `offerings.onboarding_inventory` under keys `security_services` / `security_rates` — **temporary only**; graduate to tables before job matching.

### Rates

**Do not** invent universal pricing. Prefer one of:

1. **Reuse `gt_rate_cards` + `gt_rate_rules`** with `vehicle_category_id = null` and a new nullable `security_service_line_id` (or `service_line_id`) on rules — extend GT tables carefully via **new migration**, document that card is “commercial rate card” for the offering’s service type.  
2. **Or** Security-specific `security_rate_cards` / `security_rate_rules` (cleaner long-term; more code).

Recommendation for VL: **(1) extend rate rules with optional `security_service_line_id`** so partner rates UI and CRM stay one card per offering; GT continues to require `vehicle_category_id`.

Rule fields for Security MVP:

- `rule_type`: map units → existing enums where possible (`HOURLY`, `DAILY`) or add `PER_EVENT`, `PER_POST`, `MONTHLY`, `FLAT` via new migration  
- `amount` / `hourly_amount` / `daily_amount` as today  
- `notes` for night/weekend free text in MVP

### Reads

- Partner UI: direct select on declarations + draft card (same as fleet/rates today).  
- Later CRM / match: view e.g. `v_security_offering_summary` (`security_invoker`) — **not** a giant org view.

### Writes

| Operation | Mechanism |
|---|---|
| Toggle / add service line | Direct insert/update declarations + RLS **or** one RPC if multi-row |
| Save rates for all selected lines | **RPC** preferred (delete+insert rules atomic) — same class as `upsertPartnerRateCard` |
| Submit for review | existing `rpc_partner_submit_for_review` |

## Wizard UX (target)

Order for `SECURITY` (update `service_types.wizard_steps` when shipping):

1. `coverage` — already exists  
2. `services` — **new**: pick catalog lines + Add other  
3. `operatives` — SIA / headcount / ACS (compliance)  
4. `rates` — **per selected line** (not one firm-wide hourly/daily)  
5. `documents`  
6. `review`

Home checklist (`partner-home.tsx` `WIZARD_STEPS.SECURITY`) must match.

## Test accounts

Direct login for QA (Auth user + membership + `ONBOARDING`):

| Email | Password | Org |
|---|---|---|
| `test.security@vantage-lane.test` | `TestPartner2026!` | VL Test Security Mayfair |

GT reference: `test-owner-london@vantage-lane.com` → `[TEST] London Executive Cars`.

Invite-only tokens in `modules/partner/test-kit-accounts.ts` remain for join-flow testing; **login users** are required to verify `/partner` rates.

## Current bugs / gaps (known)

| Issue | Status |
|---|---|
| `/partner/rates` redirected non-GT to home | Fixed on `main` (show `PartnerRatesForm` for all) |
| Security rates = single hourly/daily | **To replace** per this doc |
| No service-line catalog | **To build** |
| Operatives inventory JSON | OK as compliance store; not commercial catalog |
| ADR-006 says hotels/aviation get own packs later | Security pack is that class of work |

## Implementation sequence (when approved)

1. Doc sign-off on catalog codes + units (this file).  
2. Migration: `security_service_lines` seed + optional `gt_rate_rules.security_service_line_id` (or dedicated tables).  
3. Partner UI: services step + rates form per line (TanStack Query + existing UI kit).  
4. Wire wizard_steps + partner-home.  
5. Seed Security test org with 2–3 lines for QA.  
6. Update [partner-service-matrix.md](partner-service-matrix.md) + [partner-onboarding-test-kit.md](partner-onboarding-test-kit.md).

## Out of scope (explicit)

- Armed/unarmed market matrices  
- Per-operative personal rates  
- Auto-quote / job matching on security lines  
- Replacing GT rate engine with a universal schema
