-- Coverage round 2 LEADs: Madrid SECURITY/HOSPITALITY/MEDICAL;
-- Amsterdam YACHT/SECURITY/HOSPITALITY/EVENTS; Zurich YACHT/SECURITY/CONCIERGE/MEDICAL;
-- Riyadh CONCIERGE/HOSPITALITY/EVENTS; Vienna/Brussels/Geneva expansion;
-- Dubai YACHT/EVENTS gap fill

DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_med  uuid := '19353c68-bed1-4625-a811-da4e2a2a2f42';
  v_yacht uuid := '443ac19c-9b4b-4277-9531-e52d6163cb6a';
  v_sec uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- Madrid SECURITY (3 → ~5+)
    ('Decysyon Madrid','decysyon / GrupoDC Solutions','ES','https://www.decysyon.com/','decysyon.com','info@decysyon.com',NULL::text,NULL::text,'Madrid HQ','Madrid','Madrid','ES',40.42,-3.70,'Madrid travel risk & executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid SECURITY R2',v_sec),
    ('Ibiza VIP Protection Madrid','Ibiza VIP Protection','ES','https://ibizavipprotection.com/','ibizavipprotection.com','madrid@ibizavipprotection.com','+34693584482','+34693584482','Madrid desk','Madrid','Madrid','ES',40.42,-3.70,'Madrid close protection desk',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid SECURITY R2',v_sec),

    -- Madrid HOSPITALITY (1 → ~4)
    ('Rosewood Villa Magna Madrid','Rosewood Villa Magna','ES','https://www.rosewoodhotels.com/en/villa-magna',NULL::text,'villamagna@rosewoodhotels.com','+34915871234',NULL::text,'Castellana','Madrid','Madrid','ES',40.430,-3.689,'Paseo de la Castellana 22, 28046 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid HOSPITALITY R2',v_hosp),
    ('Gran Hotel Ingles Madrid','Gran Hotel Inglés','ES','https://hiddenhotels.com/gran-hotel-ingles/','granhotelingles.com','welcome@granhotelingles.com','+34913600001',NULL::text,'Echegaray','Madrid','Madrid','ES',40.415,-3.700,'Calle de Echegaray 8, 28014 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid HOSPITALITY R2',v_hosp),
    ('Four Seasons Hotel Madrid','Four Seasons Hotel Madrid','ES','https://www.fourseasons.com/madrid/',NULL::text,NULL::text,'+34910880188',NULL::text,'Canalejas','Madrid','Madrid','ES',40.417,-3.700,'Calle de Sevilla 3, 28014 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid HOSPITALITY R2',v_hosp),

    -- Madrid MEDICAL (1 → ~3)
    ('CCS Medical Center Madrid','CCS Medical Center','ES','https://ccsmedicalcenter.com/','ccsmedicalcenter.com','info@ccsmedicalcenter.com',NULL::text,NULL::text,'Manoteras','Madrid','Madrid','ES',40.487,-3.666,'Avenida de Manoteras 42, Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid MEDICAL R2',v_med),
    ('Vithas International Madrid','Vithas International','ES','https://vithas.es/en/center/vithas-international/',NULL::text,'infomadrid@vithas.es','+34915905299',NULL::text,'Arturo Soria','Madrid','Madrid','ES',40.453,-3.650,'Calle Arturo Soria 107, 28043 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid MEDICAL R2',v_med),

    -- Amsterdam YACHT (2 → ~5)
    ('KINboat Amsterdam','KINboat','NL','https://kinboat.com/en/','kinboat.com','info@kinboat.com','+31202613466',NULL::text,'Prinsengracht','Amsterdam','North Holland','NL',52.364,4.890,'Prinsengracht 669, 1017 JT Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam YACHT R2',v_yacht),
    ('Amsterdam Private Boat','Amsterdam Private Boat / Boatboys','NL','https://www.amsterdamprivateboat.com/','amsterdamprivateboat.com','info@amsterdamprivateboat.com','+31645251000','+31645251000','Amsterdam canals','Amsterdam','North Holland','NL',52.37,4.89,'Private saloon boat charters — Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam YACHT R2',v_yacht),
    ('Mokumboot Amsterdam','Mokumboot','NL','https://mokumboot.nl/en/','mokumboot.nl','sales@mokumboot.nl','+31202105700',NULL::text,'Stationsplein','Amsterdam','North Holland','NL',52.379,4.900,'Stationsplein 28, Amsterdam Centraal',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam YACHT R2',v_yacht),

    -- Amsterdam SECURITY (2 → ~4)
    ('JK Royal Security Amsterdam','JK Royal Security','NL','https://www.jk-royalsecurity.com/','jk-royalsecurity.com','info@jk-royalsecurity.com','+31207718617',NULL::text,'Nieuw-West','Amsterdam','North Holland','NL',52.346,4.830,'Wilhelmina Druckerstraat 146, 1066 AA Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam SECURITY R2',v_sec),
    ('KDM Security Amsterdam','KDM Security','NL','https://www.kdm-security.nl/','kdm-security.nl','info@kdm-security.nl','+31208462723','+31625258676','Zuidoost','Amsterdam','North Holland','NL',52.316,4.975,'Kraailookstraat 9, 1104 KN Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam SECURITY R2',v_sec),

    -- Amsterdam HOSPITALITY (2 → ~4)
    ('Hotel de l Europe Amsterdam','Hotel de l''Europe Amsterdam','NL','https://www.deleurope.com/','deleurope.com','hotel@deleurope.com','+31205311777',NULL::text,'Nieuwe Doelenstraat','Amsterdam','North Holland','NL',52.367,4.895,'Nieuwe Doelenstraat 2-14, 1012 CP Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam HOSPITALITY R2',v_hosp),
    ('Pulitzer Amsterdam','Hotel Pulitzer Amsterdam','NL','https://www.pulitzeramsterdam.com/','pulitzeramsterdam.com','info@pulitzeramsterdam.com','+31205235235',NULL::text,'Prinsengracht','Amsterdam','North Holland','NL',52.373,4.884,'Prinsengracht 323, 1016 GZ Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam HOSPITALITY R2',v_hosp),

    -- Amsterdam MEDICAL (2 → ~4)
    ('DC Klinieken Amsterdam','DC Klinieken Amsterdam','NL','https://www.dcklinieken.nl/vestigingen/dc-klinieken-amsterdam/','dcklinieken.nl','amsterdam@dcklinieken.nl','+31880100900',NULL::text,'Tesselschadestraat','Amsterdam','North Holland','NL',52.362,4.876,'Tesselschadestraat 4, 1054 ET Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam MEDICAL R2',v_med),
    ('DC Klinieken Lairesse Amsterdam','DC Klinieken Lairesse','NL','https://www.dcklinieken.nl/vestigingen/dc-klinieken-lairesse/',NULL::text,'lairesse@dcklinieken.nl',NULL::text,NULL::text,'Valeriusplein','Amsterdam','North Holland','NL',52.353,4.866,'Valeriusplein 11, 1075 BG Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam MEDICAL R2',v_med),

    -- Amsterdam EVENTS (1 → ~3)
    ('TC Productions Amsterdam','TC Productions B.V.','NL','https://www.tc-eventproductions.com/','tc-eventproductions.com','info@tc-eventproductions.com','+31203086419',NULL::text,'Amsterdam','Amsterdam','North Holland','NL',52.37,4.89,'Corporate & brand event production — Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam EVENTS R2',v_evt),
    ('Dutch Standard Events Amsterdam','Dutch Standard Events','NL','https://www.dutchstandardevents.com/en','dutchstandardevents.com','hello@dutchstandardevents.com','+31202617673','+31202617673','Amsterdam','Amsterdam','North Holland','NL',52.37,4.89,'Corporate events & conferences — Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam EVENTS R2',v_evt),

    -- Zurich YACHT (1 → ~3)
    ('White Pearl Yachting Zurich','White Pearl AG','CH','https://www.white-pearl-yachting.ch/','white-pearl-yachting.ch','ahoy@white-pearl.team','+41443094046','+41443094046','Freigutstrasse','Zurich','Zurich','CH',47.370,8.533,'Freigutstrasse 27, 8002 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich YACHT R2',v_yacht),
    ('Ganz Boats Zurich','Ganz Yachting AG','CH','https://www.ganzboats.ch/','ganzboats.ch','info@ganzboats.ch','+41444227777',NULL::text,'Bellerivestrasse','Zurich','Zurich','CH',47.355,8.556,'Bellerivestrasse 264, 8008 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich YACHT R2',v_yacht),

    -- Zurich SECURITY (1 → ~5)
    ('DGProtection Zurich','DGP De Giorgi Protection GmbH','CH','https://dgprotection.ch/','dgprotection.ch','info@dgprotection.ch','+41445528395',NULL::text,'Stablistrasse','Zurich','Zurich','CH',47.385,8.540,'Stäblistrasse 2A, 8006 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich SECURITY R2',v_sec),
    ('Swiss Security Solutions Zurich','Swiss Security Solutions GmbH','CH','https://www.swiss-security-solutions.com/','swiss-security-solutions.com','info@swiss-security-solutions.com','+41445866033',NULL::text,'Schaffhauserstrasse','Zurich','Zurich','CH',47.410,8.540,'Schaffhauserstrasse 550, 8050 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich SECURITY R2',v_sec),
    ('HSG Switzerland Zurich','Helvetia Strategies Group GmbH','CH','https://hsg-switzerland.ch/','hsg-switzerland.ch','office@hsg-switzerland.ch','+41448253577',NULL::text,'Zurich area','Zurich','Zurich','CH',47.37,8.54,'Personenschutz & event security — Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich SECURITY R2',v_sec),
    ('Secure360 Zurich','Swiss Three Asset Management GmbH','CH','https://www.secure-360.com/','secure-360.com','mail@secure-360.com','+41445207628',NULL::text,'Horgen desk','Zurich','Zurich','CH',47.260,8.600,'Stockerstrasse 27, 8810 Horgen/Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich SECURITY R2',v_sec),

    -- Zurich CONCIERGE (1 → ~4)
    ('VELLA Luxury Services Zurich','VELLA Luxury Services','CH','https://vellaluxuryservices.ch/en/','vellaluxuryservices.ch','vip@vellaluxuryservices.ch','+41435431569','+41793887904','Gockhausen','Zurich','Zurich','CH',47.385,8.570,'Im Langstuck 16, 8044 Gockhausen Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich CONCIERGE R2',v_conc),
    ('Concierge Atelier Zurich','Concierge Atelier','CH','https://www.conciergeatelier.com/','conciergeatelier.com','info@conciergeatelier.com',NULL::text,NULL::text,'Alfred-Escher-Strasse','Zurich','Zurich','CH',47.365,8.533,'Alfred-Escher-Strasse 22, 8002 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich CONCIERGE R2',v_conc),
    ('Circle8 Zurich','Circle8','CH','https://circle8.ch/','circle8.ch','welcome@circle8.ch','+41445550888',NULL::text,'Zurich','Zurich','Zurich','CH',47.37,8.54,'Zurich lifestyle management & VIP travel',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich CONCIERGE R2',v_conc),

    -- Riyadh CONCIERGE (1 → ~5)
    ('Beyond Luxury Riyadh','Beyond Luxury','SA','https://beyondluxury.sa/','beyondluxury.sa','hello@beyondluxury.sa','+966556400231','+966556400231','Riyadh','Riyadh','Riyadh','SA',24.71,46.68,'PO Box 12642, Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH EU Riyadh CONCIERGE R2',v_conc),
    ('Selia Concierge Riyadh','Selia Concierge','SA','https://seliasa.com/','seliasa.com','info@seilasa.com','+966510010955','+966510010955','Riyadh','Riyadh','Riyadh','SA',24.71,46.68,'Riyadh restaurant & transport concierge',NULL::numeric,NULL::int,'WEB_RESEARCH EU Riyadh CONCIERGE R2',v_conc),
    ('Pristine Concierge Riyadh','Pristine Concierge','SA','https://www.pristineconcierge.com/','pristineconcierge.com','reservations@pristineconcierge.com','+966559459289','+966559459289','Alyasmine','Riyadh','Riyadh','SA',24.82,46.64,'13316 Abi Bakr Rd, Alyasmine Dist, Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH EU Riyadh CONCIERGE R2',v_conc),
    ('ACE Concierge Riyadh','ACE Concierge','SA','https://ace-concierge.com/','ace-concierge.com','bookings@ace-concierge.com','+966507570111','+966507570111','Riyadh','Riyadh','Riyadh','SA',24.71,46.68,'KSA lifestyle & travel concierge — Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH EU Riyadh CONCIERGE R2',v_conc),

    -- Riyadh HOSPITALITY (2 → ~3)
    ('Narcissus Hotel Riyadh','Narcissus Hotel & Spa Riyadh','SA','https://www.narcissusriyadh.com/','narcissusriyadh.com','dosm.riyadh@narcissushotels.com','+966112946300',NULL::text,'Riyadh','Riyadh','Riyadh','SA',24.70,46.68,'Riyadh meetings & hospitality',NULL::numeric,NULL::int,'WEB_RESEARCH EU Riyadh HOSPITALITY R2',v_hosp),

    -- Riyadh EVENTS (0 → ~2)
    ('Riyadh Home Events','Riyadh Home Company','SA','https://pub.riyadhome.com/','riyadhome.com','info@riyadhome.com','+966564878394','+966564878394','Masif','Riyadh','Riyadh','SA',24.75,46.70,'Healthcare conferences & VIP hospitality — Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH EU Riyadh EVENTS R2',v_evt),

    -- Vienna SECURITY / HOSPITALITY / MEDICAL / EVENTS starters → expansion
    ('MSS Maximum Security Vienna','MSS Maximum Security Services GmbH','AT','https://www.m-s-s.at/en/','m-s-s.at','office@m-s-s.at','+436648368621','+436648368621','Siebenbrunnengasse','Vienna','Vienna','AT',48.188,16.355,'Siebenbrunnengasse 28/2, 1050 Wien',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna SECURITY R2',v_sec),
    ('VIPROTECT Vienna','VIPROTECT GmbH','AT','https://viprotect.at/en/','viprotect.at','office@viprotect.at','+4366493139621','+4366493139621','Heiligenstadt','Vienna','Vienna','AT',48.250,16.360,'Heiligenstädter Straße 32/303, 1190 Wien',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna SECURITY R2',v_sec),
    ('Grand Hotel Wien','Grand Hotel Wien','AT','https://www.grandhotelwien.com/','grandhotelwien.com','sales@grandhotelwien.com','+431515800',NULL::text,'Ringstrasse','Vienna','Vienna','AT',48.203,16.372,'Kaerntner Ring 9, 1010 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna HOSPITALITY R2',v_hosp),
    ('Rosewood Vienna','Rosewood Vienna','AT','https://www.rosewoodhotels.com/en/vienna',NULL::text,'vienna.reservations@rosewoodhotels.com','+4317999888',NULL::text,'Petersplatz','Vienna','Vienna','AT',48.209,16.370,'Petersplatz 7, 1010 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna HOSPITALITY R2',v_hosp),
    ('Wiener Privatklinik','Wiener Privatklinik','AT','https://wiener-privatklinik.com/','wiener-privatklinik.com','info@wpk.at','+431401808700',NULL::text,'Pelikangasse','Vienna','Vienna','AT',48.218,16.348,'Pelikangasse 15, 1090 Wien',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna MEDICAL R2',v_med),
    ('OFF CONCEPTS Vienna','OFF CONCEPTS Live GmbH','AT','https://www.off-concepts.com/','off-concepts.com','office@off-concepts.com','+4313949493',NULL::text,'Palais Schonborn','Vienna','Vienna','AT',48.211,16.367,'Renngasse 4, Palais Schönborn, 1010 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna EVENTS R2',v_evt),
    ('Pro Event Vienna','Pro Event Team für Wien GmbH','AT','https://proevent.at/','proevent.at','office@proevent.at','+4315247094',NULL::text,'Windmuhlgasse','Vienna','Vienna','AT',48.198,16.352,'Windmühlgasse 26, 1060 Wien',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna EVENTS R2',v_evt),

    -- Brussels HOSPITALITY / SECURITY / MEDICAL / EVENTS / CONCIERGE
    ('Corinthia Brussels','Corinthia Brussels','BE','https://www.corinthia.com/en-gb/brussels/',NULL::text,'brussels@corinthia.com','+3225931000',NULL::text,'Rue Royale','Brussels','Brussels','BE',50.847,4.363,'Rue Royale 103, 1000 Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels HOSPITALITY R2',v_hosp),
    ('Warwick Brussels','Warwick Brussels Grand-Place','BE','https://www.warwickhotels.com/warwick-brussels',NULL::text,'info.warwickbrussels@warwickhotels.com','+3225055555',NULL::text,'Grand Place','Brussels','Brussels','BE',50.846,4.355,'Rue Duquesnoy 5, 1000 Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels HOSPITALITY R2',v_hosp),
    ('Le Plaza Brussels','Le Plaza Hotel Brussels','BE','https://www.leplaza-brussels.be/','leplaza.be','reservations@leplaza.be','+3222780100',NULL::text,'Adolphe Max','Brussels','Brussels','BE',50.854,4.354,'Boulevard Adolphe Max 118-126, 1000 Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels HOSPITALITY R2',v_hosp),
    ('SAFE-T FIRST Brussels','SAFE-T FIRST','BE','https://safe-tfirst.eu/en/','safe-tfirst.eu','info@safe-tfirst.eu','+3227631038','+32477446562','Woluwe','Brussels','Brussels','BE',50.840,4.430,'Avenue de l''Aquilon 15/1, 1200 Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels SECURITY R2',v_sec),
    ('European Security Brussels','European Private Security','BE','https://europeansecurity.eu/en/','europeansecurity.eu','info@europeansecurity.eu','+3223152240',NULL::text,'Molenbeek','Brussels','Brussels','BE',50.860,4.320,'46 Rue des Braves, 1081 Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels SECURITY R2',v_sec),
    ('EMS Medical Event Care Brussels','EMS Medical Event Care Belgium','BE','https://ems-belgium.be/','ems-belgium.be','event@medicaleventcare.be','+32479928602','+32479928602','Brussels','Brussels','Brussels','BE',50.85,4.35,'VIP & diplomatic event medical support — Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels MEDICAL R2',v_med),
    ('Luxury Event Brussels','Luxury Event','BE','https://www.luxuryevent.be/','luxuryevent.be','contact@luxuryevent.be','+32487102252','+32487102252','Brussels','Brussels','Brussels','BE',50.85,4.35,'Event production & security — Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels EVENTS R2',v_evt),

    -- Geneva HOSPITALITY / CONCIERGE / YACHT / SECURITY
    ('Beau-Rivage Geneva','Beau-Rivage Genève','CH','https://www.beau-rivage.com/','beau-rivage.com','reservation@beau-rivage.com','+41227166666',NULL::text,'Quai du Mont-Blanc','Geneva','Geneva','CH',46.209,6.150,'13 Quai du Mont-Blanc, 1201 Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva HOSPITALITY R2',v_hosp),
    ('613 Services Geneva','613 Services','CH','https://613services.com/en/','613services.com','info@613services.com','+41788794643','+41788794643','Cours de Rive','Geneva','Geneva','CH',46.202,6.155,'2 Cours de Rive, 1204 Geneve',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva CONCIERGE R2',v_conc),
    ('SPI Concierge Geneva','Swiss Private International','CH','https://spi.lc/','spi.lc','concierge@spi.lc','+41587767770',NULL::text,'Geneva Airport','Geneva','Geneva','CH',46.238,6.109,'15 Route de l''Aeroport, 1215 Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva CONCIERGE R2',v_conc),
    ('Genevaboats','Genevaboats','CH','https://genevaboats.ch/','genevaboats.ch','info@genevaboats.com','+41791284000','+41791284000','Quai du Mont-Blanc','Geneva','Geneva','CH',46.209,6.151,'29 Quai du Mont-Blanc, Geneva',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva YACHT R2',v_yacht),
    ('FFGR Swiss Geneva','FFGR Swiss','CH','https://www.ffgrswiss.com/','ffgrswiss.com','contact@ffgrswiss.com','+33743461491','+33743461491','Geneva desk','Geneva','Geneva','CH',46.20,6.15,'Chauffeur, security & concierge — Geneva/Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva SECURITY R2',v_sec),

    -- Dubai YACHT / EVENTS (weak secondary)
    ('RSY Yachts Dubai','RSY Yachts','AE','https://rsyyachts.com/','rsyyachts.com','booking@rsyyachts.com','+971555786772','+971555786772','Al Raffa','Dubai','Dubai','AE',25.253,55.286,'Office M-10, FNC Building, Al Raffa, Bur Dubai',NULL::numeric,NULL::int,'WEB_RESEARCH EU Dubai YACHT R2',v_yacht),
    ('Odyssia Dubai','Odyssia','AE','https://odyssia.ae/','odyssia.ae','amckay@odyssia.ae','+971557702406','+971557702406','Dubai','Dubai','Dubai','AE',25.20,55.27,'Superyacht event experiences — Dubai',NULL::numeric,NULL::int,'WEB_RESEARCH EU Dubai EVENTS R2',v_evt),
    ('Bella Entertainment Dubai','Bella Entertainment','AE','https://www.bella-entertainment.com/','bella-entertainment.com','info@bella-entertainment.com','+971504984661','+971505417318','Dubai','Dubai','Dubai','AE',25.20,55.27,'Corporate yacht events & entertainment — Dubai',NULL::numeric,NULL::int,'WEB_RESEARCH EU Dubai EVENTS R2',v_evt)
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
  RAISE NOTICE 'EU ME coverage R2: inserted=% skipped=%', inserted, skipped;
END $$;
