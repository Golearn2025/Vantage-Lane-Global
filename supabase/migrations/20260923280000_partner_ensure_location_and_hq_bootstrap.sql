-- Allow authenticated partners to ensure catalog locations from Google Places
-- (locations_write RLS requires platform.catalog.manage — partners would fail CoverageComposer).
-- Also persist HQ coords from join setup into organization_locations.

create or replace function public.rpc_ensure_location_from_google_place(p_payload jsonb)
returns public.locations
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_place_id text := nullif(trim(p_payload->>'google_place_id'), '');
  v_name text := nullif(trim(p_payload->>'name'), '');
  v_kind text := nullif(upper(trim(p_payload->>'kind')), '');
  v_country char(2) := nullif(upper(trim(p_payload->>'country_code')), '');
  v_iata text := nullif(upper(trim(p_payload->>'iata')), '');
  v_lat numeric := nullif(p_payload->>'lat', '')::numeric;
  v_lng numeric := nullif(p_payload->>'lng', '')::numeric;
  v_formatted text := nullif(trim(p_payload->>'formatted_address'), '');
  v_row public.locations;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if v_place_id is null then
    raise exception 'google_place_id is required' using errcode = '22023';
  end if;
  if v_name is null then
    raise exception 'name is required' using errcode = '22023';
  end if;
  if v_kind is null or v_kind not in ('COUNTRY', 'REGION', 'LOCALITY', 'AIRPORT', 'POI') then
    v_kind := 'LOCALITY';
  end if;

  select * into v_row
  from public.locations
  where google_place_id = v_place_id
  limit 1;

  if found then
    if (v_row.lat is null or v_row.lng is null) and v_lat is not null and v_lng is not null then
      update public.locations
      set
        lat = v_lat,
        lng = v_lng,
        country_code = coalesce(v_country, country_code),
        updated_at = timezone('utc', now())
      where id = v_row.id
      returning * into v_row;
    end if;
    return v_row;
  end if;

  if v_iata is not null then
    select * into v_row from public.locations where iata = v_iata limit 1;
    if found then
      update public.locations
      set
        google_place_id = v_place_id,
        lat = coalesce(v_lat, lat),
        lng = coalesce(v_lng, lng),
        country_code = coalesce(v_country, country_code),
        name = coalesce(nullif(name, ''), v_name),
        updated_at = timezone('utc', now())
      where id = v_row.id
      returning * into v_row;
      return v_row;
    end if;
  end if;

  if v_kind in ('LOCALITY', 'REGION', 'COUNTRY') then
    select * into v_row
    from public.locations
    where kind = v_kind::public.location_kind
      and lower(name) = lower(v_name)
      and (v_country is null or country_code = v_country)
    limit 1;
    if found then
      update public.locations
      set
        google_place_id = coalesce(google_place_id, v_place_id),
        lat = coalesce(v_lat, lat),
        lng = coalesce(v_lng, lng),
        country_code = coalesce(v_country, country_code),
        updated_at = timezone('utc', now())
      where id = v_row.id
      returning * into v_row;
      return v_row;
    end if;
  end if;

  insert into public.locations (
    kind, name, name_normalized, country_code, iata, lat, lng,
    google_place_id, is_active, metadata
  ) values (
    v_kind::public.location_kind,
    v_name,
    lower(v_name),
    v_country,
    v_iata,
    v_lat,
    v_lng,
    v_place_id,
    true,
    jsonb_build_object(
      'source', 'google_places',
      'formatted_address', v_formatted
    )
  )
  returning * into v_row;

  return v_row;
end;
$function$;

revoke all on function public.rpc_ensure_location_from_google_place(jsonb) from public, anon;
grant execute on function public.rpc_ensure_location_from_google_place(jsonb) to authenticated, service_role;

-- Bootstrap: persist HQ place fields from join form
create or replace function public.rpc_partner_bootstrap_org(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_display_name text := nullif(trim(p_payload->>'display_name'), '');
  v_legal_name text := nullif(trim(p_payload->>'legal_name'), '');
  v_country char(2) := nullif(upper(trim(p_payload->>'legal_country_code')), '');
  v_city text := nullif(trim(p_payload->>'legal_city'), '');
  v_phone text := nullif(trim(p_payload->>'primary_phone_e164'), '');
  v_whatsapp text := nullif(trim(p_payload->>'primary_whatsapp_e164'), '');
  v_service_code text := nullif(upper(trim(p_payload->>'service_code')), '');
  v_contact_name text := nullif(trim(p_payload->>'contact_name'), '');
  v_hq_address text := nullif(trim(p_payload->>'hq_formatted_address'), '');
  v_hq_place_id text := nullif(trim(p_payload->>'hq_place_id'), '');
  v_hq_lat numeric := nullif(p_payload->>'hq_lat', '')::numeric;
  v_hq_lng numeric := nullif(p_payload->>'hq_lng', '')::numeric;
  v_svc_id uuid;
  v_org_id uuid;
  v_offering_id uuid;
  v_partnership_id uuid;
  v_membership_id uuid;
  v_owner_role_id uuid;
  v_email text;
  v_confirmed timestamptz;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select email, email_confirmed_at into v_email, v_confirmed
  from auth.users where id = v_uid;

  if v_confirmed is null then
    raise exception 'email not confirmed' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.organization_memberships m
    where m.user_id = v_uid and m.status = 'ACTIVE' and m.archived_at is null
  ) then
    raise exception 'already has organization membership' using errcode = '22023';
  end if;

  if v_phone is not null and exists (
    select 1 from public.organizations o
    where o.primary_phone_e164 = v_phone
      and o.archived_at is null
  ) then
    raise exception 'phone number already registered with another organisation' using errcode = '22023';
  end if;

  if v_display_name is null then
    raise exception 'display_name is required' using errcode = '22023';
  end if;
  if v_country is null or length(v_country) <> 2 then
    raise exception 'legal_country_code (ISO-2) is required' using errcode = '22023';
  end if;
  if v_city is null then
    raise exception 'legal_city is required' using errcode = '22023';
  end if;
  if v_service_code is null then
    raise exception 'service_code is required' using errcode = '22023';
  end if;
  if v_service_code not in (
    'GROUND_TRANSPORTATION',
    'AVIATION',
    'SECURITY',
    'HOSPITALITY',
    'CONCIERGE',
    'YACHT',
    'MEDICAL',
    'EVENTS'
  ) then
    raise exception 'service_code not open for self-onboarding' using errcode = '22023';
  end if;

  select id into v_svc_id
  from public.service_types
  where code = v_service_code and is_active
  limit 1;
  if v_svc_id is null then
    raise exception 'service type missing' using errcode = 'P0001';
  end if;

  select id into v_owner_role_id from public.roles where code = 'org_owner' limit 1;
  if v_owner_role_id is null then
    raise exception 'org_owner role missing' using errcode = 'P0001';
  end if;

  insert into public.organizations (
    display_name,
    legal_name,
    legal_country_code,
    legal_city,
    primary_email,
    primary_phone_e164,
    primary_whatsapp_e164,
    created_by_user_id,
    is_test
  ) values (
    v_display_name,
    coalesce(v_legal_name, v_display_name),
    v_country,
    v_city,
    v_email,
    v_phone,
    coalesce(v_whatsapp, v_phone),
    v_uid,
    false
  )
  returning id into v_org_id;

  insert into public.organization_capabilities (organization_id, capability)
  values (v_org_id, 'SUPPLIER');

  insert into public.partnerships (organization_id, relationship_status)
  values (v_org_id, 'ONBOARDING')
  returning id into v_partnership_id;

  insert into public.offerings (organization_id, service_type_id, operational_status)
  values (v_org_id, v_svc_id, 'UNKNOWN')
  returning id into v_offering_id;

  insert into public.organization_locations (
    organization_id,
    location_kind,
    label,
    city,
    country_code,
    is_primary,
    formatted_address,
    place_id,
    google_place_id,
    lat,
    lng
  ) values (
    v_org_id,
    'OPS_BASE',
    coalesce(v_hq_address, v_city || ' base'),
    v_city,
    v_country,
    true,
    v_hq_address,
    v_hq_place_id,
    v_hq_place_id,
    v_hq_lat,
    v_hq_lng
  );

  insert into public.organization_contacts (
    organization_id, full_name, email, phone_e164, whatsapp_e164, contact_type, is_primary, linked_user_id
  ) values (
    v_org_id,
    coalesce(v_contact_name, split_part(v_email, '@', 1)),
    v_email,
    v_phone,
    coalesce(v_whatsapp, v_phone),
    'Owner',
    true,
    v_uid
  );

  insert into public.organization_memberships (organization_id, user_id, status)
  values (v_org_id, v_uid, 'ACTIVE')
  returning id into v_membership_id;

  insert into public.membership_roles (membership_id, role_id)
  values (v_membership_id, v_owner_role_id);

  update public.profiles
  set
    display_name = coalesce(v_contact_name, display_name),
    phone = coalesce(v_phone, phone),
    updated_at = timezone('utc', now())
  where id = v_uid;

  return jsonb_build_object(
    'organization_id', v_org_id,
    'offering_id', v_offering_id,
    'partnership_id', v_partnership_id,
    'membership_id', v_membership_id,
    'service_code', v_service_code,
    'relationship_status', 'ONBOARDING'
  );
end;
$function$;

revoke all on function public.rpc_partner_bootstrap_org(jsonb) from public, anon;
grant execute on function public.rpc_partner_bootstrap_org(jsonb) to authenticated, service_role;
