# System architecture

**Status:** outline only. Detailed component design waits for [`../07-decisions/README.md`](../07-decisions/README.md).

## Expected stack

| Layer | Choice |
|---|---|
| Language | TypeScript |
| Web | React / Next.js |
| API | Next.js server + (where needed) API-first modules |
| Auth | Supabase Auth |
| Data | PostgreSQL via Supabase |
| Authorization | Permission RBAC + Row Level Security |
| Files | Supabase Storage (documents) |
| Maps (later) | Google Maps / Places |
| Email / SMS / WhatsApp | Provider behind an interface — **OPEN** |

## Architectural shape (recommended, not approved)

One application, modular inside a monolith.

```text
[ VL Admin UI ]     [ Supplier onboarding UI ]
        \                 /
         \               /
        [ Next.js app — typed modules ]
                 |
        [ Supabase Auth / Postgres / RLS / Storage ]
```

No microservices. No separate “Ground Transportation service”.

Verticals are modules (data + domain logic + UI), not deployable systems.

## Non-negotiables

- Authorization enforced in the database / server, not only in the UI.
- Schema changes via versioned migrations only.
- Platform catalogs and tenant data are not mixed without an ownership rule.
- Jobs, when they arrive, call into organizations / coverage / pricing. They do not own those models.

## OPEN

- Hosting (Vercel vs other)
- Whether any privileged orchestration runs in Supabase Edge Functions vs Next.js server
- Communication provider
- PostGIS
