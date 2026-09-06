# Schema columns (logical detail)

**Status:** Column-level proposal for review. **No SQL. No migrations. No Supabase.**

Depends on: [database-design.md](database-design.md), [ADR-015](../07-decisions/adr-015-eligibility-ops-partnership-activity.md), [ADR-016](../07-decisions/adr-016-final-pre-column-clarifications.md).

Conventions: UUID `id` PKs; `created_at` / `updated_at` timestamptz on mutable tables unless noted; soft archive via `archived_at timestamptz null` where stated.

Conceptual types use PostgreSQL vocabulary (`uuid`, `text`, `timestamptz`, `numeric`, `boolean`, `int`, `date`, `jsonb`, enums).

---

## A. Cross-cutting design answers (read first)

### 1. Duplicate organizations

**Prevention (layered, not one magic unique):**

| Layer | Mechanism |
|---|---|
| Soft | Normalize `display_name` / `legal_name` for search; admin duplicate warning UI |
| Strong optional | Unique on `website_domain` where not null (normalized) |
| Strong optional | Unique on `primary_whatsapp_e164` / `primary_email` where not null — careful: shared ops emails |
| Place | Optional unique `(google_place_id)` where not null for HQ legal place |
| Process | `archived_at IS NULL` included in unique indexes (partial uniques) |

No single global unique on name (too many collisions: “Executive Cars Ltd”).

### 2. Multiple offerings of same service type?

**MVP recommendation: at most one active Offering per `(organization_id, service_type_id)`** where `archived_at IS NULL`.

**Why:** One GT commercial posture per org is enough for network matching. Multiple GT offerings would split fleet/coverage confusingly.

**Escape hatch later:** drop uniqueness or add `label` (“Chauffeur”, “Coach division”) if a real org needs it — table shape still supports 1:N.

### 3. Multiple bases × Coverage

- Bases live in `organization_locations`.
- Coverage rows reference either a platform `location_id` (airport/city) and/or `organization_location_id` as **radius centre**.
- Example: base = Central London (`organization_locations`); coverage rows = LHR, FAB, BQH explicit + optional radius from London base.
- **Never** insert Farnborough into `organization_locations` only because it is served.

### 4. Fleet ↔ org / offering / bases

- Fleet declarations and units belong to **`organization_id` + `offering_id`** (GT offering).
- Optional `organization_location_id` = which base the cars are primarily staged at (nullable).
- Categories via `vehicle_category_id` (platform catalog).

### 5–6. Aggregate fleet then individual units

**Two tables (explicit progressive fidelity):**

| Table | Early network | Later |
|---|---|---|
| `gt_fleet_declarations` | “8 × S-Class 2024–2026, declared” | May remain, or be reduced/superseded |
| `gt_fleet_units` | Optional | Specific car, plate/VIN, verified |

Matching capacity for a category ≈  
compliant declaration quantities (year band satisfies policy) **+** compliant individual units  
(minus overlapping units already counted under a declaration — via optional `declaration_id` on unit and/or `verified_quantity` on declaration).

Do **not** require 8 unit rows to say “we have 8 S-Class”.

### 7. Document ownership

`documents` always has `organization_id`. Scope enum drives which nullable parent FKs are set:

| scope | Required FK extras |
|---|---|
| `ORGANIZATION` | none beyond org |
| `OFFERING` | `offering_id` |
| `VEHICLE_UNIT` | `fleet_unit_id` |
| `VEHICLE_DECLARATION` | `fleet_declaration_id` (e.g. group photo / batch cert) |

Check constraint enforces scope ↔ FKs. No polymorphic `entity_type`/`entity_id`.

### 8. Soft delete × unique × RLS

- Unique indexes are **partial**: `WHERE archived_at IS NULL`.
- RLS: typically `archived_at IS NULL` for normal org reads; platform may read archived.
- Archived rows remain for audit trail; FKs from historical activities stay valid.

### 9. Safe updates to platform seeds

- Catalog rows: `code` stable business key; `is_system` / `is_active`.
- Prefer **deactivate** (`is_active=false`) over delete.
- Version sensitive policy text via `standard_definitions.version` or new row + `supersedes_id`.
- Migrations/seeds idempotent on `code`.

### 10. Immutable / append-only

| Append-only / immutable | Mutable |
|---|---|
| `audit_logs` (no client update/delete) | org profile, contacts, coverage |
| Prefer append for `activities` | rate cards (version; prefer new card vs silent rewrite of history) |
| Invitation token hash after issue | membership status |
| Verified document file path (replace = new doc row) | draft docs |

---

## B. Eligibility & matching (reminder — not columns)

Auto-match requires among others: Partnership `ACTIVE`, ops ∈ {`AVAILABLE`,`LIMITED`}, not `UNKNOWN`/`UNAVAILABLE`, compliance, docs, coverage, category capacity.

Manual VL search: `UNKNOWN` (and others) remain discoverable with warnings; staff may contact/select.

---

## C. Tables

### `profiles`

| | |
|---|---|
| **Purpose** | App user profile linked 1:1 to `auth.users` |
| **Ownership** | User (self) + platform staff |
| **RLS** | User read/update self; platform broader; no cross-tenant PII leak |
| **Lifecycle** | Soft-disable via membership/platform assignment; rare hard delete with auth user |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | = `auth.users.id` |
| display_name | text | YES | |
| email | text | YES | denormalized cache from auth |
| phone | text | YES | |
| locale | text | YES | |
| is_platform_user | boolean | NO | default false; convenience flag, permissions still SoT |
| created_at | timestamptz | NO | |
| updated_at | timestamptz | NO | |

FK: none outbound (id references auth.users conceptually).  
Indexes: `(email)` where not null.

---

### `organizations`

| | |
|---|---|
| **Purpose** | Company identity (not relationship status) |
| **Ownership** | Organization tenant root |
| **RLS** | Members of org; platform by permission |
| **Lifecycle** | Soft archive `archived_at` |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| display_name | text | NO | |
| legal_name | text | YES | |
| website_url | text | YES | |
| website_domain | text | YES | normalized; partial unique |
| primary_email | text | YES | convenience; contacts remain detailed |
| primary_phone_e164 | text | YES | |
| primary_whatsapp_e164 | text | YES | |
| legal_address_line1 | text | YES | legal/HQ — **not** coverage |
| legal_address_line2 | text | YES | |
| legal_city | text | YES | |
| legal_region | text | YES | |
| legal_postal_code | text | YES | |
| legal_country_code | char(2) | YES | ISO 3166-1 alpha-2 |
| legal_lat | numeric | YES | |
| legal_lng | numeric | YES | |
| google_place_id | text | YES | partial unique |
| notes_public | text | YES | supplier-visible blurb later |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |
| created_by_user_id | uuid FK→profiles | YES | |

**Unique:** partial on `website_domain`, `google_place_id` where not null and not archived.  
**Check:** lat/lng both null or both set.  
**Indexes:** display_name search; `archived_at`.

---

### `organization_capabilities`

| | |
|---|---|
| **Purpose** | Commercial posture: SUPPLIER and/or BUYER (not XOR) |
| **Ownership** | Organization |
| **RLS** | Org members + platform |
| **Lifecycle** | Hard delete OK; or soft via removing row |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK→organizations | NO | |
| capability | enum `organization_capability` | NO | `SUPPLIER` \| `BUYER` |
| created_at | timestamptz | NO | |

**Unique:** `(organization_id, capability)`.  
Relationship status stays on `partnerships`. Offerings refine what a SUPPLIER actually sells.

---

### `organization_locations`

| | |
|---|---|
| **Purpose** | Physical/operational **bases** only |
| **Ownership** | Organization |
| **RLS** | Org + platform |
| **Lifecycle** | Soft archive |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | |
| label | text | NO | e.g. “Central London base” |
| location_kind | enum | NO | `HQ` \| `OPS_BASE` \| `DEPOT` \| `OTHER` |
| address_line1 | text | YES | |
| address_line2 | text | YES | |
| city | text | YES | |
| region | text | YES | |
| postal_code | text | YES | |
| country_code | char(2) | YES | |
| lat | numeric | YES | needed for radius centres |
| lng | numeric | YES | |
| google_place_id | text | YES | |
| timezone | text | YES | IANA |
| is_primary | boolean | NO | default false; UX only |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

**Check:** not used as coverage substitute.  
**Indexes:** `(organization_id)`, `(organization_id) WHERE is_primary AND archived_at IS NULL`.

---

### `organization_contacts`

| | |
|---|---|
| **Purpose** | Real-world contact points; **no** RBAC |
| **Ownership** | Organization |
| **RLS** | Org + platform |
| **Lifecycle** | Soft archive |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | |
| full_name | text | NO | |
| contact_type | text | NO | lookup-ish: `owner`, `reservations`, `dispatcher`, `ops_24_7`, `accounts`, `other` |
| title | text | YES | |
| email | text | YES | |
| phone_e164 | text | YES | |
| whatsapp_e164 | text | YES | |
| is_primary | boolean | NO | default false |
| linked_user_id | uuid FK→profiles | YES | set when invite accepted |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

**Indexes:** `(organization_id)`, `(organization_id, contact_type)`.  
Contact `dispatcher` ≠ membership role Dispatcher.

---

### `partnerships`

| | |
|---|---|
| **Purpose** | VL ↔ Organization relationship lifecycle only |
| **Ownership** | **VL-private** (platform); org may later read sanitized status |
| **RLS** | Platform write/read; org read optional via view later |
| **Lifecycle** | Status transitions; soft archive rare; audit all status changes |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | **UNIQUE** — 1:1 MVP |
| relationship_status | enum | NO | Lead…Inactive (see ADR-003) |
| status_changed_at | timestamptz | NO | |
| became_active_at | timestamptz | YES | |
| paused_at | timestamptz | YES | |
| rejected_at | timestamptz | YES | |
| rejected_reason | text | YES | VL-private |
| inactive_reason | text | YES | |
| priority | int | YES | network building priority |
| first_contacted_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

**Enum `relationship_status`:** `LEAD`, `CONTACTED`, `INTERESTED`, `ONBOARDING`, `UNDER_REVIEW`, `ACTIVE`, `PAUSED`, `REJECTED`, `INACTIVE`.  
**No** supplier/buyer exclusive field here.  
**Indexes:** `(relationship_status)`, unique `organization_id`.

---

### `partnership_notes`

| | |
|---|---|
| **Purpose** | VL-private CRM notes on the partnership |
| **Ownership** | Platform / VL-private |
| **RLS** | Platform only |
| **Lifecycle** | Soft archive or append-only preference |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| partnership_id | uuid FK→partnerships | NO | |
| organization_id | uuid FK | NO | denormalized for RLS |
| body | text | NO | |
| created_by_user_id | uuid FK→profiles | YES | |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

---

### `follow_ups`

| | |
|---|---|
| **Purpose** | Next actions / due dates for network building |
| **Ownership** | VL-private (platform) |
| **RLS** | Platform |
| **Lifecycle** | Complete vs cancel; soft archive |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | |
| partnership_id | uuid FK | YES | |
| due_at | timestamptz | NO | |
| title | text | NO | |
| body | text | YES | |
| status | enum | NO | `OPEN` \| `DONE` \| `CANCELLED` |
| assigned_to_user_id | uuid FK→profiles | YES | |
| completed_at | timestamptz | YES | |
| created_by_user_id | uuid FK | YES | |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

**Indexes:** `(due_at) WHERE status = 'OPEN'`, `(organization_id)`.

---

### `permissions`

| | |
|---|---|
| **Purpose** | Permission catalog |
| **Ownership** | Platform |
| **RLS** | Read authenticated; write platform |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| code | text | NO | unique e.g. `org.pricing.write` |
| description | text | YES | |
| scope | enum | NO | `PLATFORM` \| `ORGANIZATION` |
| created_at | timestamptz | NO | |

---

### `roles`

| | |
|---|---|
| **Purpose** | Seeded role bundles |
| **Ownership** | Platform |
| **RLS** | Read auth; write platform |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| code | text | NO | unique e.g. `org_dispatcher`, `platform_super_admin` |
| name | text | NO | |
| scope | enum | NO | `PLATFORM` \| `ORGANIZATION` |
| is_system | boolean | NO | seeded immutable codes |
| created_at | timestamptz | NO | |

---

### `role_permissions`

| Column | Type | Null | Notes |
|---|---|---|---|
| role_id | uuid FK | NO | PK composite |
| permission_id | uuid FK | NO | PK composite |

**PK:** `(role_id, permission_id)`.

---

### `organization_memberships`

| | |
|---|---|
| **Purpose** | User access to org (≠ subscription) |
| **Ownership** | Organization |
| **RLS** | Org admins + self + platform |
| **Lifecycle** | status disable; soft archive |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | |
| user_id | uuid FK→profiles | NO | |
| status | enum | NO | `INVITED` \| `ACTIVE` \| `DISABLED` |
| invited_at | timestamptz | YES | |
| accepted_at | timestamptz | YES | |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

**Unique:** `(organization_id, user_id) WHERE archived_at IS NULL`.

---

### `membership_roles`

| Column | Type | Null | Notes |
|---|---|---|---|
| membership_id | uuid FK | NO | |
| role_id | uuid FK | NO | org-scoped roles only (check) |

**PK:** `(membership_id, role_id)`.  
Authorize on permissions, not role code strings.

---

### `platform_role_assignments`

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| user_id | uuid FK→profiles | NO | |
| role_id | uuid FK | NO | platform-scoped |
| created_at | timestamptz | NO | |
| created_by_user_id | uuid | YES | |

**Unique:** `(user_id, role_id)`.

---

### `organization_invitations`

| | |
|---|---|
| **Purpose** | Admin invite or self-onboard link |
| **Ownership** | Organization (+ platform create) |
| **RLS** | Platform; org admins manage own; token consume via secure server path |
| **Lifecycle** | Expire / revoke; delete expired after retention |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | |
| email | text | NO | |
| contact_id | uuid FK→contacts | YES | |
| token_hash | text | NO | unique; never store raw token |
| expires_at | timestamptz | NO | |
| accepted_at | timestamptz | YES | |
| revoked_at | timestamptz | YES | |
| invited_by_user_id | uuid FK | YES | |
| intended_role_id | uuid FK→roles | YES | org role on accept |
| scopes | text[] or jsonb | YES | profile/fleet/pricing/docs |
| created_at | timestamptz | NO | |

**Check:** not accepted and revoked simultaneously meaningfully.  
**Indexes:** `token_hash`, `(organization_id)`, `(expires_at)`.

---

### `service_types`

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| code | text | NO | unique `ground_transportation` |
| name | text | NO | |
| is_active | boolean | NO | |
| created_at | timestamptz | NO | |

Platform catalog. Deactivate, don’t delete if referenced.

---

### `offerings`

| | |
|---|---|
| **Purpose** | Org supplies a service type; holds operational availability |
| **Ownership** | Organization |
| **RLS** | Org + platform |
| **Lifecycle** | Soft archive |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | |
| service_type_id | uuid FK | NO | |
| operational_status | enum | NO | `AVAILABLE` \| `LIMITED` \| `UNAVAILABLE` \| `UNKNOWN` |
| label | text | YES | optional division name |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

**Unique:** `(organization_id, service_type_id) WHERE archived_at IS NULL` (MVP).  
**Indexes:** `(organization_id, operational_status)`.

---

### `locations`

| | |
|---|---|
| **Purpose** | Global geography catalog |
| **Ownership** | Platform |
| **RLS** | Read broad; write platform |
| **Lifecycle** | `is_active`; avoid hard delete |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| kind | enum | NO | `COUNTRY` \| `REGION` \| `LOCALITY` \| `AIRPORT` \| `POI` |
| name | text | NO | |
| name_normalized | text | YES | search help |
| country_code | char(2) | YES | |
| iata | char(3) | YES | airports |
| icao | char(4) | YES | |
| lat | numeric | YES | |
| lng | numeric | YES | |
| google_place_id | text | YES | |
| timezone | text | YES | |
| is_active | boolean | NO | |
| metadata | jsonb | YES | |
| created_at / updated_at | timestamptz | NO | |

**Unique:** `iata` where not null; `icao` where not null; optional `google_place_id`.  
**Indexes:** name search, `(kind, country_code)`.

---

### `location_edges`

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| parent_location_id | uuid FK | NO | |
| child_location_id | uuid FK | NO | |
| relation | enum | NO | `CONTAINS` (nav only) |

**Unique:** `(parent_location_id, child_location_id, relation)`.  
Not a rigid mandatory hierarchy for airports.

---

### `offering_coverages`

| | |
|---|---|
| **Purpose** | Where an offering can **serve** (≠ base) |
| **Ownership** | Organization |
| **RLS** | Org + platform |
| **Lifecycle** | Soft archive |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | denorm |
| offering_id | uuid FK | NO | |
| coverage_mode | enum | NO | `AIRPORT_EXPLICIT` \| `CITY_OR_REGION` \| `RADIUS` |
| location_id | uuid FK→locations | YES | airport/city/region |
| organization_location_id | uuid FK→org_locations | YES | radius centre / base ref |
| radius_value | numeric | YES | |
| radius_unit | enum | YES | `KM` \| `MILE` |
| is_informational_only | boolean | NO | default false; country tags for admin filter ≠ auto-match |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

**Checks:**  
- `AIRPORT_EXPLICIT` / `CITY_OR_REGION` ⇒ `location_id` NOT NULL  
- `RADIUS` ⇒ `organization_location_id` OR `location_id` centre + radius_value/unit NOT NULL  
- informational country rows never alone satisfy airport match (enforced in matcher, not only DB)

**Indexes:** `(offering_id)`, `(location_id)`, `(organization_id)`, `(coverage_mode)`.

---

### `vehicle_categories`

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| code | text | NO | unique `luxury_suv` |
| name | text | NO | `Luxury SUV` |
| description | text | YES | |
| example_models | text | YES | marketing hints |
| sort_order | int | NO | |
| is_active | boolean | NO | |
| created_at | timestamptz | NO | |

Platform catalog. Seed: Executive Sedan, Luxury Sedan, Luxury SUV, Luxury MPV, Executive Van/Sprinter, Minibus, Coach.

---

### `gt_fleet_declarations`

| | |
|---|---|
| **Purpose** | Early **declared aggregate** inventory (no VIN/plate required) |
| **Ownership** | Organization |
| **RLS** | Org + platform |
| **Lifecycle** | Soft archive; supersede when refined |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | |
| offering_id | uuid FK | NO | |
| vehicle_category_id | uuid FK | NO | commercial class |
| organization_location_id | uuid FK | YES | primary staging base |
| make | text | YES | e.g. Mercedes-Benz |
| model_family | text | YES | e.g. S-Class |
| year_from | int | YES | e.g. 2024 |
| year_to | int | YES | e.g. 2026; null = open / “year_from+” |
| quantity | int | NO | e.g. 8 |
| quantity_verified_units | int | NO | default 0; count of linked verified units |
| pax_capacity_typical | int | YES | |
| luggage_capacity_typical | int | YES | |
| declaration_status | enum | NO | `DECLARED` \| `PARTIALLY_VERIFIED` \| `SUPERSEDED` |
| compliance_status | enum | NO | `COMPLIANT` \| `NON_COMPLIANT` \| `UNKNOWN` \| `EXEMPT_AUDITED` |
| compliance_notes | text | YES | |
| source | enum | NO | `OPERATOR_CLAIM` \| `VL_ENTERED` \| `IMPORT` |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

**Checks:** `quantity > 0`; `year_to IS NULL OR year_to >= year_from`; `quantity_verified_units <= quantity`.  
**Matching:** remaining declared capacity ≈ `quantity - quantity_verified_units` if declaration compliance/year policy OK.  
**Example row:** Luxury Sedan / Mercedes / S-Class / 2024–2026 / qty 8 / DECLARED.

**Indexes:** `(offering_id, vehicle_category_id)`, `(organization_id)`, `(compliance_status)`.

---

### `gt_fleet_units`

| | |
|---|---|
| **Purpose** | Individual vehicles (progressive detail / verification) |
| **Ownership** | Organization |
| **RLS** | Org + platform |
| **Lifecycle** | Soft archive / RETIRED |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | |
| offering_id | uuid FK | NO | |
| vehicle_category_id | uuid FK | NO | |
| declaration_id | uuid FK→gt_fleet_declarations | YES | optional link when refining a declaration |
| organization_location_id | uuid FK | YES | |
| make | text | YES | |
| model | text | YES | e.g. S-Class W223 |
| model_year | int | YES | |
| registration_plate | text | YES | |
| vin | text | YES | |
| color | text | YES | |
| pax_capacity | int | YES | |
| luggage_capacity | int | YES | |
| lifecycle_status | enum | NO | `ACTIVE` \| `INACTIVE` \| `RETIRED` |
| verification_status | enum | NO | `UNVERIFIED` \| `VERIFIED` \| `REJECTED` |
| compliance_status | enum | NO | same as declarations |
| compliance_notes | text | YES | |
| verified_at | timestamptz | YES | |
| verified_by_user_id | uuid FK | YES | |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

**Unique (partial):** `(organization_id, registration_plate) WHERE registration_plate IS NOT NULL AND archived_at IS NULL` (per-country plate formats vary — keep org-scoped).  
**Indexes:** `(offering_id, vehicle_category_id)`, `(declaration_id)`, compliance.

When a unit is verified and linked, bump `declarations.quantity_verified_units` (app/trigger later).

---

### `gt_rate_cards`

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | |
| offering_id | uuid FK | NO | |
| name | text | YES | |
| currency_code | char(3) | NO | |
| status | enum | NO | `DRAFT` \| `ACTIVE` \| `SUPERSEDED` |
| valid_from | date | YES | |
| valid_to | date | YES | |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

Prefer new card + SUPERSEDED over rewriting historical rules silently.

---

### `gt_rate_rules`

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | denorm |
| rate_card_id | uuid FK | NO | |
| rule_type | enum | NO | see below |
| vehicle_category_id | uuid FK | YES | |
| from_location_id | uuid FK | YES | |
| to_location_id | uuid FK | YES | |
| amount | numeric | YES | fixed / surcharge flat |
| base_amount | numeric | YES | distance |
| per_unit_amount | numeric | YES | |
| minimum_amount | numeric | YES | |
| distance_unit | enum | YES | `KM` \| `MILE` |
| hourly_amount | numeric | YES | |
| daily_amount | numeric | YES | |
| wait_amount_per_unit | numeric | YES | |
| wait_unit | enum | YES | `MINUTE` \| `HOUR` |
| notes | text | YES | |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

**`rule_type` enum:** `FIXED_TRANSFER`, `DISTANCE`, `HOURLY`, `DAILY`, `AIRPORT_TRANSFER`, `WAITING`, `PARKING`, `MEET_AND_GREET`, `EXTRA_STOP`.  
**Checks:** per type, required money fields present (enforced in app + DB checks where practical).  
**Indexes:** `(rate_card_id)`, `(organization_id, vehicle_category_id, rule_type)`.

---

### `document_types`

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| code | text | NO | unique |
| name | text | NO | |
| default_scope | enum | NO | `ORGANIZATION` \| `OFFERING` \| `VEHICLE_UNIT` \| `VEHICLE_DECLARATION` |
| is_active | boolean | NO | |
| created_at | timestamptz | NO | |

---

### `documents`

| | |
|---|---|
| **Purpose** | File metadata + verification |
| **Ownership** | Organization (VL verifies) |
| **RLS** | Org read own; platform verify; storage policies mirror |
| **Lifecycle** | Soft archive; retain verified evidence |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | always |
| document_type_id | uuid FK | NO | |
| scope | enum | NO | ORGANIZATION / OFFERING / VEHICLE_UNIT / VEHICLE_DECLARATION |
| offering_id | uuid FK | YES | |
| fleet_unit_id | uuid FK | YES | |
| fleet_declaration_id | uuid FK | YES | |
| storage_path | text | NO | |
| file_name | text | YES | |
| mime_type | text | YES | |
| issued_on | date | YES | |
| expires_on | date | YES | |
| verification_status | enum | NO | `PENDING` \| `APPROVED` \| `REJECTED` \| `EXPIRED` |
| verified_at | timestamptz | YES | |
| verified_by_user_id | uuid FK | YES | |
| rejection_reason | text | YES | |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

**Check (scope):** exactly the FK set matching scope; others null.  
**Indexes:** `(organization_id)`, `(expires_on) WHERE archived_at IS NULL`, verification_status.

---

### `standard_definitions`

| | |
|---|---|
| **Purpose** | Configurable policy/standards catalog |
| **Ownership** | Platform |
| **RLS** | Read auth/platform; write platform |
| **Lifecycle** | version / deactivate |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| code | text | NO | unique per version strategy |
| service_type_id | uuid FK | YES | null = cross-service org standards |
| scope | enum | NO | `ORGANIZATION` \| `OFFERING` \| `VEHICLE` |
| level | enum | NO | `REQUIRED` \| `RECOMMENDED` \| `OPTIONAL` |
| title | text | NO | |
| description | text | YES | |
| parameters | jsonb | YES | e.g. `{"min_vehicle_year": 2023}` |
| version | int | NO | default 1 |
| is_active | boolean | NO | |
| supersedes_id | uuid FK→self | YES | |
| created_at | timestamptz | NO | |

Vehicle year **2023** lives in `parameters`, not application constants.

---

### Compliance assessment tables (scoped — no polymorphic FK)

#### `organization_standard_assessments`

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | |
| standard_definition_id | uuid FK | NO | must be scope ORGANIZATION |
| status | enum | NO | `NOT_STARTED` \| `PENDING` \| `SATISFIED` \| `FAILED` \| `WAIVED` |
| evidence_document_id | uuid FK→documents | YES | |
| assessed_at | timestamptz | YES | |
| assessed_by_user_id | uuid FK | YES | |
| notes | text | YES | |
| created_at / updated_at | timestamptz | NO | |

**Unique:** `(organization_id, standard_definition_id)`.

#### `offering_standard_assessments`

Same shape with `offering_id` + `organization_id` denorm; standard scope must be `OFFERING`.

#### `vehicle_standard_assessments`

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | |
| standard_definition_id | uuid FK | NO | scope VEHICLE |
| fleet_unit_id | uuid FK | YES | |
| fleet_declaration_id | uuid FK | YES | |
| status | enum | NO | same |
| … | | | evidence, assessed_*, notes, timestamps |

**Check:** exactly one of `fleet_unit_id` / `fleet_declaration_id` set.  
This keeps “insurance expired” (org assessment) distinct from “S-Class 2022” (vehicle assessment).

---

### `message_templates` (communication templates)

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| owner_type | enum | NO | `PLATFORM` \| `ORGANIZATION` |
| organization_id | uuid FK | YES | required if ORGANIZATION |
| channel | enum | NO | `EMAIL` \| `WHATSAPP` |
| code | text | YES | stable for platform templates |
| name | text | NO | |
| subject | text | YES | email |
| body | text | NO | |
| is_active | boolean | NO | |
| archived_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | |

**MVP:** platform templates sufficient; org-owned allowed by schema.  
**RLS:** platform templates readable by staff; org templates by that org.

---

### `communications`

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | |
| contact_id | uuid FK | YES | |
| template_id | uuid FK | YES | |
| channel | enum | NO | EMAIL / WHATSAPP |
| action_type | enum | NO | `OPEN_WHATSAPP` \| `COPY_WHATSAPP` \| `OPEN_EMAIL` \| `COPY_EMAIL` \| `LOGGED_MANUAL` |
| subject | text | YES | |
| body_snapshot | text | YES | rendered template |
| actor_user_id | uuid FK | YES | |
| occurred_at | timestamptz | NO | |
| metadata | jsonb | YES | |
| created_at | timestamptz | NO | |

No WhatsApp API provider ids in MVP.  
**Indexes:** `(organization_id, occurred_at desc)`.

---

### `activities`

| | |
|---|---|
| **Purpose** | CRM/ops timeline for humans |
| **Ownership** | Mix: platform-created often; org may see non-internal later |
| **RLS** | Platform; careful org exposure by `visibility` |
| **Lifecycle** | Append-oriented; soft archive rare |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid FK | NO | |
| actor_user_id | uuid FK | YES | |
| activity_type | text | NO | e.g. whatsapp_outreach, note, follow_up, onboarding_link |
| summary | text | NO | |
| body | text | YES | |
| visibility | enum | NO | `VL_ONLY` \| `ORG_SHARED` |
| communication_id | uuid FK | YES | |
| contact_id | uuid FK | YES | |
| offering_id | uuid FK | YES | |
| partnership_id | uuid FK | YES | |
| occurred_at | timestamptz | NO | |
| metadata | jsonb | YES | |
| archived_at | timestamptz | YES | |
| created_at | timestamptz | NO | |

**Indexes:** `(organization_id, occurred_at desc)`.

---

### `audit_logs`

| | |
|---|---|
| **Purpose** | Security/mutation history |
| **Ownership** | Platform |
| **RLS** | Insert via secure path; select platform; **no update/delete** for clients |
| **Lifecycle** | Append-only; retention job later |

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid PK | NO | |
| organization_id | uuid | YES | null = platform-wide |
| actor_user_id | uuid | YES | |
| action | text | NO | |
| entity_table | text | NO | |
| entity_id | uuid | YES | |
| before_state | jsonb | YES | |
| after_state | jsonb | YES | |
| occurred_at | timestamptz | NO | |
| request_id | text | YES | |
| ip | text | YES | optional |

This is the only intentional “generic entity reference” — **audit metadata**, not a domain FK for compliance.

---

## D. High-risk tables (RLS spotlight)

`gt_rate_*`, `documents` + storage, `partnership_notes`, `partnerships`, `organization_contacts`, `audit_logs`, `organization_invitations`, `communications`, `activities` (VL_ONLY).

---

## E. What changed vs prior ERD sketch

| Change | Why |
|---|---|
| Added `organization_capabilities` | Supplier and Buyer both, not XOR on partnership |
| Split fleet into `gt_fleet_declarations` + `gt_fleet_units` | Network building speed → later verification |
| Split compliance into 3 assessment tables + scoped `standard_definitions` | Org insurance ≠ vehicle year |
| `documents.scope` + explicit FKs | No polymorphic domain FK |
| Renamed notes → `partnership_notes` | Owned by relationship, VL-private |
| Clarified coverage vs `organization_locations` | Farnborough ≠ base |
| D1 matching rules | UNKNOWN manual-visible, not auto-match |

---

## F. Out of scope

SQL DDL, migrations, Supabase project, auth implementation, UI, jobs tables.
