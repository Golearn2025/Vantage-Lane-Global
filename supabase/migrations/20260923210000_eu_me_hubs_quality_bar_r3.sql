-- Quality-bar R3 LEADs (thin hubs only): established firms with real email;
-- Google ratings only when verified; WhatsApp optional (never invent from landline).
-- Madrid CONCIERGE; Zurich MEDICAL/PRIVATE_AVIATION; Riyadh MEDICAL/EVENTS;
-- Vienna / Geneva / Brussels gap fill.

DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_med  uuid := '19353c68-bed1-4625-a811-da4e2a2a2f42';
  v_sec  uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_av   uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- Madrid CONCIERGE (2 → quality adds)
    ('Bespoke23 Madrid','WP Concierge S.L. / Bespoke23','ES','https://www.bespoke23.com/','bespoke23.com','info@bespoke23.com','+34690947907',NULL::text,'Madrid desk','Madrid','Madrid','ES',40.42,-3.70,'Luxury lifestyle concierge — Madrid (est. 2015)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid CONCIERGE QBAR R3',v_conc),

    -- Zurich MEDICAL
    ('Privatklinik Bethanien Zurich','Privatklinik Bethanien','CH','https://www.swissmedical.net/en/hospitals/bethanien','klinikbethanien.ch','info@klinikbethanien.ch','+41432687070',NULL::text,'Toblerstrasse','Zurich','Zurich','CH',47.380,8.570,'Toblerstrasse 51, 8044 Zurich',4.3,204,'WEB_RESEARCH EU Zurich MEDICAL QBAR R3',v_med),
    ('Klinik Im Park Zurich','Hirslanden Klinik Im Park','CH','https://www.hirslanden.ch/en/klinik-im-park/home.html',NULL::text,'klinik-impark@hirslanden.ch','+41442092111',NULL::text,'Seestrasse','Zurich','Zurich','CH',47.351,8.538,'Seestrasse 220, 8027 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich MEDICAL QBAR R3',v_med),

    -- Zurich PRIVATE_AVIATION (licensed ZRH FBOs)
    ('Cat Air Service Zurich','Cat Air Service AG','CH','https://www.cat-airservice.com/','cat-airservice.com','info@cat-airservice.com','+41438160808',NULL::text,'GAC Kloten','Zurich','Zurich','CH',47.458,8.555,'General Aviation Center, Bimenzältenstrasse, 8302 Kloten',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich PRIVATE_AVIATION QBAR R3',v_av),
    ('BHS Aviation Zurich','BHS Aviation Switzerland AG','CH','https://bhs-aviation.com/','bhs-aviation.com','handling@bhs-aviation.com','+41445554420',NULL::text,'GAC Kloten','Zurich','Zurich','CH',47.458,8.555,'Steinbüelweg 7, 8302 Kloten / Zurich Airport',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich PRIVATE_AVIATION QBAR R3',v_av),
    ('Swiss Privilege Aviation Zurich','SWISS PRIVILEGE AVIATION SERVICES GmbH','CH','https://www.swissprivilege-aviationservices.com/','swissprivilege-aviationservices.com','ops@privilegeaviation.com','+41438150921',NULL::text,'GAC Zurich Airport','Zurich','Zurich','CH',47.458,8.555,'General Aviation Center, CH-8058 Zurich-Airport',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich PRIVATE_AVIATION QBAR R3',v_av),

    -- Riyadh MEDICAL / EVENTS
    ('Dr Sulaiman Al Habib Medical Group Riyadh','Dr. Sulaiman Al Habib Medical Group','SA','https://hmg.com/','hmg.com','info@drsulaimanalhabib.com','+966115259999',NULL::text,'Olaya','Riyadh','Riyadh','SA',24.70,46.68,'King Fahd Road, Al Olaya, Riyadh',4.0,4000,'WEB_RESEARCH EU Riyadh MEDICAL QBAR R3',v_med),
    ('STAMiNA Events Riyadh','STAMiNA','SA','https://stamina.sa/','stamina.sa','gk@stamina.sa','+966550213770','+966550213770','Al Olaya','Riyadh','Riyadh','SA',24.69,46.68,'6675 Al Olaya 2628, Al Olaya Dist, 12241 Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH EU Riyadh EVENTS QBAR R3',v_evt),

    -- Vienna
    ('Austria Concierge Vienna','Austria Concierge','AT','https://austriaconcierge.com/','austriaconcierge.com','info@austriaconcierge.com','+436766671351','+436766671351','Hafnersteig','Vienna','Vienna','AT',48.211,16.377,'Hafnersteig 5, 1010 Wien',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna CONCIERGE QBAR R3',v_conc),
    ('Hotel Sacher Vienna','Hotel Sacher Wien','AT','https://www.sacher.com/en/vienna/','sacher.com','wien@sacher.com','+431514560',NULL::text,'Philharmonikerstrasse','Vienna','Vienna','AT',48.204,16.370,'Philharmonikerstrasse 4, 1010 Vienna',4.5,13050,'WEB_RESEARCH EU Vienna HOSPITALITY QBAR R3',v_hosp),
    ('Rudolfinerhaus Vienna','Rudolfinerhaus Privatklinik GmbH','AT','https://www.rudolfinerhaus.at/','rudolfinerhaus.at','info@rudolfinerhaus.at','+431360360',NULL::text,'Billrothstrasse','Vienna','Vienna','AT',48.241,16.349,'Billrothstrasse 78, 1190 Vienna',4.5,269,'WEB_RESEARCH EU Vienna MEDICAL QBAR R3',v_med),
    ('Hannahs Plan Vienna','Hannah Neunteufel KG / Hannah''s Plan','AT','https://hannahs.at/','hannahs.at','frontdesk@hannahs.at','+4313105555',NULL::text,'Berggasse','Vienna','Vienna','AT',48.220,16.362,'Berggasse 5, 1090 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna EVENTS QBAR R3',v_evt),
    ('SafetyConcepts Vienna','SafetyConcepts','AT','https://www.safetyconcepts.at/','safetyconcepts.at','request@safetyconcepts.at','+4313671657',NULL::text,'Doebling','Vienna','Vienna','AT',48.239,16.355,'Doeblinger Hauptstrasse 54, 1190 Wien',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna SECURITY QBAR R3',v_sec),

    -- Geneva
    ('La Reserve Geneve','La Réserve Genève Hotel & Spa','CH','https://www.lareserve-geneve.com/en/','lareserve-geneve.com','reservations@lareserve-geneve.com','+41229595959',NULL::text,'Bellevue','Geneva','Geneva','CH',46.258,6.145,'301 route de Lausanne, 1293 Genève-Bellevue',4.7,1653,'WEB_RESEARCH EU Geneva HOSPITALITY QBAR R3',v_hosp),
    ('Four Seasons Hotel des Bergues Geneva','Four Seasons Hotel des Bergues Geneva','CH','https://www.fourseasons.com/geneva/',NULL::text,'info@hoteldesbergues.com','+41229087000',NULL::text,'Quai des Bergues','Geneva','Geneva','CH',46.206,6.148,'33 Quai des Bergues, 1201 Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva HOSPITALITY QBAR R3',v_hosp),
    ('Clinique des Grangettes Geneva','Hirslanden Clinique des Grangettes','CH','https://www.hirslanden.ch/en/clinique-des-grangettes/home.html',NULL::text,'reception.grangettes@hirslanden.ch','+41223050111',NULL::text,'Chene-Bougeries','Geneva','Geneva','CH',46.199,6.195,'Chemin des Grangettes 7, 1224 Chêne-Bougeries',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva MEDICAL QBAR R3',v_med),
    ('Jet Aviation Geneva FBO','Jet Aviation Geneva','CH','https://www.jetaviation.com/location/geneva/',NULL::text,'gvafbo@jetaviation.com','+41581581811',NULL::text,'Geneva Airport','Geneva','Geneva','CH',46.238,6.109,'18 Chemin des Papillons, 1215 Geneva-Cointrin',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva PRIVATE_AVIATION QBAR R3',v_av),

    -- Brussels MEDICAL / EVENTS
    ('Cliniques Saint-Luc Brussels International','Cliniques universitaires Saint-Luc','BE','https://www.international-saintluc.be/en','saintluc.uclouvain.be','international@saintluc.uclouvain.be','+3227641693',NULL::text,'Hippocrate','Brussels','Brussels','BE',50.851,4.454,'Avenue Hippocrate 10, 1200 Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels MEDICAL QBAR R3',v_med),
    ('DDMC Brussels','DDMC','BE','https://www.ddmc.eu/','ddmc.eu','letsconnect@ddmc.eu','+3223408650',NULL::text,'Forest','Brussels','Brussels','BE',50.810,4.320,'Rue des Anciens Etangs 55, 1190 Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels EVENTS QBAR R3',v_evt),
    ('Tatou Event Production Brussels','Tatou Event-Production','BE','https://www.tatouproduction.com/','tatouproduction.com','hello@tatouproduction.com','+3225208326',NULL::text,'Brussels','Brussels','Brussels','BE',50.85,4.35,'Event production & staffing — Brussels (10+ yrs)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels EVENTS QBAR R3',v_evt)
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
        OR (r.email IS NOT NULL AND o.primary_email = r.email)
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
      r.website_url, r.website_domain, r.email, r.phone, r.whatsapp,
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
  RAISE NOTICE 'EU ME quality-bar R3: inserted=% skipped=%', inserted, skipped;
END $$;
