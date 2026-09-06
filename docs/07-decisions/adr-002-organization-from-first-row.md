# ADR-002: Organization from first network row

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Yes — all FKs (contacts, messages, invites) attach here

## Context

Network building starts with incomplete company data. Self-onboarding and later login must attach to the same record.

## Decision

A company becomes an **Organization** the moment it is manually added, even with only name / location / website / WhatsApp.

- Initial **relationship_status = Lead**
- No separate `leads` table and no conversion step
- CRM/relationship state lives on a VL-owned partnership/relationship object (or equivalent), not a second company identity

## Consequences

- Many thin/incomplete organizations are normal.
- Incomplete ≠ job-eligible (enforced by eligibility rules).
- Owner user is **not** required at insert time.

## Alternatives rejected

- Separate leads then convert — duplicate fields, conversion bugs, two UIs.
