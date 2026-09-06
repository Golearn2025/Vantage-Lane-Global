-- Phase 1.2: RBAC catalogs + organizations + partnerships + contacts + bases

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  scope public.permission_scope not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  scope public.permission_scope not null,
  is_system boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.platform_role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  created_by_user_id uuid references public.profiles (id) on delete set null,
  unique (user_id, role_id)
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  legal_name text,
  website_url text,
  website_domain text,
  primary_email text,
  primary_phone_e164 text,
  primary_whatsapp_e164 text,
  legal_address_line1 text,
  legal_address_line2 text,
  legal_city text,
  legal_region text,
  legal_postal_code text,
  legal_country_code char(2),
  legal_lat numeric,
  legal_lng numeric,
  google_place_id text,
  notes_public text,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by_user_id uuid references public.profiles (id) on delete set null,
  constraint organizations_lat_lng_pair check (
    (legal_lat is null and legal_lng is null) or (legal_lat is not null and legal_lng is not null)
  )
);

create unique index organizations_website_domain_uq
  on public.organizations (website_domain)
  where website_domain is not null and archived_at is null;

create unique index organizations_google_place_id_uq
  on public.organizations (google_place_id)
  where google_place_id is not null and archived_at is null;

create index organizations_archived_at_idx on public.organizations (archived_at);
create index organizations_display_name_idx on public.organizations (display_name);

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create table public.organization_capabilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  capability public.organization_capability not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, capability)
);

create table public.partnerships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  relationship_status public.relationship_status not null default 'LEAD',
  status_changed_at timestamptz not null default timezone('utc', now()),
  became_active_at timestamptz,
  paused_at timestamptz,
  rejected_at timestamptz,
  rejected_reason text,
  inactive_reason text,
  priority int,
  first_contacted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index partnerships_relationship_status_idx on public.partnerships (relationship_status);

create trigger partnerships_set_updated_at
before update on public.partnerships
for each row execute function public.set_updated_at();

create table public.partnership_notes (
  id uuid primary key default gen_random_uuid(),
  partnership_id uuid not null references public.partnerships (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  body text not null,
  created_by_user_id uuid references public.profiles (id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index partnership_notes_org_idx on public.partnership_notes (organization_id);

create trigger partnership_notes_set_updated_at
before update on public.partnership_notes
for each row execute function public.set_updated_at();

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  partnership_id uuid references public.partnerships (id) on delete set null,
  due_at timestamptz not null,
  title text not null,
  body text,
  status public.follow_up_status not null default 'OPEN',
  assigned_to_user_id uuid references public.profiles (id) on delete set null,
  completed_at timestamptz,
  created_by_user_id uuid references public.profiles (id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index follow_ups_open_due_idx on public.follow_ups (due_at) where status = 'OPEN' and archived_at is null;
create index follow_ups_org_idx on public.follow_ups (organization_id);

create trigger follow_ups_set_updated_at
before update on public.follow_ups
for each row execute function public.set_updated_at();

create table public.organization_locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  label text not null,
  location_kind public.org_location_kind not null default 'OPS_BASE',
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  country_code char(2),
  lat numeric,
  lng numeric,
  google_place_id text,
  timezone text,
  is_primary boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organization_locations_lat_lng_pair check (
    (lat is null and lng is null) or (lat is not null and lng is not null)
  )
);

create index organization_locations_org_idx on public.organization_locations (organization_id);
create index organization_locations_primary_idx
  on public.organization_locations (organization_id)
  where is_primary = true and archived_at is null;

create trigger organization_locations_set_updated_at
before update on public.organization_locations
for each row execute function public.set_updated_at();

create table public.organization_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text not null,
  contact_type text not null,
  title text,
  email text,
  phone_e164 text,
  whatsapp_e164 text,
  is_primary boolean not null default false,
  linked_user_id uuid references public.profiles (id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index organization_contacts_org_idx on public.organization_contacts (organization_id);
create index organization_contacts_type_idx on public.organization_contacts (organization_id, contact_type);

create trigger organization_contacts_set_updated_at
before update on public.organization_contacts
for each row execute function public.set_updated_at();

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.membership_status not null default 'INVITED',
  invited_at timestamptz,
  accepted_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index organization_memberships_org_user_uq
  on public.organization_memberships (organization_id, user_id)
  where archived_at is null;

create index organization_memberships_user_idx on public.organization_memberships (user_id);

create trigger organization_memberships_set_updated_at
before update on public.organization_memberships
for each row execute function public.set_updated_at();

create table public.membership_roles (
  membership_id uuid not null references public.organization_memberships (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete restrict,
  primary key (membership_id, role_id)
);

create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  contact_id uuid references public.organization_contacts (id) on delete set null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  invited_by_user_id uuid references public.profiles (id) on delete set null,
  intended_role_id uuid references public.roles (id) on delete set null,
  scopes jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index organization_invitations_org_idx on public.organization_invitations (organization_id);
create index organization_invitations_expires_idx on public.organization_invitations (expires_at);
