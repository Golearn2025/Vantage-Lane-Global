# ADR-010: Communications module V1 (manual open/copy/log)

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Medium — activity timeline and job RFQ reuse this module

## Context

Network building and later job RFQ are “pick contacts → use template → reach out”. WhatsApp Business API is out of MVP.

## Decision

Communications is a **core module**, but V1 is **manual**:

- Open WhatsApp (launch conversation for org/contact WhatsApp number when Desktop/Web available)
- Copy WhatsApp template
- Open Email
- Copy Email template
- Record / log outreach activity

Full WhatsApp API integration is **explicitly out of MVP**.

Templates + communication/activity records exist from day one so later API send and job messages attach cleanly.

## Consequences

- No automated delivery guarantees in V1 — human confirmation / log is the source of “we contacted them”.
- Provider adapters can be added later without changing the domain objects.
- Compliance: still store message body carefully; retention policy is OPEN.

## Alternatives rejected

- Phone field only; full Meta/Telnyx WhatsApp automation in MVP.
