-- Gap-fill LEADs: Madrid SECURITY/EVENTS; Amsterdam CONCIERGE/MEDICAL/SECURITY/YACHT;
-- Zurich HOSPITALITY/MEDICAL/EVENTS/YACHT; Dubai HOSPITALITY/MEDICAL/CONCIERGE;
-- Riyadh HOSPITALITY/SECURITY/CONCIERGE; Vienna/Brussels/Geneva starters

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
    -- Madrid SECURITY
    ('ASYS Seguridad Madrid','ASYS Asistencia Seguridad y Servicios S.A.','ES','https://www.asys.es/','asys.es','asys@asys.es','+34914459869',NULL::text,'Chamberi','Madrid','Madrid','ES',40.43,-3.70,'Madrid, Spain',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid SECURITY',v_sec),
    ('BullSeguridad Madrid','BullSeguridad','ES','https://www.bullseguridad.es/','bullseguridad.es','info@bullseguridad.es','+34872987348',NULL::text,'Travesia de Tellez','Madrid','Madrid','ES',40.40,-3.68,'Travesia de Tellez 4, 28007 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid SECURITY',v_sec),
    ('USS Universal Security Madrid','Universal Security Solutions','ES','https://www.universalsecuritysolutions.com/','universalsecuritysolutions.com','universalsecuritysolutions@tunota.com','+34677358265','+34677358265','Orense','Madrid','Madrid','ES',40.45,-3.69,'Calle Orense 69, Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid SECURITY',v_sec),

    -- Madrid EVENTS
    ('Leclab Madrid','Leclab Madrid','ES','https://leclab.madrid/','leclab.madrid','eventos@leclab.madrid','+34915429589',NULL::text,'Ferraz','Madrid','Madrid','ES',40.425,-3.72,'Calle Ferraz 2, 28008 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid EVENTS',v_evt),
    ('Hub Madrid Events','Hub Madrid','ES','https://www.hub.madrid/','hub.madrid','info@hub.madrid','+34624648977','+34624648977','Sol','Madrid','Madrid','ES',40.416,-3.704,'Calle de Espoz y Mina 22, 28013 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid EVENTS',v_evt),
    ('Studio18 Madrid','Studio18 Madrid','ES','https://studio18.madrid/','studio18.madrid','info@studio18.madrid','+34685890682','+34685890682','Malasana','Madrid','Madrid','ES',40.425,-3.70,'28004 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid EVENTS',v_evt),
    ('Teatro Magno Madrid','Teatro Magno','ES','https://localesparaeventos.madrid/en/rent-venue/teatro-magno/','teatromagno.com','eventos@teatromagno.com','+34681966048','+34681966048','Centro','Madrid','Madrid','ES',40.418,-3.699,'C. del Marques de Casa Riera 1, 28014 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH EU Madrid EVENTS',v_evt),

    -- Amsterdam CONCIERGE
    ('Xupreme Amsterdam','Xupreme','NL','https://xupreme.amsterdam/en/','xupreme.amsterdam','contact@xupreme.amsterdam','+31207008306',NULL::text,'Amsterdam','Amsterdam','North Holland','NL',52.37,4.89,'Amsterdam, Netherlands',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam CONCIERGE',v_conc),
    ('Concierge Amsterdam','Concierge Amsterdam','NL','https://conciergeamsterdam.nl/','conciergeamsterdam.nl','hello@conciergeamsterdam.nl','+31653798277','+31653798277','Amsterdam','Amsterdam','North Holland','NL',52.37,4.89,'Amsterdam, Netherlands',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam CONCIERGE',v_conc),
    ('Call On Me Amsterdam','Call On Me','NL','https://callonme.amsterdam/en/','callonme.amsterdam','info@callonme.amsterdam','+31650980808','+31650980808','Amsterdam','Amsterdam','North Holland','NL',52.37,4.89,'Amsterdam lifestyle & property PA',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam CONCIERGE',v_conc),
    ('Ask James Amsterdam','Ask James Lifestyle Specialist','NL','https://askjames.nl/','askjames.nl','info@askjames.nl','+31631968331','+31631968331','Amsterdam','Amsterdam','North Holland','NL',52.37,4.89,'Amsterdam luxury lifestyle management',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam CONCIERGE',v_conc),

    -- Amsterdam MEDICAL
    ('Bergman Clinics Amsterdam','Bergman Clinics','NL','https://www.bergmanclinics.nl/','bergmanclinics.nl',NULL::text,'+31889000500',NULL::text,'Willemsparkweg','Amsterdam','North Holland','NL',52.355,4.875,'Willemsparkweg 142, 1071 HR Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam MEDICAL',v_med),
    ('OLVG Amsterdam','OLVG','NL','https://www.olvg.nl/','olvg.nl','info@olvg.nl','+31205999111',NULL::text,'Oosterpark','Amsterdam','North Holland','NL',52.358,4.919,'Oosterpark 9, 1091 AC Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam MEDICAL',v_med),
    ('Mandarin Oriental Conservatorium Amsterdam','Mandarin Oriental Conservatorium','NL','https://www.mandarinoriental.com/en/amsterdam/conservatorium',NULL::text,'moams-info@mohg.com','+31205700000',NULL::text,'Museumkwartier','Amsterdam','North Holland','NL',52.358,4.880,'Paulus Potterstraat 50, 1071 DB Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam HOSPITALITY',v_hosp),

    -- Amsterdam SECURITY
    ('Infinite Risks Amsterdam','Infinite Risks B.V.','NL','https://infiniterisks.nl/','infiniterisks.nl','contact@infiniterisks.nl','+31203011395',NULL::text,'Keizersgracht','Amsterdam','North Holland','NL',52.379,4.886,'Keizersgracht 62, 1015 CS Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam SECURITY',v_sec),
    ('IPS International Protection Amsterdam','International Protection Services BV','NL','https://internationalprotectionservices.com/','internationalprotectionservices.com',NULL::text,'+31208203257','+31611876948','Olympisch Stadion','Amsterdam','North Holland','NL',52.346,4.854,'Olympisch Stadion 24, 1076 DE Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam SECURITY',v_sec),

    -- Amsterdam YACHT
    ('Private Boat Amsterdam','Private Boat Amsterdam','NL','https://privateboat.amsterdam/en/','privateboat.amsterdam','info@privateboat.amsterdam','+31650243236','+31650243236','Prinsengracht','Amsterdam','North Holland','NL',52.375,4.883,'Egelantiersgracht 18-C, 1015 RL Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam YACHT',v_yacht),
    ('Amsterdam Yacht Consultancy','Amsterdam Yacht Consultancy','NL','https://amsterdamyachtconsultancy.nl/en/','amsterdamyachtconsultancy.nl','info@amsterdamyachtconsultancy.nl','+31203032160',NULL::text,'Kudelstaart','Amsterdam','North Holland','NL',52.23,4.75,'Kudelstaartseweg 228A, 1433 GR Kudelstaart',NULL::numeric,NULL::int,'WEB_RESEARCH EU Amsterdam YACHT',v_yacht),

    -- Zurich HOSPITALITY
    ('Baur au Lac Zurich','Baur au Lac','CH','https://www.bauraulac.ch/','bauraulac.ch','info@bauraulac.ch','+41442205020',NULL::text,'Talstrasse','Zurich','Zurich','CH',47.367,8.539,'Talstrasse 1, 8001 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich HOSPITALITY',v_hosp),
    ('The Dolder Grand Zurich','The Dolder Grand','CH','https://www.thedoldergrand.com/','thedoldergrand.com','info@thedoldergrand.com','+41444566000',NULL::text,'Adlisberg','Zurich','Zurich','CH',47.373,8.573,'Kurhausstrasse 65, 8032 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich HOSPITALITY',v_hosp),
    ('FIVE Zurich','FIVE Zurich','CH','https://zurich.fivehotelsandresorts.com/',NULL::text,'fivezurich@fivehotelsandresorts.com','+41444565555',NULL::text,'Doltschiweg','Zurich','Zurich','CH',47.353,8.508,'Doltschiweg 234, 8055 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich HOSPITALITY',v_hosp),

    -- Zurich MEDICAL
    ('Klinik Hirslanden Zurich','Klinik Hirslanden','CH','https://www.hirslanden.ch/en/klinik-hirslanden/contact.html',NULL::text,'klinik-hirslanden@hirslanden.ch','+41443872111',NULL::text,'Witellikerstrasse','Zurich','Zurich','CH',47.350,8.568,'Witellikerstrasse 40, 8032 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich MEDICAL',v_med),
    ('Grand M Zurich','Grand M','CH','https://www.grandm.ch/','grandm.ch','info@grandm.ch','+41768232080','+41768232080','Mainaustrasse','Zurich','Zurich','CH',47.360,8.554,'Mainaustrasse 21, 8008 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich MEDICAL',v_med),

    -- Zurich EVENTS
    ('Eventfaszination Zurich','Eventfaszination / TIT-PIT GmbH','CH','https://eventfaszination.ch/','eventfaszination.ch','info@eventfaszination.ch','+41449565833',NULL::text,'Fehraltorf desk','Zurich','Zurich','CH',47.39,8.75,'Undermulistrasse 28, CH-8320 Fehraltorf',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich EVENTS',v_evt),
    ('Carre Event Zurich','Carre Event AG','CH','https://www.carre.ch/','carre.ch','info@carre.ch','+41443154020',NULL::text,'Dufourstrasse','Zurich','Zurich','CH',47.363,8.552,'Dufourstrasse 101, 8008 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich EVENTS',v_evt),
    ('Nerves Agency Zurich','Nerves','CH','https://nerves.ch/','nerves.ch','events@nerves.ch','+41445520044',NULL::text,'Raffelstrasse','Zurich','Zurich','CH',47.361,8.513,'Raffelstrasse 24, 8045 Zurich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich EVENTS',v_evt),
    ('Urban Agency Events Zurich','Urban Agency Events AG','CH','https://urbanagency.ch/','urbanagency.ch','info@urbanagency.ch','+41797210861','+41797210861','Zurich','Zurich','Zurich','CH',47.37,8.54,'Zurich, Switzerland',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich EVENTS',v_evt),

    -- Zurich YACHT
    ('Boat Charter Zurich','Boat Charter Zurich','CH','https://boatcharterzurich.ch/en/','boatcharterzurich.ch','mail@boatcharterzurich.ch',NULL::text,NULL::text,'Lake Zurich','Zurich','Zurich','CH',47.36,8.55,'Lake Zurich motor yacht charter',NULL::numeric,NULL::int,'WEB_RESEARCH EU Zurich YACHT',v_yacht),

    -- Dubai HOSPITALITY
    ('Burj Al Arab Jumeirah','Burj Al Arab Jumeirah','AE','https://www.jumeirah.com/en/stay/dubai/burj-al-arab-jumeirah',NULL::text,'baainfo@jumeirah.com','+97143017777',NULL::text,'Umm Suqeim','Dubai','Dubai','AE',25.141,55.185,'Umm Suqeim 3, Dubai',NULL::numeric,NULL::int,'WEB_RESEARCH EU Dubai HOSPITALITY',v_hosp),
    ('One and Only Royal Mirage Dubai','One&Only Royal Mirage','AE','https://www.oneandonlyresorts.com/royal-mirage',NULL::text,'info@oneandonlyroyalmirage.ae','+97143999999',NULL::text,'Jumeirah','Dubai','Dubai','AE',25.093,55.138,'PO Box 37252, Dubai',NULL::numeric,NULL::int,'WEB_RESEARCH EU Dubai HOSPITALITY',v_hosp),

    -- Dubai MEDICAL
    ('American Hospital Dubai','American Hospital Dubai','AE','https://www.ahdubai.com/','ahdubai.com','info@ahdubai.com','+97143775500',NULL::text,'Oud Metha','Dubai','Dubai','AE',25.235,55.320,'15th St, Oud Metha, Dubai',NULL::numeric,NULL::int,'WEB_RESEARCH EU Dubai MEDICAL',v_med),
    ('Mediclinic City Hospital Dubai','Mediclinic City Hospital','AE','https://www.mediclinic.ae/en/city-hospital/',NULL::text,'cityhospital@mediclinic.ae','+97144359900',NULL::text,'Dubai Healthcare City','Dubai','Dubai','AE',25.232,55.324,'Dubai Healthcare City, Bldg 37',NULL::numeric,NULL::int,'WEB_RESEARCH EU Dubai MEDICAL',v_med),
    ('Emirates Specialty Hospital Dubai','Emirates Specialty Hospital','AE','https://www.eshospital.com/','eshospital.com','esh.info@emirateshospital.ae','+97142484500',NULL::text,'Dubai Healthcare City','Dubai','Dubai','AE',25.233,55.325,'Building 62, Dubai Healthcare City',NULL::numeric,NULL::int,'WEB_RESEARCH EU Dubai MEDICAL',v_med),

    -- Dubai CONCIERGE
    ('Le Concierge Dubai','Le Concierge','AE','https://leconcierge.ae/','leconcierge.ae','hello@leconcierge.ae','+97145588149',NULL::text,'Business Bay','Dubai','Dubai','AE',25.186,55.274,'Office 4503, Ubora Tower, Business Bay',NULL::numeric,NULL::int,'WEB_RESEARCH EU Dubai CONCIERGE',v_conc),
    ('Leader Concierge Dubai','Leader Concierge','AE','https://www.leaderconcierge.com/','leaderconcierge.com','info@leaderconcierge.com','+971585525330','+971585525330','Silicon Oasis','Dubai','Dubai','AE',25.122,55.387,'Building A1, Dubai Digital Park',NULL::numeric,NULL::int,'WEB_RESEARCH EU Dubai CONCIERGE',v_conc),

    -- Riyadh HOSPITALITY
    ('Four Seasons Hotel Riyadh','Four Seasons Hotel Riyadh','SA','https://www.fourseasons.com/riyadh/',NULL::text,'reservations.riy@fourseasons.com','+966112115000',NULL::text,'Kingdom Centre','Riyadh','Riyadh','SA',24.711,46.674,'Kingdom Centre, Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH EU Riyadh HOSPITALITY',v_hosp),
    ('The Ritz-Carlton Riyadh','The Ritz-Carlton Riyadh','SA','https://www.ritzcarlton.com/en/hotels/ruhrz-the-ritz-carlton-riyadh/overview/',NULL::text,NULL::text,'+966118028020',NULL::text,'Al Hada','Riyadh','Riyadh','SA',24.665,46.629,'AlHada Area, Mekkah Road, Riyadh 11493',NULL::numeric,NULL::int,'WEB_RESEARCH EU Riyadh HOSPITALITY',v_hosp),

    -- Riyadh SECURITY
    ('City Security Riyadh','City Security Company','SA','https://citysecuritysa.com/','citysecuritysa.com','info@citysecuritysa.com','+966539664165','+966539664165','Al Aziziyah','Riyadh','Riyadh','SA',24.65,46.70,'Riyadh VIP & hotel security',NULL::numeric,NULL::int,'WEB_RESEARCH EU Riyadh SECURITY',v_sec),
    ('ETH Security Services Riyadh','ETH Security Services Co. Ltd','SA','https://ethssc.com/','ethssc.com','info@ethssc.com','+966112196890','+966557860001','Al Sulaymaniyah','Riyadh','Riyadh','SA',24.70,46.70,'Riyadh executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH EU Riyadh SECURITY',v_sec),
    ('Amnalawtan Security Riyadh','Amnalawtan Security','SA','https://amnalawtan.com/','amnalawtan.com','contact@amnalawtan.com','+966570060044','+966570060044','Riyadh','Riyadh','Riyadh','SA',24.71,46.68,'Private security guards — Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH EU Riyadh SECURITY',v_sec),

    -- Riyadh CONCIERGE
    ('Wosol Concierge Riyadh','Wosol Concierge','SA','https://wosolconcierge.com/en/','wosolconcierge.com','info@wosolconcierge.com','+966500009979','+966500009979','King Abdulaziz Rd','Riyadh','Riyadh','SA',24.75,46.70,'King Abdulaziz Rd, Riyadh 13315',NULL::numeric,NULL::int,'WEB_RESEARCH EU Riyadh CONCIERGE',v_conc),

    -- Vienna / Brussels / Geneva starters
    ('Vienna Tailored Concierge','Vienna Tailored Concierge','AT','https://viennaconcierge.com/','viennaconcierge.com','support@viennaconcierge.com','+436645078187','+436645078187','Vienna','Vienna','Vienna','AT',48.21,16.37,'Vienna, Austria',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna CONCIERGE',v_conc),
    ('Hotel Amigo Brussels','Hotel Amigo','BE','https://www.roccofortehotels.com/hotels-and-resorts/hotel-amigo/',NULL::text,'reservations.amigo@roccofortehotels.com','+3225474747',NULL::text,'Grand Place','Brussels','Brussels','BE',50.846,4.352,'Rue de l''Amigo 1-3, 1000 Brussels',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels HOSPITALITY',v_hosp),
    ('Clinique Generale-Beaulieu Geneva','Clinique Generale-Beaulieu','CH','https://www.swissmedical.net/en/hospitals/generale-beaulieu/contact',NULL::text,'info@beaulieu.ch','+41228395555',NULL::text,'Champel','Geneva','Geneva','CH',46.193,6.156,'Chemin de Beau-Soleil 20, 1206 Geneve',NULL::numeric,NULL::int,'WEB_RESEARCH EU Geneva MEDICAL',v_med)
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
  RAISE NOTICE 'EU ME gap-fill: inserted=% skipped=%', inserted, skipped;
END $$;
