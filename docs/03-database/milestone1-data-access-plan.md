# Milestone 1 — Data access foundation plan

**Branch:** `feature/network-crm-foundation`  
**Status:** Plan only. **No Supabase / migration apply in this document task.**  
**Consumers:** Organizations table, Quick Add, Organization Overview, Contacts, Bases, Coverage, lifecycle transitions, Activity.

When implementation of DB objects starts: **new migrations only** (never edit applied V1 history).

---

## Scope gate

| Needed for M1 CRM flow | Defer |
|---|---|
| `v_organization_summary` | `v_network_*` (until Network screen) |
| `v_organization_overview` | onboarding/compliance views |
| `rpc_quick_add_operator` | pricing/fleet RPCs |
| `rpc_change_relationship_status` | WhatsApp API |
| Direct RLS: contacts, bases, coverages, communications/activities inserts, operational_status | — |

---

## A. Views required immediately

### 1. `v_organization_summary` — **M1 required**

| | |
|---|---|
| **Purpose** | One row per org for TanStack table |
| **Inputs** | Filters via `WHERE` from client: `q`, `relationship_status`, `operational_status`, `legal_country_code`, `is_test`, **server** pagination (`.range`) + sort — never load the full view into the browser |
| **Outputs (conceptual)** | `organization_id`, `display_name`, `legal_name`, `is_test`, `legal_country_code`, `primary_base_label`, `primary_base_city`, `relationship_status`, `relationship_status_changed_at`, `operational_status`, `service_code`, `last_contact_at`, `next_action_due_at`, `next_action_title` |
| **Tables** | `organizations`, `partnerships`, `offerings`, `service_types`, `organization_locations` (primary), left join open `follow_ups`, max(`communications`/`activities`) for last contact |
| **Security** | `WITH (security_invoker = true)`. Platform users see network via RLS on base tables; org members only own org. **No** note bodies, no audit. |
| **Transaction** | Read-only |
| **Indexes depended on** | `organizations(display_name)`, `partnerships(relationship_status)`, `partnerships(organization_id)` unique, `organization_locations(organization_id) WHERE is_primary`, `follow_ups(due_at) WHERE OPEN`, `communications(organization_id, occurred_at desc)`, `activities(organization_id, occurred_at desc)` |
| **Frontend** | Query key `['organizations','list', filters]` (incl. `pageIndex`/`pageSize`); consumer: Organizations table |
| **Companion** | `v_organization_filter_countries` — distinct country codes for the filter dropdown (do not derive countries by scanning summary) |
| **M1** | **Yes** |

### 2. `v_organization_overview` — **M1 required**

| | |
|---|---|
| **Purpose** | Profile header + overview cards in one read |
| **Inputs** | `organization_id` |
| **Outputs** | Identity fields, `relationship_status`, `operational_status`, `service_code`, primary base summary, coverage_count + sample airport iatas, primary contact summary, open follow-up, `recent_activity` as limited JSON/array of ids+summaries **or** omit activity and load via separate query |
| **Tables** | orgs, partnerships, offerings, service_types, organization_locations, organization_contacts (primary), offering_coverages + locations (agg), follow_ups |
| **Security** | `security_invoker`; exclude `partnership_notes` |
| **Transaction** | Read-only |
| **Indexes** | PK lookups; coverage `(organization_id)`; contacts `(organization_id, is_primary)` |
| **Frontend** | `['organizations','overview', organizationId]` — Organization Profile |
| **M1** | **Yes** |

**Recommendation:** Keep activity as a **separate** query on `activities` (limit 20) to avoid heavy view — still M1, not a view.

---

## B. Views deferred (approved but not M1)

| Object | Wait for |
|---|---|
| `v_network_place_suppliers` | Network screen (milestone step 8) |
| `v_network_organizations` | Network map/list |
| onboarding/compliance views | those modules |

---

## C. RPCs required immediately

### 3. `rpc_quick_add_operator` — **M1 required**

| | |
|---|---|
| **Purpose** | Atomic create of Lead operator |
| **Inputs** | `display_name` (required), `legal_country_code` (required), optional: `legal_name`, website, whatsapp, email, phone, base city/label, `coverage_location_id`, lead source, internal note |
| **Outputs** | `organization_id`, `offering_id`, `partnership_id`, optional warnings `{ possible_duplicates: [...] }` |
| **Tables written** | `organizations`, `organization_capabilities` (SUPPLIER), `partnerships` (LEAD), `offerings` (GT + UNKNOWN), optional `organization_locations`, optional `offering_coverages`, `activities`, optional `partnership_notes` if internal note |
| **Security** | Prefer `SECURITY DEFINER` with explicit check `has_platform_permission('platform.network.manage')` (or network.read insufficient — **manage**). `SET search_path = public`. Grant `EXECUTE` to `authenticated` only. |
| **Transaction** | Single transaction; all-or-nothing |
| **Duplicates** | Before insert: soft-match on normalized `display_name` / domain (return warnings); hard-fail on unique violations (domain/place). Do not block on fuzzy name alone. |
| **Indexes** | Uniques on `website_domain`, `google_place_id`; GT `service_types.code` |
| **Frontend** | Mutation → invalidate `['organizations','summary']`; navigate to profile |
| **M1** | **Yes** |

### 4. `rpc_change_relationship_status` — **M1 required**

| | |
|---|---|
| **Purpose** | Business lifecycle transition |
| **Inputs** | `organization_id`, `new_status` (`relationship_status` enum), optional `note` / `reason` |
| **Outputs** | `{ organization_id, previous_status, new_status, changed_at }` |
| **Tables** | `partnerships` update; `activities` insert; `audit_logs` insert (or rely on trigger if added — prefer explicit in RPC for V1 clarity) |
| **Security** | Same as Quick Add: platform `network.manage`; validate org exists; optional allowlist of transitions (document OPEN: free transitions vs enforced graph — **recommend** allow all non-equal transitions for V1 with audit, tighten later) |
| **Transaction** | Single transaction |
| **Side effects** | Set `became_active_at` when entering `ACTIVE` if null; set `paused_at` / `rejected_at` when entering those states |
| **Indexes** | `partnerships(organization_id)` |
| **Frontend** | Profile / table status control; invalidate summary + overview + activity keys |
| **M1** | **Yes** |

---

## D. Direct table access (M1 — no new RPC)

| Operation | Table | Notes |
|---|---|---|
| List/edit contacts | `organization_contacts` | RLS platform/org |
| Create/edit base | `organization_locations` | |
| Create/edit coverage | `offering_coverages` | validate mode checks already in DB |
| Update operational status | `offerings.operational_status` | direct OK |
| Log WhatsApp/Email open/copy | `communications` + `activities` | may be one client batch or tiny RPC later if atomicity required — **start direct** two inserts; if fragile, add `rpc_log_outreach` in a later migration |
| Insert VL note / follow-up | `partnership_notes`, `follow_ups` | platform RLS |
| Read activity | `activities` | filter by org; VL_ONLY ok for platform |

---

## E. Optional later (not M1 blockers)

| Object | Why wait |
|---|---|
| `rpc_log_outreach` | Only if dual insert proves error-prone |
| Generated columns `last_contact_at` on org | Optimize summary if view slow — new migration |
| Transition state machine enforcement | Product decision |

---

## F. Suggested migration sequence (when DB work starts)

1. **New migration:** `v_organization_summary` + `v_organization_overview` (`security_invoker`)  
2. **New migration:** `rpc_quick_add_operator`  
3. **New migration:** `rpc_change_relationship_status`  
4. Grants + smoke SQL tests as platform user  
5. Then frontend against these contracts  

Do not edit Phase 1 applied SQL files.

---

## G. Frontend query key map (M1)

| Key | Source |
|---|---|
| `['organizations','summary', filters]` | view summary |
| `['organizations','overview', id]` | view overview |
| `['organizations','contacts', id]` | table |
| `['organizations','bases', id]` | table |
| `['organizations','coverages', id]` | table (+ locations join) |
| `['organizations','activity', id]` | table |
| Mutations: quickAdd, changeRelationshipStatus | RPCs |

Realtime (after UI works): subscribe on profile/table screens only → invalidate keys above.

---

## H. Out of scope for this plan

Frontend code, applying migrations, Network views/RPCs, Jobs, pricing, billing, WhatsApp API.
