# Vantage Lane Global — Architecture Documentation

**No application code, no Supabase tables, no UI yet.**

## Current phase

**Column-level schema review** — [`03-database/schema-columns.md`](03-database/schema-columns.md).

Do not create SQL, migrations, auth, or UI until this is approved.

## Start here

1. [schema-columns.md](03-database/schema-columns.md) ← **review now**
2. [ADR-016](07-decisions/adr-016-final-pre-column-clarifications.md)
3. [database-design.md](03-database/database-design.md)

## Locked highlights

- UNKNOWN: no auto-match; manual search with warning
- Partnership lifecycle ≠ supplier/buyer (capabilities both)
- Compliance: org / offering / vehicle (no polymorphic domain FK)
- Bases ≠ coverage
- Fleet: `gt_fleet_declarations` (qty aggregates) → `gt_fleet_units` (verified individuals)
- VehicleCategory (global) ≠ concrete models
