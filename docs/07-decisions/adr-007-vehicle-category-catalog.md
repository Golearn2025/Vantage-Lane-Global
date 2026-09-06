# ADR-007: Vehicle category catalog vs fleet models

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Yes — free-text categories destroy matching

## Context

Matching and pricing use commercial classes. Operators market specific models (S-Class, V-Class). Minimum vehicle year for the premium network starts at 2023 but must be policy-driven.

## Decision

1. **VL-controlled vehicle category catalog** (closed list for matching/pricing).
2. **Fleet inventory** stores actual models, years, quantities, images — separate from category.
3. Initial categories:
   - Executive Sedan (e.g. E-Class, BMW 5 / i5, EQE)
   - Luxury Sedan (e.g. S-Class, BMW 7 / i7)
   - Luxury SUV (e.g. Range Rover Autobiography, Escalade)
   - Luxury MPV (e.g. V-Class)
   - Executive Van / Sprinter
   - Minibus
   - Coach
4. **Minimum vehicle year default = 2023** lives in **configurable policy / standards**, never hard-coded application logic.

## Consequences

- Catalog ownership is a VL ops task.
- Country-specific naming mismatches → notes / examples on catalog, not free-text categories.
- Eligibility can fail old fleets via policy evaluation.

## Alternatives rejected

- Free-text vehicle classes as matching keys.
