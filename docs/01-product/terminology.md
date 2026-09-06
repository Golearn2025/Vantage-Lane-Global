# Terminology

Use these words consistently in docs, schema and UI. If a term is still unstable, it is marked **OPEN**.

## Platform

| Term | Meaning |
|---|---|
| **Vantage Lane Global (VL)** | The company that owns and operates the platform. |
| **Platform** | The software product. |
| **Platform administrator** | A VL staff user. Can manage the global network. Not a member of a supplier organization by default. |
| **Super Admin** | A platform-level role with full administrative power. Exact permission set is an open decision. |

## Organizations and people

| Term | Meaning |
|---|---|
| **Organization** | A company on the platform. The tenant. May be supplier, buyer, or both. |
| **Supplier** | An organization that offers one or more services into the network. |
| **Buyer / Client** | An organization that requests services. A private aviation firm buying a transfer is a buyer, even if it is itself a supplier in another vertical. |
| **Operator** | Informal name for a Ground Transportation supplier. Prefer **Organization** or **GT supplier** in the model. |
| **Membership** | The link between a User and an Organization, including roles and permissions. |
| **User** | A login identity. A user may have memberships in zero or more organizations, and/or a platform role. |
| **Contact** | A person we can reach at an organization. May or may not be a User. Early CRM contacts are usually Contacts, not Users. |

## Services and verticals

| Term | Meaning |
|---|---|
| **Vertical** | A business line the platform can support (Ground Transportation, Aviation, Security, Hospitality, Concierge). |
| **Service type** | A catalog entry for a kind of service an organization can supply or buy. Ground Transportation is a service type. |
| **Offering** | The fact that a specific Organization supplies a specific service type. An org can have many offerings. |
| **Capability** | Vertical-specific facts attached to an offering (fleet, coverage, GT pricing, hotel room types later). |

## Locations and coverage

| Term | Meaning |
|---|---|
| **Location** | A geographic place we care about: country, region, city/locality, airport, or point of interest. |
| **Airport** | A Location with aviation identifiers (IATA / ICAO) and usually a Google Place ID. Includes private aviation airports. |
| **Coverage** | Where an offering can actually operate. Not the same as the company address. |
| **Coverage radius** | Distance from a point (city centre, base, airport) within which the supplier will accept work. |
| **Airport coverage** | Explicit statement that the supplier serves a named airport. |

Do not say “the company is in London” when you mean “the company can cover LHR”. Those are different facts.

## Ground Transportation (vertical language)

| Term | Meaning |
|---|---|
| **Vehicle category** | A commercial class used for quoting: sedan, executive sedan, MPV, van, coach, etc. Catalog-level, not a physical car. |
| **Fleet inventory** | How many vehicles of a category the organization has, plus year / quality hints. |
| **Service product** | A sellable GT product: airport transfer, point-to-point, hourly / as-directed, wait time, extra stop. **OPEN** exact catalog. |
| **Rate card** | The commercial price list of an offering. May contain fixed rates and/or distance-based rules. |
| **Fixed rate** | A set price for a category + product + (optional) location or route. |
| **Distance-based rate** | `base fare + price per mile or km`, with a **minimum price**. |
| **Minimum price** | Floor for a distance-based calculation. The customer never pays less than this. |
| **Base fare** | Opening charge before distance is applied. |
| **Org location / base** | An operational site of an organization. An org may have many. Not the same as a single HQ field. |
| **Fleet vehicle / model** | Concrete vehicle (make/model/year). Separate from **vehicle category**. |
| **Eligibility** | Derived readiness to receive jobs (relationship gates + operational + REQUIRED compliance/docs/coverage/fleet policy). |
| **Subscription / plan** | Future commercial billing. Distinct from membership access. MVP suppliers are FREE. |

## Commercial lifecycle and readiness

These are easy to collapse into one “status” and that would be a mistake.

| Term | Meaning |
|---|---|
| **Lead** | An organization we know about but have not converted into a working partner. May already be stored as an Organization with a CRM state. |
| **Partnership state** | Where the relationship with VL is: Lead, Contacted, Interested, Onboarding, Under Review, Active, Paused, Rejected, Inactive. |
| **Operational status** | Offering availability: AVAILABLE, LIMITED, UNAVAILABLE, UNKNOWN. Not partnership status. |
| **Standards** | VL rules the supplier must meet (insurance, licensing, vehicle age, service rules). Configurable policy. |
| **Job-eligible** | **Derived** readiness — never a single SoT flag. Requires ACTIVE partnership plus ops, compliance, docs, coverage, category fleet compliance. |

## Onboarding and CRM

| Term | Meaning |
|---|---|
| **Manual creation** | A VL admin creates the organization from research / a table. |
| **Self-onboarding** | The organization completes its own profile through a secure link. |
| **Onboarding link** | A time-limited, scoped invitation that can create or attach a user and collect profile data. |
| **Activity** | An append-only event in the timeline: note, email sent, WhatsApp sent, status change, document uploaded. |
| **Follow-up** | A dated next action on an organization. |
| **Internal note** | VL-only commentary. Never visible to the supplier. |

## Communications

| Term | Meaning |
|---|---|
| **Channel** | Email or WhatsApp in MVP thinking. Others later. |
| **Template** | A reusable message body with variables (company name, city, airport, job summary). |
| **Outreach** | An outbound message action while building the network. V1 = open/copy/log; WhatsApp API later. |
| **Job message** | An outbound message that presents a job and either a quote or a request-for-quote. |

WhatsApp is not a free-form broadcast channel. Provider and consent rules are an open decision.

## Future work (do not implement now)

| Term | Meaning |
|---|---|
| **Job / Request** | A buyer need: e.g. “Mercedes V-Class, LIN to hotel, 14:00”. |
| **Quote** | A price offered for a job, either calculated from a rate card or returned by a supplier. |
| **Assignment** | The decision that a given supplier will perform the job. |
| **Auto-quote** | A quote generated from structured prices without asking the supplier. |
| **RFQ** | Request for quote: we send the job and wait for the supplier’s price. |

## Words to avoid in the core model

| Avoid | Why |
|---|---|
| Driver as a core entity | Vertical detail. Premature. |
| Operator as a table name | Informal. Use Organization. |
| Country as the matching key | Too coarse. Coverage and airports matter. |
| A single `status` for everything | Mixes CRM, compliance and operations. |
| “Partner” as the only org type | Buyers and dual-role orgs exist. |
