-- Quick Add: persist coverage radius + primary base coordinates for map pins.

create or replace function public.rpc_quick_add_operator(p_payload jsonb)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare
  v_display_name text := nullif(trim(p_payload->>'display_name'), '');
  v_country char(2) := nullif(upper(trim(p_payload->>'legal_country_code')), '');
  v_legal_name text := nullif(trim(p_payload->>'legal_name'), '');
  v_website_url text := nullif(trim(p_payload->>'website_url'), '');
  v_website_domain text;
  v_email text := nullif(trim(lower(p_payload->>'primary_email')), '');
  v_phone text := nullif(trim(p_payload->>'primary_phone_e164'), '');
  v_whatsapp text := nullif(trim(p_payload->>'primary_whatsapp_e164'), '');
  v_base_label text := nullif(trim(p_payload->>'base_label'), '');
  v_base_city text := nullif(trim(p_payload->>'base_city'), '');
  v_base_lat numeric := nullif(p_payload->>'base_lat', '')::numeric;
  v_base_lng numeric := nullif(p_payload->>'base_lng', '')::numeric;
  v_coverage_location_id uuid := nullif(p_payload->>'coverage_location_id', '')::uuid;
  v_coverage_radius_km numeric := nullif(p_payload->>'coverage_radius_km', '')::numeric;
  v_lead_source text := nullif(trim(p_payload->>'lead_source'), '');
  v_internal_note text := nullif(trim(p_payload->>'internal_note'), '');
  v_google_place_id text := nullif(trim(p_payload->>'google_place_id'), '');
  v_is_test boolean := coalesce((p_payload->>'is_test')::boolean, false);

  v_svc_id uuid;
  v_org_id uuid;
  v_partnership_id uuid;
  v_offering_id uuid;
  v_base_id uuid;
  v_duplicates jsonb := '[]'::jsonb;
  v_hard_block boolean := false;
  v_norm_name text;
  v_loc_kind public.location_kind;
  v_coverage_mode public.coverage_mode;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if not public.has_platform_permission('platform.network.manage') then
    raise exception 'forbidden: platform.network.manage required' using errcode = '42501';
  end if;

  if v_display_name is null then
    raise exception 'display_name is required' using errcode = '22023';
  end if;

  if v_country is null or length(v_country) <> 2 then
    raise exception 'legal_country_code (ISO-2) is required' using errcode = '22023';
  end if;

  if v_coverage_radius_km is not null and (v_coverage_radius_km < 5 or v_coverage_radius_km > 200) then
    raise exception 'coverage_radius_km must be between 5 and 200' using errcode = '22023';
  end if;

  if v_website_url is not null then
    v_website_domain := lower(v_website_url);
    v_website_domain := regexp_replace(v_website_domain, '^https?://', '');
    v_website_domain := regexp_replace(v_website_domain, '^www\.', '');
    v_website_domain := split_part(v_website_domain, '/', 1);
    v_website_domain := nullif(v_website_domain, '');
  end if;
  v_website_domain := coalesce(
    nullif(trim(lower(p_payload->>'website_domain')), ''),
    v_website_domain
  );

  select id into v_svc_id
  from public.service_types
  where code = 'GROUND_TRANSPORTATION' and is_active
  limit 1;

  if v_svc_id is null then
    raise exception 'GROUND_TRANSPORTATION service type missing' using errcode = 'P0001';
  end if;

  if v_coverage_location_id is not null then
    if not exists (select 1 from public.locations l where l.id = v_coverage_location_id and l.is_active) then
      raise exception 'coverage_location_id not found' using errcode = '22023';
    end if;
  end if;

  v_norm_name := lower(regexp_replace(v_display_name, '\s+', ' ', 'g'));

  select coalesce(jsonb_agg(jsonb_build_object(
      'organization_id', d.id,
      'display_name', d.display_name,
      'match_reasons', d.reasons
    )), '[]'::jsonb),
    coalesce(bool_or(d.has_hard_unique), false)
  into v_duplicates, v_hard_block
  from (
    select o.id, o.display_name,
      (
        select array_agg(r order by r)
        from unnest(array_remove(array[
          case when v_website_domain is not null and o.website_domain = v_website_domain then 'website_domain' end,
          case when v_whatsapp is not null and o.primary_whatsapp_e164 = v_whatsapp then 'whatsapp' end,
          case when v_phone is not null and o.primary_phone_e164 = v_phone then 'phone' end,
          case when v_google_place_id is not null and o.google_place_id = v_google_place_id then 'google_place_id' end,
          case when lower(regexp_replace(o.display_name, '\s+', ' ', 'g')) = v_norm_name
                and o.legal_country_code is not distinct from v_country
               then 'same_name_and_country' end
        ], null)) as r
      ) as reasons,
      (
        (v_website_domain is not null and o.website_domain = v_website_domain)
        or (v_google_place_id is not null and o.google_place_id = v_google_place_id)
      ) as has_hard_unique
    from public.organizations o
    where o.archived_at is null
      and (
        (v_website_domain is not null and o.website_domain = v_website_domain)
        or (v_whatsapp is not null and o.primary_whatsapp_e164 = v_whatsapp)
        or (v_phone is not null and o.primary_phone_e164 = v_phone)
        or (v_google_place_id is not null and o.google_place_id = v_google_place_id)
        or (
          lower(regexp_replace(o.display_name, '\s+', ' ', 'g')) = v_norm_name
          and o.legal_country_code is not distinct from v_country
        )
      )
    limit 10
  ) d
  where d.reasons is not null and cardinality(d.reasons) > 0;

  if v_hard_block then
    return jsonb_build_object(
      'created', false,
      'blocked_by_unique_identifiers', true,
      'organization_id', null,
      'relationship_status', null,
      'potential_duplicates', v_duplicates
    );
  end if;

  insert into public.organizations (
    display_name,
    legal_name,
    legal_country_code,
    website_url,
    website_domain,
    primary_email,
    primary_phone_e164,
    primary_whatsapp_e164,
    google_place_id,
    is_test,
    created_by_user_id
  ) values (
    v_display_name,
    v_legal_name,
    v_country,
    v_website_url,
    v_website_domain,
    v_email,
    v_phone,
    v_whatsapp,
    v_google_place_id,
    v_is_test,
    auth.uid()
  )
  returning id into v_org_id;

  insert into public.organization_capabilities (organization_id, capability)
  values (v_org_id, 'SUPPLIER');

  insert into public.partnerships (
    organization_id,
    relationship_status,
    status_changed_at,
    first_contacted_at
  ) values (
    v_org_id,
    'LEAD',
    timezone('utc', now()),
    null
  )
  returning id into v_partnership_id;

  insert into public.offerings (
    organization_id,
    service_type_id,
    operational_status
  ) values (
    v_org_id,
    v_svc_id,
    'UNKNOWN'
  )
  returning id into v_offering_id;

  if v_base_label is not null or v_base_city is not null then
    insert into public.organization_locations (
      organization_id,
      label,
      location_kind,
      city,
      country_code,
      lat,
      lng,
      google_place_id,
      is_primary
    ) values (
      v_org_id,
      coalesce(v_base_label, coalesce(v_base_city, 'Primary base') || ' base'),
      'OPS_BASE',
      v_base_city,
      v_country,
      v_base_lat,
      v_base_lng,
      v_google_place_id,
      true
    )
    returning id into v_base_id;
  end if;

  if v_coverage_location_id is not null then
    select l.kind into v_loc_kind
    from public.locations l
    where l.id = v_coverage_location_id;

    if v_loc_kind = 'AIRPORT' then
      v_coverage_mode := 'AIRPORT_EXPLICIT'::public.coverage_mode;
    elsif v_coverage_radius_km is not null then
      v_coverage_mode := 'RADIUS'::public.coverage_mode;
    else
      v_coverage_mode := 'CITY_OR_REGION'::public.coverage_mode;
    end if;

    insert into public.offering_coverages (
      organization_id,
      offering_id,
      coverage_mode,
      location_id,
      radius_value,
      radius_unit,
      is_informational_only
    ) values (
      v_org_id,
      v_offering_id,
      v_coverage_mode,
      v_coverage_location_id,
      v_coverage_radius_km,
      case when v_coverage_radius_km is not null then 'KM'::public.distance_unit else null end,
      false
    );
  end if;

  insert into public.activities (
    organization_id,
    actor_user_id,
    activity_type,
    summary,
    body,
    visibility,
    partnership_id,
    offering_id,
    metadata
  ) values (
    v_org_id,
    auth.uid(),
    'organization.created',
    'Operator manually created (Quick Add)',
    null,
    'VL_ONLY',
    v_partnership_id,
    v_offering_id,
    jsonb_strip_nulls(jsonb_build_object(
      'source', 'rpc_quick_add_operator',
      'lead_source', v_lead_source
    ))
  );

  if v_internal_note is not null then
    insert into public.partnership_notes (
      partnership_id,
      organization_id,
      body,
      created_by_user_id
    ) values (
      v_partnership_id,
      v_org_id,
      v_internal_note,
      auth.uid()
    );
  end if;

  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    entity_table,
    entity_id,
    after_state
  ) values (
    v_org_id,
    auth.uid(),
    'rpc.quick_add_operator',
    'organizations',
    v_org_id,
    jsonb_build_object(
      'relationship_status', 'LEAD',
      'operational_status', 'UNKNOWN',
      'service', 'GROUND_TRANSPORTATION'
    )
  );

  return jsonb_build_object(
    'created', true,
    'blocked_by_unique_identifiers', false,
    'organization_id', v_org_id,
    'partnership_id', v_partnership_id,
    'offering_id', v_offering_id,
    'primary_base_id', v_base_id,
    'relationship_status', 'LEAD',
    'operational_status', 'UNKNOWN',
    'service_code', 'GROUND_TRANSPORTATION',
    'potential_duplicates', v_duplicates
  );
end;
$function$;

revoke all on function public.rpc_quick_add_operator(jsonb) from public, anon;
grant execute on function public.rpc_quick_add_operator(jsonb) to authenticated, service_role;
