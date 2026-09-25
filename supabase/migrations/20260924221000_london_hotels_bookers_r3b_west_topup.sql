-- VL Bookers R3b: West London top-up (retry agent) — 5 new desks only
-- Skipped Syon Park / Chelsea Harbour (already in DB under different emails)

DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record;
  v_org uuid;
  inserted int := 0;
  skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('Seraphine Hammersmith Desk','Seraphine Hammersmith','GB','https://www.seraphinehammersmith.co.uk/',NULL,'hammersmith@seraphinehotel.co.uk','+442086000555',NULL,'Hammersmith','London','England','GB',51.4935264,-0.2302126,'2 Cambridge Grove, Hammersmith, London W6 0LA, United Kingdom','BOOKER_DEMAND UK West London mid HOSPITALITY',v_hosp),
    ('Ravenscourt House Desk','Ravenscourt House','GB','https://ravenscourthouse.com/',NULL,'info@ravenscourthouse.com','+442039291959',NULL,'Hammersmith','London','England','GB',51.4964708,-0.2352129,'3 Paddenswick Road, Hammersmith, London W6 0BY, United Kingdom','BOOKER_DEMAND UK West London mid HOSPITALITY',v_hosp),
    ('Second Nature Chiswick Desk','Second Nature Chiswick','GB','https://www.staysecondnature.com/locations/chiswick-london',NULL,'reservations@staysecondnature.com','+442039880220',NULL,'Chiswick','London','England','GB',51.4932688,-0.2572057,'10 Windmill Road, Chiswick, London W4 1SD, United Kingdom','BOOKER_DEMAND UK West London mid HOSPITALITY',v_hosp),
    ('Millennium Chelsea FC Desk','Millennium & Copthorne Hotels at Chelsea Football Club','GB','https://www.millenniumhotels.com/en/london/millennium-copthorne-hotels-at-chelsea-football-club/',NULL,'reservations@chelseafc.com','+442034793565',NULL,'Fulham','London','England','GB',51.4811343,-0.1900941,'Stamford Bridge, Fulham Road, Fulham, London SW6 1HS, United Kingdom','BOOKER_DEMAND UK West London mid HOSPITALITY',v_hosp),
    ('Urban Villa Brentford Desk','Urban Villa Boutique Hotel','GB','https://www.urbanvilla.com/',NULL,'enquiries@urbanvilla.com','+442037505000',NULL,'Brentford','London','England','GB',51.4912818,-0.3031161,'Great West Road, Brentford, London TW8 0GA, United Kingdom','BOOKER_DEMAND UK West London mid HOSPITALITY',v_hosp)
  ) AS t(
    display_name, legal_name, country, website_url, website_domain, email, phone, whatsapp,
    base_label, city, region, country_code, lat, lng, formatted_address, note, service_type_id
  )
  LOOP
    IF EXISTS (
      SELECT 1 FROM organizations o WHERE o.archived_at IS NULL AND (
        (lower(o.display_name) = lower(r.display_name) AND o.legal_country_code = r.country)
        OR (r.email IS NOT NULL AND lower(coalesce(o.primary_email, '')) = lower(r.email)
            AND coalesce(o.notes_public, '') LIKE 'BOOKER_DEMAND%')
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
  RAISE NOTICE 'West London top-up: inserted=% skipped=%', inserted, skipped;
END $$;
