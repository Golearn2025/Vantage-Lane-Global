# Phase 1 implementation report

**Project:** `zbzfbloiodcfjxbrdynl` (Global Network Vantage Lane)  
**Date:** 2026-09-06  
**Scope:** Database foundation only (no Jobs, billing, WhatsApp API, Aviation, UI)

## Verification before changes

| Check | Result |
|---|---|
| Connected project | Confirmed `zbzfbloiodcfjxbrdynl` |
| Public schema | Empty (no app tables) |
| Existing migrations | None |
| Untouched | `auth.*`, `storage.*` (Supabase-managed) |

## Migrations applied (also mirrored in `supabase/migrations/`)

1. `phase1_enums_profiles`
2. `phase1_rbac_organizations_partnerships`
3. `phase1_locations_offerings_coverage`
4. `phase1_gt_fleet_documents_compliance`
5. `phase1_crm_comms_audit`
6. `phase1_rls_helpers_and_policies`
7. `phase1_seed_roles_permissions`
8. `phase1_security_hardening`

## Tables created (33)

profiles, permissions, roles, role_permissions, platform_role_assignments, organizations, organization_capabilities, partnerships, partnership_notes, follow_ups, organization_locations, organization_contacts, organization_memberships, membership_roles, organization_invitations, locations, location_edges, service_types, offerings, offering_coverages, vehicle_categories, gt_fleet_declarations, gt_fleet_units, document_types, documents, standard_definitions, organization_standard_assessments, offering_standard_assessments, vehicle_standard_assessments, message_templates, communications, activities, audit_logs

**Not in Phase 1 (by design):** `gt_rate_cards`, `gt_rate_rules`, jobs, billing.

## Seed / config data

| Data | Count / value |
|---|---|
| Service type | `GROUND_TRANSPORTATION` |
| Vehicle categories | 7 (EXECUTIVE_SEDAN … COACH) |
| Locations | UK + London + 7 airports (LHR, LGW, STN, LTN, LCY, FAB, BQH) with IATA/ICAO |
| Min vehicle year policy | `standard_definitions.GT_MIN_VEHICLE_YEAR.parameters.min_vehicle_year = 2023` |
| GT standards | 17 definitions (org/offering/vehicle scopes) |
| Document types | 8 |
| Message templates | 3 platform templates |
| Permissions | 13 |
| Roles | 10 (3 platform + 7 org) |

## RLS

- RLS **enabled** on all 33 public tables
- **65** policies
- Helpers: `is_platform_user`, `has_platform_permission`, `is_org_member`, `has_org_permission`
- VL-private: `partnerships`, `partnership_notes`, `follow_ups` — platform permissions only
- `audit_logs` append-only (update/delete triggers)
- Hardening: revoked `anon` execute on security definer helpers; `search_path` set on triggers

## Indexes / FKs

- ~91 indexes (incl. partial uniques for soft-archive)
- ~79 foreign keys

## Tenant isolation test

As role `authenticated` **without** membership / platform roles:

| Table | Rows visible |
|---|---|
| organizations | **0** |
| partnerships | **0** |
| partnership_notes | **0** |
| follow_ups | **0** |
| gt_fleet_declarations | **0** |
| locations (catalog) | 9 (expected — platform catalog readable) |
| vehicle_categories | 7 (expected) |

Test org fixtures were deleted after the check.

## Architecture deviations / notes

1. **Rate cards deferred** — not in Phase 1 letter list; schema docs remain the source for Phase 2 pricing.
2. **London CONTAINS Farnborough** — navigation edge only for UX hierarchy; matching still uses explicit airport coverage (documented as nav, not domain truth).
3. No application architecture changes required; DB matches approved docs.

## Remaining open issues

- Assign first Super Admin user after Auth signup (`platform_role_assignments`)
- Storage buckets/policies for `documents.storage_path` not created yet
- Full JWT membership isolation test (user A vs org B) still recommended after first real users exist
- Advisors may still warn that authenticated can call permission helper RPCs (intentional for RLS); `handle_new_user` execute revoked from API roles
- D2–D6 from docs still product opens (not blockers)

## Not implemented (explicit)

Jobs, billing, WhatsApp API, Private Aviation, UI, gt_rate_* tables.
