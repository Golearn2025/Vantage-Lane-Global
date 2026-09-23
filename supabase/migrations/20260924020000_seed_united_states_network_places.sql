-- Seed United States country (+ LA) so Network Places can find America / US.
-- New York City LOCALITY already exists; Danny/Continental bases live on org_locations (US).

insert into public.locations (
  kind, name, name_normalized, country_code, lat, lng, timezone, is_active
)
select
  'COUNTRY',
  'United States',
  'united states',
  'US',
  39.8283,
  -98.5795,
  'America/Chicago',
  true
where not exists (
  select 1
  from public.locations
  where kind = 'COUNTRY'
    and country_code = 'US'
);

insert into public.locations (
  kind, name, name_normalized, country_code, lat, lng, timezone, is_active
)
select
  'LOCALITY',
  'Los Angeles',
  'los angeles',
  'US',
  34.0522,
  -118.2437,
  'America/Los_Angeles',
  true
where not exists (
  select 1
  from public.locations
  where kind = 'LOCALITY'
    and country_code = 'US'
    and name_normalized = 'los angeles'
);

-- Link US → New York City / Los Angeles when both exist
insert into public.location_edges (parent_location_id, child_location_id, relation)
select us.id, child.id, 'CONTAINS'
from public.locations us
join public.locations child
  on child.kind = 'LOCALITY'
 and child.country_code = 'US'
 and child.name_normalized in ('new york city', 'los angeles')
where us.kind = 'COUNTRY'
  and us.country_code = 'US'
on conflict do nothing;

-- Ensure NYC has coords (already seeded in some envs)
update public.locations
set
  lat = coalesce(lat, 40.7128),
  lng = coalesce(lng, -74.0060),
  timezone = coalesce(timezone, 'America/New_York')
where kind = 'LOCALITY'
  and country_code = 'US'
  and name_normalized in ('new york city', 'new york');
