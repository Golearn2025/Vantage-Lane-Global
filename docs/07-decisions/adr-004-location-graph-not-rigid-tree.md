# ADR-004: Location model and global search

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Yes — rigid `airport.city_id` trees are painful to unwind

## Context

Ops need Country → Region/City → Airport navigation **and** direct airport/IATA search. Private aviation airports are a primary use case. First market is UK, but architecture must not be UK-specific.

## Decision

- Locations are typed places (country, region, city/locality, airport, address/POI).
- Containment relations may support navigation; they are **not** a rigid mandatory hierarchy.
- Global search by: airport name, IATA/ICAO, city, region, country, address/location.
- Airport search is a first-class requirement.

## Consequences

- Seed first market (UK + London-area airports) without baking UK into schema.
- Duplicate place risk → use Place ID / IATA / careful admin UX.
- Radius matching needs coordinates (PostGIS later optional).

## Alternatives rejected

- Mandatory Country → City → Airport tree as domain truth.
