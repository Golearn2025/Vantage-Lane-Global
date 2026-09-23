-- Coverage R5: CH/AT/BE remaining gaps → ~4–5 (Brussels CONCIERGE priority).
-- EMAIL required; PHONE when public; WhatsApp optional (never invent from landline).
-- Established firms only; ratings only when verified; PRIVATE_AVIATION not AVIATION.
-- Domain NULL on multi-city brand desks to avoid cross-city domain dedupe.

DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_yacht uuid := '443ac19c-9b4b-4277-9531-e52d6163cb6a';
  v_sec  uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_av   uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- Brussels CONCIERGE (1 → ~4) — priority
    ('Admire DMC Brussels','@dmire BV','BE','https://www.admire.be/','admire.be','events@admire.be','+3223616559',NULL::text,'Beersel HQ','Brussels','Brussels','BE',50.75,4.30,'Gemeenveldstraat 93, 1652 Beersel (Alsemberg) — DMC since 1978',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels CONCIERGE R5',v_conc),
    ('ZOYO Travel Brussels','ZOYO Travel Belgium','BE','https://dmc-belgium.eu/','zoyotravel.be','info@zoyotravel.be','+31202447661','+31645070468','Rue de la Presse','Brussels','Brussels','BE',50.850,4.356,'Rue de la Presse 4, 1000 Brussels (est. 2014)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels CONCIERGE R5',v_conc),
    ('The Lifestyle Manager Belgium','The Lifestyle Manager','BE','https://thelifestylemanager.be/en/welcome/','thelifestylemanager.be','team@thelifestylemanager.be','+3250960358',NULL::text,'Belgium / Brussels desk','Brussels','Brussels','BE',50.85,4.35,'Private concierge since 2012 — Antwerp, Brussels, Ghent, Knokke programmes',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels CONCIERGE R5',v_conc),

    -- Vienna PRIVATE_AVIATION (2 → ~5)
    ('Vienna Airport FBO','Vienna Airport FBO GmbH','AT','https://viennaairport-fbo.com/en/','viennaairport-fbo.com','fbo@viennaairport.com','+431700722204',NULL::text,'Vienna Airport GAT','Vienna','Vienna','AT',48.110,16.570,'Niki Lauda Allee Object 140, 1300 Vienna-Airport',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna PRIVATE_AVIATION R5',v_av),
    ('Sparfell Vienna Charter','SPARFELL Luftfahrt GmbH','AT','https://www.sparfell.aero/contact/',NULL::text,'charter.vienna@sparfell.aero','+431707009016',NULL::text,'General Aviation Terminal','Vienna','Vienna','AT',48.110,16.570,'Niki Lauda Allee 1, 1300 Vienna Airport',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna PRIVATE_AVIATION R5',v_av),
    ('GlobeAir Austria Vienna','GlobeAir AG','AT','https://www.globeair.com/contact','globeair.com','customercare@globeair.com','+437221727400','+437221727400','Austria / VIE programme','Vienna','Vienna','AT',48.21,16.37,'Polytec-Straße 1, 4063 Hörsching — on-demand charter serving VIE (est. Austrian operator)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna PRIVATE_AVIATION R5',v_av),

    -- Vienna YACHT (2 → ~4)
    ('Moremann Charter Vienna','Moremann Charter GmbH','AT','https://moremann.at/','moremann.at','office@moremann.at','+4313535999',NULL::text,'Haidingergasse','Vienna','Vienna','AT',48.195,16.395,'Haidingergasse 27, 1030 Vienna — premium skippered motor yachts',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna YACHT R5',v_yacht),
    ('Vienna Boat Charter','Vienna Boat Charter','AT','https://www.viennaboatcharter.at/en/','viennaboatcharter.at','office@viennaboatcharter.at','+436769290165','+436769290165','Danube Vienna','Vienna','Vienna','AT',48.23,16.40,'Skippered & bareboat motorboat charter on the Danube — Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna YACHT R5',v_yacht),

    -- Geneva CONCIERGE (3 → ~5)
    ('Le Bureau Concierge Geneva','Le Bureau','CH','https://www.le-bureau.ch/','le-bureau.ch','lifestyle@le-bureau.ch','+41227374160',NULL::text,'Chemin des Tulipiers','Geneva','Geneva','CH',46.196,6.168,'13 chemin des Tulipiers, 1208 Geneva (est. 2002)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva CONCIERGE R5',v_conc),
    ('BeSpoke Concierge Geneva','BeSpoke Concierge','CH','https://concierge-bespoke.com/en/about/','concierge-bespoke.com','info@concierge-bespoke.com','+41796391383','+41796391383','Rue de la Colline','Geneva','Geneva','CH',46.201,6.143,'Rue de la Colline 12, 1205 Geneva (est. 2013)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva CONCIERGE R5',v_conc),

    -- Geneva EVENTS (3 → ~5)
    ('NEPSA Geneva','New Events Production SA (NEPSA)','CH','https://www.nepsa.ch/','nepsa.ch','info@nepsa.ch','+41229391330',NULL::text,'Rue Rousseau','Geneva','Geneva','CH',46.209,6.146,'30 Rue Rousseau, 1201 Geneva (est. 1999)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva EVENTS R5',v_evt),
    ('RED ZONE Events Geneva','Red Zone','CH','https://www.redzone.ch/','redzone.ch','info@redzone.ch','+41227770070',NULL::text,'Avenue de Chatelaine','Geneva','Geneva','CH',46.210,6.120,'Avenue de Châtelaine 36, 1203 Geneva (est. 2002)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva EVENTS R5',v_evt),

    -- Geneva SECURITY (3 → ~4)
    ('Bodyguard Prestige Securite Geneva','Bodyguard Prestige Sécurité','CH','https://www.bodyguard-prestige.ch/en/home/','bodyguard-prestige.ch','contact@bodyguard-prestige.ch','+41228498557','+41792381045','Route de Jussy','Geneva','Geneva','CH',46.198,6.200,'Route de Jussy 35, 1226 Thônex — 30+ years private & event security',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva SECURITY R5',v_sec),

    -- Geneva PRIVATE_AVIATION (3 → ~5); domain NULL for multi-city brands
    ('Sparfell Geneva Charter','SPARFELL Airways SA','CH','https://www.sparfell.aero/contact/',NULL::text,'charter.geneva@sparfell.aero','+41227071927',NULL::text,'Terminal C3','Geneva','Geneva','CH',46.238,6.109,'18 chemin des Papillons, 1215 Geneva Airport',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva PRIVATE_AVIATION R5',v_av),
    ('LunaJets Geneva','LunaJets SA','CH','https://www.lunajets.com/en/contact-us/geneva-switzerland',NULL::text,'geneva@lunajets.com','+41227821212',NULL::text,'Geneva Airport HQ','Geneva','Geneva','CH',46.238,6.109,'Geneva Airport area HQ — 24/7 private jet charter',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva PRIVATE_AVIATION R5',v_av),

    -- Geneva YACHT (3 → ~5)
    ('Privilege Yachting Geneva','Privilège Yachting','CH','https://www.privilegeyachting.com/','privilegeyachting.com','info@privilegeyachting.com','+41227383366',NULL::text,'Rue Richemont','Geneva','Geneva','CH',46.210,6.145,'4 Rue Richemont, 1202 Geneva — private Lake Geneva cruises',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva YACHT R5',v_yacht),
    ('Les Corsaires Geneva','Les Corsaires','CH','https://www.lescorsaires.ch/en','lescorsaires.ch','info@lescorsaires.ch','+41227354300',NULL::text,'Quai Gustave-Ador','Geneva','Geneva','CH',46.204,6.165,'Quai Gustave-Ador 33, 1207 Geneva — boat rental & sailing',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva YACHT R5',v_yacht),

    -- Zurich HOSPITALITY (3 → ~5)
    ('La Reserve Eden au Lac Zurich','La Réserve Eden au Lac Zurich','CH','https://www.lareserve-zurich.com/','lareserve-zurich.com','info@lareserve-zurich.com','+41442662525',NULL::text,'Utoquai','Zurich','Zurich','CH',47.361,8.548,'Utoquai 45, 8008 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich HOSPITALITY R5',v_hosp),
    ('Widder Hotel Zurich','Widder Hotel','CH','https://www.widderhotel.com/en/corporate/contact-arrival/','widderhotel.com','home@widderhotel.com','+41442242526',NULL::text,'Rennweg','Zurich','Zurich','CH',47.373,8.539,'Rennweg 7, 8001 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich HOSPITALITY R5',v_hosp),

    -- Zurich YACHT (3 → ~4)
    ('ZSG Charter Zurich','Zürichsee-Schifffahrtsgesellschaft AG (ZSG)','CH','https://www.zsg.ch/de/gruppen-firmen/eventlocation-mieten/schiff-mieten/passendes-schiff','zsg.ch','schiffsmiete@zsg.ch','+41444871336',NULL::text,'Mythenquai','Zurich','Zurich','CH',47.354,8.536,'Mythenquai 333, 8038 Zurich — private ship charter & lake events',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich YACHT R5',v_yacht)
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
  RAISE NOTICE 'EU hubs R5 CH/AT/BE gaps: inserted=% skipped=%', inserted, skipped;
END $$;
