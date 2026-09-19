-- Network geographic read models (security_invoker; RLS preserved).

create or replace view public.v_network_place_suppliers
with (security_invoker = true)
as
select
  l.id as location_id,
  l.name as location_name,
  l.kind as location_kind,
  l.iata,
  l.icao,
  l.country_code as location_country_code,
  l.lat as location_lat,
  l.lng as location_lng,
  o.id as organization_id,
  o.display_name,
  o.legal_name,
  o.legal_country_code,
  o.is_test,
  o.archived_at,
  p.id as partnership_id,
  p.relationship_status,
  p.status_changed_at as relationship_status_changed_at,
  off.id as offering_id,
  off.operational_status,
  st.code as service_code,
  st.name as service_name,
  oc.id as coverage_id,
  oc.coverage_mode,
  oc.is_informational_only,
  ol.id as primary_base_id,
  ol.label as primary_base_label,
  ol.city as primary_base_city,
  ol.country_code as primary_base_country_code,
  ol.lat as primary_base_lat,
  ol.lng as primary_base_lng
from public.offering_coverages oc
join public.locations l on l.id = oc.location_id
join public.organizations o on o.id = oc.organization_id
left join public.partnerships p on p.organization_id = o.id
left join public.offerings off on off.id = oc.offering_id
left join public.service_types st on st.id = off.service_type_id
left join lateral (
  select *
  from public.organization_locations ol1
  where ol1.organization_id = o.id
    and ol1.archived_at is null
  order by ol1.is_primary desc, ol1.created_at
  limit 1
) ol on true
where oc.archived_at is null
  and o.archived_at is null
  and l.is_active;

create or replace view public.v_network_organizations
with (security_invoker = true)
as
select
  o.id as organization_id,
  o.display_name,
  o.legal_name,
  o.legal_country_code,
  o.is_test,
  o.archived_at,
  o.created_at,
  p.id as partnership_id,
  p.relationship_status,
  p.status_changed_at as relationship_status_changed_at,
  off.id as offering_id,
  off.operational_status,
  st.code as service_code,
  st.name as service_name,
  ol.id as primary_base_id,
  ol.label as primary_base_label,
  ol.city as primary_base_city,
  ol.region as primary_base_region,
  ol.country_code as primary_base_country_code,
  ol.lat as primary_base_lat,
  ol.lng as primary_base_lng,
  (
    select count(*)::integer
    from public.offering_coverages oc
    where oc.organization_id = o.id
      and oc.archived_at is null
  ) as coverage_count,
  (
    select coalesce(
      array_agg(sub.iata order by sub.iata) filter (where sub.iata is not null),
      array[]::text[]
    )
    from (
      select distinct l.iata::text as iata
      from public.offering_coverages oc
      join public.locations l on l.id = oc.location_id
      where oc.organization_id = o.id
        and oc.archived_at is null
        and oc.coverage_mode = 'AIRPORT_EXPLICIT'::public.coverage_mode
        and l.iata is not null
      order by l.iata::text
      limit 12
    ) sub
  ) as coverage_airport_iatas
from public.organizations o
left join public.partnerships p on p.organization_id = o.id
left join lateral (
  select *
  from public.offerings off1
  where off1.organization_id = o.id
    and off1.archived_at is null
  order by off1.created_at
  limit 1
) off on true
left join public.service_types st on st.id = off.service_type_id
left join lateral (
  select *
  from public.organization_locations ol1
  where ol1.organization_id = o.id
    and ol1.archived_at is null
  order by ol1.is_primary desc, ol1.created_at
  limit 1
) ol on true
where o.archived_at is null;

revoke all on public.v_network_place_suppliers from public, anon;
revoke all on public.v_network_organizations from public, anon;
grant select on public.v_network_place_suppliers to authenticated, service_role;
grant select on public.v_network_organizations to authenticated, service_role;
