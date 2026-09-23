-- Coverage R4: Zurich/Geneva/Vienna/Brussels thin services → ~4–5 each.
-- EMAIL required; PHONE when public; WhatsApp optional (never invent from landline).
-- Established firms only; ratings only when verified; PRIVATE_AVIATION not AVIATION.

DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_med  uuid := '19353c68-bed1-4625-a811-da4e2a2a2f42';
  v_yacht uuid := '443ac19c-9b4b-4277-9531-e52d6163cb6a';
  v_sec  uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_av   uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035';
  v_gt   uuid := 'a44149dd-e4b3-4e32-8074-ad1248f27521';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- Zurich MEDICAL (4 → ~5)
    ('Klinik Pyramide am See Zurich','Klinik Pyramide am See AG','CH','https://www.pyramide.ch/','pyramide.ch','info@pyramide.ch','+41443881515',NULL::text,'Bellerivestrasse','Zurich','Zurich','CH',47.357,8.555,'Bellerivestrasse 34, 8034 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich MEDICAL R4',v_med),

    -- Zurich PRIVATE_AVIATION (4 → ~5+)
    ('AMAC Corporate Jet Zurich','AMAC Corporate Jet AG','CH','https://www.amacaerospace.com/aircraft-management-charter-request/','amacaerospace.com','charter@amacaerospace.com','+41583103232',NULL::text,'Kloten','Zurich','Zurich','CH',47.458,8.555,'Schaffhauserstrasse 123, 8302 Kloten-Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich PRIVATE_AVIATION R4',v_av),
    ('Cat Aviation Zurich','Cat Aviation AG','CH','https://www.cat-aviation.com/','cat-aviation.com','info@cat-aviation.com','+41448140066',NULL::text,'Zurich Airport','Zurich','Zurich','CH',47.458,8.555,'Postfach 2223, 8060 Zurich-Flughafen',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich PRIVATE_AVIATION R4',v_av),
    ('Nomad Aviation Zurich','Nomad Aviation AG','CH','https://www.nomadjet.com/','nomadjet.eu','fly@nomadjet.eu','+41588000800',NULL::text,'Kloten','Zurich','Zurich','CH',47.450,8.560,'Lindenstrasse 23, 8302 Kloten',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich PRIVATE_AVIATION R4',v_av),

    -- Geneva HOSPITALITY (3 → ~5)
    ('Mandarin Oriental Geneva','Mandarin Oriental, Geneva','CH','https://www.mandarinoriental.com/en/geneva/rhone-river/',NULL::text,'mogva-reservations@mohg.com','+41229090000',NULL::text,'Quai Turrettini','Geneva','Geneva','CH',46.206,6.141,'Quai Turrettini 1, 1201 Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva HOSPITALITY R4',v_hosp),
    ('Hotel President Wilson Geneva','Hotel President Wilson, A Luxury Collection Hotel','CH','https://www.marriott.com/en-us/hotels/gvalc-hotel-president-wilson-a-luxury-collection-hotel-geneva/','hotelpwilson.com','resa@hotelpwilson.com','+41229066666',NULL::text,'Quai Wilson','Geneva','Geneva','CH',46.211,6.151,'47 Quai Wilson, 1211 Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva HOSPITALITY R4',v_hosp),

    -- Geneva MEDICAL (2 → ~4–5)
    ('Clinique La Colline Geneva','Hirslanden Clinique La Colline','CH','https://www.hirslanden.ch/en/clinique-la-colline/home.html',NULL::text,'info.lacolline@hirslanden.ch','+41227022022',NULL::text,'Champel','Geneva','Geneva','CH',46.192,6.154,'Avenue de Beau-Séjour 6, 1206 Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva MEDICAL R4',v_med),
    ('Genolier Patient Services Geneva','Genolier Patient Services','CH','https://genolier-patient-services.com/',NULL::text,'gps@swissmedical.net','+41223669428',NULL::text,'Geneva / Genolier','Geneva','Geneva','CH',46.20,6.15,'International patient coordination — Geneva network clinics',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva MEDICAL R4',v_med),

    -- Geneva CONCIERGE (2 → ~4)
    ('Empire Rent Concierge Geneva','Empire Rent','CH','https://www.empire-rent.ch/concierge','empire-rent.ch','contact@empire-rent.ch','+41788857272','+41788857272','Geneva','Geneva','Geneva','CH',46.20,6.15,'Luxury concierge, hotels, jets & security — Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva CONCIERGE R4',v_conc),

    -- Geneva EVENTS (0 → ~4–5)
    ('Vitalis Events Geneva','Vitalis Events SA','CH','https://vitalis-events.com/','vitalis-events.com','welcome@vitalis-events.com','+41225190800',NULL::text,'Pont-Rouge','Geneva','Geneva','CH',46.185,6.125,'Esplanade de Pont-Rouge 6, 1212 Geneva (est. 2003)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva EVENTS R4',v_evt),
    ('MICE Spirit Geneva','M.I.C.E. Spirit','CH','https://mice-spirit.com/','mice-spirit.com','info@mice-spirit.com','+41783026640','+41783026640','Geneva','Geneva','Geneva','CH',46.20,6.15,'Corporate MICE, seminars & incentives — Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva EVENTS R4',v_evt),
    ('KITES International Events Geneva','Kites International Sàrl','CH','https://kites-events.agency/','kites-events.agency','info@kites-events.agency','+41792006574','+41792006574','Lake Geneva desk','Geneva','Geneva','CH',46.20,6.15,'Corporate conferences & incentives — Geneva/Lausanne (est. 2001)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva EVENTS R4',v_evt),

    -- Geneva YACHT (1 → ~4)
    ('Swissboat Geneva','Swissboat','CH','https://swissboat.com/','swissboat.com','info@swissboat.com','+41227324747',NULL::text,'Quai du Mont-Blanc','Geneva','Geneva','CH',46.209,6.150,'4 Quai du Mont-Blanc, 1201 Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva YACHT R4',v_yacht),
    ('CGN Exclusive Geneva','CGN SA','CH','https://www.cgn.ch/en/cgn-exclusive','cgn.ch','exclusive@cgn.ch','+41848811848',NULL::text,'Quai du Mont-Blanc','Geneva','Geneva','CH',46.209,6.150,'Private boat charter & lake events — Geneva ports',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva YACHT R4',v_yacht),

    -- Geneva PRIVATE_AVIATION (1 → ~4)
    ('Jet Aviation Geneva Charter','Jet Aviation Business Jets AG','CH','https://www.jetaviation.com/location/geneva/',NULL::text,'charter.geneva@jetaviation.ch','+41581581900',NULL::text,'Geneva Airport','Geneva','Geneva','CH',46.238,6.109,'P.O. Box 476, 1215 Geneva Airport',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva PRIVATE_AVIATION R4',v_av),
    ('Signature Aviation Geneva','Signature Aviation','CH','https://www.signatureaviation.com/locations/gva',NULL::text,'gva@signatureaviation.com','+41228170123',NULL::text,'Terminal C3','Geneva','Geneva','CH',46.238,6.109,'Terminal C3, Chemin des Papillons 18, 1215 Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva PRIVATE_AVIATION R4',v_av),

    -- Geneva SECURITY (0 → ~4)
    ('Securitas Geneva','Securitas AG Direction régionale Genève','CH','https://www.securitas.ch/en/contact/',NULL::text,'geneve@securitas.ch','+41589102525',NULL::text,'Avenue du Mail','Geneva','Geneva','CH',46.199,6.140,'Avenue du Mail 22, 1205 Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva SECURITY R4',v_sec),
    ('Protectas Aviation Security Geneva','Protectas Aviation Security AG','CH','https://protectas-aviation-security.ch/en/contact','protectas-aviation-security.ch','gva.aviation@protectas.com','+41581230110',NULL::text,'Geneva Airport','Geneva','Geneva','CH',46.232,6.110,'Route de Pré-Bois 17, 1215 Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva SECURITY R4',v_sec),
    ('FFGR Swiss Geneva','FFGR Swiss','CH','https://www.ffgrswiss.com/','ffgrswiss.com','contact@ffgrswiss.com','+33743461491',NULL::text,'Geneva desk','Geneva','Geneva','CH',46.20,6.15,'Chauffeur, security & concierge — Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva SECURITY R4',v_sec),

    -- Vienna CONCIERGE (2 → ~4–5)
    ('F5 Travel Concierge Vienna','F5 Travel & Concierge e.U.','AT','https://www.f5travel.eu/','f5travel.eu','hello@f5travel.eu','+436641414019','+436641414019','Schiffmuhlenstrasse','Vienna','Vienna','AT',48.230,16.440,'Schiffmühlenstrasse 53/3/25, 1220 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna CONCIERGE R4',v_conc),
    ('Krenn Events Concierge Vienna','VK Events / Krenn Concierge','AT','https://concierge.krenn-events.com/','vk-events.com','concierge@vk-events.com','+436646365556','+436646365556','Vienna','Vienna','Vienna','AT',48.21,16.37,'VIP lifestyle & event concierge — Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna CONCIERGE R4',v_conc),

    -- Vienna HOSPITALITY (3 → ~5)
    ('Hotel Imperial Vienna','Hotel Imperial, a Luxury Collection Hotel','AT','https://www.marriott.com/en-us/hotels/vieli-hotel-imperial-a-luxury-collection-hotel-vienna/',NULL::text,'hotel.imperial@luxurycollection.com','+431501100',NULL::text,'Kaerntner Ring','Vienna','Vienna','AT',48.201,16.372,'Kaerntner Ring 16, 1010 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna HOSPITALITY R4',v_hosp),
    ('Hotel Bristol Vienna','Hotel Bristol, a Luxury Collection Hotel','AT','https://www.marriott.com/en-us/hotels/viebr-hotel-bristol-a-luxury-collection-hotel-vienna/',NULL::text,'hotel.bristol@luxurycollection.com','+431515160',NULL::text,'Kaerntner Ring','Vienna','Vienna','AT',48.203,16.370,'Kaerntner Ring 1, 1010 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna HOSPITALITY R4',v_hosp),

    -- Vienna MEDICAL (2 → ~4–5)
    ('Privatklinik Doebling Vienna','Privatklinik Döbling','AT','https://www.privatklinik-doebling.at/','pkd.at','privatklinik@pkd.at','+431360660',NULL::text,'Heiligenstaedter Strasse','Vienna','Vienna','AT',48.248,16.357,'Heiligenstädter Straße 55-65, 1190 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna MEDICAL R4',v_med),
    ('Confraternitaet Goldenes Kreuz Vienna','Mavie Med Privatkliniken — Confraternität & Goldenes Kreuz','AT','https://www.confraternitaet-goldenes-kreuz.at/','pkcgk.at','info@pkcgk.at','+431401110',NULL::text,'Lazarettgasse','Vienna','Vienna','AT',48.219,16.348,'Lazarettgasse 16-18, 1090 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna MEDICAL R4',v_med),

    -- Vienna EVENTS (3 → ~5)
    ('Palais Events Vienna','Palais Events','AT','https://palaisevents.at/en/','palaisevents.at','office@palaisevents.at','+43153337630',NULL::text,'Herrengasse','Vienna','Vienna','AT',48.210,16.366,'Herrengasse 14, 1010 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna EVENTS R4',v_evt),

    -- Vienna SECURITY (3 → ~5)
    ('Halevi Partner Vienna','Halevi Partner GmbH','AT','https://halevipartner.com/en/','halevipartner.com','office@halevipartner.com','+436764415252','+436764415252','Rothergasse','Vienna','Vienna','AT',48.245,16.450,'Rothergasse 2, 1220 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna SECURITY R4',v_sec),

    -- Vienna PRIVATE_AVIATION (0 → ~4)
    ('Avcon Jet Vienna','Avcon Jet AG','AT','https://www.avconjet.com/','avconjet.at','office@avconjet.at','+43150547470',NULL::text,'Wohllebengasse','Vienna','Vienna','AT',48.195,16.375,'Wohllebengasse 12-14, 1040 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna PRIVATE_AVIATION R4',v_av),
    ('Jet Aviation Vienna FBO','Jet Aviation Vienna','AT','https://www.jetaviation.com/location/vienna/',NULL::text,'viefbo@jetaviation.com','+431700735609',NULL::text,'Vienna Airport','Vienna','Vienna','AT',48.110,16.570,'General Aviation Center, Steinriegelweg 1, 1300 Vienna-Airport',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna PRIVATE_AVIATION R4',v_av),

    -- Vienna YACHT (0 → ~3–4)
    ('Avcon Yacht Vienna','Avcon Yacht GmbH','AT','https://www.avconyacht.at/','avconyacht.com','office@avconyacht.com','+4313564747',NULL::text,'Wohllebengasse','Vienna','Vienna','AT',48.195,16.375,'Wohllebengasse 12-14, 1040 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna YACHT R4',v_yacht),
    ('DDSG Blue Danube Charter Vienna','DDSG Blue Danube Schiffahrt GmbH','AT','https://ddsg-blue-danube.at/','ddsg-blue-danube.at','charter@ddsg-blue-danube.at','+43158880442',NULL::text,'Handelskai','Vienna','Vienna','AT',48.226,16.410,'Handelskai 265, 1020 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna YACHT R4',v_yacht),

    -- Vienna GT
    ('BB Premium Driver Vienna','B&B Premium Driver Service','AT','https://premiumdriver.at/en/','premiumdriver.at','office@premiumdriver.at','+4366488617405','+4366488617405','Vienna','Vienna','Vienna','AT',48.21,16.37,'Mercedes chauffeur & VIP transfers — Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna GT R4',v_gt),
    ('Vienna Private Driver','Vienna Private Driver','AT','https://vienna-private-driver.com/','vienna-private-driver.com','info@vienna-private-driver.com','+436602077992','+436602077992','Vienna','Vienna','Vienna','AT',48.21,16.37,'Luxury chauffeur & airport transfers — Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna GT R4',v_gt),

    -- Brussels MEDICAL (2 → ~4–5)
    ('CHIREC Delta International Brussels','CHIREC — International Patients Unit (Delta Hospital)','BE','https://www.chirec.be/en/international-patients','chirec.be','patients.international@chirec.be','+3224345551',NULL::text,'Delta Hospital','Brussels','Brussels','BE',50.813,4.400,'Boulevard du Triomphe 201, 1160 Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels MEDICAL R4',v_med),
    ('Betamedics Belgium','Betamedics nv/sa','BE','https://betamedics.com/en','betamedics.com','info@betamedics.com','+3251676760',NULL::text,'Belgium medical desk','Brussels','Brussels','BE',50.85,4.35,'Premium medical coordination for Belgian clinics — Brussels programmes',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels MEDICAL R4',v_med),

    -- Brussels EVENTS (3 → ~5)
    ('Square Brussels Convention Centre','SQUARE — GL events Brussels','BE','https://square-brussels.com/','square-brussels.com','info@square-brussels.com','+3225151300',NULL::text,'Mont des Arts','Brussels','Brussels','BE',50.844,4.357,'Mont des Arts / Kunstberg, 1000 Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels EVENTS R4',v_evt),

    -- Brussels CONCIERGE (0 → ~3–4) — Luxentis primary B2B desk
    ('Luxentis DMC Brussels','Luxentis DMC','BE','https://luxentis.be/en/','luxentisdmc.com','contact@luxentisdmc.com','+32484168514','+32484168514','Brussels ops desk','Brussels','Brussels','BE',50.85,4.35,'B2B concierge, MICE & white-label DMC — Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels CONCIERGE R4',v_conc),

    -- Brussels SECURITY (2 → ~4)
    ('Securitas Belgium Brussels','Securitas NV/SA','BE','https://www.securitas.be/','securitas.be','info@securitas.be','+3222635555',NULL::text,'Sint Lendriksborre','Brussels','Brussels','BE',50.890,4.380,'Sint Lendriksborre 3, 1120 Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels SECURITY R4',v_sec),

    -- Brussels PRIVATE_AVIATION (0 → ~4); domain NULL to avoid cross-city FBO brand-domain dedupe
    ('ExecuJet Brussels FBO','ExecuJet Brussels','BE','https://www.execujet.com/locations/brussels-fbo-ebbr/',NULL::text,'fbo.ebbr@execujet.com','+3227205880',NULL::text,'Zaventem','Brussels','Brussels','BE',50.901,4.484,'Building 28, 1930 Zaventem / Brussels Airport',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels PRIVATE_AVIATION R4',v_av),
    ('AviaVIP Brussels FBO','AviaVIP Brussels','BE','https://aviavip.com/network/brussels-fbo/',NULL::text,'ebbr@aviavip.com','+3227230697',NULL::text,'Ringweg','Brussels','Brussels','BE',50.901,4.484,'Ringweg 36C, 1930 Zaventem',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels PRIVATE_AVIATION R4',v_av),
    ('ASL Group Belgium','ASL Group — Private Jet Services','BE','https://www.aslgroup.eu/','aslgroup.eu','sales@aslgroup.eu','+3211295016',NULL::text,'Belgium ops','Brussels','Brussels','BE',50.85,4.35,'Private jet charter, FBO & medical flights — Belgium (est. 1997)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels PRIVATE_AVIATION R4',v_av)
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
  RAISE NOTICE 'EU hubs R4 ZH/GVA/VIE/BRU: inserted=% skipped=%', inserted, skipped;
END $$;
