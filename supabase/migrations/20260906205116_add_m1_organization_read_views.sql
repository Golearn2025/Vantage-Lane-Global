-- Milestone 1 organization read models (security_invoker; RLS preserved).
-- next_action* comes from follow_ups and is null for callers without VL follow-up access.

create or replace view public.v_organization_summary
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
  o.updated_at,
  p.relationship_status,
  p.status_changed_at as relationship_status_changed_at,
  off.operational_status,
  st.code as service_code,
  st.name as service_name,
  ol.label as primary_base_label,
  ol.city as primary_base_city,
  ol.country_code as primary_base_country_code,
  (
    select count(*)::integer
    from public.offering_coverages oc
    where oc.organization_id = o.id
      and oc.archived_at is null
  ) as coverage_count,
  (
    select greatest(
      (select max(a.occurred_at) from public.activities a
        where a.organization_id = o.id and a.archived_at is null),
      (select max(c.occurred_at) from public.communications c
        where c.organization_id = o.id)
    )
  ) as last_activity_at,
  fu.id as next_follow_up_id,
  fu.due_at as next_action_due_at,
  fu.title as next_action_title
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
left join lateral (
  select *
  from public.follow_ups f
  where f.organization_id = o.id
    and f.status = 'OPEN'::public.follow_up_status
    and f.archived_at is null
  order by f.due_at
  limit 1
) fu on true;

create or replace view public.v_organization_overview
with (security_invoker = true)
as
select
  o.id as organization_id,
  o.display_name,
  o.legal_name,
  o.legal_country_code,
  o.website_url,
  o.website_domain,
  o.primary_email,
  o.primary_phone_e164,
  o.primary_whatsapp_e164,
  o.is_test,
  o.archived_at,
  o.created_at,
  o.updated_at,
  (
    select coalesce(array_agg(c.capability::text order by c.capability::text), array[]::text[])
    from public.organization_capabilities c
    where c.organization_id = o.id
  ) as capabilities,
  p.id as partnership_id,
  p.relationship_status,
  p.status_changed_at as relationship_status_changed_at,
  p.became_active_at,
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
  ) as coverage_airport_iatas,
  ct.id as primary_contact_id,
  ct.full_name as primary_contact_name,
  ct.contact_type as primary_contact_type,
  ct.email as primary_contact_email,
  ct.phone_e164 as primary_contact_phone_e164,
  ct.whatsapp_e164 as primary_contact_whatsapp_e164,
  (
    select greatest(
      (select max(a.occurred_at) from public.activities a
        where a.organization_id = o.id and a.archived_at is null),
      (select max(c.occurred_at) from public.communications c
        where c.organization_id = o.id)
    )
  ) as last_activity_at,
  fu.id as next_follow_up_id,
  fu.due_at as next_action_due_at,
  fu.title as next_action_title
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
left join lateral (
  select *
  from public.organization_contacts c1
  where c1.organization_id = o.id
    and c1.archived_at is null
  order by c1.is_primary desc, c1.created_at
  limit 1
) ct on true
left join lateral (
  select *
  from public.follow_ups f
  where f.organization_id = o.id
    and f.status = 'OPEN'::public.follow_up_status
    and f.archived_at is null
  order by f.due_at
  limit 1
) fu on true;

revoke all on public.v_organization_summary from public, anon;
revoke all on public.v_organization_overview from public, anon;
grant select on public.v_organization_summary to authenticated, service_role;
grant select on public.v_organization_overview to authenticated, service_role;
