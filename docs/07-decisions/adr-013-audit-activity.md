# ADR-013: Scoped audit / activity (not event sourcing)

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Medium — if skipped, history is unrecoverable

## Context

CRM, compliance, and admin actions need history. Full event sourcing is overkill.

## Decision

Use an appropriately scoped **audit / activity** architecture.

**Refined by ADR-015:** two tables — `activities` (CRM/ops timeline) and `audit_logs` (append-oriented security/mutation history). Do not merge them. Do not build event sourcing.

## Consequences

- Two related mechanisms may exist (activity feed vs audit log) sharing conventions.
- Super Admin actions must be auditable from day one.
- Retention and PII in logs need a later policy.

## Alternatives rejected

- Overwrite-only status fields; full event-sourced domain.
