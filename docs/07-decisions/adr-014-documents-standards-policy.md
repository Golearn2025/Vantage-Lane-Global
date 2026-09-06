# ADR-014: Documents, compliance, and configurable standards

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Yes — hard-coded rules and checkbox “approved” do not scale by country

## Context

Documents expire. Standards differ by market. Eligibility must eventually come from policy/compliance, not one manual flag. First GT standards pack is known; SLAs must not be globally frozen yet.

## Decision

### Documents

Support: issue date, expiry date, verification status, verification date, verified by, rejection reason.

Expired **required** compliance documents must eventually affect eligibility. Platform should warn VL before important expiry.

### Standards / policy

Configurable standards architecture (not hard-coded application rules for every check).

Levels: **REQUIRED** | **RECOMMENDED** | **OPTIONAL / INFORMATIONAL**.

Initial GT standards cover company/compliance, vehicles (incl. default min year 2023 as policy), drivers, service, operations — see [supplier-standards-gt.md](../05-modules/supplier-standards-gt.md).

Do not decide every SLA/compliance value globally now — legislation differs by country. Architecture must allow country/market overlays later.

## Consequences

- Policy tables/seeds + evaluation function for eligibility.
- Manual VL override may exist as audited exception, not as the primary model.
- Country-specific document types can be added without schema forks.

## Alternatives rejected

- Hard-code year 2023 and all rules in TypeScript.
- Single `standards_accepted` checkbox as eligibility source of truth.
