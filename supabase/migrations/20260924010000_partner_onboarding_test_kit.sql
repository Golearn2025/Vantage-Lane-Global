-- Partner onboarding test kit: 8 is_test LEADs (one per service) + open invites.
-- Tokens match modules/partner/test-kit-accounts.ts — open /join?invite=<token>

create extension if not exists pgcrypto;

do $$
declare
  r record;
  v_svc_id uuid;
  v_org_id uuid;
  v_contact_id uuid;
  v_offering_id uuid;
begin
  for r in
    select * from (
      values
        (
          'GROUND_TRANSPORTATION',
          'VL Test GT London',
          'Alex Driver',
          'test.gt@vantage-lane.test',
          '+447700900101',
          'London',
          'GB',
          'vltest_invite_gt_2026_ok01xxxx',
          '972cd9004f4cde558556cbe9a1f878b2eec34ecc4c54289894231e04384ea9af'
        ),
        (
          'AVIATION',
          'VL Test Aviation Heathrow',
          'Blake Aviator',
          'test.aviation@vantage-lane.test',
          '+447700900102',
          'London',
          'GB',
          'vltest_invite_av_2026_ok02xxxx',
          'dc4b0b582e308577a32398976c53234763b82f737e47ef071a133f72d74af70a'
        ),
        (
          'SECURITY',
          'VL Test Security Mayfair',
          'Casey Guard',
          'test.security@vantage-lane.test',
          '+447700900103',
          'London',
          'GB',
          'vltest_invite_sec_2026_ok03xxx',
          'f74bed1a8d31db3eebf6dc5d3ae5aff40870eb974acc8d3d5a5576a734c57310'
        ),
        (
          'HOSPITALITY',
          'VL Test Hospitality Knightsbridge',
          'Dana Host',
          'test.hospitality@vantage-lane.test',
          '+447700900104',
          'London',
          'GB',
          'vltest_invite_hos_2026_ok04xxx',
          'ed9d151917a310ee8b582c21556cb87ea26ed9158ce00e38c9927e8102e781f4'
        ),
        (
          'CONCIERGE',
          'VL Test Concierge Chelsea',
          'Eden Concierge',
          'test.concierge@vantage-lane.test',
          '+447700900105',
          'London',
          'GB',
          'vltest_invite_con_2026_ok05xxx',
          '8e6b5c0a174ad23902cd203f96b9e502e04403e883bf3ed5961f8c2d7faa058d'
        ),
        (
          'YACHT',
          'VL Test Yacht Monaco',
          'Finn Skipper',
          'test.yacht@vantage-lane.test',
          '+336700900106',
          'Monaco',
          'MC',
          'vltest_invite_yt_2026_ok06xxxx',
          '9b13c2d137aae8ab14c5fb98a96e2fb8c80e618452b182e86791dc99a9aa1112'
        ),
        (
          'MEDICAL',
          'VL Test Medical Harley',
          'Grey Medic',
          'test.medical@vantage-lane.test',
          '+447700900107',
          'London',
          'GB',
          'vltest_invite_med_2026_ok07xxx',
          'a90f72c44015d25a6bc16b41484775ef4275e8da42520af36d816b315c82cfe7'
        ),
        (
          'EVENTS',
          'VL Test Events Westminster',
          'Harper Events',
          'test.events@vantage-lane.test',
          '+447700900108',
          'London',
          'GB',
          'vltest_invite_evt_2026_ok08xxx',
          '541f9f4202fe152192de934f5e550c25b3a3017cb478ffb72eff5c0830a00514'
        )
    ) as t(
      service_code,
      display_name,
      contact_name,
      email,
      phone,
      city,
      country,
      invite_token,
      token_hash
    )
  loop
    -- Idempotent: skip if this test email already exists on a test org
    if exists (
      select 1
      from public.organizations o
      where o.is_test = true
        and lower(o.primary_email) = lower(r.email)
    ) then
      continue;
    end if;

    select id into v_svc_id
    from public.service_types
    where code = r.service_code
    limit 1;

    if v_svc_id is null then
      raise notice 'Skipping % — service_types row missing', r.service_code;
      continue;
    end if;

    insert into public.organizations (
      display_name,
      legal_name,
      legal_country_code,
      legal_city,
      primary_email,
      primary_phone_e164,
      notes_public,
      is_test
    ) values (
      r.display_name,
      r.display_name,
      r.country,
      r.city,
      lower(r.email),
      r.phone,
      'Partner onboarding test kit — safe to archive. Invite token (dev): ' || r.invite_token,
      true
    )
    returning id into v_org_id;

    insert into public.organization_capabilities (organization_id, capability)
    values (v_org_id, 'SUPPLIER');

    insert into public.partnerships (
      organization_id,
      relationship_status,
      status_changed_at
    ) values (
      v_org_id,
      'LEAD',
      timezone('utc', now())
    );

    insert into public.offerings (
      organization_id,
      service_type_id,
      operational_status
    ) values (
      v_org_id,
      v_svc_id,
      'UNKNOWN'
    )
    returning id into v_offering_id;

    insert into public.organization_contacts (
      organization_id,
      full_name,
      contact_type,
      title,
      email,
      phone_e164,
      is_primary
    ) values (
      v_org_id,
      r.contact_name,
      'Owner',
      'Onboarding test contact',
      lower(r.email),
      r.phone,
      true
    )
    returning id into v_contact_id;

    -- Revoke any prior open invites for this email (shouldn't exist for new orgs)
    update public.organization_invitations
    set revoked_at = timezone('utc', now())
    where lower(email) = lower(r.email)
      and revoked_at is null
      and accepted_at is null;

    insert into public.organization_invitations (
      organization_id,
      email,
      contact_id,
      token_hash,
      expires_at,
      service_code,
      last_email_status
    ) values (
      v_org_id,
      lower(r.email),
      v_contact_id,
      r.token_hash,
      timezone('utc', now()) + interval '365 days',
      r.service_code,
      'test_kit'
    );
  end loop;
end;
$$;
