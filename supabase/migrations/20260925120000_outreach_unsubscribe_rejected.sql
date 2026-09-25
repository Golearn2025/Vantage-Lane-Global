-- Outreach unsubscribe / rejected: one-click opt-out for booker + partner emails

alter table public.organization_invitations
  add column if not exists unsubscribed_at timestamptz;

comment on column public.organization_invitations.unsubscribed_at is
  'Set when recipient clicked Unsubscribe; last_email_status becomes rejected';

alter table public.organizations
  add column if not exists outreach_rejected_at timestamptz;

comment on column public.organizations.outreach_rejected_at is
  'Permanent outreach opt-out — never send booker or partner emails again';

create index if not exists organization_invitations_unsubscribed_idx
  on public.organization_invitations (unsubscribed_at)
  where unsubscribed_at is not null;

create index if not exists organizations_outreach_rejected_idx
  on public.organizations (outreach_rejected_at)
  where outreach_rejected_at is not null;

create or replace function public.rpc_outreach_unsubscribe(p_token text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_hash text;
  v_inv public.organization_invitations%rowtype;
begin
  if p_token is null or length(trim(p_token)) < 16 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_token');
  end if;

  v_hash := encode(digest(convert_to(trim(p_token), 'UTF8'), 'sha256'), 'hex');

  select * into v_inv
  from public.organization_invitations
  where token_hash = v_hash
    and revoked_at is null
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  update public.organization_invitations
  set
    unsubscribed_at = coalesce(unsubscribed_at, timezone('utc', now())),
    last_email_status = 'rejected'
  where id = v_inv.id;

  update public.organization_invitations
  set
    unsubscribed_at = coalesce(unsubscribed_at, timezone('utc', now())),
    last_email_status = 'rejected'
  where organization_id = v_inv.organization_id
    and invite_kind = v_inv.invite_kind
    and revoked_at is null
    and unsubscribed_at is null;

  update public.organizations
  set outreach_rejected_at = coalesce(outreach_rejected_at, timezone('utc', now()))
  where id = v_inv.organization_id;

  return jsonb_build_object(
    'ok', true,
    'invite_kind', v_inv.invite_kind,
    'organization_id', v_inv.organization_id
  );
end;
$function$;

revoke all on function public.rpc_outreach_unsubscribe(text) from public, anon;
grant execute on function public.rpc_outreach_unsubscribe(text) to anon, authenticated, service_role;

comment on function public.rpc_outreach_unsubscribe(text) is
  'One-click unsubscribe from outreach email — sets rejected + org outreach_rejected_at';

-- Append new columns at end (drop+create required to insert mid-select)
drop view if exists public.v_invite_leads;
create view public.v_invite_leads as
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
  inv.unsubscribed_at,
  o.outreach_rejected_at
from public.organizations o
join public.partnerships p
  on p.organization_id = o.id
 and p.relationship_status = 'LEAD'
join public.organization_capabilities oc_cap
  on oc_cap.organization_id = o.id
 and oc_cap.capability = 'SUPPLIER'
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
    and i.invite_kind = 'partner'
  order by i.created_at desc
  limit 1
) inv on true
where o.archived_at is null;

grant select on public.v_invite_leads to authenticated, service_role;

drop view if exists public.v_booker_leads;
create view public.v_booker_leads as
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
  ol.lng as primary_base_lng,
  inv.unsubscribed_at,
  o.outreach_rejected_at
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
      unsubscribed_at,
      outreach_rejected_at,
      case
        when outreach_rejected_at is not null
          or unsubscribed_at is not null
          or lower(coalesce(last_email_status, '')) = 'rejected'
          then 'rejected'
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
    'emails_rejected', (select count(*)::int from leads where invite_status = 'rejected'),
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
