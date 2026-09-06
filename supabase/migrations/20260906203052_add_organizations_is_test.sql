-- Add development/test organization flag
alter table public.organizations
  add column is_test boolean not null default false;

create index organizations_is_test_idx
  on public.organizations (is_test)
  where archived_at is null;

comment on column public.organizations.is_test is
  'True for development/test organizations. Not a substitute for tenant isolation.';
