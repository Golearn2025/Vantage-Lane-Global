# Partner service matrix (onboarding)

One signup for all partners. After email verify they pick a **service type**. Wizard steps and documents change with that choice.

## Catalog (now vs later)

| Code | Status | Partner types |
|---|---|---|
| `GROUND_TRANSPORTATION` | Live | Chauffeur / transfer operators |
| `SECURITY` | Live | CP, events, residential, guarding firms |
| `PRIVATE_AVIATION` | Catalog only | Later wizard |
| `HOSPITALITY` | Not seeded yet | Hotels / restaurants / venues — **no vehicle rates** |
| Events / Concierge | Later | — |

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
| Rates (currency+unit once; distance/hourly/daily/fixed) | yes | Not used by Hospitality/Security |
| Documents | yes | See below |

**GT documents (org):** `COMPANY_REGISTRATION`, `OPERATOR_LICENCE` (or N/A by market), `COMMERCIAL_INSURANCE`, `FLEET_PHOTO_SET`. Recommended: vehicle registration/insurance.

### Security

| Step | Required | Notes |
|---|---|---|
| Service subtypes (CP / events / residential / …) | yes | No vehicle categories |
| Coverage (cities / regions) | yes | |
| Licensing (e.g. SIA UK where applicable) | yes | Market-specific |
| Rates (hourly / daily / event) | yes | **Not** per-km vehicle rates |
| Documents | yes | Company reg + local security licences |

### Hospitality (future)

| Step | Required | Notes |
|---|---|---|
| Venue type (hotel / restaurant / other) | yes | |
| Location + capacity | yes | |
| Offering / packages | yes | |
| Rates (room / cover / event) | yes | **Never** GT vehicle rate card |
| Documents | yes | Business registration, insurance |

## Rule

UI must branch on `offerings.service_type_id` / `service_types.code`. Do not show GT fleet/rate screens to Security or Hospitality.
