# Architectural decisions

## Status

Decisions **1–14** below are **ACCEPTED** (reviewed 2026-09-06).

Do **not** create the Supabase schema until you have reviewed:

1. Updated [domain model](../02-architecture/domain-model.md)
2. [Tables vs policy/config](../03-database/tables-vs-config.md)
3. [Supabase implementation plan](../03-database/supabase-implementation-plan.md)
4. [Contradictions / open risks](contradictions-and-open-items.md)

## ADR index (expensive to reverse)

| ADR | Decision | Status |
|---|---|---|
| [001](adr-001-hybrid-multi-tenancy.md) | Hybrid multi-tenancy | Accepted |
| [002](adr-002-organization-from-first-row.md) | Lead = Organization from first row | Accepted |
| [003](adr-003-orthogonal-status-model.md) | Orthogonal status model | Accepted |
| [004](adr-004-location-graph-not-rigid-tree.md) | Locations + search, not rigid tree | Accepted |
| [005](adr-005-structured-coverage.md) | Structured coverage | Accepted |
| [006](adr-006-gt-pricing-module.md) | GT-specific pricing module | Accepted |
| [007](adr-007-vehicle-category-catalog.md) | VL vehicle category catalog | Accepted |
| [008](adr-008-users-invitations-memberships.md) | Users, invitations, memberships | Accepted |
| [009](adr-009-permission-rbac.md) | Permission-based RBAC | Accepted |
| [010](adr-010-communications-v1-manual.md) | Communications V1 (no WhatsApp API) | Accepted |
| [011](adr-011-organization-locations.md) | Multiple org bases/locations | Accepted |
| [012](adr-012-contacts-vs-users.md) | Contacts ≠ Users | Accepted |
| [013](adr-013-audit-activity.md) | Scoped audit / activity | Accepted (refined by 015: two tables) |
| [014](adr-014-documents-standards-policy.md) | Documents + configurable standards | Accepted |
| [015](adr-015-eligibility-ops-partnership-activity.md) | Eligibility gates, ops enum, Partnership table, Activity≠Audit, vehicle compliance | Accepted |
| [016](adr-016-final-pre-column-clarifications.md) | UNKNOWN matching, capabilities both, scoped compliance, base≠coverage, fleet declarations | Accepted |

## Market & outreach (accepted product constraints)

| Item | Decision |
|---|---|
| First market | **United Kingdom** — London + major commercial/private aviation airports |
| Architecture locale | **Not UK-specific** |
| Outreach V1 | Template + copy / open WhatsApp / email — **no WhatsApp Business API** |
| Supplier plans MVP | All suppliers **FREE**; subscription modeled for later, not built now |

## Quick accept summary (1–14)

1. **Hybrid multi-tenancy** — VL platform visibility by permission; orgs isolated unless explicit future grant.
2. **Org from first row** — `relationship_status = Lead`; no separate leads table.
3. **Orthogonal statuses** — relationship + operational + derived eligibility/compliance.
4. **Geography** — global search (airport/IATA/ICAO/city/region/country/address); nav is UX only.
5. **Coverage** — airport explicit, city/region, radius; multi-base; country ≠ all airports.
6. **GT pricing** — fixed, distance (base+unit+min), hourly, daily, airport, wait, parking, meet & greet, extra stop; miles/km; RFQ if no price; **not** universal engine.
7. **Vehicle catalog** — VL categories; models/years separate; min year **2023** as **policy**, not hard-code.
8. **Users** — org without users OK; admin invite **or** self-onboard; no shared passwords; membership ≠ subscription.
9. **RBAC** — permissions, seeded roles, platform vs org namespaces; no custom-role UI in MVP.
10. **Communications** — module yes; V1 open/copy/log only; WhatsApp API out of MVP.
11. **Org locations** — multiple bases; not one address on Organization.
12. **Contacts** — many contacts; no login required; separate from User.
13. **Audit** — who/what/when/context/old→new; not event sourcing.
14. **Documents / standards** — expiry + verification; configurable policy levels REQUIRED/RECOMMENDED/OPTIONAL; affect eligibility.
