# ADR-006: Ground Transportation pricing module

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Medium–high — jobs/auto-quote depend on rule shape

## Context

Operators need fixed and distance-based pricing, plus common chauffeur surcharges. Other verticals will not use “per mile”.

## Decision

Build a **GT-specific** pricing module (rate card + rules), **not** a universal pricing engine.

Supported commercial concepts (model must allow; UI can phase in):

- Fixed transfer price
- Base fare + price per distance unit + minimum price
- Hourly by vehicle category
- Daily pricing
- Airport transfer pricing
- Waiting charges
- Parking
- Meet & greet charges
- Extra stop charges

Distance units are **per rule / rate card context** (`mile` | `km`), never a single global hard-code.

If no applicable price exists → future workflow uses **RFQ / manual quotation**.

## Consequences

- Hotels/aviation get their own pricing packs later.
- Auto-quote becomes “select matching GT rule(s)” not “read a magic number”.
- Currency: at least one currency per rate card in MVP thinking.

## Alternatives rejected

- Columns on Organization; universal JSON pricing language; PDF-only prices.
