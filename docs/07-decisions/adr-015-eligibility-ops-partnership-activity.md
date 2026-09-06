# ADR-015: Eligibility, operational status, Partnership, Activity/Audit, vehicle compliance

- **Status:** Accepted
- **Date:** 2026-09-06
- **Closes:** Open items O1–O5 / vehicle-year strictness / activity-vs-audit from prior review

## Decisions

### 1. Job eligibility

Only `partnerships.relationship_status = ACTIVE` may **potentially** be eligible.

ACTIVE is **never** sufficient alone. Eligibility is **derived** from at least:

- Partnership ACTIVE  
- Offering operationally enabled (`AVAILABLE` or `LIMITED`; not `UNAVAILABLE`)  
- Required compliance/standards OK  
- Required documents valid  
- Coverage matches request  
- Requested vehicle category has compliant capacity (≥1 compliant vehicle)  
- Operational availability allows the request  

Do **not** use a SoT column `job_eligible = true`. Cache/materialization optional later.

### 2. Operational status

Enum: `AVAILABLE` | `LIMITED` | `UNAVAILABLE` | `UNKNOWN`.  
No `BUSY`. No real-time dispatch system in MVP.

### 3. Vehicle year / category

Policy default 2023+ remains configurable.  
Do **not** fail the whole Organization for one old car.  
Compliance at **vehicle** level; matching requires **≥1 compliant vehicle** in the **requested category**.  
Keep `VehicleCategory` (global) separate from `FleetVehicle` (org model/year).

### 4. Partnership table

Separate entity/table. Relationship fields must not live on `organizations`.  
Org = company identity; Partnership = VL ↔ org relationship (supports future supplier/buyer/both).

### 5. Activity vs Audit

Two tables: `activities` (CRM/ops timeline) and `audit_logs` (append-oriented security/mutation history). Not event sourcing.

### 6. Contact vs role

`organization_contacts.contact_type` ≠ membership RBAC role. No automatic permissions from contact labels.

## Consequences

Documented in [database-design.md](../03-database/database-design.md).
