-- Policy: VL Bookers = Greater London BUYER desks only.
-- Non-London BOOKER_DEMAND BUYER leads move to Network (SUPPLIER) so they leave Bookers.

DO $$
DECLARE
  moved int := 0;
  r record;
BEGIN
  FOR r IN
    SELECT o.id
    FROM public.organizations o
    JOIN public.organization_capabilities oc
      ON oc.organization_id = o.id
     AND oc.capability = 'BUYER'
    WHERE o.archived_at IS NULL
      AND coalesce(o.is_test, false) = false
      AND o.notes_public LIKE 'BOOKER_DEMAND%'
      AND NOT (
        upper(coalesce(o.legal_country_code, '')) = 'GB'
        AND lower(trim(coalesce(o.legal_city, ''))) = 'london'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.organization_capabilities oc2
        WHERE oc2.organization_id = o.id
          AND oc2.capability = 'SUPPLIER'
      )
  LOOP
    DELETE FROM public.organization_capabilities
    WHERE organization_id = r.id
      AND capability = 'BUYER';

    INSERT INTO public.organization_capabilities (organization_id, capability)
    VALUES (r.id, 'SUPPLIER')
    ON CONFLICT DO NOTHING;

    UPDATE public.organizations
    SET notes_public = regexp_replace(
      coalesce(notes_public, ''),
      '^BOOKER_DEMAND',
      'NETWORK_LEAD (ex-booker)'
    )
    WHERE id = r.id;

    moved := moved + 1;
  END LOOP;

  RAISE NOTICE 'Non-London bookers moved to Network SUPPLIER=%', moved;
END $$;

-- Hard-scope booker leads view to London GB only
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
where o.archived_at is null
  and upper(coalesce(o.legal_country_code, '')) = 'GB'
  and lower(trim(coalesce(o.legal_city, ''))) = 'london';

grant select on public.v_booker_leads to authenticated, service_role;

comment on view public.v_booker_leads is
  'VL Bookers demand desks — Greater London BUYER LEADs only (not Network)';

-- Dashboard stats follow the same London-only scope
create or replace function public.get_booker_dashboard_stats()
returns json
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_result json;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if not public.has_platform_permission('platform.ops.dashboard') then
    raise exception 'forbidden: platform.ops.dashboard required' using errcode = '42501';
  end if;

  with leads as (
    select
      invite_email,
      invite_accepted_at,
      last_email_status,
      opened_at,
      clicked_at,
      invited_at,
      case
        when invite_accepted_at is not null
          or lower(coalesce(last_email_status, '')) = 'signed_up'
          then 'interested'
        when lower(coalesce(last_email_status, '')) = 'clicked'
          or clicked_at is not null
          then 'clicked'
        when lower(coalesce(last_email_status, '')) = 'opened'
          or opened_at is not null
          then 'opened'
        when lower(coalesce(last_email_status, '')) = 'delivered'
          then 'delivered'
        when lower(coalesce(last_email_status, '')) in ('failed', 'bounced')
          then 'failed'
        when lower(coalesce(last_email_status, '')) in ('sent', 'queued')
          or invited_at is not null
          then 'sent'
        else 'not_sent'
      end as invite_status
    from public.v_booker_leads
    where coalesce(is_test, false) = false
  )
  select json_build_object(
    'leads_total', (select count(*)::int from leads),
    'leads_with_email', (
      select count(*)::int from leads where invite_email is not null and btrim(invite_email) <> ''
    ),
    'leads_ready_not_sent', (
      select count(*)::int
      from leads
      where invite_status = 'not_sent'
        and invite_email is not null
        and btrim(invite_email) <> ''
    ),
    'emails_sent', (select count(*)::int from leads where invite_status = 'sent'),
    'emails_delivered', (select count(*)::int from leads where invite_status = 'delivered'),
    'emails_opened', (select count(*)::int from leads where invite_status = 'opened'),
    'emails_clicked', (select count(*)::int from leads where invite_status = 'clicked'),
    'interested', (select count(*)::int from leads where invite_status = 'interested'),
    'emails_failed', (select count(*)::int from leads where invite_status = 'failed'),
    'communications_email_sent', (
      select count(*)::int
      from public.communications c
      join public.organizations o on o.id = c.organization_id
      where c.channel = 'EMAIL'
        and c.action_type = 'SENT_EMAIL'
        and coalesce(o.is_test, false) = false
        and coalesce(c.metadata->>'invite_kind', '') = 'booker'
        and upper(coalesce(o.legal_country_code, '')) = 'GB'
        and lower(trim(coalesce(o.legal_city, ''))) = 'london'
    )
  )
  into v_result;

  return v_result;
end;
$function$;

revoke all on function public.get_booker_dashboard_stats() from public, anon;
grant execute on function public.get_booker_dashboard_stats() to authenticated, service_role;

comment on function public.get_booker_dashboard_stats() is
  'VL Bookers London-only demand funnel — separate from partner network invites';
