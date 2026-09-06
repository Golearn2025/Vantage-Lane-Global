-- Milestone 1 relationship lifecycle command (SECURITY INVOKER + platform.network.manage).

create or replace function public.rpc_change_relationship_status(
  p_organization_id uuid,
  p_new_status public.relationship_status,
  p_note text default null
)
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare
  v_partnership public.partnerships%rowtype;
  v_old public.relationship_status;
  v_note text := nullif(trim(p_note), '');
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if not public.has_platform_permission('platform.network.manage') then
    raise exception 'forbidden: platform.network.manage required' using errcode = '42501';
  end if;

  if p_organization_id is null then
    raise exception 'organization_id is required' using errcode = '22023';
  end if;

  if p_new_status is null then
    raise exception 'new_status is required' using errcode = '22023';
  end if;

  select * into v_partnership
  from public.partnerships
  where organization_id = p_organization_id
  for update;

  if not found then
    raise exception 'partnership not found for organization' using errcode = 'P0002';
  end if;

  v_old := v_partnership.relationship_status;

  if v_old = p_new_status then
    return jsonb_build_object(
      'organization_id', p_organization_id,
      'partnership_id', v_partnership.id,
      'previous_status', v_old,
      'new_status', p_new_status,
      'changed', false,
      'status_changed_at', v_partnership.status_changed_at
    );
  end if;

  update public.partnerships p
  set
    relationship_status = p_new_status,
    status_changed_at = timezone('utc', now()),
    became_active_at = case
      when p_new_status = 'ACTIVE' then coalesce(p.became_active_at, timezone('utc', now()))
      else p.became_active_at
    end,
    paused_at = case
      when p_new_status = 'PAUSED' then timezone('utc', now())
      when p_new_status = 'ACTIVE' then null
      else p.paused_at
    end,
    rejected_at = case
      when p_new_status = 'REJECTED' then timezone('utc', now())
      else p.rejected_at
    end,
    rejected_reason = case
      when p_new_status = 'REJECTED' then coalesce(v_note, p.rejected_reason)
      else p.rejected_reason
    end,
    inactive_reason = case
      when p_new_status = 'INACTIVE' then coalesce(v_note, p.inactive_reason)
      else p.inactive_reason
    end,
    first_contacted_at = case
      when p_new_status = 'CONTACTED' then coalesce(p.first_contacted_at, timezone('utc', now()))
      else p.first_contacted_at
    end,
    updated_at = timezone('utc', now())
  where p.id = v_partnership.id
  returning * into v_partnership;

  insert into public.activities (
    organization_id,
    actor_user_id,
    activity_type,
    summary,
    body,
    visibility,
    partnership_id,
    metadata
  ) values (
    p_organization_id,
    auth.uid(),
    'partnership.status_changed',
    format('Relationship status: %s → %s', v_old, p_new_status),
    v_note,
    'VL_ONLY',
    v_partnership.id,
    jsonb_build_object(
      'previous_status', v_old,
      'new_status', p_new_status,
      'source', 'rpc_change_relationship_status'
    )
  );

  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    entity_table,
    entity_id,
    before_state,
    after_state
  ) values (
    p_organization_id,
    auth.uid(),
    'rpc.change_relationship_status',
    'partnerships',
    v_partnership.id,
    jsonb_build_object('relationship_status', v_old),
    jsonb_build_object('relationship_status', p_new_status)
  );

  return jsonb_build_object(
    'organization_id', p_organization_id,
    'partnership_id', v_partnership.id,
    'previous_status', v_old,
    'new_status', p_new_status,
    'changed', true,
    'status_changed_at', v_partnership.status_changed_at
  );
end;
$function$;

revoke all on function public.rpc_change_relationship_status(uuid, public.relationship_status, text) from public, anon;
grant execute on function public.rpc_change_relationship_status(uuid, public.relationship_status, text) to authenticated, service_role;
