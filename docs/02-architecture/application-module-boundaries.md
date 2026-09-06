# Application module boundaries (frontend)

Complements [module-boundaries.md](module-boundaries.md) and [frontend-architecture.md](frontend-architecture.md).

## App modules (initial)

| Module | Owns in UI | Types live in |
|---|---|---|
| `shell` | Layout, **minimal** nav, theme, toasts, command palette | module-local |
| `identity` | Session, permission checks | module-local |
| `organizations` | Table, profile, Quick Add UI, CRM editors | `modules/organizations/types.ts` |
| `network` | Place search, map/list (when shipped) | `modules/network/types.ts` |
| `communications` | Template pick, open/copy/log | module-local |

`onboarding` / `compliance` modules appear when screens ship — not empty nav stubs.

## Shared types (strict)

Only cross-module contracts in `shared/types/` (e.g. `RelationshipStatus`, `OperationalStatus`, `LocationSummary`, `OrganizationReference`).

Do **not** dump every DTO into `shared/`.

## Public API between modules

- Network uses `OrganizationReference` / shared enums — not deep organization profile types.
- Organizations does not import network map internals.
