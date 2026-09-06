-- Harden function search_path and revoke anon execute on security definer helpers

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

revoke all on function public.is_platform_user() from public;
revoke all on function public.is_platform_user() from anon;
grant execute on function public.is_platform_user() to authenticated;

revoke all on function public.has_platform_permission(text) from public;
revoke all on function public.has_platform_permission(text) from anon;
grant execute on function public.has_platform_permission(text) to authenticated;

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.is_org_member(uuid) from anon;
grant execute on function public.is_org_member(uuid) to authenticated;

revoke all on function public.has_org_permission(uuid, text) from public;
revoke all on function public.has_org_permission(uuid, text) from anon;
grant execute on function public.has_org_permission(uuid, text) to authenticated;
