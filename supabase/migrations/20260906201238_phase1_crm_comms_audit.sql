-- Phase 1.5: message templates, communications, activities, audit_logs

create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  owner_type public.template_owner_type not null default 'PLATFORM',
  organization_id uuid references public.organizations (id) on delete cascade,
  channel public.communication_channel not null,
  code text,
  name text not null,
  subject text,
  body text not null,
  is_active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint message_templates_owner_check check (
    (owner_type = 'PLATFORM' and organization_id is null)
    or (owner_type = 'ORGANIZATION' and organization_id is not null)
  )
);

create unique index message_templates_platform_code_uq
  on public.message_templates (code)
  where owner_type = 'PLATFORM' and code is not null and archived_at is null;

create trigger message_templates_set_updated_at
before update on public.message_templates
for each row execute function public.set_updated_at();

insert into public.message_templates (owner_type, channel, code, name, subject, body) values
('PLATFORM', 'EMAIL', 'NETWORK_INTRO_EMAIL', 'Network introduction (email)',
 'Partnership opportunity with Vantage Lane Global',
 'Hello {{contact_name}},\n\nWe are building a premium ground transportation network and would like to connect with {{organization_name}}.\n\nBest regards,\nVantage Lane Global'),
('PLATFORM', 'WHATSAPP', 'NETWORK_INTRO_WHATSAPP', 'Network introduction (WhatsApp)', null,
 'Hello {{contact_name}}, this is Vantage Lane Global. We are building a premium chauffeur network and would like to discuss covering {{location_name}} with {{organization_name}}.'),
('PLATFORM', 'EMAIL', 'ONBOARDING_INVITE_EMAIL', 'Onboarding invite (email)',
 'Complete your Vantage Lane Global profile',
 'Hello {{contact_name}},\n\nPlease use this secure link to complete your organization profile: {{onboarding_link}}\n\nThank you,\nVantage Lane Global');

create table public.communications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid references public.organization_contacts (id) on delete set null,
  template_id uuid references public.message_templates (id) on delete set null,
  channel public.communication_channel not null,
  action_type public.communication_action_type not null,
  subject text,
  body_snapshot text,
  actor_user_id uuid references public.profiles (id) on delete set null,
  occurred_at timestamptz not null default timezone('utc', now()),
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index communications_org_occurred_idx on public.communications (organization_id, occurred_at desc);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_user_id uuid references public.profiles (id) on delete set null,
  activity_type text not null,
  summary text not null,
  body text,
  visibility public.activity_visibility not null default 'VL_ONLY',
  communication_id uuid references public.communications (id) on delete set null,
  contact_id uuid references public.organization_contacts (id) on delete set null,
  offering_id uuid references public.offerings (id) on delete set null,
  partnership_id uuid references public.partnerships (id) on delete set null,
  occurred_at timestamptz not null default timezone('utc', now()),
  metadata jsonb,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index activities_org_occurred_idx on public.activities (organization_id, occurred_at desc);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  actor_user_id uuid,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  before_state jsonb,
  after_state jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  request_id text,
  ip text
);

create index audit_logs_org_occurred_idx on public.audit_logs (organization_id, occurred_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_table, entity_id);

-- Append-only enforcement for audit_logs (block update/delete for non-superuser paths via trigger)
create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$;

create trigger audit_logs_no_update
before update on public.audit_logs
for each row execute function public.prevent_audit_log_mutation();

create trigger audit_logs_no_delete
before delete on public.audit_logs
for each row execute function public.prevent_audit_log_mutation();
