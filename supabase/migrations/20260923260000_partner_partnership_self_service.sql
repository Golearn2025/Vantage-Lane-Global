-- Partner self-service on partnerships (acknowledge standard + submit for review).
-- Direct UPDATE on partnerships is platform-only; partners use these SECURITY DEFINER RPCs.

alter table public.partnerships
  add column if not exists standard_acknowledged_at timestamptz;

create or replace function public.rpc_partner_acknowledge_standard(
  p_organization_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_organization_id is null then
    raise exception 'organization_id required' using errcode = '22023';
  end if;

  if not (
    public.has_org_permission(p_organization_id, 'org.profile.write')
    or public.has_platform_permission('platform.network.manage')
  ) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.partnerships
  set
    standard_acknowledged_at = timezone('utc', now()),
    updated_at = timezone('utc', now())
  where organization_id = p_organization_id;

  if not found then
    raise exception 'partnership not found' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.rpc_partner_submit_for_review(
  p_organization_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status public.relationship_status;
begin
  if p_organization_id is null then
    raise exception 'organization_id required' using errcode = '22023';
  end if;

  if not (
    public.has_org_permission(p_organization_id, 'org.profile.write')
    or public.has_platform_permission('platform.network.manage')
  ) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select relationship_status into v_status
  from public.partnerships
  where organization_id = p_organization_id
  for update;

  if not found then
    raise exception 'partnership not found' using errcode = 'P0002';
  end if;

  if v_status not in ('ONBOARDING', 'CONTACTED', 'LEAD') then
    raise exception 'cannot submit from status %', v_status using errcode = '22023';
  end if;

  update public.partnerships
  set
    relationship_status = 'UNDER_REVIEW',
    status_changed_at = timezone('utc', now()),
    updated_at = timezone('utc', now())
  where organization_id = p_organization_id;
end;
$$;

revoke all on function public.rpc_partner_acknowledge_standard(uuid) from public, anon;
grant execute on function public.rpc_partner_acknowledge_standard(uuid) to authenticated, service_role;

revoke all on function public.rpc_partner_submit_for_review(uuid) from public, anon;
grant execute on function public.rpc_partner_submit_for_review(uuid) to authenticated, service_role;
