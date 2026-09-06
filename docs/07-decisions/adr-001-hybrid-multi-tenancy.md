# ADR-001: Hybrid multi-tenancy

- **Status:** Accepted
- **Date:** 2026-09-06
- **Expensive to reverse:** Yes — shapes every RLS policy and query

## Context

VL needs global network visibility. External organizations need isolated workspaces. Cross-org access (e.g. job invite) comes later and must be explicit.

## Decision

Use **hybrid multi-tenancy**:

- Platform staff see network-wide data according to **platform permissions**.
- External orgs operate in isolated workspaces and **never** see another org’s private data unless a future explicit workflow grants access.
- Classify every table as: platform catalog, org-owned, VL-private (CRM/notes), or transactional/shared (future jobs).

## Consequences

- RLS is two-layered (platform permission **or** org membership **or** explicit grant).
- VL staff are **not** fake members of every supplier org.
- Mis-classifying data (e.g. VL notes on org profile) becomes a security bug.

## Alternatives rejected

- Isolated SaaS only — blocks matching.
- Marketplace without tenants — weak isolation and weak future supplier workspace.
