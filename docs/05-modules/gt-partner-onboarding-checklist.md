# GT partner onboarding checklist (MVP)

Aligned with [supplier-standards-gt.md](./supplier-standards-gt.md), ADR-007 (categories), ADR-014 (standards/docs), ADR-015 (Active ≠ job-eligible).

Public standard link: https://vantage-lane.com/driversnetwork

## Wizard steps (mobile-first)

1. Accept VL Driver / Supplier Standards (checkbox + link)
2. Company profile (legal name, display name, contact WhatsApp/email)
3. Coverage (primary base + radius km/mile + key airports)
4. Fleet (VL categories only; model year; photos)
5. Rates (one card settings + per selected category)
6. Documents (upload / N/A)
7. Submit → `UNDER_REVIEW`

## Rate card rules

- **Once per card:** `currency_code` + distance unit (`KM` | `MILE`)
- **Categories:** platform catalog only (`EXECUTIVE_SEDAN`, `LUXURY_SEDAN`, `LUXURY_SUV`, `LUXURY_MPV`, `EXECUTIVE_VAN`, `MINIBUS`, `COACH`). Partner maps locally named cars into these; optional free-text note.
- **Per selected category:**
  - Distance: `base_amount`, `per_unit_amount`, `minimum_amount`
  - Hourly: `hourly_amount`
  - Daily: `daily_amount`
  - Fixed airport↔centre transfer (1–2 routes) where applicable
- **Self-check before save:** Google distance on market reference route → implied price vs VL benchmark bands → warn high/low; allow save with flag.

## Fleet year

- Policy default `min_vehicle_year = 2023` from `standard_definitions.GT_MIN_VEHICLE_YEAR` (not hard-coded).
- Older years allowed to save with **warning**.
- Effect: lowers activation/review score; category not job-eligible until compliant (or VL waiver). Partnership can still be `ACTIVE`.

## Documents

### REQUIRED (organization)

| Code | Name | Notes |
|---|---|---|
| `COMPANY_REGISTRATION` | Company registration | |
| `OPERATOR_LICENCE` | Operator / PHV licence | Mark N/A + note if market has no equivalent |
| `COMMERCIAL_INSURANCE` | Commercial / private hire insurance | |
| Standards acceptance | Checkbox | `SUPPLIER_AGREEMENT` PDF optional until Active |

### REQUIRED (fleet presentation)

| Code | Name |
|---|---|
| `FLEET_PHOTO_SET` | Fleet / vehicle images |

### RECOMMENDED (score, not hard gate on submit)

| Code | Name |
|---|---|
| `VEHICLE_REGISTRATION` | Vehicle registration |
| `VEHICLE_INSURANCE` | Vehicle-specific insurance |
| `SERVICE_CERTIFICATION` | Local service certification |

Not in MVP wizard: individual driver licences, client invoices, personal IDs.

## Partner test login

- Email: `test-owner-london@vantage-lane.com`
- Org: `[TEST] London Executive Cars`
- Password: set via Auth admin / SQL (see chat; never commit)
- Shell: `/partner` (not platform CRM)
