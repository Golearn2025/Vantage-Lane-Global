# Vantage Lane Global — Architecture Documentation

Database baseline **V1** (`db-foundation-v1`). Application architecture **approved**.

## Current phase

On branch `feature/network-crm-foundation`: prepare data-access for Network CRM UI.  
**No frontend code / no Supabase changes until the Milestone 1 data-access plan is executed.**

## Application architecture (approved)

1. [frontend-architecture.md](02-architecture/frontend-architecture.md)
2. [data-access-realtime-architecture.md](02-architecture/data-access-realtime-architecture.md)
3. [application-module-boundaries.md](02-architecture/application-module-boundaries.md)
4. [ui-design-system.md](02-architecture/ui-design-system.md)
5. **[milestone1-data-access-plan.md](03-database/milestone1-data-access-plan.md)** ← next DB work when authorized

## Database baseline (immutable)

- [phase1-implementation-report.md](03-database/phase1-implementation-report.md)
- [bootstrap-rls-report.md](03-database/bootstrap-rls-report.md)
- `supabase/migrations/` — **do not edit applied migrations**
