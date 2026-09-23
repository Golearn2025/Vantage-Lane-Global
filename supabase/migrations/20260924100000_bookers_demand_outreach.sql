-- Bookers (demand) outreach: separate from partner Invites

alter table public.organization_invitations
  add column if not exists invite_kind text not null default 'partner';

alter table public.organization_invitations
  drop constraint if exists organization_invitations_invite_kind_check;

alter table public.organization_invitations
  add constraint organization_invitations_invite_kind_check
  check (invite_kind in ('partner', 'booker'));

create index if not exists organization_invitations_kind_idx
  on public.organization_invitations (invite_kind, created_at desc);

comment on column public.organization_invitations.invite_kind is
  'partner = join network invite; booker = demand/buyer outreach';

-- Partner Invites: SUPPLIER leads only; latest partner invite row
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
  inv.service_code as invite_service_code,
  inv.invite_kind
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

-- Bookers: BUYER leads; latest booker invite row
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
  inv.invite_kind
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
where o.archived_at is null;

grant select on public.v_booker_leads to authenticated, service_role;

-- Public CTA: mark booker interest (clicked + accepted)
create or replace function public.rpc_mark_booker_interest(p_token text)
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
    and invite_kind = 'booker'
    and expires_at > timezone('utc', now())
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found_or_expired');
  end if;

  update public.organization_invitations
  set
    clicked_at = coalesce(clicked_at, timezone('utc', now())),
    accepted_at = coalesce(accepted_at, timezone('utc', now())),
    last_email_status = 'signed_up'
  where id = v_inv.id;

  return jsonb_build_object(
    'ok', true,
    'organization_id', v_inv.organization_id,
    'invitation_id', v_inv.id
  );
end;
$function$;

revoke all on function public.rpc_mark_booker_interest(text) from public, anon;
grant execute on function public.rpc_mark_booker_interest(text) to anon, authenticated, service_role;

-- Seed starter UK hotel / concierge bookers (BUYER)
DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record;
  v_org uuid;
  inserted int := 0;
  skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('The Lanesborough Bookings Desk','The Lanesborough','GB','https://www.oetkercollection.com/hotels/the-lanesborough/',NULL,'reservations@lanesborough.com','+442072596600',NULL,'Hyde Park Corner','London','England','GB',51.502,-0.152,'Hyde Park Corner, London SW1X 7TA','BOOKER_DEMAND UK London HOSPITALITY desk',v_hosp),
    ('Claridge''s Guest Experience','Claridge''s','GB','https://www.claridges.co.uk/',NULL,'reservations@claridges.co.uk','+442076296060',NULL,'Mayfair','London','England','GB',51.512,-0.147,'Brook Street, London W1K 4HR','BOOKER_DEMAND UK London HOSPITALITY desk',v_hosp),
    ('The Connaught Concierge','The Connaught','GB','https://www.the-connaught.co.uk/',NULL,'concierge@the-connaught.co.uk','+442074997070',NULL,'Mayfair','London','England','GB',51.51,-0.15,'Carlos Place, London W1K 2AL','BOOKER_DEMAND UK London CONCIERGE',v_conc),
    ('Mandarin Oriental Hyde Park Concierge','Mandarin Oriental Hyde Park','GB','https://www.mandarinoriental.com/en/london/hyde-park',NULL,'molon-concierge@mohg.com','+442072358000',NULL,'Knightsbridge','London','England','GB',51.502,-0.16,'66 Knightsbridge, London SW1X 7LA','BOOKER_DEMAND UK London CONCIERGE',v_conc),
    ('Four Seasons Park Lane Guest Services','Four Seasons Hotel London at Park Lane','GB','https://www.fourseasons.com/london/',NULL,'lon.reservations@fourseasons.com','+442074995000',NULL,'Park Lane','London','England','GB',51.505,-0.15,'Hamilton Place, Park Lane, London W1J 7DR','BOOKER_DEMAND UK London HOSPITALITY desk',v_hosp),
    ('Rosewood London Concierge','Rosewood London','GB','https://www.rosewoodhotels.com/en/london',NULL,'london.concierge@rosewoodhotels.com','+442077871000',NULL,'Holborn','London','England','GB',51.517,-0.118,'252 High Holborn, London WC1V 7EN','BOOKER_DEMAND UK London CONCIERGE',v_conc),
    ('The Ned Guest Relations','The Ned','GB','https://www.thened.com/london',NULL,'reservations.london@thened.com','+442038280000',NULL,'City of London','London','England','GB',51.513,-0.09,'27 Poultry, London EC2R 8AJ','BOOKER_DEMAND UK London HOSPITALITY desk',v_hosp),
    ('Quintessentially Concierge London','Quintessentially','GB','https://www.quintessentially.com/',NULL,'membership@quintessentially.com','+442073423480',NULL,'Mayfair','London','England','GB',51.51,-0.14,'London, United Kingdom','BOOKER_DEMAND UK London CONCIERGE',v_conc),
    ('Ten Trinity Concierge','Ten Trinity Square','GB','https://www.tengroup.com/ten-trinity-square',NULL,'reservations@tentrinitysquare.com','+442071983888',NULL,'Tower Hill','London','England','GB',51.51,-0.078,'10 Trinity Square, London EC3N 4AJ','BOOKER_DEMAND UK London HOSPITALITY desk',v_hosp),
    ('Edinburgh Concierge Collective','Edinburgh Concierge Collective','GB','https://www.edinburghconcierge.com/',NULL,'hello@edinburghconcierge.com','+441312250100',NULL,'New Town','Edinburgh','Scotland','GB',55.953,-3.2,'Edinburgh, Scotland','BOOKER_DEMAND UK Edinburgh CONCIERGE',v_conc),
    ('Gleneagles Guest Experience','Gleneagles','GB','https://gleneagles.com/',NULL,'reservations@gleneagles.com','+441764662231',NULL,'Auchterarder','Perthshire','Scotland','GB',56.28,-3.75,'Auchterarder, Perthshire PH3 1NF','BOOKER_DEMAND UK Scotland HOSPITALITY desk',v_hosp),
    ('Manchester Midland Concierge','The Midland Hotel','GB','https://www.themidlandhotel.co.uk/',NULL,'concierge@themidlandhotel.co.uk','+441612360300',NULL,'City centre','Manchester','England','GB',53.477,-2.245,'16 Peter Street, Manchester M60 2DS','BOOKER_DEMAND UK Manchester CONCIERGE',v_conc)
  ) AS t(
    display_name, legal_name, country, website_url, website_domain, email, phone, whatsapp,
    base_label, city, region, country_code, lat, lng, formatted_address, note, service_type_id
  )
  LOOP
    IF EXISTS (
      SELECT 1 FROM organizations o WHERE o.archived_at IS NULL AND (
        (lower(o.display_name) = lower(r.display_name) AND o.legal_country_code = r.country)
        OR (o.notes_public IS NOT NULL AND o.notes_public = r.note AND lower(o.display_name) = lower(r.display_name))
      )
    ) THEN
      skipped := skipped + 1;
      CONTINUE;
    END IF;

    INSERT INTO organizations (
      display_name, legal_name, legal_country_code, legal_city, legal_region,
      website_url, website_domain, primary_email, primary_phone_e164, primary_whatsapp_e164,
      notes_public, is_test, created_by_user_id
    ) VALUES (
      r.display_name, r.legal_name, r.country, r.city, r.region,
      r.website_url, r.website_domain, r.email, r.phone, COALESCE(r.whatsapp, r.phone),
      r.note, false, v_admin
    ) RETURNING id INTO v_org;

    INSERT INTO organization_capabilities (organization_id, capability)
    VALUES (v_org, 'BUYER') ON CONFLICT DO NOTHING;
    INSERT INTO partnerships (organization_id, relationship_status, status_changed_at)
    VALUES (v_org, 'LEAD', now());
    INSERT INTO offerings (organization_id, service_type_id, operational_status)
    VALUES (v_org, r.service_type_id, 'UNKNOWN');
    INSERT INTO organization_locations (
      organization_id, label, location_kind, city, region, country_code, lat, lng, formatted_address, is_primary
    ) VALUES (v_org, r.base_label, 'OPS_BASE', r.city, r.region, r.country_code, r.lat, r.lng, r.formatted_address, true);
    INSERT INTO organization_contacts (
      organization_id, full_name, contact_type, title, email, phone_e164, is_primary
    ) VALUES (
      v_org, 'Guest / Concierge desk', 'Other', 'Bookings desk', r.email, r.phone, true
    );
    inserted := inserted + 1;
  END LOOP;
  RAISE NOTICE 'UK bookers seed: inserted=% skipped=%', inserted, skipped;
END $$;
