# MVP roadmap

Sequence, not dates. ADRs 001–014 accepted. Implementation has not started.

0. **Review updated domain model + Supabase plan** (current gate).
1. Database design (columns/ERD) + versioned migrations + RLS.
2. Platform auth + VL admin access (invites, no shared passwords).
3. Organizations CRM table: Lead→…, contacts, multi-base locations, notes, follow-ups, activity/audit.
4. Locations seed (**United Kingdom** + London-area airports) + global search; coverage.
5. GT pack: VL categories, fleet models/years, rate cards (fixed, distance, hourly, daily, surcharges).
6. Documents + configurable standards + derived eligibility + expiry warnings.
7. Admin invite + self-onboarding link.
8. Communications V1: templates + open/copy WhatsApp/email + log (no WhatsApp API).
9. Basic map / airport query: who is job-eligible here?
10. **Stop.** Validate with real UK operators.
11. Only then: Jobs, auto-quote vs RFQ.

If step 3 is not usable as a daily working table, do not start step 11.
