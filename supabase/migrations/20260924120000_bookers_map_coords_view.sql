-- Bookers map: expose primary base coords on v_booker_leads

create or replace view public.v_booker_leads as
select
  o.id as organization_id,
  o.display_name,
  o.legal_country_code,
  o.legal_city,
  o.primary_email,
  o.is_test,
  o.created_at,
  p.relationship_status,
  st.code as service_code,
  st.name as service_name,
  coalesce(oc.email, o.primary_email) as invite_email,
  oc.id as contact_id,
  oc.full_name as contact_name,
  inv.id as invitation_id,
  inv.created_at as invited_at,
  inv.expires_at as invite_expires_at,
  inv.accepted_at as invite_accepted_at,
  inv.converted_organization_id,
  inv.last_email_status,
  inv.opened_at,
  inv.clicked_at,
  inv.resend_message_id,
  inv.service_code as invite_service_code,
  inv.invite_kind,
  ol.label as primary_base_label,
  ol.city as primary_base_city,
  ol.formatted_address as primary_base_address,
  ol.lat as primary_base_lat,
  ol.lng as primary_base_lng
from public.organizations o
join public.partnerships p
  on p.organization_id = o.id
 and p.relationship_status = 'LEAD'
join public.organization_capabilities oc_cap
  on oc_cap.organization_id = o.id
 and oc_cap.capability = 'BUYER'
left join lateral (
  select off.service_type_id
  from public.offerings off
  where off.organization_id = o.id
    and off.archived_at is null
  order by off.created_at asc
  limit 1
) of1 on true
left join public.service_types st on st.id = of1.service_type_id
left join lateral (
  select c.*
  from public.organization_contacts c
  where c.organization_id = o.id
    and c.archived_at is null
  order by c.is_primary desc, c.created_at asc
  limit 1
) oc on true
left join lateral (
  select i.*
  from public.organization_invitations i
  where i.organization_id = o.id
    and i.revoked_at is null
    and i.invite_kind = 'booker'
  order by i.created_at desc
  limit 1
) inv on true
left join lateral (
  select loc.*
  from public.organization_locations loc
  where loc.organization_id = o.id
    and loc.archived_at is null
  order by loc.is_primary desc, loc.created_at asc
  limit 1
) ol on true
where o.archived_at is null;

grant select on public.v_booker_leads to authenticated, service_role;
