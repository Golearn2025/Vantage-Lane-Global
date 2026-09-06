# ADR-016: Final pre-column clarifications

- **Status:** Accepted
- **Date:** 2026-09-06

## D1 — Operational UNKNOWN / matching

| Status | Auto-match | Manual VL search |
|---|---|---|
| AVAILABLE | Eligible (if other gates pass) | Normal |
| LIMITED | Eligible, lower rank / reduced-capacity signal | Warning: limited capacity |
| UNAVAILABLE | Not eligible | May show as unavailable |
| UNKNOWN | **Not** eligible for auto-match | **Visible** with warning “availability unconfirmed”; staff may contact/select manually |

No SoT `job_eligible` column.

## Partnership vs commercial roles

- `partnerships` = VL ↔ Organization **relationship lifecycle** only (1:1 for MVP).
- An Organization may be Supplier, Buyer, or **Both**.
- Do **not** encode exclusive supplier XOR buyer on partnership.
- Commercial posture via small `organization_capabilities` (`SUPPLIER` | `BUYER`) + `offerings` for what is actually supplied.

## Compliance scopes

Requirements and assessments are scoped explicitly:

- **ORGANIZATION** — licence, insurance, supplier agreement
- **OFFERING** — GT operational standards
- **VEHICLE** — year policy, vehicle docs (on declaration and/or unit)

No single “everything hangs off Offering”. No polymorphic `entity_type`/`entity_id` FK.

## Location vs coverage

- `organization_locations` = bases only.
- `offering_coverages` = where service can be delivered.
- Serving Farnborough ≠ Farnborough is a base.

## Fleet progressive fidelity

Support **declared aggregate inventory** without VIN/registration, then optional **individual verified units**. See schema doc.
