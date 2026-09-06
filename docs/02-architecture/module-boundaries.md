# Module boundaries

**Status:** aligned with ADR 001–014. Modules are logical, not repos.

## Modules

| Module | Owns | Must not own |
|---|---|---|
| Identity | Users, memberships, platform roles, invitations | Coverage, prices |
| Organizations | Company profile, **org locations/bases**, contacts | GT fleet columns |
| Catalog | Service types, locations, vehicle categories, standards definitions | Tenant prices |
| Offerings | Org × service type, operational state | Buyer billing |
| Coverage | Offering × location / base × radius | Map UX details |
| Ground Transportation | Fleet inventory (model ≠ category), GT rate rules | Organization identity |
| Pricing (GT pack) | Rate cards / rules (fixed, distance, hourly, daily, surcharges) | Universal multi-vertical engine |
| Partnership / CRM | VL relationship, notes, follow-ups | Supplier-visible profile |
| Communications | Templates; V1 open/copy/log | WhatsApp API in MVP |
| Documents & standards | Files, verification, policy compliance | Hard-coded year/SLA constants |
| Activity / Audit | Timeline + scoped audit | Full event sourcing |
| Subscriptions (later) | Plans | Access membership |
| Jobs (later) | Requests, quotes, assignments | Re-defining coverage |

## Rule

A vertical module may *read* core entities. It may not require the core to know what a driver or a runway is.
