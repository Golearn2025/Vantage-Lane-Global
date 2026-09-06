-- Phase 1.6: RLS helper functions + enable RLS + policies

create or replace function public.is_platform_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_role_assignments pra
    join public.roles r on r.id = pra.role_id
    where pra.user_id = auth.uid()
      and r.scope = 'PLATFORM'
  );
$$;

create or replace function public.has_platform_permission(perm_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_role_assignments pra
    join public.role_permissions rp on rp.role_id = pra.role_id
    join public.permissions p on p.id = rp.permission_id
    where pra.user_id = auth.uid()
      and p.code = perm_code
      and p.scope = 'PLATFORM'
  );
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.status = 'ACTIVE'
      and m.archived_at is null
  );
$$;

create or replace function public.has_org_permission(org_id uuid, perm_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    join public.membership_roles mr on mr.membership_id = m.id
    join public.role_permissions rp on rp.role_id = mr.role_id
    join public.permissions p on p.id = rp.permission_id
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.status = 'ACTIVE'
      and m.archived_at is null
      and p.code = perm_code
      and p.scope = 'ORGANIZATION'
  );
$$;

revoke all on function public.is_platform_user() from public;
revoke all on function public.has_platform_permission(text) from public;
revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.has_org_permission(uuid, text) from public;
grant execute on function public.is_platform_user() to authenticated;
grant execute on function public.has_platform_permission(text) to authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_permission(uuid, text) to authenticated;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.permissions enable row level security;
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.platform_role_assignments enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_capabilities enable row level security;
alter table public.partnerships enable row level security;
alter table public.partnership_notes enable row level security;
alter table public.follow_ups enable row level security;
alter table public.organization_locations enable row level security;
alter table public.organization_contacts enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.membership_roles enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.locations enable row level security;
alter table public.location_edges enable row level security;
alter table public.service_types enable row level security;
alter table public.offerings enable row level security;
alter table public.offering_coverages enable row level security;
alter table public.vehicle_categories enable row level security;
alter table public.gt_fleet_declarations enable row level security;
alter table public.gt_fleet_units enable row level security;
alter table public.document_types enable row level security;
alter table public.documents enable row level security;
alter table public.standard_definitions enable row level security;
alter table public.organization_standard_assessments enable row level security;
alter table public.offering_standard_assessments enable row level security;
alter table public.vehicle_standard_assessments enable row level security;
alter table public.message_templates enable row level security;
alter table public.communications enable row level security;
alter table public.activities enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles
create policy profiles_select_self_or_platform on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_platform_user());
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.has_platform_permission('platform.users.manage'))
  with check (id = auth.uid() or public.has_platform_permission('platform.users.manage'));

-- Catalog read for authenticated; write platform
create policy permissions_select_auth on public.permissions for select to authenticated using (true);
create policy permissions_write_platform on public.permissions for all to authenticated
  using (public.has_platform_permission('platform.catalog.manage'))
  with check (public.has_platform_permission('platform.catalog.manage'));

create policy roles_select_auth on public.roles for select to authenticated using (true);
create policy roles_write_platform on public.roles for all to authenticated
  using (public.has_platform_permission('platform.catalog.manage'))
  with check (public.has_platform_permission('platform.catalog.manage'));

create policy role_permissions_select_auth on public.role_permissions for select to authenticated using (true);
create policy role_permissions_write_platform on public.role_permissions for all to authenticated
  using (public.has_platform_permission('platform.catalog.manage'))
  with check (public.has_platform_permission('platform.catalog.manage'));

create policy platform_role_assignments_select on public.platform_role_assignments for select to authenticated
  using (user_id = auth.uid() or public.has_platform_permission('platform.users.manage'));
create policy platform_role_assignments_write on public.platform_role_assignments for all to authenticated
  using (public.has_platform_permission('platform.users.manage'))
  with check (public.has_platform_permission('platform.users.manage'));

-- Organizations: members see own; platform network manage sees all
create policy organizations_select on public.organizations for select to authenticated
  using (public.is_org_member(id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy organizations_insert on public.organizations for insert to authenticated
  with check (public.has_platform_permission('platform.network.manage'));
create policy organizations_update on public.organizations for update to authenticated
  using (
    public.has_platform_permission('platform.network.manage')
    or public.has_org_permission(id, 'org.profile.write')
  )
  with check (
    public.has_platform_permission('platform.network.manage')
    or public.has_org_permission(id, 'org.profile.write')
  );

create policy organization_capabilities_select on public.organization_capabilities for select to authenticated
  using (public.is_org_member(organization_id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy organization_capabilities_write on public.organization_capabilities for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write'))
  with check (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write'));

-- VL-private CRM: partnerships, notes, follow_ups — platform only
create policy partnerships_platform_only on public.partnerships for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_platform_permission('platform.network.read'))
  with check (public.has_platform_permission('platform.network.manage'));

create policy partnership_notes_platform_only on public.partnership_notes for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_platform_permission('platform.network.read'))
  with check (public.has_platform_permission('platform.network.manage'));

create policy follow_ups_platform_only on public.follow_ups for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_platform_permission('platform.network.read'))
  with check (public.has_platform_permission('platform.network.manage'));

-- Org-owned operational tables
create policy organization_locations_select on public.organization_locations for select to authenticated
  using (public.is_org_member(organization_id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy organization_locations_write on public.organization_locations for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write'))
  with check (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write'));

create policy organization_contacts_select on public.organization_contacts for select to authenticated
  using (public.is_org_member(organization_id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy organization_contacts_write on public.organization_contacts for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write'))
  with check (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write'));

create policy organization_memberships_select on public.organization_memberships for select to authenticated
  using (user_id = auth.uid() or public.is_org_member(organization_id) or public.has_platform_permission('platform.users.manage') or public.has_platform_permission('platform.network.manage'));
create policy organization_memberships_write on public.organization_memberships for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.members.manage'))
  with check (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.members.manage'));

create policy membership_roles_select on public.membership_roles for select to authenticated
  using (
    exists (
      select 1 from public.organization_memberships m
      where m.id = membership_id
        and (m.user_id = auth.uid() or public.is_org_member(m.organization_id) or public.has_platform_permission('platform.network.manage'))
    )
  );
create policy membership_roles_write on public.membership_roles for all to authenticated
  using (
    exists (
      select 1 from public.organization_memberships m
      where m.id = membership_id
        and (public.has_platform_permission('platform.network.manage') or public.has_org_permission(m.organization_id, 'org.members.manage'))
    )
  )
  with check (
    exists (
      select 1 from public.organization_memberships m
      where m.id = membership_id
        and (public.has_platform_permission('platform.network.manage') or public.has_org_permission(m.organization_id, 'org.members.manage'))
    )
  );

create policy organization_invitations_select on public.organization_invitations for select to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.members.manage'));
create policy organization_invitations_write on public.organization_invitations for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.members.manage'))
  with check (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.members.manage'));

-- Platform catalogs: read authenticated, write platform catalog manage
create policy locations_select on public.locations for select to authenticated using (true);
create policy locations_write on public.locations for all to authenticated
  using (public.has_platform_permission('platform.catalog.manage'))
  with check (public.has_platform_permission('platform.catalog.manage'));
create policy location_edges_select on public.location_edges for select to authenticated using (true);
create policy location_edges_write on public.location_edges for all to authenticated
  using (public.has_platform_permission('platform.catalog.manage'))
  with check (public.has_platform_permission('platform.catalog.manage'));
create policy service_types_select on public.service_types for select to authenticated using (true);
create policy service_types_write on public.service_types for all to authenticated
  using (public.has_platform_permission('platform.catalog.manage'))
  with check (public.has_platform_permission('platform.catalog.manage'));
create policy vehicle_categories_select on public.vehicle_categories for select to authenticated using (true);
create policy vehicle_categories_write on public.vehicle_categories for all to authenticated
  using (public.has_platform_permission('platform.catalog.manage'))
  with check (public.has_platform_permission('platform.catalog.manage'));
create policy document_types_select on public.document_types for select to authenticated using (true);
create policy document_types_write on public.document_types for all to authenticated
  using (public.has_platform_permission('platform.catalog.manage'))
  with check (public.has_platform_permission('platform.catalog.manage'));
create policy standard_definitions_select on public.standard_definitions for select to authenticated using (true);
create policy standard_definitions_write on public.standard_definitions for all to authenticated
  using (public.has_platform_permission('platform.catalog.manage'))
  with check (public.has_platform_permission('platform.catalog.manage'));

-- Offerings / coverage / fleet / docs / assessments
create policy offerings_select on public.offerings for select to authenticated
  using (public.is_org_member(organization_id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy offerings_write on public.offerings for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write'))
  with check (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write'));

create policy offering_coverages_select on public.offering_coverages for select to authenticated
  using (public.is_org_member(organization_id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy offering_coverages_write on public.offering_coverages for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write'))
  with check (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.profile.write'));

create policy gt_fleet_declarations_select on public.gt_fleet_declarations for select to authenticated
  using (public.is_org_member(organization_id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy gt_fleet_declarations_write on public.gt_fleet_declarations for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.fleet.write'))
  with check (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.fleet.write'));

create policy gt_fleet_units_select on public.gt_fleet_units for select to authenticated
  using (public.is_org_member(organization_id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy gt_fleet_units_write on public.gt_fleet_units for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.fleet.write'))
  with check (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.fleet.write'));

create policy documents_select on public.documents for select to authenticated
  using (public.is_org_member(organization_id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy documents_write on public.documents for all to authenticated
  using (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.documents.write'))
  with check (public.has_platform_permission('platform.network.manage') or public.has_org_permission(organization_id, 'org.documents.write'));

create policy org_std_assess_select on public.organization_standard_assessments for select to authenticated
  using (public.is_org_member(organization_id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy org_std_assess_write on public.organization_standard_assessments for all to authenticated
  using (public.has_platform_permission('platform.network.manage'))
  with check (public.has_platform_permission('platform.network.manage'));

create policy offering_std_assess_select on public.offering_standard_assessments for select to authenticated
  using (public.is_org_member(organization_id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy offering_std_assess_write on public.offering_standard_assessments for all to authenticated
  using (public.has_platform_permission('platform.network.manage'))
  with check (public.has_platform_permission('platform.network.manage'));

create policy vehicle_std_assess_select on public.vehicle_standard_assessments for select to authenticated
  using (public.is_org_member(organization_id) or public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage'));
create policy vehicle_std_assess_write on public.vehicle_standard_assessments for all to authenticated
  using (public.has_platform_permission('platform.network.manage'))
  with check (public.has_platform_permission('platform.network.manage'));

-- Templates: platform readable; org templates only own org; write platform or org profile
create policy message_templates_select on public.message_templates for select to authenticated
  using (
    owner_type = 'PLATFORM'
    or (organization_id is not null and public.is_org_member(organization_id))
    or public.has_platform_permission('platform.network.read')
    or public.has_platform_permission('platform.network.manage')
  );
create policy message_templates_write on public.message_templates for all to authenticated
  using (
    public.has_platform_permission('platform.catalog.manage')
    or (owner_type = 'ORGANIZATION' and organization_id is not null and public.has_org_permission(organization_id, 'org.profile.write'))
  )
  with check (
    public.has_platform_permission('platform.catalog.manage')
    or (owner_type = 'ORGANIZATION' and organization_id is not null and public.has_org_permission(organization_id, 'org.profile.write'))
  );

create policy communications_select on public.communications for select to authenticated
  using (public.has_platform_permission('platform.network.read') or public.has_platform_permission('platform.network.manage') or public.is_org_member(organization_id));
create policy communications_write on public.communications for all to authenticated
  using (public.has_platform_permission('platform.communications.send') or public.has_platform_permission('platform.network.manage'))
  with check (public.has_platform_permission('platform.communications.send') or public.has_platform_permission('platform.network.manage'));

-- Activities: VL_ONLY only platform; ORG_SHARED visible to org members
create policy activities_select on public.activities for select to authenticated
  using (
    public.has_platform_permission('platform.network.read')
    or public.has_platform_permission('platform.network.manage')
    or (visibility = 'ORG_SHARED' and public.is_org_member(organization_id))
  );
create policy activities_insert on public.activities for insert to authenticated
  with check (public.has_platform_permission('platform.network.manage') or public.has_platform_permission('platform.communications.send'));
create policy activities_update on public.activities for update to authenticated
  using (public.has_platform_permission('platform.network.manage'))
  with check (public.has_platform_permission('platform.network.manage'));

-- Audit logs: platform read; insert via platform manage (service role bypasses RLS typically)
create policy audit_logs_select on public.audit_logs for select to authenticated
  using (public.has_platform_permission('platform.audit.read') or public.has_platform_permission('platform.network.manage'));
create policy audit_logs_insert on public.audit_logs for insert to authenticated
  with check (public.has_platform_permission('platform.network.manage') or public.has_platform_permission('platform.audit.write'));
