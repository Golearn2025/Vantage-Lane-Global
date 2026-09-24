-- VL Bookers outreach funnel stats (separate from network partner invites)

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
    )
  )
  into v_result;

  return v_result;
end;
$function$;

revoke all on function public.get_booker_dashboard_stats() from public, anon;
grant execute on function public.get_booker_dashboard_stats() to authenticated, service_role;

comment on function public.get_booker_dashboard_stats() is
  'VL Bookers (BUYER demand) outreach funnel — separate from partner network invites';
