-- Partner service onboarding inventory (Security operatives, aircraft, vessels, etc.)
-- Stored as JSONB on offerings so each wizard step can persist without new tables yet.
-- Also move Yacht test-kit org to UK (Southampton) for GB onboarding coverage.

alter table public.offerings
  add column if not exists onboarding_inventory jsonb not null default '{}'::jsonb;

comment on column public.offerings.onboarding_inventory is
  'Partner wizard service-specific inventory by step key (operatives, aircraft, vessels, properties, specialisations, services, capabilities).';

create or replace function public.rpc_partner_save_onboarding_inventory(
  p_offering_id uuid,
  p_step_key text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_result jsonb;
begin
  if p_offering_id is null or p_step_key is null or length(trim(p_step_key)) = 0 then
    raise exception 'offering_id and step_key required' using errcode = '22023';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'payload must be a JSON object' using errcode = '22023';
  end if;

  select o.organization_id into v_org_id
  from public.offerings o
  where o.id = p_offering_id
    and o.archived_at is null;

  if v_org_id is null then
    raise exception 'offering not found' using errcode = 'P0002';
  end if;

  if not (
    public.has_org_permission(v_org_id, 'org.profile.write')
    or public.has_platform_permission('platform.network.manage')
  ) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.offerings
  set
    onboarding_inventory =
      coalesce(onboarding_inventory, '{}'::jsonb)
      || jsonb_build_object(trim(p_step_key), p_payload),
    updated_at = timezone('utc', now())
  where id = p_offering_id
  returning onboarding_inventory into v_result;

  return v_result;
end;
$$;

revoke all on function public.rpc_partner_save_onboarding_inventory(uuid, text, jsonb)
  from public, anon;
grant execute on function public.rpc_partner_save_onboarding_inventory(uuid, text, jsonb)
  to authenticated, service_role;

-- Move existing Yacht test kit LEAD to UK Southampton (idempotent).
update public.organizations
set
  display_name = 'VL Test Yacht Southampton',
  legal_name = 'VL Test Yacht Southampton',
  legal_country_code = 'GB',
  legal_city = 'Southampton',
  primary_phone_e164 = '+447700900106',
  notes_public = replace(
    coalesce(notes_public, ''),
    'Monaco',
    'Southampton UK'
  ),
  updated_at = timezone('utc', now())
where is_test = true
  and lower(primary_email) = 'test.yacht@vantage-lane.test';

update public.organization_locations ol
set
  city = 'Southampton',
  country_code = 'GB',
  label = coalesce(nullif(ol.label, ''), 'Southampton base'),
  updated_at = timezone('utc', now())
from public.organizations o
where ol.organization_id = o.id
  and o.is_test = true
  and lower(o.primary_email) = 'test.yacht@vantage-lane.test'
  and ol.archived_at is null;
