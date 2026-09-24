# Partner onboarding test kit (UK)

Deterministic `is_test` LEADs — one per service — with open invites.

Source of truth: `modules/partner/test-kit-accounts.ts`  
Seed: `supabase/migrations/20260924010000_partner_onboarding_test_kit.sql`  
Inventory persistence: `offerings.onboarding_inventory` + `rpc_partner_save_onboarding_inventory`

## How to test

1. Open `/join?invite=<token>` for the service below.
2. Sign up with the listed email (password suggestion: `TestPartner2026!`).
3. Complete coverage → service inventory step → rates (if required) → documents → review.

All kit orgs are **UK** (London or Southampton for Yacht).

| Service | Company | Email | Phone | Invite token |
|---|---|---|---|---|
| Ground Transportation | VL Test GT London | `test.gt@vantage-lane.test` | `+447700900101` | `vltest_invite_gt_2026_ok01xxxx` |
| Aviation | VL Test Aviation Heathrow | `test.aviation@vantage-lane.test` | `+447700900102` | `vltest_invite_av_2026_ok02xxxx` |
| Security | VL Test Security Mayfair | `test.security@vantage-lane.test` | `+447700900103` | `vltest_invite_sec_2026_ok03xxx` |
| Hospitality | VL Test Hospitality Knightsbridge | `test.hospitality@vantage-lane.test` | `+447700900104` | `vltest_invite_hos_2026_ok04xxx` |
| Concierge | VL Test Concierge Chelsea | `test.concierge@vantage-lane.test` | `+447700900105` | `vltest_invite_con_2026_ok05xxx` |
| Yacht & Marine | VL Test Yacht Southampton | `test.yacht@vantage-lane.test` | `+447700900106` | `vltest_invite_yt_2026_ok06xxxx` |
| Medical & Wellness | VL Test Medical Harley | `test.medical@vantage-lane.test` | `+447700900107` | `vltest_invite_med_2026_ok07xxx` |
| Events & Protocol | VL Test Events Westminster | `test.events@vantage-lane.test` | `+447700900108` | `vltest_invite_evt_2026_ok08xxx` |

## Service inventory steps (now persisted)

| Service | Inventory step | Saved under |
|---|---|---|
| Security | Operatives & SIA | `operatives` |
| Aviation | Aircraft | `aircraft` |
| Yacht | Vessels | `vessels` |
| Hospitality | Properties | `properties` |
| Concierge | Specialisations | `specialisations` |
| Medical | Services | `services` |
| Events | Capabilities | `capabilities` |
| GT | Fleet (existing tables) | `gt_fleet_*` |

## Legacy GT shell logins

See [gt-partner-onboarding-checklist.md](./gt-partner-onboarding-checklist.md) for `test-owner-london@vantage-lane.com`.
