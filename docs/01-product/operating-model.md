# Operating model

This is the human workflow the software must serve. Architecture that ignores this will produce a correct-looking schema and an unusable product.

## Who uses the system first

| Actor | What they do in MVP |
|---|---|
| VL Super Admin / network builder | Researches countries, adds companies, sends outreach, reviews onboarding, activates suppliers. |
| VL operations (later) | Receives a client job, finds 1–3 eligible suppliers, quotes or RFQs, confirms the job. |
| Supplier contact | Receives email / WhatsApp. Either replies with data or opens an onboarding link. |
| Supplier user (thin) | Completes profile, fleet, coverage, prices, documents. |
| Buyer | **Not a primary MVP user.** Jobs will exist later. |

Drivers are not users of the core platform in MVP.

## Loop A — Build the network

```text
Choose country
    → research operators
    → add row in working table (Lead organization)
    → choose channel + template
    → send WhatsApp or email
    → wait / follow up
    → operator replies with data  OR  completes onboarding link
    → VL reviews
    → standards + documents
    → Active / Rejected / Paused
    → appears on map and in airport coverage
```

Important details:

- The table is the daily tool. Adding a company must be fast and incomplete-friendly. A lead with a name, city, WhatsApp and a website is enough to start.
- Templates are not a nice-to-have. They are how VL scales contact without rewriting the same pitch.
- V1 outreach is **open/copy WhatsApp or email + log**. Automated WhatsApp API is out of MVP.
- History matters. “We contacted them on 12 March, they asked to wait until April” must not disappear when status changes.
- Self-onboarding and “they sent us a PDF / WhatsApp voice note and we typed it in” are both valid. The model must accept both.

## Loop B — Receive work (designed now, built later)

```text
Client needs a transfer
    → location / airport / datetime / vehicle category
    → find job-eligible suppliers for that coverage
    → typically 1–3 companies, not the whole country list
    → if rate card can price it: generate quote, send to client / confirm with supplier
    → if not: send job template to chosen suppliers and collect quotes
    → assign
```

Preconditions before a supplier is even in that list:

- partnership is Active (or whatever we decide is the commercial gate)
- offering is operationally active
- standards are satisfied
- coverage matches the job
- vehicle category exists in fleet (or is offered)
- we know how to contact them

Country is a search starting point for humans. It is **not** a sufficient matching key. “I know three companies in Italy” is a VL mental model. The system should prefer airport / city / radius, then show the short list.

## Two doors, one record

```text
                    ┌─────────────────────┐
  VL admin table  → │                     │
                    │   Organization      │
  onboarding link → │   + Offering        │
                    │   + Coverage        │
  inbound email   → │   + Contacts        │
                    │   + Rate card       │
                    └─────────────────────┘
```

Never create a `leads` product that cannot become the same organization the supplier later logs into.

## Communications as operations, not marketing

Outbound messages are operational records:

- who was contacted
- which template
- which job or which onboarding ask
- what they replied
- what the next action is

That is CRM + ops, not a newsletter tool.

## What “I add them in a table” really implies

The first UI is closer to a **CRM pipeline + spreadsheet** than to a polished supplier portal:

- sortable / filterable table
- country and city filters
- status filters
- next follow-up
- one-click “send template”
- side panel or row expand for notes and activity

Over-designing a public multi-module SaaS shell before this table works would be the wrong sequence.

## Standards before work

VL wants suppliers to know the standards **before** they receive jobs.

That means:

- standards content is VL-owned
- acceptance is recorded
- “Active” without standards-ready should not be job-eligible
- sending a job is a privileged action that checks eligibility server-side

Exact standards list is an **OPEN DECISION** (insurance, licences, vehicle age, chauffeur presentation, airport permits, etc.).
