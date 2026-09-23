-- UK hub gaps + EU hubs (Paris, Frankfurt, Milan, Dubai) multiservice LEADs

DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_med  uuid := '19353c68-bed1-4625-a811-da4e2a2a2f42';
  v_av   uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035';
  v_yacht uuid := '443ac19c-9b4b-4277-9531-e52d6163cb6a';
  v_sec uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- UK gaps
    ('Luxury Private Concierge Midlands','Luxury Private Concierge','GB','https://www.luxuryprivateconcierge.com/','luxuryprivateconcierge.com','hello@luxuryprivateconcierge.com','+447435809665','+447435809665','West Midlands','Birmingham','England','GB',52.48,-1.9,'West Midlands, United Kingdom',NULL,NULL,'WEB_RESEARCH UK Birmingham CONCIERGE',v_conc),
    ('VIP-Fly Airport Concierge','VIP-Fly','GB','https://vip-fly.com/','vip-fly.com','booking@vip-fly.com','+447506755598','+447506755598','BHX / LPL','Birmingham','England','GB',52.45,-1.75,'Airport concierge Birmingham & Liverpool',NULL,NULL,'WEB_RESEARCH UK Birmingham CONCIERGE',v_conc),
    ('Flamingo Yacht Charters','Flamingo Yacht Charters','GB','https://flamingoyachts.com/','flamingoyachts.com','info@flamingoyachts.com','+441475686088',NULL,'Largs','Glasgow','Scotland','GB',55.795,-4.87,'Largs Yacht Haven, Scotland',NULL,NULL,'WEB_RESEARCH UK Glasgow YACHT',v_yacht),
    ('SeaSpray Yacht Charters','SeaSpray Yacht Charters Ltd','GB','https://www.seasprayscotland.com/','seasprayscotland.com','admin@seasprayscotland.com','+447939517540','+447939517540','Largs','Glasgow','Scotland','GB',55.795,-4.87,'Largs Yacht Haven KA30 8EZ',NULL,NULL,'WEB_RESEARCH UK Glasgow YACHT',v_yacht),
    ('Glasgow Private Clinic','Glasgow Private Clinic','GB','https://glasgowprivateclinic.co.uk/','glasgowprivateclinic.co.uk','info@glasgowprivateclinic.co.uk','+441413842485',NULL,'Newton Mearns','Glasgow','Scotland','GB',55.77,-4.33,'224-226 Ayr Road, Newton Mearns G77 6DR',NULL,NULL,'WEB_RESEARCH UK Glasgow MEDICAL',v_med),
    ('Quantum Health Glasgow','Quantum Health','GB','https://quantumhealth.uk/','quantumhealth.uk','info@quantumhealth.uk','+441413705600','+447495979210','Shawlands','Glasgow','Scotland','GB',55.835,-4.27,'186 Kilmarnock Rd, Glasgow G41 3PG',NULL,NULL,'WEB_RESEARCH UK Glasgow MEDICAL',v_med),
    ('The Queens Hotel Leeds','The Queens Hotel Leeds','GB','https://www.thequeensleeds.co.uk/','thequeensleeds.co.uk','events@thequeensleeds.co.uk','+441132431323',NULL,'City Square','Leeds','England','GB',53.796,-1.547,'City Square, Leeds LS1 1PJ',NULL,NULL,'WEB_RESEARCH UK Leeds HOSPITALITY',v_hosp),
    ('Titanic Hotel Liverpool','Titanic Hotel Liverpool','GB','https://www.titanichotelliverpool.com/','titanichotelliverpool.com','events@titanichotelliverpool.com','+441515591444',NULL,'Stanley Dock','Liverpool','England','GB',53.42,-2.99,'Stanley Dock, Regent Road, Liverpool L3 0AN',NULL,NULL,'WEB_RESEARCH UK Liverpool HOSPITALITY',v_hosp),
    ('Liverpool Events Collective','Liverpool Events Collective','GB','https://www.titanichotelliverpool.com/',NULL,'info@titanichotelliverpool.com','+441514825783',NULL,'Stanley Dock','Liverpool','England','GB',53.42,-2.99,'Events venue coordination — Liverpool waterfront',NULL,NULL,'WEB_RESEARCH UK Liverpool EVENTS',v_evt),

    -- Paris FR
    ('FFGR Concierge Worldwide','FFGR Concierge','FR','https://www.ffgrconcierge.com/','ffgrconcierge.com','contact@ffgr.io','+33188611548','+33743461491','Paris','Paris','Île-de-France','FR',48.87,2.33,'Paris, France',NULL,NULL,'WEB_RESEARCH EU Paris CONCIERGE',v_conc),
    ('TGZ Conciergerie','TGZ Conciergerie','FR','https://tgzconciergerie.com/','tgzconciergerie.com','contact@tgzconciergerie.com','+33782295121','+33782295121','Champs-Élysées','Paris','Île-de-France','FR',48.87,2.31,'50 avenue des Champs-Élysées, 75008 Paris',NULL,NULL,'WEB_RESEARCH EU Paris CONCIERGE',v_conc),
    ('My Paris Concierge','My Paris Concierge','FR','https://myparisconcierge.com/','myparisconcierge.com','contact@myparisconcierge.com','+33769698514','+33769698514','Paris','Paris','Île-de-France','FR',48.86,2.35,'Paris, France',NULL,NULL,'WEB_RESEARCH EU Paris CONCIERGE',v_conc),
    ('Bodyguard Paris Agency','Bodyguard Paris Agency','FR','https://www.bodyguard-paris.com/','bodyguard-paris.com','contact@bodyguard-paris.com','+33189706010',NULL,'Champs-Élysées','Paris','Île-de-France','FR',48.87,2.31,'78 Avenue des Champs-Élysées, 75008 Paris',NULL,NULL,'WEB_RESEARCH EU Paris SECURITY',v_sec),
    ('Groupe VIP Security','Groupe VIP','FR','https://www.groupevip.fr/','groupevip.fr','contact@groupevip.fr','+33145978640',NULL,'Brétigny','Paris','Île-de-France','FR',48.61,2.3,'2 rue du Petit Paris, 91220 Brétigny-sur-Orge',NULL,NULL,'WEB_RESEARCH EU Paris SECURITY',v_sec),
    ('GSPRP Close Protection','GSPRP','FR','https://www.gsprp.fr/','gsprp.fr','closeprotection@gsprp.fr',NULL,NULL,'Berri','Paris','Île-de-France','FR',48.87,2.31,'38 rue de Berri, 75008 Paris',NULL,NULL,'WEB_RESEARCH EU Paris SECURITY',v_sec),
    ('Advanced Air Support Le Bourget','Advanced Air Support','FR','https://www.advancedairsupport.com/','advancedairsupport.com','handling@advancedairsupport.com','+33148358964',NULL,'Le Bourget','Paris','Île-de-France','FR',48.95,2.44,'Hangar H5, 1 avenue de l''Europe, 93350 Le Bourget',NULL,NULL,'WEB_RESEARCH EU Paris PRIVATE_AVIATION',v_av),
    ('Signature Aviation Le Bourget','Signature Aviation LBG','FR','https://www.signatureaviation.com/locations/LBG',NULL,'lbgt1@signatureflight.fr','+33149927581',NULL,'LBG FBO','Paris','Île-de-France','FR',48.97,2.44,'45 Avenue de l''Europe, Le Bourget 93350',NULL,NULL,'WEB_RESEARCH EU Paris PRIVATE_AVIATION',v_av),
    ('Jetex Le Bourget','Jetex LBG','FR','https://www.jetex.com/',NULL,'fbo-lbg@jetex.com','+33174372522',NULL,'LBG','Paris','Île-de-France','FR',48.97,2.44,'Paris Le Bourget FBO',NULL,NULL,'WEB_RESEARCH EU Paris PRIVATE_AVIATION',v_av),
    ('Plaza Athénée Paris','Hotel Plaza Athénée','FR','https://www.plaza-athenee-paris.com/','plaza-athenee-paris.com','reservations.pah@dorchestercollection.com','+33153676665',NULL,'Montaigne','Paris','Île-de-France','FR',48.866,2.304,'25 Avenue Montaigne, 75008 Paris',NULL,NULL,'WEB_RESEARCH EU Paris HOSPITALITY',v_hosp),

    -- Frankfurt DE
    ('now V.I.P. Frankfurt','now V.I.P.','DE','https://www.nowvip.de/','nowvip.de','info@nowvip.de','+491712952505','+491712952505','Frankfurt Airport','Frankfurt','Hesse','DE',50.05,8.57,'Am Luftbrückendenkmal, 60562 Frankfurt',NULL,NULL,'WEB_RESEARCH EU Frankfurt CONCIERGE',v_conc),
    ('Fraport VIP Services','Fraport VIP Services','DE','https://vip.frankfurt-airport.com/','frankfurt-airport.com','vip-services@fraport.de','+496969070366',NULL,'FRA T1','Frankfurt','Hesse','DE',50.05,8.57,'Frankfurt Airport VIP Terminal',NULL,NULL,'WEB_RESEARCH EU Frankfurt HOSPITALITY',v_hosp),

    -- Milan IT
    ('NCC Milan Private Aviation','NCC Milan','IT','https://nccmilano.com/','nccmilano.com','booking@nccmilano.com','+390287199694','+393270985522','Linate / Malpensa','Milan','Lombardy','IT',45.45,9.28,'Milan private aviation ground support',NULL,NULL,'WEB_RESEARCH EU Milan PRIVATE_AVIATION',v_av),
    ('NCC Milan Security Escort','NCC Milan Security','IT','https://nccmilano.com/',NULL,'booking@nccmilano.com','+393420981000',NULL,'Milan','Milan','Lombardy','IT',45.46,9.19,'Bodyguard & armored car — Milan',NULL,NULL,'WEB_RESEARCH EU Milan SECURITY',v_sec),

    -- Dubai AE
    ('ExecuJet Dubai International FBO','ExecuJet Middle East','AE','https://www.execujet.com/locations/dubai-international-fbo-omdb/','execujet.com','fbo.omdb@execujet-me.com','+97146016363',NULL,'DXB Free Zone','Dubai','Dubai','AE',25.25,55.36,'Dubai Int. Airport Free Zone',NULL,NULL,'WEB_RESEARCH EU Dubai PRIVATE_AVIATION',v_av)
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
    ) THEN skipped := skipped + 1; CONTINUE; END IF;

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

    INSERT INTO organization_capabilities (organization_id, capability) VALUES (v_org, 'SUPPLIER') ON CONFLICT DO NOTHING;
    INSERT INTO partnerships (organization_id, relationship_status, status_changed_at) VALUES (v_org, 'LEAD', now());
    INSERT INTO offerings (organization_id, service_type_id, operational_status) VALUES (v_org, r.service_type_id, 'UNKNOWN');
    INSERT INTO organization_locations (
      organization_id, label, location_kind, city, region, country_code, lat, lng, formatted_address, is_primary
    ) VALUES (v_org, r.base_label, 'OPS_BASE', r.city, r.region, r.country_code, r.lat, r.lng, r.formatted_address, true);
    inserted := inserted + 1;
  END LOOP;
  RAISE NOTICE 'UK gaps + EU hubs: inserted=% skipped=%', inserted, skipped;
END $$;
