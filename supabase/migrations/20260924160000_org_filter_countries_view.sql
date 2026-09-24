-- Lightweight read model for Organizations table country filter.
-- Keeps filter options on a view (security_invoker), not a full summary scan.

create or replace view public.v_organization_filter_countries
with (security_invoker = true)
as
select distinct o.legal_country_code as country_code
from public.organizations o
where o.archived_at is null
  and o.legal_country_code is not null
order by 1;

revoke all on public.v_organization_filter_countries from public, anon;
grant select on public.v_organization_filter_countries to authenticated, service_role;
