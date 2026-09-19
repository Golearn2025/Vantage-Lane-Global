-- Google reputation fields for prospecting / network ranking
alter table public.organizations
  add column if not exists google_rating numeric(2,1),
  add column if not exists google_review_count integer,
  add column if not exists google_reviews_checked_at timestamptz,
  add column if not exists google_reviews_note text;

alter table public.organizations drop constraint if exists organizations_google_rating_check;
alter table public.organizations
  add constraint organizations_google_rating_check
  check (google_rating is null or (google_rating >= 0 and google_rating <= 5));

alter table public.organizations drop constraint if exists organizations_google_review_count_check;
alter table public.organizations
  add constraint organizations_google_review_count_check
  check (google_review_count is null or google_review_count >= 0);

comment on column public.organizations.google_rating is 'Manual/synced Google rating 0-5';
comment on column public.organizations.google_review_count is 'Manual/synced Google review count';
comment on column public.organizations.google_reviews_note is 'Source note e.g. claimed on site / Trustindex / approximate';

drop view if exists public.v_network_organizations;

create view public.v_network_organizations
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
  o.google_rating,
  o.google_review_count,
  o.google_reviews_note,
  p.id as partnership_id,
  p.relationship_status,
  p.status_changed_at as relationship_status_changed_at,
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
  ) as coverage_airport_iatas
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
where o.archived_at is null;

revoke all on public.v_network_organizations from public, anon;
grant select on public.v_network_organizations to authenticated, service_role;
