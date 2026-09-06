# Frontend architecture

**Status:** APPROVED (with final adjustments 2026-09-06). Documentation only until implementation branch work.  
**Baseline:** Database V1 (`db-foundation-v1`) is immutable history.

## Product frame

First shippable product: **internal VL Ground Transportation Network CRM**.

Staff (platform roles) search geography and operators, add leads fast, manage org/contact/base/coverage, outreach via WhatsApp/email open/copy/log, and see live updates without refresh.

Future modules (Jobs, RFQ, Aviation, …) must plug into the shell without a rewrite. They are **not** built now.

## Stack (locked for V1 app)

| Layer | Choice | Why |
|---|---|---|
| App | Next.js (App Router) + React + TypeScript strict | Server/client boundaries, auth cookies, future Server Actions |
| Style | Tailwind + shadcn/ui + Lucide | Fast, accessible primitives; not a theme lock-in |
| Server state | TanStack Query | Cache + invalidation for Supabase + realtime |
| Tables | TanStack Table | Production filters/sort/columns |
| Forms | React Hook Form + Zod | UX validation; DB/RLS remain authoritative |
| Auth / data / live | Supabase Auth, client queries, Realtime, Storage | Aligns with RLS-first model |
| Maps | Google Maps / Places later | Not milestone 1 |
| Client global store | Zustand **only** if genuine cross-screen UI state | Prefer Query + URL; no Redux |

## Design principles

1. **Platform CRM first** — optimize for VL staff desktop workflows.
2. **Modular by domain** — Network ≠ Organizations ≠ future Jobs.
3. **Read models for screens** — components consume typed summaries, not raw joined rows everywhere.
4. **Contextual edit** — no giant Edit Organization page.
5. **Realtime by default** for shared CRM fields — no manual refresh culture.
6. **Do not over-engineer** — internal tool that must scale modularly, not a marketplace shell on day one.

## Folder structure (exact proposal)

```text
apps/web/   OR repo root as Next app (choose one at scaffold; prefer repo root for now)
├── app/                          # Next.js App Router (routes only + thin layouts)
│   ├── (auth)/login/...
│   ├── (platform)/               # VL staff shell (sidebar)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Overview
│   │   ├── network/              # route added when Network screen ships
│   │   ├── organizations/
│   │   │   ├── page.tsx          # table
│   │   │   └── [organizationId]/
│   │   └── settings/             # only if real settings exist
│   └── api/                      # rare: privileged webhooks only if needed
├── modules/
│   ├── network/                  # types.ts, queries, components (geo discovery)
│   ├── organizations/            # types.ts, table, profile, quick-add UI
│   ├── communications/           # templates, open/copy/log UI
│   ├── identity/                 # session, permissions helpers (client)
│   └── shell/                    # sidebar, command palette, theme, toasts
├── shared/
│   ├── ui/                       # shadcn primitives (button, sheet, dialog…)
│   ├── components/               # cross-module presentational (StatusBadge…)
│   ├── lib/
│   │   ├── supabase/             # browser + server clients
│   │   ├── query/                # QueryClient, keys factory
│   │   └── utils/
│   ├── types/                    # ONLY cross-module contracts (enums, refs)
│   ├── validation/               # shared Zod primitives (enums, e164…)
│   └── hooks/                    # useMediaQuery, usePermission, etc.
├── server/                       # Next server-only
│   ├── actions/                  # Server Actions when privileged
│   └── rpc/                      # typed wrappers around supabase.rpc
└── styles/
    └── tokens.css                # semantic design tokens (light/dark/system)
```

### Where things live

| Concern | Location |
|---|---|
| Supabase clients | `shared/lib/supabase/` |
| Query definitions / keys | `modules/<domain>/queries.ts` (+ `shared/lib/query/keys.ts`) |
| Realtime subscriptions | `modules/<domain>/realtime.ts` (+ shell provider) |
| Feature-specific types / read models | `modules/<domain>/types.ts` (e.g. `OrganizationSummary` near organizations) |
| Cross-module contracts only | `shared/types/` — e.g. `RelationshipStatus`, `OperationalStatus`, `LocationSummary`, `OrganizationReference` |
| Zod schemas | `modules/<domain>/schemas.ts` (+ shared enum schemas if reused) |
| UI primitives | `shared/ui/` |
| Feature components | `modules/<domain>/components/` |
| Table column defs | `modules/organizations/table/columns.tsx` |
| Server Actions | `server/actions/` (privileged only) |
| RPC wrappers | `server/rpc/` or `modules/*/api.ts` with server-only import for privileged |
| Permission helpers | `modules/identity/permissions.ts` (mirror DB permission codes) |

### Dependency rules

```text
app/  → modules/* , shared/*
modules/A  → shared/* ; feature types stay in-module
modules/*  ↛ app/
shared/ui  ↛ modules/*
shared/types  → only genuinely shared contracts (not a dump)
server/*   → shared/lib/supabase (server) + shared contracts
modules ↛ circular imports
```

No `components/` god folder. Network may depend on `OrganizationReference` from shared; org table read-models stay in `modules/organizations/types.ts`.

## Route map (initial)

| Route | Purpose | Audience |
|---|---|---|
| `/login` | Auth | all |
| `/` | Overview / ops home | platform |
| `/organizations` | CRM table | platform — **first CRM screen** |
| `/organizations/[id]` | Org profile | platform |
| `/network` | Geo discovery + map/list | platform — after org CRM flow works |
| `/network?q=&airport=` | Search state in URL | platform |
| `/settings` | Theme / profile when real | platform |

**Add later when screens exist:** `/onboarding`, `/compliance`.  
**Not now:** `/jobs`, `/quotes`, `/billing`.

Org-tenant routes can share profile pages later behind permission checks; first milestone is **platform staff shell**.

## Sidebar / navigation

**Initial usable sidebar (no empty stubs):**

```text
Overview
Network
Organizations
Settings   # only if it has real functionality (e.g. theme/account)
```

Add **Onboarding** and **Compliance** to nav only when first usable screens ship.  
Future modules must register without restructuring the shell — do **not** show empty placeholders.

### Network vs Organizations (intent confirmed + sharpening)

| | **Network** | **Organizations** |
|---|---|---|
| Question | *Where* are we covered? Who is near this airport? | *Who* is this company and where are they in CRM? |
| Primary object | Location / airport / map | Organization row |
| Entry | Search Farnborough → suppliers by relationship buckets | Search/filter companies → open profile |
| Add | **+ Add Operator** (pre-fill coverage airport from context) | Same Quick Add, less geo context |
| Map | First-class | Optional later / link out to Network |

Do **not** duplicate two full CRMs. Network is a **geographic lens** over the same orgs; Organizations is the **CRM lens**.

## Network screen architecture

**Layout (desktop):** search bar + filters | split **list/table** + **map** (synced selection).

**Search:** airport name, IATA, ICAO, city, region, country, organization (airport-first ranking for ops).

**After selecting Farnborough:**

- Place header (airport meta)
- Buckets: Active / Contacted / Onboarding / Leads (from partnership + eligibility signals — careful: Active ≠ job-eligible)
- Operator list (from read model)
- Map pins for org bases / coverage centres — **pin ≠ coverage**; badge only if explicit coverage exists
- CTA: **+ Add Operator** (coverage airport pre-filled)

**Mobile:** search → result cards → org profile; map secondary or full-screen sheet.

Data: prefer `v_network_place_suppliers` / `v_network_organizations` (see data-access doc). Realtime: partnership/org changes invalidate network queries for visible place.

## Organizations table architecture

TanStack Table + URL query params for `q`, `status`, `country`, `is_test`, `page`, `sort`.

**Default columns (V1):**

| Column | Default |
|---|---|
| Company (`display_name` + TEST badge) | on |
| Country | on |
| Primary base | on |
| Relationship status | on |
| Operational status | on |
| Last contact | on |
| Next action | on |

**Optional / hidden by default:** Coverage summary, Service, Fleet summary, Compliance, WhatsApp, Website.

Features phased: column visibility + filters + sort + pagination now; saved views / bulk actions later.

Row click → `/organizations/[id]`.

## Organization profile architecture

**Header (5-second read):**

- Display name (+ legal name subtitle)
- Service chip (GT)
- Relationship status + Operational status
- Primary base · coverage count / key airports
- Actions: WhatsApp · Email · Edit overview · More

**Tabs V1 (only if content exists or is primary):**

1. **Overview** (default)
2. **Contacts**
3. **Coverage** (bases adjacent or sub-section)
4. **Activity**

**Defer as tabs until data workflows live:** Fleet, Pricing, Compliance, Documents — accessible via Overview cards → “Manage …” drawer/page when ready, or add tab when milestone hits.

### Overview cards (keep lean)

| Card | Content |
|---|---|
| Health | relationship + ops + warnings (UNKNOWN, expired docs later) |
| Primary contact | name, WhatsApp, email, open actions |
| Coverage | top airports + count; Add Coverage |
| Next action | follow-up due |
| Recent activity | last 5 VL-visible events |

Avoid Fleet/Pricing/Compliance cards until those modules have real data entry — empty gold-plated cards create noise.

## Editing UX rules

| Pattern | Use when |
|---|---|
| **Inline / control** | Simple operational fields (e.g. operational status) via direct RLS mutation where allowed. **Relationship lifecycle** uses `rpc_change_relationship_status` — not a raw table patch + separate activity insert |
| **Modal** | Tiny: rename contact field, confirm destructive |
| **Drawer/Sheet** | Medium: add coverage, edit contact, quick note |
| **Full page** | Rare: multi-step onboarding wizard, future complex fleet import |

**No** monolithic Edit Organization form.

Forms: RHF + Zod. Server/DB validation authoritative.

## Command palette (Cmd/Ctrl+K)

Infrastructure in `modules/shell/command-palette`.

V1 search providers: Organizations, Airports (locations), later Contacts.

Commands (register, implement gradually): Open Network, Open Organizations, Add Operator.

Reusable search index adapters — do not hardcode only org names in the dialog.

## Responsive strategy

| Breakpoint | Behavior |
|---|---|
| `lg+` | Sidebar expanded, tables, network split view |
| `md` | Collapsible sidebar, fewer table columns |
| `sm` | Bottom/nav sheet, **card lists** instead of wide tables, profile stacked |

Mobile must still: search org, open profile, WhatsApp, contacts, change relationship (if permitted), note, coverage summary, next action.

## Theme / design tokens

Modes: **light / dark / system**. Persist preference.

Accent: **Champagne Gold** as `primary` / focus ring / sparse highlights — **not** large gold surfaces.

Propose token (accessible on light & dark — finalize in UI milestone with contrast check):

- `--primary: ~ #C4A574` (champagne gold)
- `--primary-foreground: near-black on light / near-white on dark as needed for contrast

Semantic tokens: `background`, `foreground`, `card`, `muted`, `border`, `primary`, `primary-foreground`, `secondary`, `success`, `warning`, `danger`, `info`.

Status colors use success/warning/danger/info — **never** gold for Active/Lead/etc.

## UX quality baseline

Skeleton loaders, empty states, toasts, error boundaries, retry, safe optimistic updates, destructive confirms, keyboard a11y, focus traps in dialogs/sheets, breadcrumbs on profile, theme persistence, non-blocking loading, realtime so refresh is not the workflow.

## Frontend ↔ backend contracts

Generated `Database` types from Supabase: **allowed in data layer**, not sprinkled in every component.

**Type ownership:**

| Location | Examples |
|---|---|
| `modules/organizations/types.ts` | `OrganizationSummary`, `OrganizationOverview`, `QuickAddOperatorInput`, `Contact`, `CoverageSummary` |
| `modules/network/types.ts` | `NetworkSupplierRow`, `NetworkPlaceResult` |
| `shared/types/` | `RelationshipStatus`, `OperationalStatus`, `LocationSummary`, `OrganizationReference` |

## First frontend milestone (approved order)

Highest-value flow: **Login → Organizations → + Add Operator → Profile → Contact → Update lifecycle**.

1. Application shell + authentication  
2. Organizations table  
3. Quick Add Operator (`rpc_quick_add_operator`)  
4. Organization Profile  
5. Contacts / contextual editing  
6. Bases / Coverage  
7. WhatsApp + Email open/copy/log  
8. Network airport/location search  
9. Realtime (after screens + query contracts work)  
10. Additional CRM improvements  

Realtime is important but **after** underlying screens are correct — feature/screen-scoped subscriptions only.

## Challenges / anti-over-engineering

- No micro-frontends, no GraphQL layer, no Redux.
- No Jobs nav stub that looks half-built — omit until real.
- Do not sync map pins as coverage truth.
- Do not subscribe all tables globally.
- Do not put Quick Add as 7 client inserts.
