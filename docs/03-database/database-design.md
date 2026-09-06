# Database design (logical)

**Status:** Direction approved. Column-level detail in [schema-columns.md](schema-columns.md). **No SQL / migrations yet.**

Final clarifications: [ADR-016](../07-decisions/adr-016-final-pre-column-clarifications.md).

---

## 1. Naming convention

| Rule | Example |
|---|---|
| Snake_case, plural table names | `organizations`, `gt_fleet_vehicles` |
| UUID primary keys named `id` | `id uuid PK` |
| Foreign keys named `{entity}_id` | `organization_id`, `offering_id` |
| Join tables: `{a}_{b}` plural or explicit | `role_permissions`, `organization_memberships` |
| Enums: PostgreSQL enums **or** text + check — prefer enums for closed stable sets; lookup tables for VL-editable catalogs | see §11 |
| Soft-delete column (when used) | `archived_at timestamptz null` |
| Timestamps | `created_at`, `updated_at` on mutable tables |
| Actor columns | `created_by_user_id`, `updated_by_user_id` where useful |
| Vertical prefixes | `gt_` for Ground Transportation–only tables |
| No org-scoped duplication of global catalogs | `locations` is global, not `organization_locations` for airports |

Auth: Supabase `auth.users`. App profile table: `profiles` with `id` = `auth.users.id`.

---

## 2. Primary key and identity principle

- Prefer **UUID** PKs everywhere (except possibly pure seed lookup codes — still UUID is fine for consistency).
- Every **tenant-owned** row must have an unambiguous path to `organization_id`.
- Do **not** mechanically denormalize `organization_id` onto every child if the parent already owns it **and** RLS can join safely and efficiently.
- When child tables are queried often with tenant filters, or RLS joins would be deep/fragile, **denormalize `organization_id`** and enforce consistency with a composite FK or trigger later.

### Ownership path policy (choice per table)

| Pattern | When | Example |
|---|---|---|
| Direct `organization_id` | Top-level tenant aggregates; high-volume RLS | `organization_contacts`, `organization_locations`, `offerings`, `documents` |
| Via parent only | Narrow children always loaded with parent | `gt_rate_rules` → via `gt_rate_cards.offering_id` → `offerings.organization_id` — **recommend also denormalize** `organization_id` on rate cards for RLS simplicity |
| Platform / global | No org ownership | `locations`, `vehicle_categories`, `service_types`, `standard_definitions` |
| Platform assignment | User-scoped platform power | `platform_role_assignments` |

**Recommendation for MVP RLS safety:** put `organization_id` on every org-owned “security boundary” table that clients might query directly (`offerings`, `offering_coverages`, `gt_fleet_vehicles`, `gt_rate_cards`, `documents`, `communications`, `organization_invitations`). Deep grandchildren may inherit via parent **only if** they are never exposed without parent join — still prefer denormalized `organization_id` on `gt_rate_rules` if selected alone.

---

## 3. Logical ERD

```text
auth.users 1──1 profiles
                │
                ├──< platform_role_assignments >── roles (scope=platform)
                │
                └──< organization_memberships >── organizations
                         │              │
                         └── roles      │
                              (scope=org)
                                        │
         organizations 1──────────────1 partnerships (VL↔org)
               │                        │
               ├──< organization_locations
               ├──< organization_contacts ──── optional ──> profiles (user)
               ├──< organization_notes          (VL-private)
               ├──< organization_follow_ups
               ├──< organization_invitations
               ├──< documents
               └──< offerings >── service_types
                        │
                        ├── operational_status
                        ├──< offering_coverages >── locations
                        │         └── optional org_location_id (radius base)
                        ├──< offering_standard_compliances >── standard_definitions
                        ├──< gt_fleet_vehicles >── vehicle_categories
                        └──< gt_rate_cards
                                  └──< gt_rate_rules >── vehicle_categories
                                                       └── optional location refs

permissions ──< role_permissions >── roles

locations ──< location_edges >── locations   (nav containment, optional)

message_templates (platform and/or org — see ownership)
communications >── organizations, contacts, templates

activities >── organizations (+ optional offering/contact refs)
audit_logs  (append-only; org_id nullable for platform-wide events)

document_types (catalog)
vehicle_categories (catalog)  ←── commercial class
gt_fleet_vehicles             ←── concrete model/year (Escalade ESV 2025 ≠ Range Rover 2024; same Luxury SUV)

NOT IN THIS DESIGN (later): jobs, quotes, subscriptions billing tables
```

### Cardinalities (summary)

| From | To | Cardinality |
|---|---|---|
| Organization | Partnership | **1:1** for MVP VL↔org commercial relationship (future: could become 1:N if multiple relationship kinds — design Partnership as own table so this can evolve) |
| Organization | OrgLocation | 1:N |
| Organization | Contact | 1:N |
| Organization | Offering | 1:N |
| Organization | Membership | 1:N |
| User | Membership | 1:N (multi-org allowed by model) |
| Offering | Coverage | 1:N |
| Offering | FleetVehicle | 1:N |
| Offering | RateCard | 1:N (versioned / dated) |
| RateCard | RateRule | 1:N |
| FleetVehicle | VehicleCategory | N:1 |
| Coverage | Location | N:1 (nullable if radius-only around org base) |
| Contact | User | N:0..1 |
| ServiceType | Offering | 1:N |
| Location | LocationEdge | 1:N as parent or child |

**VehicleCategory ↔ FleetVehicle (mandatory separation):**  
Global category `Luxury SUV`. Org A: `Cadillac Escalade ESV — 2025`. Org B: `Range Rover Autobiography — 2024`. Both map to the same category for matching/pricing; models stay org-owned facts.

---

## 4. Entity / table responsibilities

### 4.1 Identity & access

| Table | Responsibility |
|---|---|
| `profiles` | Display name, avatar, locale; mirrors auth user |
| `organizations` | Legal/commercial company identity (name, website, legal address fields, branding). **No** relationship_status |
| `organization_memberships` | User access to an org; status (invited/active/disabled) |
| `roles` | Seeded role bundles; `scope` = `platform` \| `organization` |
| `permissions` | Permission keys (`platform.network.manage`, `org.pricing.write`, …) |
| `role_permissions` | M:N |
| `membership_roles` | Membership ↔ role (allows multiple roles later; MVP may start 1 role/membership) |
| `platform_role_assignments` | VL staff ↔ platform role |
| `organization_invitations` | Secure invite/self-onboard tokens (hashed), email, scopes, expiry |

### 4.2 Partnership & CRM

| Table | Responsibility |
|---|---|
| `partnerships` | VL ↔ Organization relationship: `relationship_status`, dates, commercial notes flags, future buyer/supplier relationship facets |
| `organization_contacts` | Real-world people; `contact_type` label (owner, reservations, dispatcher, …); channels; **not** RBAC |
| `organization_notes` | VL-private notes |
| `organization_follow_ups` | Next actions / due dates |
| `activities` | Human CRM/ops timeline |
| `audit_logs` | Append-oriented security/mutation history |

### 4.3 Catalog (platform-owned)

| Table | Responsibility |
|---|---|
| `service_types` | GT, aviation, … |
| `locations` | Country/region/city/airport/POI; IATA/ICAO; coords; Place ID |
| `location_edges` | Optional containment for UI navigation |
| `vehicle_categories` | Executive Sedan, Luxury Sedan, Luxury SUV, … |
| `document_types` | Insurance, licence, … |
| `standard_definitions` | Configurable standards + level + parameters (e.g. min_vehicle_year=2023) |
| `message_templates` | Platform default templates (org-custom templates: see ownership) |

### 4.4 Tenant commercial / ops

| Table | Responsibility |
|---|---|
| `organization_locations` | Bases (Milan/Rome/Geneva; London + Gatwick ops) |
| `offerings` | Org supplies service_type; **operational_status** |
| `offering_coverages` | Airport explicit / city-region / radius |
| `documents` | File metadata + verification + expiry |
| `offering_standard_compliances` | Evidence / pass state per standard for an offering |
| `communications` | Open/copy/log outreach records |

### 4.5 Ground Transportation

| Table | Responsibility |
|---|---|
| `gt_fleet_vehicles` | Concrete vehicles: category_id, make/model, year, qty, capacity, images, **vehicle_compliance_status** / lifecycle |
| `gt_rate_cards` | Versioned price list for an offering |
| `gt_rate_rules` | Typed rules: fixed, distance, hourly, daily, airport, wait, parking, meet_greet, extra_stop |

---

## 5. Major fields (conceptual — not SQL)

### `organizations`
`id`, `legal_name`, `display_name`, `website`, `primary_email`, `primary_phone`, `primary_whatsapp` (optional denormalized shortcuts — contacts remain source for people), `legal_address_*`, `google_place_id` (legal/HQ optional), `country_code` (interest/home, not coverage), `archived_at`, timestamps.

### `partnerships`
`id`, `organization_id` **UNIQUE**, `relationship_status` enum, `supplier_enabled` / `buyer_enabled` (booleans or flags for future dual role), `became_active_at`, `paused_at`, `rejected_reason`, `internal_priority`, timestamps.  
**No** job_eligible flag as source of truth.

### `offerings`
`id`, `organization_id`, `service_type_id`, `operational_status` (`AVAILABLE` \| `LIMITED` \| `UNAVAILABLE` \| `UNKNOWN`), unique `(organization_id, service_type_id)` for MVP (one GT offering per org unless we need multiples later).

### `offering_coverages`
`id`, `organization_id` (denormalized), `offering_id`, `coverage_mode` (`AIRPORT_EXPLICIT` \| `CITY_OR_REGION` \| `RADIUS`), `location_id` (nullable for pure org-base radius), `organization_location_id` (radius centre), `radius_value`, `radius_unit` (`KM` \| `MILE`), `is_informational_only` (e.g. country tag for admin filter — **not** used for airport auto-match).

### `gt_fleet_vehicles`
`id`, `organization_id`, `offering_id`, `vehicle_category_id`, `make`, `model`, `model_year`, `quantity`, `pax_capacity`, `luggage_capacity`, `image_paths`, `lifecycle_status` (`ACTIVE` \| `INACTIVE` \| `RETIRED`), `compliance_status` (`COMPLIANT` \| `NON_COMPLIANT` \| `UNKNOWN` \| `EXEMPT_AUDITED`), `compliance_notes`, timestamps.  
Policy year 2023+ evaluated into `compliance_status` (and/or derived at match time); do not hard-code 2023 in app logic.

### `gt_rate_rules`
`id`, `organization_id`, `rate_card_id`, `rule_type`, `vehicle_category_id`, money fields, `distance_unit`, `base_amount`, `per_unit_amount`, `minimum_amount`, `hourly_amount`, `daily_amount`, optional from/to `location_id`, currency inherited from card, validity.

### `organization_contacts`
`id`, `organization_id`, `full_name`, `contact_type` (lookup or text: owner, reservations, dispatcher, ops_24_7, accounts, …), `email`, `phone`, `whatsapp`, `is_primary`, `linked_user_id` nullable, `archived_at`.

### `activities`
`id`, `organization_id`, `actor_user_id` nullable, `activity_type`, `summary`, `body`, `channel`, `communication_id` nullable, `contact_id` nullable, `offering_id` nullable, `occurred_at`, `metadata` jsonb. Editable/correctable only under strict rules (prefer append + correction note).

### `audit_logs`
`id`, `organization_id` nullable, `actor_user_id` nullable, `action`, `entity_type`, `entity_id`, `before_state` jsonb, `after_state` jsonb, `occurred_at`, `request_id` optional. **Insert-only** for normal roles; no update/delete via client.

---

## 6. Job eligibility (derived — not a SoT column)

**Gate 0:** `partnerships.relationship_status = ACTIVE` is required to consider eligibility. ACTIVE alone is never sufficient.

### Auto-match vs manual search (ops status)

| operational_status | Auto-match | Manual VL search |
|---|---|---|
| AVAILABLE | Eligible if other gates pass | Normal |
| LIMITED | Eligible; lower rank / reduced-capacity signal | Warning |
| UNAVAILABLE | Not eligible | Show as unavailable |
| UNKNOWN | **Not** eligible | **Visible** with “availability unconfirmed”; staff may contact/select |

Other gates: compliance, valid required docs, coverage match, ≥1 compliant capacity in requested category (declarations and/or units).

**Do not** store `job_eligible` as source of truth.

---

## 7. Operational status definitions

| Status | Meaning |
|---|---|
| `AVAILABLE` | Generally accepting work |
| `LIMITED` | May accept some work; capacity restricted |
| `UNAVAILABLE` | Do not send operational requests now |
| `UNKNOWN` | Availability not confirmed |

Separate from Partnership and from compliance. No `BUSY`. No NASA dispatch calendars in MVP.

---

## 8. Tenant / data ownership & RLS

### Ownership classes

| Class | Who owns | Typical tables |
|---|---|---|
| **Platform catalog** | VL / platform | `service_types`, `locations`, `location_edges`, `vehicle_categories`, `document_types`, `standard_definitions`, `permissions`, `roles`, `role_permissions` |
| **Organization-owned** | Tenant org | `organization_*`, `offerings`, coverages, fleet, rates, org documents, org communications |
| **VL-private CRM** | Platform (about an org) | `partnerships` internals, `organization_notes`, follow-ups, some activities |
| **Identity** | User | `profiles`; memberships link user↔org |
| **Audit** | Platform | `audit_logs` — readable by platform roles; org admins may see org-scoped subset later |

### RLS required?

| Table | RLS | Notes |
|---|---|---|
| All org-owned tables | **Yes** | `organization_id` in policy via membership **or** platform permission |
| `partnerships` | **Yes** | Org may see sanitized subset later; MVP: VL-only write; org read of status TBD — default **VL-private**, expose only safe fields via view if needed |
| `organization_notes` | **Yes** | Platform only |
| `activities` | **Yes** | Platform + eventually org members for non-internal types |
| `audit_logs` | **Yes** | Insert via service role / security definer; select platform; **no** client update/delete |
| Catalog tables | **Yes** (read all authenticated or public-read; write platform) | Prevent supplier forging categories |
| `profiles` | **Yes** | User reads self; platform broader |
| `roles` / `permissions` | **Yes** | Read authenticated; write platform |

**Hostile client assumption:** frontend checks never sufficient. Every select/insert/update/delete enforced in RLS (+ server for invites/tokens).

### Platform vs organization ownership (quick matrix)

| Record | Platform | Organization |
|---|---|---|
| Airport `LHR` | ✓ | |
| Coverage “we serve LHR” | | ✓ |
| Category Luxury SUV | ✓ | |
| Escalade ESV 2025 row | | ✓ |
| Standard “min year 2023” | ✓ | |
| Compliance pass evidence | | ✓ (and VL verifies) |
| Relationship Active | ✓ (Partnership) | |
| Rate rule £2.80/km | | ✓ |

---

## 9. High-risk multi-tenant vulnerability tables

These are the tables most likely to leak competitor or VL-private data if RLS is wrong:

1. **`gt_rate_cards` / `gt_rate_rules`** — competitor pricing
2. **`documents`** + Storage objects — licences, insurance
3. **`organization_notes` / `partnerships`** — VL CRM / rejection reasons
4. **`organization_contacts`** — personal phones/WhatsApp
5. **`audit_logs`** — security-sensitive before/after
6. **`communications` / `activities`** — outreach content
7. **`organization_invitations`** — token hashes / emails (tokens never stored plaintext)
8. **Storage buckets** for fleet images/docs — path must not be guessable across orgs

Mitigations: denormalized `organization_id`, deny-by-default RLS, separate VL-private policies, storage policies mirroring SQL, no `using (true)` for authenticated.

---

## 10. Lifecycle / delete strategy

| Kind | Strategy |
|---|---|
| Organizations | Soft archive (`archived_at`). Rare hard delete only via controlled admin process |
| Partnerships | Status transitions; keep history via audit. No hard delete of Active history |
| Contacts, bases, coverages, fleet, rates | Soft archive preferred; hard delete allowed for draft mistakes if no job history references (future) |
| Documents | Soft archive; retain file per retention policy; never silently destroy verified compliance evidence |
| Invitations | Expire; revoke; hard delete of expired rows OK after retention window |
| Activities | Append-oriented; corrections as new activity; no casual delete |
| Audit logs | **No client delete/update**. Retention job later (legal) |
| Catalog rows | Soft deactivate (`is_active=false`); avoid deleting FKs in use |

---

## 11. Enums vs lookup / config tables

| Use **enum** (stable, closed) | Use **lookup/config table** (VL-editable) |
|---|---|
| `relationship_status` | `vehicle_categories` |
| `operational_status` | `service_types` |
| `coverage_mode` | `document_types` |
| `radius_unit` / distance unit | `standard_definitions` (+ parameters) |
| `rate_rule_type` | `message_templates` |
| `document_verification_status` | `contact_types` (or text + check; lookup preferred) |
| `fleet lifecycle_status` / `compliance_status` | `locations` |
| Role `scope` | permissions/roles seeds (tables, not enums) |

---

## 12. Derived values — must NOT be source-of-truth columns

| Do not treat as SoT | Derive from |
|---|---|
| `job_eligible` | Partnership + offering ops + compliance + docs + coverage + category fleet compliance |
| `auto_quotable` | Eligibility + matching rate rules |
| `standards_ok` | Compliance records + document validity + policy |
| `has_compliant_luxury_sedan` | Fleet rows for that category |
| `covers_all_uk_airports` | **Never** infer from country tag |
| Cached search denorm (optional) | Always rebuildable |

Optional projection/cache later is fine if invalidated correctly.

---

## 13. Conceptual indexes

| Area | Indexes (conceptual) |
|---|---|
| Orgs | `(display_name` trigram/search`), `(archived_at)` |
| Partnerships | **unique** `organization_id`; `(relationship_status)` |
| Memberships | unique `(organization_id, user_id)`; `(user_id)` |
| Contacts | `(organization_id)`; `(organization_id, contact_type)` |
| Locations | `(kind)`; unique `(iata)` where not null; `(icao)`; `(country_code)`; geo `(lat,lng)` or future geography; full-text name |
| Offerings | unique `(organization_id, service_type_id)`; `(organization_id, operational_status)` |
| Coverages | `(offering_id)`; `(location_id)`; `(organization_id)`; `(coverage_mode)` |
| Fleet | `(offering_id, vehicle_category_id)`; `(organization_id)`; `(compliance_status, vehicle_category_id)` |
| Rate rules | `(rate_card_id)`; `(organization_id, vehicle_category_id, rule_type)` |
| Documents | `(organization_id)`; `(expires_at)` for warning jobs; `(verification_status)` |
| Activities | `(organization_id, occurred_at desc)` |
| Audit | `(organization_id, occurred_at desc)`; `(entity_type, entity_id)` |
| Invitations | unique token hash; `(organization_id)`; `(expires_at)` |

---

## 14. Security / ownership review checklist

- [x] UUID PKs
- [x] Partnership separate from Organization
- [x] VehicleCategory ≠ FleetVehicle
- [x] Activity ≠ Audit
- [x] Contact type ≠ Membership role
- [x] Locations global; coverage tenant
- [x] Eligibility derived; ACTIVE insufficient alone
- [x] Operational enum without BUSY
- [x] Vehicle year policy configurable; compliance per vehicle; match = ≥1 compliant in requested category
- [x] RLS assumed hostile
- [x] High-risk tables identified
- [ ] Stakeholder approval before migrations

---

## 15. Still open (non-blocking)

| ID | Topic |
|---|---|
| D2 | May org users read sanitized partnership status? |
| D3 | Future multiple partnership rows (buyer-specific)? |
| D4 | PostGIS vs haversine |
| D5 | Org-owned message templates in first UI |
| D6 | Exact UK airport seed list |

**Closed:** D1 UNKNOWN behavior — [ADR-016](../07-decisions/adr-016-final-pre-column-clarifications.md).

---

## 16. Out of scope tables (explicit)

`jobs`, `quotes`, `assignments`, WhatsApp provider message sync, `subscription_plans` / Stripe objects, driver entities, live GPS.
