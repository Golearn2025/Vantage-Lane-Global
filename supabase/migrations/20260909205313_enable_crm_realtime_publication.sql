-- Enable Postgres Changes for CRM tables used by screen-scoped realtime.

do $$
begin
  alter publication supabase_realtime add table public.organizations;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.partnerships;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.offerings;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.activities;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.communications;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.organization_contacts;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.organization_locations;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.offering_coverages;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.follow_ups;
exception when duplicate_object then null;
end $$;
