-- Network outreach invites: tracking + soft conversion link (LEAD stays LEAD)

alter type public.communication_action_type add value if not exists 'SENT_EMAIL';

alter table public.organization_invitations
  add column if not exists converted_organization_id uuid
    references public.organizations (id) on delete set null,
  add column if not exists service_code text,
  add column if not exists resend_message_id text,
  add column if not exists last_email_status text,
  add column if not exists opened_at timestamptz,
  add column if not exists clicked_at timestamptz;

create index if not exists organization_invitations_resend_idx
  on public.organization_invitations (resend_message_id)
  where resend_message_id is not null;

create index if not exists organization_invitations_converted_idx
  on public.organization_invitations (converted_organization_id)
  where converted_organization_id is not null;

-- Mark invite converted after partner bootstrap creates a NEW org
create or replace function public.rpc_mark_invite_converted(
  p_token text,
  p_converted_organization_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_hash text;
  v_inv public.organization_invitations%rowtype;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_token is null or length(trim(p_token)) < 16 then
    raise exception 'invalid token' using errcode = '22023';
  end if;
  if p_converted_organization_id is null then
    raise exception 'converted organization required' using errcode = '22023';
  end if;

  v_hash := encode(digest(convert_to(trim(p_token), 'UTF8'), 'sha256'), 'hex');

  select * into v_inv
  from public.organization_invitations
  where token_hash = v_hash
    and revoked_at is null
    and accepted_at is null
    and expires_at > timezone('utc', now())
  limit 1;

  if not found then
    -- Idempotent / soft-fail: token may already be used or expired
    return jsonb_build_object('ok', false, 'reason', 'not_found_or_used');
  end if;

  update public.organization_invitations
  set
    accepted_at = timezone('utc', now()),
    converted_organization_id = p_converted_organization_id,
    last_email_status = coalesce(last_email_status, 'signed_up')
  where id = v_inv.id;

  insert into public.activities (
    organization_id,
    actor_user_id,
    activity_type,
    summary,
    body,
    visibility
  ) values (
    v_inv.organization_id,
    v_uid,
    'INVITE_CONVERTED',
    'Lead invite converted to new partner org',
    'Invitee completed /join. Soft-linked to organization ' || p_converted_organization_id::text,
    'VL_ONLY'
  );

  insert into public.activities (
    organization_id,
    actor_user_id,
    activity_type,
    summary,
    body,
    visibility
  ) values (
    p_converted_organization_id,
    v_uid,
    'JOINED_FROM_INVITE',
    'Joined from network invite',
    'Came from lead organization ' || v_inv.organization_id::text,
    'VL_ONLY'
  );

  return jsonb_build_object(
    'ok', true,
    'invitation_id', v_inv.id,
    'lead_organization_id', v_inv.organization_id,
    'converted_organization_id', p_converted_organization_id
  );
end;
$function$;

revoke all on function public.rpc_mark_invite_converted(text, uuid) from public, anon;
grant execute on function public.rpc_mark_invite_converted(text, uuid) to authenticated, service_role;

-- Read model for Invites page
create or replace view public.v_invite_leads as
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
  inv.service_code as invite_service_code
from public.organizations o
join public.partnerships p
  on p.organization_id = o.id
 and p.relationship_status = 'LEAD'
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
  order by i.created_at desc
  limit 1
) inv on true
where o.archived_at is null;

grant select on public.v_invite_leads to authenticated, service_role;
