# ADR-011: Multiple organization locations / bases

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Yes — single HQ column forces painful migrations

## Context

Suppliers may operate from Milan, Rome and Geneva (or London + Gatwick base, etc.). Coverage radius often starts from a base, not from a legal HQ.

## Decision

- Model **organization locations / bases** as separate entities.
- Do **not** treat a single business address on Organization as the complete location model.
- Organization may still have legal/billing address fields, but operational bases are first-class.
- Coverage radius may reference a specific base/location.

## Consequences

- Map pins may show multiple points per org.
- “Primary” base is a UX convenience, not the only location.

## Alternatives rejected

- One `address` / one lat-lng on Organization as the whole model.
