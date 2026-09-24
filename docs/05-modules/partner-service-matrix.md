# Partner service matrix (onboarding)

One signup for all partners. After email verify they pick a **service type**. Wizard steps and documents change with that choice.

## Catalog

| Code | Status | Partner types |
|---|---|---|
| `GROUND_TRANSPORTATION` | Live | Chauffeur / transfer operators |
| `SECURITY` | Live | CP, events, residential, guarding firms |
| `AVIATION` | Live | Private aviation / AOC operators |
| `HOSPITALITY` | Live | Hotels / restaurants / venues — **no GT vehicle rates** |
| `CONCIERGE` | Live | Lifestyle / HNW concierge |
| `YACHT` | Live | Yacht & marine charter |
| `MEDICAL` | Live | Medical & wellness escorts |
| `EVENTS` | Live | Events & protocol |

UK test accounts: [partner-onboarding-test-kit.md](./partner-onboarding-test-kit.md).

## Shared path (all services)

1. `/join` — name, email, phone/WhatsApp, password  
2. Email verification  
3. `/join/setup` — company name, service, country, city  
4. Creates `organization` + `offering` + `partnership` (`ONBOARDING`) + Owner membership  
5. Service-specific wizard → submit → VL review → `ACTIVE` (≠ job-eligible)

## Per-service wizard modules

### Ground Transportation

| Step | Required | Notes |
|---|---|---|
| Accept Driver Network standard | yes | https://vantage-lane.com/driversnetwork |
| Coverage (base + radius + airports) | yes | Country/city from setup |
| Fleet (VL categories, year) | yes | Policy min year 2023+; older = warn / score down |
| Rates (currency+unit once; distance/hourly/daily/fixed) | yes | Not used by Hospitality |
| Documents | yes | Company reg + operator licence + insurance |

### Security

Full design: [security-partner-onboarding.md](security-partner-onboarding.md).

| Step | Required | Notes |
|---|---|---|
| Coverage | yes | Cities / regions |
| **Services offered** | yes | VL catalog (CP, residential, door/venue, event…) + **Other** custom — like GT fleet categories |
| Operatives & SIA | yes | Compliance (licences, headcount, ACS) — not the commercial catalog |
| Rates | yes | **Per service line** (hourly / daily / event / per post…) — not one firm-wide hourly/daily |
| Documents | yes | Company reg + SIA / local security licences |

Industry: firms sell mission types (bodyguard, house for HNW, club/restaurant door, events), not a single “security” price.

### Aviation / Yacht

| Step | Required | Notes |
|---|---|---|
| Coverage | yes | |
| Aircraft / Vessels | yes | Persisted inventory JSON |
| Rates (hourly / daily) | yes | |
| Documents | yes | AOC / maritime licences where applicable |

### Hospitality / Concierge / Medical / Events

| Step | Required | Notes |
|---|---|---|
| Coverage | yes | |
| Properties / Specialisations / Services / Capabilities | yes | Persisted inventory JSON |
| Rates | Hospitality: no GT card | Concierge/Medical/Events follow wizard config |
| Documents | yes | Business registration + service-specific |

## Rule

UI must branch on `offerings.service_type_id` / `service_types.code`. Do not show GT fleet screens to Security or Hospitality.
