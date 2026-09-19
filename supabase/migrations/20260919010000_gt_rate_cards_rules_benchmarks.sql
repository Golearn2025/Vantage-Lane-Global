-- GT rate cards, rules, and VL benchmark bands for partner self-check

create type public.rate_card_status as enum ('DRAFT', 'ACTIVE', 'SUPERSEDED');

create type public.gt_rate_rule_type as enum (
  'FIXED_TRANSFER',
  'DISTANCE',
  'HOURLY',
  'DAILY',
  'AIRPORT_TRANSFER',
  'WAITING',
  'PARKING',
  'MEET_AND_GREET',
  'EXTRA_STOP'
);

create type public.wait_unit as enum ('MINUTE', 'HOUR');

create table public.gt_rate_cards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  offering_id uuid not null references public.offerings (id) on delete cascade,
  name text,
  currency_code char(3) not null,
  distance_unit public.distance_unit not null default 'MILE',
  status public.rate_card_status not null default 'DRAFT',
  valid_from date,
  valid_to date,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index gt_rate_cards_org_idx on public.gt_rate_cards (organization_id);
create index gt_rate_cards_offering_idx on public.gt_rate_cards (offering_id);
create index gt_rate_cards_status_idx on public.gt_rate_cards (status) where archived_at is null;

create trigger gt_rate_cards_set_updated_at
before update on public.gt_rate_cards
for each row execute function public.set_updated_at();

create table public.gt_rate_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  rate_card_id uuid not null references public.gt_rate_cards (id) on delete cascade,
  rule_type public.gt_rate_rule_type not null,
  vehicle_category_id uuid references public.vehicle_categories (id) on delete restrict,
  from_location_id uuid references public.locations (id) on delete set null,
  to_location_id uuid references public.locations (id) on delete set null,
  amount numeric,
  base_amount numeric,
  per_unit_amount numeric,
  minimum_amount numeric,
  distance_unit public.distance_unit,
  hourly_amount numeric,
  daily_amount numeric,
  wait_amount_per_unit numeric,
  wait_unit public.wait_unit,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index gt_rate_rules_card_idx on public.gt_rate_rules (rate_card_id);
create index gt_rate_rules_org_cat_type_idx on public.gt_rate_rules (organization_id, vehicle_category_id, rule_type);

create trigger gt_rate_rules_set_updated_at
before update on public.gt_rate_rules
for each row execute function public.set_updated_at();

create table public.gt_rate_benchmark_bands (
  id uuid primary key default gen_random_uuid(),
  market_key text not null,
  route_key text not null,
  vehicle_category_id uuid references public.vehicle_categories (id) on delete cascade,
  currency_code char(3) not null,
  low_amount numeric not null,
  high_amount numeric not null,
  reference_from_location_id uuid references public.locations (id) on delete set null,
  reference_to_location_id uuid references public.locations (id) on delete set null,
  reference_distance numeric,
  reference_distance_unit public.distance_unit,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint gt_rate_benchmark_bands_range check (high_amount >= low_amount),
  unique (market_key, route_key, vehicle_category_id, currency_code)
);

create index gt_rate_benchmark_bands_market_idx on public.gt_rate_benchmark_bands (market_key) where is_active;

create trigger gt_rate_benchmark_bands_set_updated_at
before update on public.gt_rate_benchmark_bands
for each row execute function public.set_updated_at();

insert into public.gt_rate_benchmark_bands (
  market_key, route_key, vehicle_category_id, currency_code,
  low_amount, high_amount, reference_distance, reference_distance_unit, notes
)
select
  'london_uk',
  'LHR_CENTRE',
  vc.id,
  'GBP',
  case vc.code when 'EXECUTIVE_SEDAN' then 85 when 'LUXURY_SEDAN' then 120 else 90 end,
  case vc.code when 'EXECUTIVE_SEDAN' then 140 when 'LUXURY_SEDAN' then 220 else 160 end,
  18.5,
  'MILE',
  'Indicative premium chauffeur band Heathrow ↔ Central London'
from public.vehicle_categories vc
where vc.code in ('EXECUTIVE_SEDAN', 'LUXURY_SEDAN', 'LUXURY_SUV', 'LUXURY_MPV');

alter table public.gt_rate_cards enable row level security;
alter table public.gt_rate_rules enable row level security;
alter table public.gt_rate_benchmark_bands enable row level security;

create policy gt_rate_cards_select on public.gt_rate_cards for select to authenticated
  using (public.is_org_member(organization_id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy gt_rate_cards_write on public.gt_rate_cards for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write') or public.has_org_permission(organization_id, 'org.fleet.write') or public.has_org_permission(organization_id, 'org.pricing.write'))
  with check (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write') or public.has_org_permission(organization_id, 'org.fleet.write') or public.has_org_permission(organization_id, 'org.pricing.write'));

create policy gt_rate_rules_select on public.gt_rate_rules for select to authenticated
  using (public.is_org_member(organization_id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy gt_rate_rules_write on public.gt_rate_rules for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write') or public.has_org_permission(organization_id, 'org.fleet.write') or public.has_org_permission(organization_id, 'org.pricing.write'))
  with check (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write') or public.has_org_permission(organization_id, 'org.fleet.write') or public.has_org_permission(organization_id, 'org.pricing.write'));

create policy gt_rate_benchmark_bands_select on public.gt_rate_benchmark_bands for select to authenticated
  using (true);
create policy gt_rate_benchmark_bands_write on public.gt_rate_benchmark_bands for all to authenticated
  using (public.has_platform_permission('platform.catalog.manage') or public.has_platform_permission('platform.network.manage'))
  with check (public.has_platform_permission('platform.catalog.manage') or public.has_platform_permission('platform.network.manage'));

grant select, insert, update, delete on public.gt_rate_cards to authenticated;
grant select, insert, update, delete on public.gt_rate_rules to authenticated;
grant select on public.gt_rate_benchmark_bands to authenticated;
