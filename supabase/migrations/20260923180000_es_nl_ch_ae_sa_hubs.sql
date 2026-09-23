-- Madrid / Amsterdam / Zurich / Dubai expand / Riyadh multiservice LEADs

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
    -- Madrid / Spain
    ('FFGR Espana','FFGR Espana','ES','https://www.ffgrespana.com/','ffgrespana.com','reservation@ffgrespana.com',NULL,NULL,'Madrid','Madrid','Madrid','ES',40.42,-3.70,'Madrid, Spain',NULL,NULL,'WEB_RESEARCH EU Madrid CONCIERGE',v_conc),
    ('Algoz Group Madrid','Algoz Group','ES','https://algozgroup.com/concierge-madrid','algozgroup.com','service@algozgroup.com','+971508694209','+971508694209','Madrid','Madrid','Madrid','ES',40.42,-3.70,'Madrid luxury concierge & close protection',NULL,NULL,'WEB_RESEARCH EU Madrid CONCIERGE',v_conc),
    ('AviaVIP Madrid FBO','AviaVIP Madrid','ES','https://aviavip.com/network/madrid-fbo/','aviavip.com','lemd@aviavip.com','+34629361111',NULL,'Barajas','Madrid','Madrid','ES',40.47,-3.56,'Terminal Ejecutiva, Madrid Barajas',NULL,NULL,'WEB_RESEARCH EU Madrid PRIVATE_AVIATION',v_av),
    ('General Aviation Service Madrid','General Aviation Service S.L.','ES','https://generalaviation.es/madrid/','generalaviation.es','madrid@generalaviation.es','+34913936906',NULL,'Barajas','Madrid','Madrid','ES',40.47,-3.56,'Madrid-Barajas premium ground handling',NULL,NULL,'WEB_RESEARCH EU Madrid PRIVATE_AVIATION',v_av),
    ('Mandarin Oriental Ritz Madrid','Mandarin Oriental Ritz Madrid','ES','https://www.mandarinoriental.com/en/madrid/hotel-ritz','mohg.com','mrmad-reservations@mohg.com','+34917016767',NULL,'Plaza de la Lealtad','Madrid','Madrid','ES',40.415,-3.692,'Plaza de la Lealtad 5, 28014 Madrid',NULL,NULL,'WEB_RESEARCH EU Madrid HOSPITALITY',v_hosp),
    ('Clinica CEMTRO Madrid','Clinica CEMTRO','ES','https://www.clinicacemtro.com/','clinicacemtro.com','clinica.cemtro@clinicacemtro.com','+34917355757',NULL,'Mirasierra','Madrid','Madrid','ES',40.48,-3.72,'Av. Ventisquero de la Condesa 42, 28035 Madrid',NULL,NULL,'WEB_RESEARCH EU Madrid MEDICAL',v_med),
    ('Boat Charter BCN','Boat Charter BCN','ES','https://www.boatcharterbcn.com/','boatcharterbcn.com','info@boatcharterbcn.com','+34639727411','+34639727411','Port Olimpic','Barcelona','Catalonia','ES',41.39,2.20,'Calle Badajoz 28 bis, 08005 Barcelona',NULL,NULL,'WEB_RESEARCH EU Barcelona YACHT',v_yacht),
    ('Gotland Charter Barcelona','Gotland Charter','ES','https://www.gotlandcharter.com/','gotlandcharter.com','hello@gotlandcharter.com','+34610669333','+34610669333','Port Olimpic','Barcelona','Catalonia','ES',41.39,2.20,'Port Olimpic de Barcelona',NULL,NULL,'WEB_RESEARCH EU Barcelona YACHT',v_yacht),

    -- Amsterdam NL
    ('Flagship Events Amsterdam','Flagship Events','NL','https://flagshipamsterdam.com/','flagshipamsterdam.com','events@flagshipamsterdam.com','+31202612828',NULL,'Amsterdam','Amsterdam','North Holland','NL',52.37,4.89,'Amsterdam, Netherlands',NULL,NULL,'WEB_RESEARCH EU Amsterdam EVENTS',v_evt),
    ('Hotel Okura Amsterdam','Hotel Okura Amsterdam','NL','https://www.okura.nl/','okura.nl','info@okura.nl','+31206787111',NULL,'De Pijp','Amsterdam','North Holland','NL',52.35,4.89,'Ferdinand Bolstraat 333, 1072 LH Amsterdam',NULL,NULL,'WEB_RESEARCH EU Amsterdam HOSPITALITY',v_hosp),
    ('Jet Aviation Amsterdam FBO','Jet Aviation Amsterdam','NL','https://www.jetaviation.com/',NULL,'amsfbo@jetaviation.com',NULL,NULL,'Schiphol','Amsterdam','North Holland','NL',52.31,4.76,'Amsterdam Schiphol FBO',NULL,NULL,'WEB_RESEARCH EU Amsterdam PRIVATE_AVIATION',v_av),
    ('AviaVIP Amsterdam','AviaVIP Amsterdam','NL','https://aviavip.com/',NULL,'eham@aviavip.com','+31202066780',NULL,'Schiphol','Amsterdam','North Holland','NL',52.31,4.76,'Amsterdam Schiphol FBO',NULL,NULL,'WEB_RESEARCH EU Amsterdam PRIVATE_AVIATION',v_av),

    -- Zurich CH
    ('HLS Infinity Zurich','HLS Infinity','CH','https://hlsinfinity.com/','hlsinfinity.com','contact@hlsinfinity.com','+41216010417','+41798017615','Zurich / Lausanne','Zurich','Zurich','CH',47.37,8.54,'Switzerland — Zurich desk',NULL,NULL,'WEB_RESEARCH EU Zurich CONCIERGE',v_conc),
    ('Jet Aviation Zurich FBO','Jet Aviation Zurich','CH','https://www.jetaviation.com/location/zurich/',NULL,'zrhfbo@jetaviation.com','+41581588466',NULL,'Kloten','Zurich','Zurich','CH',47.46,8.56,'General Aviation Center, CH-8302 Kloten',NULL,NULL,'WEB_RESEARCH EU Zurich PRIVATE_AVIATION',v_av),
    ('HLS Zurich Security','HLS Security Zurich','CH','https://hlsinfinity.com/',NULL,'security@hlsinfinity.com',NULL,NULL,'Zurich','Zurich','Zurich','CH',47.37,8.54,'Bodyguard & VIP protection — Switzerland',NULL,NULL,'WEB_RESEARCH EU Zurich SECURITY',v_sec),

    -- Dubai AE expand
    ('VCP Global Secure Yachts','VCP Global','AE','https://vcp-global.com/ae/secure-yachts/','vcp-global.com','info@vcp-global.com','+971566643309','+971566643309','Dubai','Dubai','Dubai','AE',25.2,55.27,'Secure yacht & MedEvac — UAE',NULL,NULL,'WEB_RESEARCH EU Dubai YACHT',v_yacht),
    ('Jet Aviation Dubai DXB FBO','Jet Aviation Dubai','AE','https://www.jetaviation.com/location/dubai-dxb-uae/',NULL,'dxbfbo@jetaviation.com','+97142073411',NULL,'DXB','Dubai','Dubai','AE',25.25,55.36,'Dubai International FBO',NULL,NULL,'WEB_RESEARCH EU Dubai PRIVATE_AVIATION',v_av),
    ('CGT VIP Events Dubai','CGT VIP Events','AE','https://cgtsecurityservices.com/vip-travel-lifestyle-services/event-management/',NULL,'info@cgtsecurityservices.com','+971552745713','+971552745713','Emirates Towers','Dubai','Dubai','AE',25.22,55.28,'VIP event management — Dubai',NULL,NULL,'WEB_RESEARCH EU Dubai EVENTS',v_evt),

    -- Riyadh SA
    ('TPAC Private Aviation Riyadh','The Private Aviation Company','SA','https://theprivateaviation.com/','theprivateaviation.com','vip@tpac.sa','+966530000050','+966530000050','Olaya','Riyadh','Riyadh','SA',24.69,46.69,'Al Faisaliah Tower Level 18, Riyadh',NULL,NULL,'WEB_RESEARCH EU Riyadh PRIVATE_AVIATION',v_av),
    ('Jet Aviation Riyadh FBO','Jet Aviation Riyadh','SA','https://www.jetaviation.com/location/riyadh/',NULL,'ruhfbo@jetaviation.com','+966112214200',NULL,'RUH','Riyadh','Riyadh','SA',24.96,46.70,'King Khalid International FBO',NULL,NULL,'WEB_RESEARCH EU Riyadh PRIVATE_AVIATION',v_av),
    ('MEGA Aviation Riyadh','MEGA Aviation','SA','https://www.mega.aero/','mega.aero','charter@mega.aero','+16505502734',NULL,'Riyadh desk','Riyadh','Riyadh','SA',24.71,46.68,'Private jet & medical flights — RUH',NULL,NULL,'WEB_RESEARCH EU Riyadh PRIVATE_AVIATION',v_av),

    -- Paris FR gaps: Events
    ('The Red Carpet Paris','The Red Carpet','FR','https://theredcarpet.fr/','theredcarpet.fr','contact@theredcarpet.fr','+33170375768',NULL,'Vendome','Paris','Ile-de-France','FR',48.867,2.329,'10 Place Vendome, 75001 Paris',NULL,NULL,'WEB_RESEARCH EU Paris EVENTS',v_evt),
    ('Diplomacy Event Paris','Diplomacy Event','FR','https://www.diplomacy-event.com/','diplomacy-event.com','president@diplomacy-event.com','+33661524946','+33661524946','Paris','Paris','Ile-de-France','FR',48.86,2.35,'VIP / diplomatic events — Paris',NULL,NULL,'WEB_RESEARCH EU Paris EVENTS',v_evt)
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
  RAISE NOTICE 'ES NL CH AE SA: inserted=% skipped=%', inserted, skipped;
END $$;
