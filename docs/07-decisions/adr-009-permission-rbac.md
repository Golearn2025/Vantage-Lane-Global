# ADR-009: Permission-based RBAC

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Yes — role-name checks spread through codebases

## Context

Org and platform roles will evolve. Custom role UI is not MVP, but authorization must not hard-code role names.

## Decision

- Authorize on **permissions**, never `if role === "admin"`.
- Seed roles as permission bundles.
- Separate namespaces: **platform.*** vs **org.***.
- Seeded platform roles (initial): Super Admin, Platform Admin, Platform Operations.
- Seeded org roles (initial): Owner, Admin, Dispatcher, Operations, Finance, Driver Coordinator, Viewer.
- No custom-role management UI in MVP.

## Consequences

- Permission catalog is a migration/seed concern.
- Platform permissions are the only legitimate tenant-wide bypass.
- Org permissions never grant VL-private CRM notes or other orgs’ rate cards.

## Alternatives rejected

- Hardcoded role strings in app logic; full role builder in MVP.
