# Data access & realtime architecture

**Status:** APPROVED (final adjustments 2026-09-06). Documentation only until implementation.  
**Baseline DB:** V1 immutable. Future schema changes = **new** migrations only.

## Principles

| Layer | Role |
|---|---|
| **Tables** | Source of truth |
| **Views** | Focused read models for screens (`security_invoker`) |
| **Direct Supabase** | Simple reads/writes under RLS |
| **RPC / DB functions** | Multi-row transactional commands |
| **Server Actions / backend** | Secrets, Admin Auth, external APIs, privileged orchestration |
| **Realtime** | Live UI; invalidate/patch TanStack Query |

**No** traditional backend of hundreds of REST endpoints.

---

## Decision rules: direct vs view vs RPC vs server vs worker

| Situation | Mechanism |
|---|---|
| Read list/detail shaped for one screen | **View** (+ direct select) |
| Single-row update user is allowed to do (phone, note body) | **Direct** table update via Supabase client + RLS |
| Insert one contact / one coverage row | **Direct** insert + RLS |
| Multi-table create/update that must be atomic (Quick Add Operator) | **RPC** |
| **Relationship lifecycle transitions** (LEAD→…→ACTIVE) | **RPC** `rpc_change_relationship_status` — not direct partnership patch + separate activity insert |
| Needs service role, webhook secret, email provider key | **Server Action** / Edge Function |
| Long-running / scheduled (expiry reminders blast) | **Worker / Edge** later |
| “Just expose REST because habit” | **Reject** |

### Relationship status transitions (business command)

**Do not** treat lifecycle changes as ordinary direct `partnerships` updates from the client.

Use transactional RPC e.g. `rpc_change_relationship_status(organization_id, new_status, note?)` that:

1. Validates authorization (`platform.network.manage` / equivalent)
2. Updates `partnerships.relationship_status` (+ `status_changed_at`, `became_active_at` when entering ACTIVE, etc.)
3. Writes an `activities` row
4. Relies on / appends `audit_logs` behavior as designed

Frontend calls **one** command — never “update partnership then insert activity”.

Simple operational fields (e.g. `offerings.operational_status`, contact phone) may remain **direct RLS mutations**.

### Quick Add Operator

**RPC:** `rpc_quick_add_operator(payload jsonb)` — all-or-nothing transaction:

- Organization  
- Capability `SUPPLIER`  
- Partnership `LEAD`  
- Offering `GROUND_TRANSPORTATION` with operational `UNKNOWN`  
- optional Base  
- optional Coverage  
- Activity (manually created)

Duplicate detection **before or during** the workflow — soft warnings on similar names; hard blocks only on strong uniques (e.g. domain / place id) where defined. Do not block solely on fuzzy name similarity.

**Server Action wrapper** optional for logging/rate-limit — not required if RPC auth checks are solid.

---

## Views (approved for product; milestone gating below)

Client-facing views: **`security_invoker = true`**. No giant universal org view.

### Required for early CRM UI

- `v_organization_summary` — Organizations table  
- `v_organization_overview` — Profile overview  

### Required when Network ships

- `v_network_place_suppliers`  
- `v_network_organizations`  

### Deferred until modules exist

- `v_onboarding_pipeline`  
- `v_compliance_attention`  

(Details of columns/filters remain as previously documented for the four approved views.)

---

## Direct Supabase — reads

| Read | Path |
|---|---|
| Catalog locations / airports search | `locations` (+ optional search RPC later) |
| Vehicle categories | `vehicle_categories` |
| Message templates (platform) | `message_templates` |
| Org contacts list | `organization_contacts` or overview view |
| Activity timeline | `activities` (respect visibility) |
| Table/network screens | **views** above |

## Direct Supabase — writes (examples)

| Write | Path |
|---|---|
| Update contact phone/email | `organization_contacts` update |
| Add/edit single coverage row | `offering_coverages` |
| Change operational_status | `offerings` update |
| Change relationship_status | **`rpc_change_relationship_status`** (not direct) |
| Insert activity / communication log | `activities` / `communications` |
| Insert VL note / follow-up | platform-only tables |

Always: permission via RLS; optional optimistic UI.

## RPC / backend required

| Operation | Why |
|---|---|
| `rpc_quick_add_operator` | Multi-table transaction |
| `rpc_change_relationship_status` | Lifecycle + activity (+ audit) atomic |
| Invite user / set password flows | Auth Admin — **Server Action** |
| Future document verify with side effects | May stay direct + audit trigger, or RPC |
| Future WhatsApp API send | Server / worker — not V1 |
| Bulk import operators | Server + RPC later |

---

## Realtime architecture

### V1 transport

**Supabase Postgres Changes** on specific tables, filtered where possible.

Architecture must allow later **Broadcast topics** e.g. `platform:network`, `organization:{id}` when fan-out cost grows.

### What needs realtime (V1)

| Change | Who cares |
|---|---|
| `partnerships.relationship_status` | Network + Organizations + profile header |
| `offerings.operational_status` | same |
| `organizations` display fields | table + profile + network |
| `activities` / `communications` insert | profile Activity; maybe table “last contact” |
| `organization_contacts` | profile Contacts |
| `offering_coverages` | profile Coverage + network place lists |
| `follow_ups` | overview next action |

**Not** every catalog seed change. **Not** audit_logs for all clients. **Not** full table dumps.

### Page subscriptions (feature-scoped — not global)

Subscribe **only on screens that need live data**. Do not globally subscribe the app to every CRM table.

| Page | Subscribe (conceptually) |
|---|---|
| Organizations table | org + partnership (+ offering) events → invalidate/patch `v_organization_summary` queries |
| Org profile | that `organization_id` only |
| Network (when shipped) | place-scoped invalidation |

Base table changes → targeted update/invalidation of **view-backed** query keys. Never refetch the whole application.

**Lifecycle:** subscribe on mount / focus; unsubscribe on unmount; pause when tab hidden if needed.

### TanStack Query interaction

| Event | Action |
|---|---|
| Row update for entity in cache | **Patch** cached object if payload complete |
| Status change affecting lists/buckets | **Invalidate** `organizations.summary`, `network.place.*` |
| Insert activity | Invalidate `organization.activity`; optionally prepend if payload known |
| Unrelated table | **Ignore** |
| Ambiguous / partial payload | Invalidate, don’t guess-patch |

Prefer **narrow invalidation** over full-page refetch.

### Security

- Client subscriptions still subject to RLS on receiving changes (Supabase Realtime respects privileges).
- Never assume event payload is authoritative for forbidden fields — re-fetch through views if unsure.
- Test users must not receive other tenants’ private channel data.

### Scale path

1. V1: Postgres Changes → Query invalidation  
2. Later: emit Broadcast on `platform:network` for relationship flips; clients subscribed to Network only  
3. Organization rooms for profile collaborators  

---

## Security implications

- Views with wrong security mode = **tenant leak** — mandate `security_invoker` + review.
- RPC `security definer` must re-check permissions explicitly; deny-by-default.
- Direct client writes are fine only where RLS is proven (bootstrap tests).
- Platform CRM notes stay off tenant-readable views.
- Realtime is not a substitute for authorization.

---

## Schema limitations that could block (no changes now)

| Gap | Impact | Mitigation without editing old migrations |
|---|---|---|
| No materialized “last_contact_at” column | Summary view needs subquery/agg | OK in view; index activities later via **new** migration if slow |
| No Greater London region entity | Network “region” filter limited | Use London locality + country; add region later as data |
| Rate cards not in DB yet | Pricing Status card empty | Omit card until Phase 2 pricing migration |
| Storage buckets not created | Documents UI blocked | Milestone after Storage setup |
| No `rpc_quick_add_operator` yet | Quick Add blocked | **New** migration when implementation starts |
| Views not created yet | Screens can start on manual joins | Prefer adding views in first app DB migration batch |

None of these require editing applied V1 migrations.

---

## What NOT to build in this design pass

REST CRUD controllers for every table, GraphQL gateway, event-sourcing bus, per-user websocket servers, WhatsApp Cloud API.
