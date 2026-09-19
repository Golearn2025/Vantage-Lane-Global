-- Partners need to see their own relationship_status in the partner shell.
create policy partnerships_org_member_select on public.partnerships
  for select to authenticated
  using (public.is_org_member(organization_id));
