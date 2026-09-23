-- UK London quality LEADs across missing service types (~5 each)
-- HOSPITALITY / CONCIERGE / EVENTS / MEDICAL / PRIVATE_AVIATION / YACHT
-- Dedupes on website_domain, phone, whatsapp, or display_name+country

DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_med  uuid := '19353c68-bed1-4625-a811-da4e2a2a2f42';
  v_av   uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035'; -- PRIVATE_AVIATION
  v_yacht uuid := '443ac19c-9b4b-4277-9531-e52d6163cb6a';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record;
  v_org uuid;
  v_st uuid;
  inserted int := 0;
  skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- HOSPITALITY
    ('STEM Hospitality','STEM Hospitality','GB','https://stem-group.co.uk/','stem-group.co.uk','info@stem-group.co.uk','+442030894979',NULL,'Edgware Road','London','England','GB',51.514,-0.162,'7A Edgware Road, London W2 2ER',NULL,NULL,'WEB_RESEARCH UK London HOSPITALITY',v_hosp),
    ('Golden Square Management','Golden Square Management','GB','https://goldensquaremanagement.com/','goldensquaremanagement.com','info@goldensquaremanagement.com','+447527583986','+447527583986','Soho','London','England','GB',51.512,-0.142,'37 Golden Square, London W1F 9LB',NULL,NULL,'WEB_RESEARCH UK London HOSPITALITY',v_hosp),
    ('Firmdale Hotels','Firmdale Hotels Plc','GB','https://www.firmdalehotels.com/','firmdalehotels.com','sales@firmdale.com','+442079801011',NULL,'South Kensington','London','England','GB',51.495,-0.172,'18 Thurloe Place, London SW7 2SP',NULL,NULL,'WEB_RESEARCH UK London HOSPITALITY',v_hosp),
    ('Blakes Hotel London','Blakes Management Limited','GB','https://www.blakeshotels.com/','blakeshotels.com','reservations@blakeshotels.com','+442073706701',NULL,'South Kensington','London','England','GB',51.492,-0.178,'33 Roland Gardens, London SW7 3PF',NULL,NULL,'WEB_RESEARCH UK London HOSPITALITY',v_hosp),
    ('Dorchester Collection','Dorchester Services Limited','GB','https://www.dorchestercollection.com/','dorchestercollection.com','info.tdl@dorchestercollection.com','+442076298888',NULL,'Mayfair','London','England','GB',51.507,-0.152,'Park Lane, London W1K 1QA',NULL,NULL,'WEB_RESEARCH UK London HOSPITALITY',v_hosp),

    -- CONCIERGE
    ('Innerplace','Innerplace','GB','https://www.innerplace.co.uk/','innerplace.co.uk','info@innerplace.co.uk','+442076364385',NULL,'Fitzrovia','London','England','GB',51.52,-0.136,'London, United Kingdom',NULL,NULL,'WEB_RESEARCH UK London CONCIERGE',v_conc),
    ('NINE Concierge','NINE Concierge','GB','https://nineconcierge.com/','nineconcierge.com','nine@nineconcierge.com','+447790600201','+447790600201','London','London','England','GB',51.507,-0.128,'London, United Kingdom',NULL,NULL,'WEB_RESEARCH UK London CONCIERGE',v_conc),
    ('888 Concierge','888 Concierge','GB','https://888-concierge.com/','888-concierge.com','info@888circle.co','+447462415164','+447462415164','Great Portland Street','London','England','GB',51.52,-0.143,'167-169 Great Portland Street, 5th Floor, London W1W 5PF',NULL,NULL,'WEB_RESEARCH UK London CONCIERGE',v_conc),
    ('OF.luxury','OF.luxury','GB','https://ofluxury.co.uk/','ofluxury.co.uk','info@ofluxury.co.uk',NULL,NULL,'London','London','England','GB',51.507,-0.128,'London, United Kingdom',NULL,NULL,'WEB_RESEARCH UK London CONCIERGE',v_conc),
    ('Quintessentially','Quintessentially','GB','https://quintessentially.com/','quintessentially.com',NULL,'+442030736600',NULL,'London','London','England','GB',51.507,-0.128,'London, United Kingdom',NULL,NULL,'WEB_RESEARCH UK London CONCIERGE',v_conc),

    -- EVENTS & PROTOCOL
    ('Parade Guest Experience','Parade','GB','https://weareparade.com/','weareparade.com','hello@weareparade.com','+442071237953',NULL,'London','London','England','GB',51.507,-0.128,'London, United Kingdom',NULL,NULL,'WEB_RESEARCH UK London EVENTS',v_evt),
    ('Sincura Group Events','The Sincura Group','GB','https://thesincuragroup.com/','thesincuragroup.com','info@thesincuragroup.com','+442031482655',NULL,'London','London','England','GB',51.507,-0.128,'London, United Kingdom',NULL,NULL,'WEB_RESEARCH UK London EVENTS',v_evt),
    ('The Protocol Consultancy','The Protocol Consultancy','GB','https://www.theprotocolconsultancy.com/','theprotocolconsultancy.com','natasha@theprotocolconsultancy.com','+447966509815','+447966509815','London','London','England','GB',51.507,-0.128,'London, United Kingdom',NULL,NULL,'WEB_RESEARCH UK London EVENTS',v_evt),
    ('Mount Protocol','Mount Protocol Ltd','GB','https://mountprotocol.com/','mountprotocol.com','info@mountprotocol.com','+447570159004','+447570159004','City Road','London','England','GB',51.527,-0.088,'123 City Road, London EC1V 2NX',NULL,NULL,'WEB_RESEARCH UK London EVENTS',v_evt),
    ('VIP Events London','VIP Events London','GB','https://vipeventslondon.com/','vipeventslondon.com','contact@vipeventslondon.com',NULL,NULL,'London','London','England','GB',51.507,-0.128,'London, United Kingdom',NULL,NULL,'WEB_RESEARCH UK London EVENTS',v_evt),

    -- MEDICAL & WELLNESS
    ('HOOKE London','HOOKE','GB','https://hooke.london/','hooke.london','enquiries@hooke.london','+442037466070',NULL,'Mayfair','London','England','GB',51.51,-0.147,'Mayfair, London, United Kingdom',NULL,NULL,'WEB_RESEARCH UK London MEDICAL',v_med),
    ('Miller Health','Miller Health','GB','https://www.millerhealth.london/','millerhealth.london','hello@millerhealth.london',NULL,NULL,'Harley Street','London','England','GB',51.52,-0.147,'25 Harley Street, London W1G 9QW',NULL,NULL,'WEB_RESEARCH UK London MEDICAL',v_med),
    ('Deia Health','9 Harley Street Limited','GB','https://deiahealth.com/','deiahealth.com','hello@deiahealth.com','+442070792100',NULL,'Harley Street','London','England','GB',51.52,-0.147,'9 Harley Street, London W1G 9QY',NULL,NULL,'WEB_RESEARCH UK London MEDICAL',v_med),
    ('Founders Health','Founders Health','GB','https://www.foundershealth.co/','foundershealth.co','concierge@foundershealth.co',NULL,NULL,'London','London','England','GB',51.507,-0.128,'London, United Kingdom',NULL,NULL,'WEB_RESEARCH UK London MEDICAL',v_med),
    ('The Concierge Clinic','The Concierge Clinic','GB','https://theconciergeclinic.co.uk/','theconciergeclinic.co.uk','members@theconciergeclinic.co.uk','+442071181816',NULL,'Marylebone','London','England','GB',51.519,-0.149,'62 Wimpole Street, London W1G 8AJ',NULL,NULL,'WEB_RESEARCH UK London MEDICAL',v_med),

    -- PRIVATE AVIATION
    ('Global Charter London','Global Charter','GB','https://www.globalcharter.com/','globalcharter.com','fly@globalcharter.com','+442071579525',NULL,'Kensington','London','England','GB',51.495,-0.186,'142 Cromwell Road, London SW7 4EF',NULL,NULL,'WEB_RESEARCH UK London PRIVATE_AVIATION',v_av),
    ('LunaJets London','LunaJets UK Ltd','GB','https://www.lunajets.com/','lunajets.com','london@lunajets.com','+442074095095',NULL,'Chiswick','London','England','GB',51.492,-0.267,'The Gatehouse, 2 Devonhurst Place, Heathfield Terrace, London W4 4JD',NULL,NULL,'WEB_RESEARCH UK London PRIVATE_AVIATION',v_av),
    ('Drex Aviation','Drex Aviation Group Limited','GB','https://drexaviation.com/','drexaviation.com','info@drexaviation.com','+442078240130','+447459476779','Enfield','London','England','GB',51.652,-0.046,'Unit 1, 245 Alma Road, London EN3 7BB',NULL,NULL,'WEB_RESEARCH UK London PRIVATE_AVIATION',v_av),
    ('Private Jets UK','Private Jets UK','GB','https://private-jets.co.uk/','private-jets.co.uk','flight@private-jets.co.uk','+442045773119','+447730145585','London City','London','England','GB',51.505,0.049,'Business Aviation Centre, Hartmann Rd, London E16 2PX',NULL,NULL,'WEB_RESEARCH UK London PRIVATE_AVIATION',v_av),
    ('Jetex Biggin Hill','Jetex','GB','https://www.jetex.com/','jetex.com','fbo-bqh@jetex.com','+441959528743',NULL,'Biggin Hill','London','England','GB',51.331,0.032,'Biggin Hill Airport, Westerham, Kent, United Kingdom',NULL,NULL,'WEB_RESEARCH UK London PRIVATE_AVIATION',v_av),

    -- YACHT & MARINE
    ('Yachts London','Cape Cuvier Ltd','GB','https://www.yachtslondon.com/','yachtslondon.com','info@yachtslondon.com','+441590610543',NULL,'Thames','London','England','GB',51.487,-0.169,'London / Thames, United Kingdom',NULL,NULL,'WEB_RESEARCH UK London YACHT',v_yacht),
    ('Thames Luxury Charters','Thames Luxury Charters Ltd','GB','https://www.thamesluxurycharters.co.uk/','thamesluxurycharters.co.uk','enquiries@thamesluxurycharters.co.uk','+442073577751',NULL,'Butler''s Wharf','London','England','GB',51.504,-0.074,'Admirals Court, 9-10 Copper Row, London SE1 2LH',NULL,NULL,'WEB_RESEARCH UK London YACHT',v_yacht),
    ('Roccabella Yachts','Roccabella Yachts','GB','https://roccabellayachts.com/','roccabellayachts.com','info@roccabellayachts.com','+442070996732',NULL,'Covent Garden','London','England','GB',51.515,-0.121,'16 Great Queen Street, Covent Garden, London WC2B 5AH',NULL,NULL,'WEB_RESEARCH UK London YACHT',v_yacht),
    ('Camper & Nicholsons London','Camper & Nicholsons (Mayfair) Limited','GB','https://www.camperandnicholsons.com/','camperandnicholsons.com','london@camperandnicholsons.com','+442070091950',NULL,'Mayfair','London','England','GB',51.509,-0.145,'42 Berkeley Square, London W1J 5AW',NULL,NULL,'WEB_RESEARCH UK London YACHT',v_yacht),
    ('Burgess Yachts London','Burgess','GB','https://www.burgessyachts.com/','burgessyachts.com','enquiries@burgessyachts.com','+442077664300',NULL,'St James''s','London','England','GB',51.508,-0.134,'Cunard House, 15 Regent Street, London SW1Y 4LR',NULL,NULL,'WEB_RESEARCH UK London YACHT',v_yacht)
  ) AS t(
    display_name, legal_name, country, website_url, website_domain, email, phone, whatsapp,
    base_label, city, region, country_code, lat, lng, formatted_address, rating, reviews, note, service_type_id
  )
  LOOP
    IF EXISTS (
      SELECT 1 FROM organizations o WHERE o.archived_at IS NULL AND (
        (r.website_domain IS NOT NULL AND o.website_domain = r.website_domain)
        OR (r.phone IS NOT NULL AND o.primary_phone_e164 = r.phone)
        OR (r.whatsapp IS NOT NULL AND o.primary_whatsapp_e164 = r.whatsapp)
        OR (lower(o.display_name) = lower(r.display_name) AND o.legal_country_code = r.country)
      )
    ) THEN
      skipped := skipped + 1;
      CONTINUE;
    END IF;

    INSERT INTO organizations (
      display_name, legal_name, legal_country_code, legal_city, legal_region,
      website_url, website_domain, primary_email, primary_phone_e164, primary_whatsapp_e164,
      google_rating, google_review_count, google_reviews_checked_at,
      notes_public, is_test, created_by_user_id
    ) VALUES (
      r.display_name, r.legal_name, r.country, r.city, r.region,
      r.website_url, r.website_domain, r.email, r.phone, COALESCE(r.whatsapp, r.phone),
      r.rating, r.reviews, CASE WHEN r.rating IS NOT NULL THEN now() ELSE NULL END,
      r.note, false, v_admin
    ) RETURNING id INTO v_org;

    INSERT INTO organization_capabilities (organization_id, capability)
    VALUES (v_org, 'SUPPLIER') ON CONFLICT DO NOTHING;

    INSERT INTO partnerships (organization_id, relationship_status, status_changed_at)
    VALUES (v_org, 'LEAD', now());

    INSERT INTO offerings (organization_id, service_type_id, operational_status)
    VALUES (v_org, r.service_type_id, 'UNKNOWN');

    INSERT INTO organization_locations (
      organization_id, label, location_kind, city, region, country_code, lat, lng, formatted_address, is_primary
    ) VALUES (
      v_org, r.base_label, 'OPS_BASE', r.city, r.region, r.country_code, r.lat, r.lng, r.formatted_address, true
    );

    inserted := inserted + 1;
  END LOOP;

  RAISE NOTICE 'UK London multiservice: inserted=% skipped=%', inserted, skipped;
END $$;
