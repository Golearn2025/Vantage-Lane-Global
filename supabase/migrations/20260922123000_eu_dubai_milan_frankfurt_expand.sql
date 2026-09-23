-- Expand: Dubai / Paris / Frankfurt / Milan additional multiservice LEADs
-- Applied remotely 2026-09-22 alongside uk_gaps_eu_hubs

DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_med  uuid := '19353c68-bed1-4625-a811-da4e2a2a2f42';
  v_av   uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035';
  v_yacht uuid := '443ac19c-9b4b-4277-9531-e52d6163cb6a';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('Quintessentially Dubai','Quintessentially Dubai','AE','https://quintessentially.com/dubai/personal-concierge-in-dubai',NULL,'membership@quintessentially.com','+97144376800','+971526337450','Dubai','Dubai','Dubai','AE',25.2,55.27,'Dubai, UAE',NULL,NULL,'WEB_RESEARCH EU Dubai CONCIERGE',v_conc),
    ('DC Aviation Al-Futtaim DWC','DC Aviation Al-Futtaim','AE','https://www.dc-aviation.ae/','dc-aviation.ae','sales@dc-aviation.ae','+97148701800',NULL,'DWC','Dubai','Dubai','AE',24.9,55.16,'Al Maktoum International Airport FBO',NULL,NULL,'WEB_RESEARCH EU Dubai PRIVATE_AVIATION',v_av),
    ('My Private Service Paris','My Private Service','FR','https://www.myprivateservice.com/','myprivateservice.com','contact@myprivateservice.com','+33650027981','+33650027981','Champs-Elysees','Paris','Ile-de-France','FR',48.87,2.31,'66 Avenue des Champs-Elysees, 75008 Paris',NULL,NULL,'WEB_RESEARCH EU Paris CONCIERGE',v_conc),
    ('Le Bristol Paris','Le Bristol Paris','FR','https://www.lebristolparis.com/','lebristolparis.com','resa@lebristolparis.com','+33153433000',NULL,'Faubourg Saint-Honore','Paris','Ile-de-France','FR',48.872,2.315,'112 rue du Faubourg Saint-Honore, 75008 Paris',NULL,NULL,'WEB_RESEARCH EU Paris HOSPITALITY',v_hosp),
    ('American Hospital of Paris','American Hospital of Paris','FR','https://www.american-hospital.org/','american-hospital.org','patientservices@ahparis.org','+33146412525',NULL,'Neuilly','Paris','Ile-de-France','FR',48.885,2.272,'63 Boulevard Victor Hugo, 92200 Neuilly-sur-Seine',NULL,NULL,'WEB_RESEARCH EU Paris MEDICAL',v_med),
    ('Yachts de Paris','Yachts de Paris','FR','https://www.yachtsdeparis.fr/','yachtsdeparis.fr','contact@yachtsdeparis.fr','+33144542110',NULL,'Port de Javel','Paris','Ile-de-France','FR',48.85,2.28,'Port de Javel Haut, Paris',NULL,NULL,'WEB_RESEARCH EU Paris YACHT',v_yacht),
    ('Camper & Nicholsons Antibes','Camper & Nicholsons Antibes','FR','https://www.camperandnicholsons.com/',NULL,'antibes@camperandnicholsons.com','+33492912875',NULL,'Antibes','Antibes','PACA','FR',43.58,7.12,'Antibes French Riviera yacht brokerage',NULL,NULL,'WEB_RESEARCH EU Paris YACHT',v_yacht),
    ('Signature Aviation Frankfurt','Signature Aviation FRA','DE','https://www.signatureaviation.com/locations/FRA',NULL,'fra@signatureaviation.com','+496969072200',NULL,'FRA FBO','Frankfurt','Hesse','DE',50.05,8.57,'Frankfurt Airport FBO',NULL,NULL,'WEB_RESEARCH EU Frankfurt PRIVATE_AVIATION',v_av),
    ('Four Seasons Hotel Milano','Four Seasons Hotel Milano','IT','https://www.fourseasons.com/milan/',NULL,'milan.reservations@fourseasons.com','+3902770881',NULL,'Via Gesu','Milan','Lombardy','IT',45.469,9.197,'Via Gesu 6/8, 20121 Milan',NULL,NULL,'WEB_RESEARCH EU Milan HOSPITALITY',v_hosp),
    ('Armani Hotel Milano','Armani Hotel Milano','IT','https://www.armanihotels.com/','armanihotels.com','reservations.milano@armanihotels.com','+390288838888',NULL,'Via Manzoni','Milan','Lombardy','IT',45.47,9.19,'Via Manzoni 31, 20121 Milan',NULL,NULL,'WEB_RESEARCH EU Milan HOSPITALITY',v_hosp),
    ('Quintessentially Milan','Quintessentially Milan','IT','https://quintessentially.com/',NULL,'membership@quintessentially.com','+390297693800',NULL,'Via Durini','Milan','Lombardy','IT',45.466,9.2,'Via Durini 5, Milan',NULL,NULL,'WEB_RESEARCH EU Milan CONCIERGE',v_conc)
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
  RAISE NOTICE 'EU expand: inserted=% skipped=%', inserted, skipped;
END $$;
