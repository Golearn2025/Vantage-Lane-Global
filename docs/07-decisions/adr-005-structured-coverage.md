# ADR-005: Structured coverage

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Yes — free-text coverage blocks matching forever

## Context

Jobs must answer “who covers this airport / city / point?” Organizations can have multiple bases.

## Decision

Coverage is structured rows on an offering (or equivalent), supporting:

- **Explicit airport coverage** (strong matching signal)
- **City / region coverage**
- **Geographic radius** from an organization base / location

Rules:

- “Covers Italy” must **not** auto-qualify every Italian airport
- Multiple operating bases/locations are first-class (see ADR-011)
- Matching preference: explicit airport → radius containing point → (weaker) broader area signals for admin search only

## Consequences

- More structured data entry for suppliers/admins.
- Country-level rows may exist as informational / search filters, not job auto-match.

## Alternatives rejected

- Text areas only; airport list only; geo-polygons in MVP.
