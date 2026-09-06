# ADR-003: Orthogonal status model

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Yes — every workflow and report assumes status meaning

## Context

One overloaded `status` mixes CRM conversation, operational availability, and compliance.

## Decision

Model at least three concerns separately:

1. **Relationship status** (CRM / partnership lifecycle), e.g.  
   Lead → Contacted → Interested → Onboarding → Under Review → Active → Paused / Rejected / Inactive
2. **Operational status** (availability of the offering / org for work) — modeled separately
3. **Derived eligibility / compliance** — computed from requirements (documents, standards, coverage, vehicle policy, etc.), not a single manual checkbox as the source of truth

UI may show a pipeline column (relationship). Job routing uses eligibility.

## Consequences

- Slightly more complex UX explanations.
- Eligibility must be computed/enforced server-side.
- “Active relationship but expired insurance” cannot quietly receive jobs.

## Alternatives rejected

- Single enum — forces lies and special cases.
- Status + random booleans — becomes inconsistent.
