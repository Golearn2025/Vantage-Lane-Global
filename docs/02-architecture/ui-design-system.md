# UI design system (tokens & tone)

**Status:** Direction for implementation. No code in this task.

## Product feel

Premium restrained B2B SaaS (spirit of Linear / Stripe Dashboard — **not** a clone). Dense enough for ops tables; calm enough for long CRM sessions.

Avoid: generic purple admin templates, neon dark-mode glows, gold-everywhere branding.

## Color roles

| Token | Role |
|---|---|
| `background` / `foreground` | Page canvas / default text |
| `card` | Surfaces |
| `muted` | Secondary text / quiet chrome |
| `border` | Hairlines |
| `primary` | **Champagne gold accent** — buttons primary sparse, focus rings, brand marks |
| `primary-foreground` | Text on primary |
| `secondary` | Neutral secondary actions |
| `success` / `warning` / `danger` / `info` | **Status only** |

Champagne gold proposal (tune with contrast QA): approximately `#C4A574` on light; adjust luminance for dark mode so accent remains visible without dominating.

## Modes

`light` | `dark` | `system` — user preference persisted; follow OS when system.

## Components

Prefer shadcn primitives themed via CSS variables so rebrand ≠ rewrite.

Status badges map relationship/operational enums → success/warning/danger/info/muted — never to gold by default.

## Density

Desktop tables: comfortable-compact. Mobile cards: larger hit targets.
