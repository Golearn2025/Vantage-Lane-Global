-- Phase 1.3: locations, service types, offerings, coverage + UK airport seed

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  kind public.location_kind not null,
  name text not null,
  name_normalized text,
  country_code char(2),
  iata char(3),
  icao char(4),
  lat numeric,
  lng numeric,
  google_place_id text,
  timezone text,
  is_active boolean not null default true,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint locations_lat_lng_pair check (
    (lat is null and lng is null) or (lat is not null and lng is not null)
  )
);

create unique index locations_iata_uq on public.locations (iata) where iata is not null;
create unique index locations_icao_uq on public.locations (icao) where icao is not null;
create unique index locations_google_place_id_uq on public.locations (google_place_id) where google_place_id is not null;
create index locations_kind_country_idx on public.locations (kind, country_code);
create index locations_name_idx on public.locations (name);

create trigger locations_set_updated_at
before update on public.locations
for each row execute function public.set_updated_at();

create table public.location_edges (
  id uuid primary key default gen_random_uuid(),
  parent_location_id uuid not null references public.locations (id) on delete cascade,
  child_location_id uuid not null references public.locations (id) on delete cascade,
  relation public.location_edge_relation not null default 'CONTAINS',
  unique (parent_location_id, child_location_id, relation),
  constraint location_edges_no_self check (parent_location_id <> child_location_id)
);

create table public.service_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.offerings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  service_type_id uuid not null references public.service_types (id) on delete restrict,
  operational_status public.operational_status not null default 'UNKNOWN',
  label text,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index offerings_org_service_uq
  on public.offerings (organization_id, service_type_id)
  where archived_at is null;

create index offerings_org_ops_idx on public.offerings (organization_id, operational_status);

create trigger offerings_set_updated_at
before update on public.offerings
for each row execute function public.set_updated_at();

create table public.offering_coverages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  offering_id uuid not null references public.offerings (id) on delete cascade,
  coverage_mode public.coverage_mode not null,
  location_id uuid references public.locations (id) on delete restrict,
  organization_location_id uuid references public.organization_locations (id) on delete set null,
  radius_value numeric,
  radius_unit public.distance_unit,
  is_informational_only boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint offering_coverages_mode_check check (
    (
      coverage_mode in ('AIRPORT_EXPLICIT', 'CITY_OR_REGION')
      and location_id is not null
    )
    or (
      coverage_mode = 'RADIUS'
      and radius_value is not null
      and radius_unit is not null
      and (organization_location_id is not null or location_id is not null)
    )
  )
);

create index offering_coverages_offering_idx on public.offering_coverages (offering_id);
create index offering_coverages_location_idx on public.offering_coverages (location_id);
create index offering_coverages_org_idx on public.offering_coverages (organization_id);
create index offering_coverages_mode_idx on public.offering_coverages (coverage_mode);

create trigger offering_coverages_set_updated_at
before update on public.offering_coverages
for each row execute function public.set_updated_at();

-- Seeds: service type + UK geography
insert into public.service_types (code, name)
values ('GROUND_TRANSPORTATION', 'Ground Transportation');

insert into public.locations (kind, name, name_normalized, country_code, timezone, is_active)
values ('COUNTRY', 'United Kingdom', 'united kingdom', 'GB', 'Europe/London', true);

insert into public.locations (kind, name, name_normalized, country_code, timezone, is_active)
values ('LOCALITY', 'London', 'london', 'GB', 'Europe/London', true);

insert into public.locations (kind, name, name_normalized, country_code, iata, icao, lat, lng, timezone, is_active) values
('AIRPORT', 'London Heathrow Airport', 'london heathrow airport', 'GB', 'LHR', 'EGLL', 51.4700, -0.4543, 'Europe/London', true),
('AIRPORT', 'London Gatwick Airport', 'london gatwick airport', 'GB', 'LGW', 'EGKK', 51.1537, -0.1821, 'Europe/London', true),
('AIRPORT', 'London Stansted Airport', 'london stansted airport', 'GB', 'STN', 'EGSS', 51.8860, 0.2389, 'Europe/London', true),
('AIRPORT', 'London Luton Airport', 'london luton airport', 'GB', 'LTN', 'EGGW', 51.8747, -0.3683, 'Europe/London', true),
('AIRPORT', 'London City Airport', 'london city airport', 'GB', 'LCY', 'EGLC', 51.5053, 0.0553, 'Europe/London', true),
('AIRPORT', 'Farnborough Airport', 'farnborough airport', 'GB', 'FAB', 'EGLF', 51.2757, -0.7764, 'Europe/London', true),
('AIRPORT', 'London Biggin Hill Airport', 'london biggin hill airport', 'GB', 'BQH', 'EGKB', 51.3308, 0.0325, 'Europe/London', true);

-- Navigation edges: UK contains London; UK/London contain airports (nav only, not rigid domain truth)
insert into public.location_edges (parent_location_id, child_location_id, relation)
select uk.id, lon.id, 'CONTAINS'
from public.locations uk, public.locations lon
where uk.kind = 'COUNTRY' and uk.country_code = 'GB' and uk.name = 'United Kingdom'
  and lon.kind = 'LOCALITY' and lon.name = 'London';

insert into public.location_edges (parent_location_id, child_location_id, relation)
select lon.id, a.id, 'CONTAINS'
from public.locations lon
join public.locations a on a.kind = 'AIRPORT' and a.country_code = 'GB'
  and a.iata in ('LHR','LGW','STN','LTN','LCY','FAB','BQH')
where lon.kind = 'LOCALITY' and lon.name = 'London';

insert into public.location_edges (parent_location_id, child_location_id, relation)
select uk.id, a.id, 'CONTAINS'
from public.locations uk
join public.locations a on a.kind = 'AIRPORT' and a.country_code = 'GB'
  and a.iata in ('LHR','LGW','STN','LTN','LCY','FAB','BQH')
where uk.kind = 'COUNTRY' and uk.country_code = 'GB' and uk.name = 'United Kingdom'
on conflict do nothing;
