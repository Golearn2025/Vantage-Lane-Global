# ADR-012: Contacts vs authenticated users

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Medium–high — CRM and auth collide if merged

## Context

Orgs have Owner, Reservations, 24/7 Ops, Dispatcher, Accounts — many never log in.

## Decision

- An organization has **many contacts**.
- Contacts do **not** require app login.
- Keep **Organization Contact** and **authenticated User** separate.
- Optional link Contact → User when an invite is accepted.
- Contact roles/labels (Owner, Reservations, …) are contact metadata, not RBAC permissions (unless/until they become users with memberships).

## Consequences

- Outreach targets Contacts.
- Auth targets Users + Memberships.
- Shared ops inboxes remain contacts until an invite creates a real user.

## Alternatives rejected

- Treating every contact email as a User row.
