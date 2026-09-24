-- Security commercial catalog + partner declarations + rate linkage.
-- See docs/05-modules/security-partner-onboarding.md

create table if not exists public.security_service_lines (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  allowed_units text[] not null default array['hourly','daily']::text[],
  sort_order integer not null default 0,
  is_active boolean not null default true,
  allows_custom_label boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger security_service_lines_set_updated_at
before update on public.security_service_lines
for each row execute function public.set_updated_at();

insert into public.security_service_lines (
  code, name, description, allowed_units, sort_order, allows_custom_label
) values
  ('CLOSE_PROTECTION', 'Close Protection / bodyguard',
   '1:1 or team protection for principals',
   array['hourly','daily','shift_12h'], 10, false),
  ('RESIDENTIAL_ESTATE', 'Residential / estate',
   'House, villa or compound posts',
   array['hourly','daily','per_post','monthly'], 20, false),
  ('STATIC_GUARDING', 'Static guarding',
   'Site / office / static posts',
   array['hourly','daily','per_post'], 30, false),
  ('DOOR_VENUE', 'Door / venue',
   'Club, restaurant, hotel door supervision',
   array['hourly','per_event'], 40, false),
  ('EVENT_SECURITY', 'Event security',
   'Gala, concert, summit, private event',
   array['hourly','per_event'], 50, false),
  ('CCTV_MONITORING', 'CCTV / control room',
   'Monitoring and control room',
   array['hourly','monthly'], 60, false),
  ('SECURE_TRANSPORT', 'Secure transport',
   'CP with vehicle / secure transfer',
   array['hourly','daily','flat'], 70, false),
  ('TRAVEL_ADVANCE', 'Travel / advance',
   'Advance work and travel security',
   array['daily','flat'], 80, false),
  ('OTHER', 'Other (custom)',
   'Service line not listed — add your own label',
   array['hourly','daily','shift_12h','per_event','per_post','monthly','flat'], 90, true)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  allowed_units = excluded.allowed_units,
  sort_order = excluded.sort_order,
  allows_custom_label = excluded.allows_custom_label,
  is_active = true,
  updated_at = timezone('utc', now());

create table if not exists public.security_service_declarations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  offering_id uuid not null references public.offerings (id) on delete cascade,
  service_line_id uuid not null references public.security_service_lines (id) on delete restrict,
  custom_label text,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint security_service_declarations_custom_label_chk
    check (
      custom_label is null
      or length(trim(custom_label)) > 0
    )
);

create index security_service_declarations_org_idx
  on public.security_service_declarations (organization_id)
  where archived_at is null;
create index security_service_declarations_offering_idx
  on public.security_service_declarations (offering_id)
  where archived_at is null;

create unique index security_service_declarations_line_uq
  on public.security_service_declarations (offering_id, service_line_id)
  where archived_at is null
    and custom_label is null;

create trigger security_service_declarations_set_updated_at
before update on public.security_service_declarations
for each row execute function public.set_updated_at();

alter table public.gt_rate_rules
  add column if not exists security_declaration_id uuid
    references public.security_service_declarations (id) on delete cascade;

alter table public.gt_rate_rules
  add column if not exists billing_unit text;

create index if not exists gt_rate_rules_security_decl_idx
  on public.gt_rate_rules (security_declaration_id)
  where security_declaration_id is not null;

-- Extra commercial units for Security (and later verticals)
do $$
begin
  alter type public.gt_rate_rule_type add value if not exists 'PER_EVENT';
  alter type public.gt_rate_rule_type add value if not exists 'PER_POST';
  alter type public.gt_rate_rule_type add value if not exists 'MONTHLY';
  alter type public.gt_rate_rule_type add value if not exists 'FLAT';
  alter type public.gt_rate_rule_type add value if not exists 'SHIFT_12H';
exception
  when duplicate_object then null;
end $$;

alter table public.security_service_lines enable row level security;
alter table public.security_service_declarations enable row level security;

drop policy if exists security_service_lines_select on public.security_service_lines;
create policy security_service_lines_select on public.security_service_lines
  for select to authenticated
  using (is_active = true or public.has_platform_permission('platform.network.read'));

drop policy if exists security_service_declarations_select on public.security_service_declarations;
create policy security_service_declarations_select
  on public.security_service_declarations for select to authenticated
  using (
    public.is_org_member(organization_id)
    or public.has_platform_permission('platform.network.read')
    or public.has_platform_permission('platform.network.manage')
  );

drop policy if exists security_service_declarations_write on public.security_service_declarations;
create policy security_service_declarations_write
  on public.security_service_declarations for all to authenticated
  using (
    public.has_platform_permission('platform.network.manage')
    or public.has_org_permission(organization_id, 'org.pricing.write')
    or public.has_org_permission(organization_id, 'org.profile.write')
  )
  with check (
    public.has_platform_permission('platform.network.manage')
    or public.has_org_permission(organization_id, 'org.pricing.write')
    or public.has_org_permission(organization_id, 'org.profile.write')
  );

grant select on public.security_service_lines to authenticated, service_role;
grant select, insert, update, delete on public.security_service_declarations
  to authenticated, service_role;

-- SECURITY wizard: services before operatives, then rates
update public.service_types
set wizard_steps = '[
  {"key":"profile","label":"Company profile"},
  {"key":"coverage","label":"Coverage"},
  {"key":"security_services","label":"Services offered"},
  {"key":"operatives","label":"Operatives & SIA"},
  {"key":"rates","label":"Rate card"},
  {"key":"documents","label":"Documents"},
  {"key":"review","label":"Review & submit"}
]'::jsonb
where code = 'SECURITY';
