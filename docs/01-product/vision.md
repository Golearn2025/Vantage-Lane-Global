# Product vision

## What Vantage Lane Global is

Vantage Lane Global is a multi-tenant B2B platform for building and operating a global network of premium service partners.

The company does not start as a consumer booking app. It starts as an **internal network-building and orchestration system**: VL staff find, contact, qualify, onboard and activate professional suppliers, then later match client jobs to those suppliers.

The first vertical is **Ground Transportation**: chauffeur and ground transport companies that cover cities, commercial airports and private aviation airports.

The same core must later support other premium verticals without a rewrite:

- Private Aviation
- Security
- Hospitality / Hotels
- Concierge
- Other luxury travel services

## What problem we are solving

Luxury travel work is fragmented. When a client needs a transfer in Milan, Farnborough or Dubai, someone at VL must already know:

- which companies operate there
- whether they are approved and active
- what they cover (city, airport, radius)
- what vehicles they have
- how they price
- how to reach them (email / WhatsApp)
- whether they meet operational standards

Today that knowledge usually lives in spreadsheets, inboxes and people's heads. The platform must become the system of record for the network, then the system that routes work through it.

## How the business actually works

VL administrators build the network country by country.

1. Pick a country and search for professional operators.
2. Add them manually as leads / organizations in a working table.
3. Contact them by email or WhatsApp using templates.
4. The operator either sends data back, or completes a secure self-onboarding link.
5. VL reviews profile, coverage, fleet, documents and standards.
6. Approved operators become **Active** and appear on the map.
7. When a job arrives, VL can see the relevant suppliers for that country / city / airport.
8. If the supplier has usable prices, the system can produce a quotation.
9. If not, VL sends the job to selected suppliers and asks for a quote.
10. Only active, standards-compliant suppliers should receive work.

Both creation paths — manual admin entry and operator self-onboarding — must write into the **same** organization / domain model.

## What an Organization is

An Organization is a company on the platform. It is not “a driver company”.

An Organization may act as:

- **Supplier** — sells services into the network
- **Buyer / Client** — buys services from the network
- **Both** — e.g. a hotel buys transfers and later supplies rooms; a chauffeur company supplies GT and later buys aviation handling

Example:

- A chauffeur company supplies Ground Transportation.
- A private aviation company buys Ground Transportation.
- A hotel buys transportation and may later supply accommodation.

## What the core domain is

The core is **Organizations, Users, Services, Locations, Coverage, commercial relationships and communications**.

The core is **not**:

- drivers
- vehicles as the primary object
- chauffeur-specific booking flows
- a consumer marketplace

Ground Transportation details (fleet, vehicle categories, airport coverage, GT pricing) belong in a vertical module that hangs off the core.

## Multi-tenancy and control

Every company has its own `organization_id`.

- VL platform administrators manage the global network.
- External organizations only see data they are authorized to see.
- Organization users will eventually have roles (Owner, Admin, Dispatcher, Operations, Finance, Driver Coordinator, Viewer, and custom roles later).
- Authorization is permission-based RBAC, not hardcoded role names.
- VL also has platform-level roles such as Super Admin.

## Product principles

1. **Network first, jobs second.** If the network data is weak, matching will fail.
2. **Same model, two entry doors.** Manual create and self-onboard must not fork the data model.
3. **Status is not a single switch.** Commercial lifecycle, operational readiness and “can receive jobs” are related but not identical.
4. **Quote-on-request is the default; auto-quote is an upgrade.** Most operators will not give complete structured prices on day one.
5. **Coverage is not headquarters.** A company based in Guildford may cover Farnborough and Heathrow.
6. **Communications are part of the product.** Email and WhatsApp outreach are how the network gets built.
7. **History over overwrite.** Partnership and onboarding changes must remain auditable.
8. **Verticals plug in. They do not own the core.**

## Success for the first release

VL staff can, for a first country:

- keep a working table of operators
- contact them with templates
- collect or receive their profile
- mark who is active and standards-ready
- see them on a map / by airport
- later attach a job to 1–3 relevant suppliers and either auto-quote or request a quote

If that loop does not work, the rest of the platform does not matter yet.
