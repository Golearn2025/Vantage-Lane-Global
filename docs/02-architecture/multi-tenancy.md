# Multi-tenancy

**Status:** Accepted — see [ADR-001](../07-decisions/adr-001-hybrid-multi-tenancy.md).

## Rules

- Hybrid: tenant workspaces + platform network functions.
- Every company has an organization id.
- Organization-owned rows are tenant-scoped.
- Platform catalogs (locations, service types, vehicle categories, standard definitions) are global.
- VL CRM (partnership, internal notes, follow-ups) is platform-owned and hidden from suppliers by default.
- Platform staff get network-wide visibility **only** via platform permissions.
- External orgs never see another org’s private data unless a future explicit workflow grants access.
- VL staff are not fake members of every supplier organization.
- An organization may exist with zero users.

## Table classification

See [tables-vs-config.md](../03-database/tables-vs-config.md).

## Still open at implementation time

- Exact RLS helper function signatures
- Support / impersonation policy
- Multi-org membership UX in MVP (model allows; UI may defer)
