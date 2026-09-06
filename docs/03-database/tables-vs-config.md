# Tables vs policy / configuration data

Guidance for the future schema. **No tables created yet.**

## Likely PostgreSQL tables (domain entities)

### Identity & access

| Entity | Table-ish name | Notes |
|---|---|---|
| User profile | `profiles` (extends auth.users) | App profile; auth.users owned by Supabase |
| Organization | `organizations` | Tenant |
| Membership | `organization_memberships` | user ↔ org |
| Role | `roles` | seeded; platform or org scope |
| Permission | `permissions` | seeded catalog |
| RolePermission | `role_permissions` | bundle |
| MembershipRole | `membership_roles` or role_id on membership | keep simple in MVP |
| Platform assignment | `platform_role_assignments` | VL staff |
| Invitation | `organization_invitations` | hashed token, expiry |

### Network / CRM

| Entity | Table-ish name | Notes |
|---|---|---|
| Partnership | `organization_partnerships` or `partnerships` | VL↔org; relationship_status |
| Contact | `organization_contacts` | no login required |
| Note | `organization_notes` | VL-private |
| Follow-up | `organization_follow_ups` | |
| Activity | `activities` | CRM/ops timeline |
| Audit log | `audit_logs` | Append-only security/mutation history (separate from activities) |

### Catalog & geography

| Entity | Table-ish name | Notes |
|---|---|---|
| Service type | `service_types` | seeded |
| Location | `locations` | countries, cities, airports… |
| Location containment | `location_edges` | optional nav graph |
| Vehicle category | `vehicle_categories` | VL catalog |
| Standard definition | `standard_definitions` | policy rows |
| Document type | `document_types` | seeded |

### Org commercial / ops

| Entity | Table-ish name | Notes |
|---|---|---|
| Org location/base | `organization_locations` | multi-base |
| Offering | `offerings` | org × service_type + operational_status |
| Coverage | `offering_coverages` | structured |
| Document | `documents` | metadata + storage path |
| Compliance record | `offering_standard_compliances` | per standard evaluation/evidence |
| Message template | `message_templates` | |
| Communication | `communications` | open/copy/log |

### Ground Transportation pack

| Entity | Table-ish name | Notes |
|---|---|---|
| Fleet vehicle / inventory | `gt_fleet_vehicles` | model, year, category_id, per-vehicle compliance |
| Rate card | `gt_rate_cards` | |
| Rate rule | `gt_rate_rules` | typed rules |
| Partnership | `partnerships` | **separate** from organizations |

### Future (design only — do not migrate in MVP unless tiny hook)

| Entity | Notes |
|---|---|
| `subscription_plans` / `organization_subscriptions` | FREE only in MVP; optional `commercial_plan` text/enum hook |
| `jobs`, `quotes`, `assignments` | after network loop works |

## Policy / configuration data (seeded rows, not hard-coded logic)

These are **data** VL can change without redeploying rule logic (evaluation code reads them):

| Config | Examples | Stored as |
|---|---|---|
| Vehicle categories | Executive Sedan, Luxury MPV, … | `vehicle_categories` seed |
| Example models (marketing hints) | E-Class, S-Class | optional child table or JSON on category |
| Min vehicle year | default 2023 | `standard_definitions` / policy parameter |
| Standard levels | REQUIRED / RECOMMENDED / OPTIONAL | columns on standard_definitions |
| GT supplier standards text | insurance, attire, water, … | standard_definitions (+ maybe versioned content) |
| Document types | PH licence, insurance cert, … | document_types |
| Relationship status enum | Lead…Inactive | DB enum or check + app const synced |
| Rate rule types | fixed, distance, hourly, … | enum / lookup table |
| Distance units | mile, km | enum on rule |
| Message templates | first contact, onboarding, RFQ | message_templates (VL-editable) |
| First market seed locations | UK, London, LHR, LGW, STN, LTN, FAB, … | locations seed |
| Service types | ground_transportation | service_types seed |
| Roles & permissions | Super Admin, Owner, … | roles / permissions seeds |
| Eligibility parameters | which docs required for UK GT | policy rows + market overlay later |

## What must NOT be hard-coded in application if-statements

- Minimum vehicle year `2023`
- Full text of supplier standards
- Which document types are required per market (long-term)
- Role name strings as authorization (`=== "admin"`)
- “UK-only” schema assumptions
- Global distance unit

## What may be code (evaluation), reading policy tables

- Eligibility projection function
- “Does this rate rule match this job shape?”
- Radius contains point
- Permission checks against permission keys

## Storage (not relational “entities”)

| Asset | Store |
|---|---|
| Document files, fleet images | Supabase Storage + `documents` / fleet image metadata |
| Auth secrets / password hashes | Supabase Auth only |

## RLS classification reminder

| Class | Examples |
|---|---|
| Platform catalog | locations, vehicle_categories, service_types, standard_definitions |
| Org-owned | organization_locations, contacts, offerings, coverages, fleet, rates, documents |
| VL-private | partnerships notes, follow-ups, some audit |
| Platform staff via permission | read/write across orgs as allowed |
| Future shared | job invitations |
