# ADR-008: Users, invitations, memberships (and future subscriptions)

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Yes — auth identity + membership FKs

## Context

Orgs are created as leads without logins. Admins must grant access by email. Shared default passwords are unacceptable. Paid plans may exist later; MVP suppliers are free.

## Decision

- An Organization **may exist with zero users**.
- Two account creation flows:
  - **A.** Admin-created org + invite contact by email
  - **B.** Secure self-onboarding / invitation link
- Prefer **secure invitation / set-password link**, or uniquely generated temporary credential **requiring password change**.
- **Never** one shared default password across organizations.
- Model separately: `user`, `organization_membership`, roles/permissions.
- Distinguish **organizational membership** (access) from **commercial subscription/plan** (billing).
- MVP: all supplier orgs are **FREE**. Architect a future subscription/plan hook; **do not implement billing now**.

## Consequences

- Invitation objects (token, expiry, scope, email) are required.
- Contact email ≠ automatic login identity until invite accepted.
- A user may hold memberships in multiple orgs later; design must allow it.

## Alternatives rejected

- Mandatory user at org create; magic-link with no invite audit; shared passwords.
