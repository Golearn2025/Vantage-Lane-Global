# Bootstrap + RLS report

**Project:** `zbzfbloiodcfjxbrdynl`  
**Date:** 2026-09-06  
**Auth passwords:** untouched

## Migration

- Applied: `add_organizations_is_test`
- Repo file: `supabase/migrations/20260906203000_add_organizations_is_test.sql`
- Column: `organizations.is_test boolean NOT NULL DEFAULT false`

Also added platform location (data, not schema migration): **Manchester Airport** `MAN` / `EGCC`, locality Manchester, nav edges.

## Users discovered (profiles)

| Email | Profile exists | Confirmed | Platform user flag |
|---|---|---|---|
| catalin@vantage-lane.com | yes | yes | true |
| cristi@vantage-lane.com | yes | yes | true |
| test-owner-london@vantage-lane.com | yes | yes | false |
| test-dispatcher-london@vantage-lane.com | yes | yes | false |
| test-owner-manchester@vantage-lane.com | yes | yes | false |

## Platform roles

| Email | Role |
|---|---|
| catalin@vantage-lane.com | `platform_super_admin` |
| cristi@vantage-lane.com | `platform_super_admin` |

No platform roles on test users.

## Organizations

| Display | Legal | is_test | UUID |
|---|---|---|---|
| Vantage Lane London | Vantage Lane Ltd | false | `b430341e-e63d-43c3-bd4b-f10e51b9efa2` |
| [TEST] London Executive Cars | — | true | `0da3af9c-f7cd-4d71-b512-dfda15831e55` |
| [TEST] Manchester Chauffeurs | — | true | `d31b4abb-cb99-4b99-bcd2-f0414aad74ad` |

All three: SUPPLIER, GT offering AVAILABLE, partnership ACTIVE.

## Memberships

| User | Org | Role |
|---|---|---|
| catalin | Vantage Lane London | `org_owner` |
| cristi | Vantage Lane London | `org_owner` |
| test-owner-london | [TEST] London Executive Cars | `org_owner` |
| test-dispatcher-london | [TEST] London Executive Cars | `org_dispatcher` |
| test-owner-manchester | [TEST] Manchester Chauffeurs | `org_owner` |

## Coverage

- **VL London:** London (CITY_OR_REGION) + LHR, LGW, STN, LTN, LCY, FAB, BQH
- **Test London:** LHR, FAB
- **Test Manchester:** MAN

## RLS tests (`SET LOCAL ROLE authenticated` + JWT `sub`)

| Actor | Orgs visible | VL private notes/follow-ups | Audit | Platform role assignments | Cross-tenant |
|---|---|---|---|---|---|
| Catalin | all 3 | 1 / 1 | 1 | 2 | OK (platform) |
| Cristi | all 3 | 1 / 1 | 1 | 2 | OK (platform) |
| Test London Owner | only London test | 0 / 0 | 0 | 0 | no VL, no Manchester |
| Test London Dispatcher | only London test | 0 / 0 | 0 | 0 | no VL, no Manchester; `org.fleet.write` yes; `org.members.manage` no |
| Test Manchester Owner | only Manchester test | 0 / 0 | 0 | 0 | no VL, no London test |

**Policy failures found:** none for the scenarios tested.

**Fixes required:** none.

## Not done (by design)

UI, Jobs, pricing, billing. Auth passwords unchanged.
