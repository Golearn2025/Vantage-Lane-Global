-- Phase 1.1: extensions, enums, shared triggers, profiles

create extension if not exists "pgcrypto";

create type public.permission_scope as enum ('PLATFORM', 'ORGANIZATION');
create type public.organization_capability as enum ('SUPPLIER', 'BUYER');
create type public.org_location_kind as enum ('HQ', 'OPS_BASE', 'DEPOT', 'OTHER');
create type public.relationship_status as enum (
  'LEAD',
  'CONTACTED',
  'INTERESTED',
  'ONBOARDING',
  'UNDER_REVIEW',
  'ACTIVE',
  'PAUSED',
  'REJECTED',
  'INACTIVE'
);
create type public.follow_up_status as enum ('OPEN', 'DONE', 'CANCELLED');
create type public.membership_status as enum ('INVITED', 'ACTIVE', 'DISABLED');
create type public.location_kind as enum ('COUNTRY', 'REGION', 'LOCALITY', 'AIRPORT', 'POI');
create type public.location_edge_relation as enum ('CONTAINS');
create type public.operational_status as enum ('AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'UNKNOWN');
create type public.coverage_mode as enum ('AIRPORT_EXPLICIT', 'CITY_OR_REGION', 'RADIUS');
create type public.distance_unit as enum ('KM', 'MILE');
create type public.declaration_status as enum ('DECLARED', 'PARTIALLY_VERIFIED', 'SUPERSEDED');
create type public.compliance_status as enum ('COMPLIANT', 'NON_COMPLIANT', 'UNKNOWN', 'EXEMPT_AUDITED');
create type public.fleet_source as enum ('OPERATOR_CLAIM', 'VL_ENTERED', 'IMPORT');
create type public.fleet_lifecycle_status as enum ('ACTIVE', 'INACTIVE', 'RETIRED');
create type public.verification_status as enum ('UNVERIFIED', 'VERIFIED', 'REJECTED');
create type public.document_scope as enum ('ORGANIZATION', 'OFFERING', 'VEHICLE_UNIT', 'VEHICLE_DECLARATION');
create type public.document_verification_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
create type public.standard_scope as enum ('ORGANIZATION', 'OFFERING', 'VEHICLE');
create type public.standard_level as enum ('REQUIRED', 'RECOMMENDED', 'OPTIONAL');
create type public.assessment_status as enum ('NOT_STARTED', 'PENDING', 'SATISFIED', 'FAILED', 'WAIVED');
create type public.template_owner_type as enum ('PLATFORM', 'ORGANIZATION');
create type public.communication_channel as enum ('EMAIL', 'WHATSAPP');
create type public.communication_action_type as enum (
  'OPEN_WHATSAPP',
  'COPY_WHATSAPP',
  'OPEN_EMAIL',
  'COPY_EMAIL',
  'LOGGED_MANUAL'
);
create type public.activity_visibility as enum ('VL_ONLY', 'ORG_SHARED');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  email text,
  phone text,
  locale text,
  is_platform_user boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index profiles_email_idx on public.profiles (email) where email is not null;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
