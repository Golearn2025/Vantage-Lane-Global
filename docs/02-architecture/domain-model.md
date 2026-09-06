# Domain model (post-decision)

Conceptual model after ADRs 001–014. **Not** a Supabase schema yet.

Validation question: can VL add a UK lead with only name + WhatsApp, invite them later, record multi-base coverage for Farnborough, attach a GT rate card (or leave empty for RFQ), and compute job-eligibility from policy + documents — without a rewrite?

## Design stance

- Core: **Organization, OrgLocation, Contact, User, Membership, ServiceType, Offering, Location, Coverage, Partnership, Communication, Activity/Audit, Document, Standard/Policy**.
- GT pack: **VehicleCategory, FleetVehicle, RateCard, RateRule**.
- Org may exist with zero users and zero prices.
- Membership (access) ≠ subscription (billing) — subscription is a future hook only.
- Category ≠ vehicle model.
- Min vehicle year and other rules are **policy data**.

## Relationship diagram

```text
                         ┌────────────────────┐
                         │   ServiceType      │  platform catalog
                         └─────────┬──────────┘
                                   │
┌──────────┐  memberships  ┌───────▼────────┐   offering   ┌─────────────┐
│   User   │───────────────│  Organization  │──────────────│  Offering   │
└────┬─────┘               └───────┬────────┘              └──────┬──────┘
     │                             │                              │
     │ platform_roles              │                              │
┌────▼──────────┐                  │                    ┌─────────▼────────┐
│ PlatformRole  │         ┌────────▼────────┐           │    Coverage      │──► Location
│ + permissions │         │  OrgLocation    │◄──radius──│ (airport/city/   │
└───────────────┘         │  (bases)        │           │  region/radius)  │
                          └─────────────────┘           └─────────┬────────┘
┌────────────────┐                │                               │
│ OrgInvitation  │                │                      ┌────────▼────────┐
└────────┬───────┘                │                      │ GT Capability   │
         │                        │                      │ Fleet + Rates   │
┌────────▼───────┐       ┌────────▼────────┐             └────────┬────────┘
│    Contact     │       │  Partnership    │                      │
│ (no login req) │       │  (VL↔Org CRM)   │             ┌────────▼────────┐
└────────┬───────┘       └────────┬────────┘             │ VehicleCategory │
         │                        │                      │ (VL catalog)    │
         │ optional link          │                      └────────┬────────┘
         ▼                        ▼                               │
┌────────────────┐       ┌────────────────┐             ┌────────▼────────┐
│ User (if any)  │       │ Note/FollowUp  │             │ FleetVehicle    │
└────────────────┘       └────────────────┘             │ model + year    │
                                                        └─────────────────┘
┌────────────────┐       ┌────────────────┐             ┌─────────────────┐
│ MessageTemplate│──────►│ Communication  │             │ RateCard        │
└────────────────┘       │ (open/copy/log)│             │ + RateRule      │
                         └────────┬───────┘             └─────────────────┘
                                  │
┌────────────────┐       ┌────────▼───────┐       ┌─────────────────────┐
│ Document       │       │ Activity/Audit │       │ StandardPolicy      │
│ + verification │       └────────────────┘       │ + OrgCompliance     │
└────────────────┘                                └─────────────────────┘

┌────────────────┐
│ Location       │◄── containment (optional, for nav)
│ country/city/  │
│ airport/POI    │
└────────────────┘

Future (not built): Job, Quote, Assignment, SubscriptionPlan, OrgSubscription
```

## Core entities

### Organization

Tenant company. Created as soon as VL adds it to the network.

Typical lead minimum: name + optional website / WhatsApp / email / country interest.

Does **not** own “the” single operational location — see OrgLocation.

May have legal/registered address fields for company identity, separate from bases.

### OrgLocation (base)

Physical/operational location(s) of an organization.

Examples: Milan base, Rome base, Geneva base; London HQ + Gatwick ops base.

Fields conceptually: label, address, coords, Place ID, timezone, is_primary (UX only), kind (hq / ops_base / depot).

Coverage radius may reference an OrgLocation.

### Contact

Person at the org: Owner, Reservations, 24/7 Operations, Dispatcher, Accounts/Finance, etc.

Has channels (email, phone, WhatsApp). **No login required.**

Optional `user_id` when invite accepted.

### User

Supabase Auth identity.

May be platform staff and/or hold one or more organization memberships.

### OrganizationMembership

`user` ↔ `organization` + role(s) → permissions.

Separate from Contact and from future Subscription.

### OrganizationInvitation

Secure invite: token (hashed), expiry, target email, organization, optional contact link, scopes (profile/fleet/pricing/docs), invited_by.

Flows: admin-initiated access **or** self-onboarding link. Set-password / one-time temp credential with forced change. No shared default password.

### PlatformRole / Permission

Platform permission bundles for VL staff (Super Admin, Platform Admin, Platform Operations).

Org roles seeded separately (Owner, Admin, Dispatcher, Operations, Finance, Driver Coordinator, Viewer).

Authorization always checks **permissions**.

### ServiceType

Platform catalog: `ground_transportation`, later aviation, security, hospitality, concierge.

### Offering

Organization supplies a ServiceType.

Holds **operational_status**: `AVAILABLE` | `LIMITED` | `UNAVAILABLE` | `UNKNOWN` (no `BUSY`).

Attachment point for coverage, GT pack, documents scoped to service, compliance evaluation.

### Partnership (VL ↔ Organization)

VL-owned commercial/CRM relationship.

**relationship_status:**  
Lead | Contacted | Interested | Onboarding | Under Review | Active | Paused | Rejected | Inactive

Internal notes, follow-ups, next actions — **not** visible to the supplier by default.

### Location (platform catalog)

Typed place: country | region | locality/city | airport | address/poi.

Search keys: name, IATA/ICAO (airports), ISO country, Place ID, coordinates.

Optional containment edges for Country → Region/City → Airport **navigation** only.

First seed: United Kingdom + London-area commercial/private aviation airports. Schema remains global.

### Coverage

Offering × (location and/or org base) with mode:

- `airport_explicit`
- `city_or_region`
- `radius` (from OrgLocation or Location centre + distance + unit km|mile)

Country-wide informational coverage does **not** auto-match every airport.

Matching signal strength: explicit airport > radius containing point > weaker area flags for admin filtering.

### Activity / Audit

**Two separate stores** ([ADR-015](../07-decisions/adr-015-eligibility-ops-partnership-activity.md)):

- **Activity** — CRM/ops timeline (WhatsApp outreach, follow-up, note, onboarding link).
- **Audit log** — append-oriented security/mutation history (status change, document verify, permission change). Not event sourcing.

### Communication + MessageTemplate

Templates (email / WhatsApp text).

V1 actions: open WhatsApp, copy WhatsApp template, open email, copy email template, log outreach.

No WhatsApp Business API in MVP.

### Document

Org- or offering-scoped file metadata: type, issue date, expiry, verification status/date/by, rejection reason.

Expired required docs affect eligibility; VL gets expiry warnings.

### StandardPolicy + compliance records

Configurable standards with level: REQUIRED | RECOMMENDED | OPTIONAL.

Initial GT pack documented in modules. Evaluation feeds **derived eligibility**.

Country overlays later — do not hard-code every SLA globally.

### Future: SubscriptionPlan / OrgSubscription

Hook only. MVP: all suppliers FREE. Do not implement billing.

---

## Ground Transportation pack

### VehicleCategory (catalog)

Closed VL list:

| Category | Example models (illustrative) |
|---|---|
| Executive Sedan | E-Class, BMW 5/i5, EQE |
| Luxury Sedan | S-Class, BMW 7/i7 |
| Luxury SUV | Range Rover Autobiography, Escalade |
| Luxury MPV | V-Class |
| Executive Van / Sprinter | Sprinter or equivalent |
| Minibus | — |
| Coach | — |

### FleetVehicle (progressive fidelity)

**Two concepts:**

1. **`gt_fleet_declarations`** — early network building: “8 × S-Class 2024–2026, declared” without VIN/plate.
2. **`gt_fleet_units`** — later individual cars (model, year, registration, verified).

Category (global commercial class) stays separate from make/model.  
US Escalade ESV 2025 and UK Range Rover Autobiography 2024 can both map to `Luxury SUV`.

Compliance is per declaration/unit. Matching needs compliant **capacity** in the requested category (≥1 unit and/or remaining declared qty that meets policy). One old E-Class does not fail the whole organization.

### RateCard + RateRule

GT-only. Currency on card. Rules support:

- fixed transfer
- distance: base + per unit + minimum; unit mile|km
- hourly (by category)
- daily
- airport transfer
- waiting
- parking
- meet & greet
- extra stop

No applicable rule → RFQ later. Not a universal multi-vertical pricing engine.

---

## Status & eligibility (derived)

| Concern | Where | Source of truth |
|---|---|---|
| Relationship | `partnerships.relationship_status` | Explicit CRM state (separate table) |
| Operational | `offerings.operational_status` | AVAILABLE / LIMITED / UNAVAILABLE / UNKNOWN |
| Vehicle compliance | `gt_fleet_vehicles.compliance_status` (+ policy) | Per vehicle; category match needs ≥1 compliant |
| Eligibility | Derived function / projection | Never a SoT `job_eligible` column |

Eligibility (conceptual):

```text
may_consider =
  partnership.relationship_status = ACTIVE

job_eligible ≈
  may_consider
  AND offering.operational_status IN (AVAILABLE, LIMITED)  -- UNKNOWN: recommend exclude from auto-match
  AND offering.operational_status <> UNAVAILABLE
  AND required standards/docs OK
  AND coverage matches request
  AND ≥1 lifecycle-active + policy-compliant fleet vehicle in REQUESTED category
```

ACTIVE partnership alone never implies job-eligible (e.g. expired insurance, UNAVAILABLE, old-only fleet in that category).

---

## Data ownership

| Data | Owner | Supplier-visible |
|---|---|---|
| Catalogs (locations, categories, service types, standard definitions) | Platform | Reference yes |
| Org profile, bases, contacts, offerings, coverage, fleet, rates, docs | Organization | Own only |
| Partnership, VL notes, follow-ups, eligibility overrides | VL / platform | No (or sanitized) |
| Communications logged about them | Shared/ops | Own messages as applicable |
| Future job invites | Transactional | Only invited |

---

## Explicitly not in domain yet

Drivers as users, live GPS, jobs/quotes UI, buyer portal, billing, WhatsApp API, geo-polygons, custom role builder UI.
