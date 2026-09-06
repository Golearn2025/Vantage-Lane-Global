# Contradictions and open items

## Closed

| Item | Resolution |
|---|---|
| Eligibility / ACTIVE | ADR-015 |
| Ops enum | AVAILABLE / LIMITED / UNAVAILABLE / UNKNOWN |
| D1 UNKNOWN | Not auto-match; visible manually with warning — ADR-016 |
| Vehicle year | Per vehicle/declaration; ≥1 compliant in category |
| Partnership table | Separate; capabilities SUPPLIER/BUYER both — ADR-016 |
| Activity vs Audit | Two tables |
| Contact vs role | Separate |
| Compliance scopes | Org / Offering / Vehicle assessment tables — schema-columns |
| Base vs coverage | Strictly separate |
| Fleet fidelity | Declarations (aggregate) + units (individual) |

## Still open

| ID | Question |
|---|---|
| D2 | Org read of partnership status? |
| D3 | Multiple partnership rows later? |
| D4 | PostGIS vs haversine |
| D5 | Org templates in first UI |
| D6 | UK airport seed list |
| O7–O12 | Auth invite provider, retention, buyers day-one, rate UI slice, UK docs, expiry alerts |
