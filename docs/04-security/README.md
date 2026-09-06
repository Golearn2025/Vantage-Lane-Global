# Security

Decisions accepted: ADR-001, 008, 009, 013.

Planned detailed docs (after schema design approval):

- `authentication.md` — Supabase Auth, invitations, set-password, no shared passwords
- `authorization-rbac.md` — permission catalog, seeded roles, platform vs org
- `row-level-security.md` — hybrid tenancy policies
- `security-principles.md`

## Locked principles

- Never frontend-only authorization.
- Authorize on permissions, not role name strings.
- VL internal notes are not org-readable.
- Supplier A never sees supplier B rate cards.
- Onboarding tokens expire and are hashed at rest.
- Super Admin actions are auditable.
- Platform visibility is permission-gated, not “all authenticated users”.
