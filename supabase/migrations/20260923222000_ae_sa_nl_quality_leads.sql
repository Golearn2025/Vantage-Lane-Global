-- Quality LEADs: Dubai / Riyadh / Amsterdam gap fill
-- EMAIL required; phone when public; WhatsApp optional (not inferred from phone)
-- PRIVATE_AVIATION only (never AVIATION). Chain hotel domains left NULL to avoid collisions.

DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_med  uuid := '19353c68-bed1-4625-a811-da4e2a2a2f42';
  v_yacht uuid := '443ac19c-9b4b-4277-9531-e52d6163cb6a';
  v_sec uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_av uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035';
  v_gt uuid := 'a44149dd-e4b3-4e32-8074-ad1248f27521';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- ========== RIYADH MEDICAL (0 → ~4) ==========
    ('Dallah Hospital Riyadh','Dallah Healthcare Company','SA','https://www.dallah-hospital.com/','dallah-hospital.com','info@dallah-hospital.com','+966920012222',NULL::text,'Al Nakheel','Riyadh','Riyadh','SA',24.69,46.68,'Dallah Hospital, Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH SA Riyadh MEDICAL Q',v_med),
    ('Dr Soliman Fakeeh Hospital Riyadh','Dr. Soliman Fakeeh Hospital Riyadh','SA','https://en.dsfhriyadh.fakeeh.care/',NULL::text,'dsfhriyadh@fakeeh.care','+9668001209999',NULL::text,'Alyasmin','Riyadh','Riyadh','SA',24.82,46.64,'King Fahd Rd, Alyasmin, Riyadh 11564',NULL::numeric,NULL::int,'WEB_RESEARCH SA Riyadh MEDICAL Q',v_med),
    ('Kingdom Hospital Riyadh','Kingdom Hospital','SA','https://www.kingdomhospital.net/','kingdomhospital.net','info@khccgroup.com','+966112751111',NULL::text,'Al Rabie','Riyadh','Riyadh','SA',24.79,46.70,'Takkassosi St, Al Rabie, Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH SA Riyadh MEDICAL Q',v_med),
    ('Saudi German Hospital Riyadh','Saudi German Health / MEAHCO','SA','https://riyadh.saudigermanhealth.com/','saudigermanhealth.com','info@meahco.sa','+966920007997',NULL::text,'Press District','Riyadh','Riyadh','SA',24.71,46.68,'King Fahd Road, Press District, Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH SA Riyadh MEDICAL Q',v_med),

    -- ========== RIYADH EVENTS (1 → ~4) ==========
    ('Evolution Events Riyadh','Evolution Events KSA','SA','https://www.evolutionevents.sa/','evolutionevents.sa','hello@evolutionevents.sa','+966114504718',NULL::text,'Al Faisaliah','Riyadh','Riyadh','SA',24.69,46.69,'Al Bakriah Street, Al Faisaliah, Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH SA Riyadh EVENTS Q',v_evt),
    ('Pro4 Events Riyadh','Pro4','SA','https://pro4.com/','pro4.com','info@pro4.com','+966114625088',NULL::text,'Al Malqa','Riyadh','Riyadh','SA',24.80,46.63,'Business Park Bldg Office 103, Anas Ibn Malik Rd, Al Malqa',NULL::numeric,NULL::int,'WEB_RESEARCH SA Riyadh EVENTS Q',v_evt),
    ('VIP Events Management Riyadh','VIP Events Management','SA','https://www.vip-events.com.sa/','vip-events.com.sa','contact@vip-events.com.sa','+966591492845','+966591492845','Al Nada','Riyadh','Riyadh','SA',24.82,46.64,'Al Nada, Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH SA Riyadh EVENTS Q',v_evt),

    -- ========== RIYADH SECURITY (3 → ~4) ==========
    ('SAFE National Security Services Riyadh','National Security Services Company (SAFE)','SA','https://www.safesecurity.sa/','safesecurity.sa','info@safesecurity.sa','+966920003505',NULL::text,'Digital City','Riyadh','Riyadh','SA',24.73,46.62,'Digital City, Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH SA Riyadh SECURITY Q',v_sec),

    -- ========== RIYADH HOSPITALITY (3 → ~5) ==========
    ('Fairmont Riyadh','Fairmont Riyadh','SA','https://www.fairmont.com/en/hotels/riyadh/fairmont-riyadh.html',NULL::text,'RIY.Reservations@Fairmont.com','+966118262626',NULL::text,'Business Gate','Riyadh','Riyadh','SA',24.79,46.82,'Business Gate, Qurtubah Area 11552 Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH SA Riyadh HOSPITALITY Q',v_hosp),
    ('Mandarin Oriental Al Faisaliah Riyadh','Mandarin Oriental Al Faisaliah, Riyadh','SA','https://www.mandarinoriental.com/en/riyadh/al-faisaliah',NULL::text,'moryd-reservations@mohg.com','+966112732000',NULL::text,'Olaya','Riyadh','Riyadh','SA',24.69,46.69,'King Fahad Rd, Olaya, Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH SA Riyadh HOSPITALITY Q',v_hosp),

    -- ========== DUBAI YACHT (2 → ~5) ==========
    ('Xclusive Yachts Dubai','Xclusive Yachts','AE','https://xclusiveyachts.com/','xclusiveyachts.com','charter@xclusiveyachts.com','+97144327233','+97144327233','Dubai Marina','Dubai','Dubai','AE',25.08,55.14,'Unit 3 Marina Level, Al Majara Tower, Dubai Marina',NULL::numeric,NULL::int,'WEB_RESEARCH AE Dubai YACHT Q',v_yacht),
    ('Royal Yachts Dubai','Royal Yachts','AE','https://www.ry.ae/','ry.ae','info@ry.ae','+97145514040','+971502266906','Downtown','Dubai','Dubai','AE',25.20,55.27,'Downtown Dubai, UAE',NULL::numeric,NULL::int,'WEB_RESEARCH AE Dubai YACHT Q',v_yacht),
    ('Empire Yachts Dubai','Empire Yachts','AE','https://empireyachts.ae/','empireyachts.ae','charter@empireyachts.ae','+971522447777',NULL::text,'Dubai Marina','Dubai','Dubai','AE',25.08,55.14,'Marina Park LG 02, Al Marsa St, Dubai Marina',NULL::numeric,NULL::int,'WEB_RESEARCH AE Dubai YACHT Q',v_yacht),

    -- ========== DUBAI HOSPITALITY (2 → ~5) ==========
    ('Atlantis The Royal Dubai','Atlantis The Royal','AE','https://www.atlantis.com/atlantis-the-royal',NULL::text,'theroyal.reservations@atlantisdubai.com','+97144260008',NULL::text,'Palm Jumeirah','Dubai','Dubai','AE',25.13,55.12,'Atlantis The Royal, Palm Jumeirah, Dubai',NULL::numeric,NULL::int,'WEB_RESEARCH AE Dubai HOSPITALITY Q',v_hosp),
    ('Address Downtown Dubai','Address Downtown','AE','https://www.addresshotels.com/en/hotels/address-downtown/','addresshotels.com','info.addth@addresshotels.com','+97144368888',NULL::text,'Downtown','Dubai','Dubai','AE',25.20,55.27,'Sheikh Mohammed Bin Rashid Blvd, Downtown Dubai',NULL::numeric,NULL::int,'WEB_RESEARCH AE Dubai HOSPITALITY Q',v_hosp),
    ('Mandarin Oriental Jumeira Dubai','Mandarin Oriental Jumeira, Dubai','AE','https://www.mandarinoriental.com/en/dubai/jumeira',NULL::text,'modub-reservations@mohg.com','+97147772222',NULL::text,'Jumeira','Dubai','Dubai','AE',25.23,55.26,'Jumeirah Beach Road, Jumeira 1, Dubai',NULL::numeric,NULL::int,'WEB_RESEARCH AE Dubai HOSPITALITY Q',v_hosp),

    -- ========== DUBAI EVENTS (3 → ~4) ==========
    ('M and M Group Dubai','M&M Group','AE','https://www.mnm.ae/','mnm.ae','hi@mnm.ae','+97145671583',NULL::text,'Dubai Media City','Dubai','Dubai','AE',25.09,55.15,'Building 8, Dubai Media City, Dubai',NULL::numeric,NULL::int,'WEB_RESEARCH AE Dubai EVENTS Q',v_evt),

    -- ========== DUBAI MEDICAL (3 → ~4) ==========
    ('Aster Hospital Dubai','Aster Hospital Dubai','AE','https://www.asterhospitals.ae/',NULL::text,'pr@asterdmhealthcare.com','+971557009111',NULL::text,'Al Qusais','Dubai','Dubai','AE',25.27,55.38,'Aster Hospital, 9c Street 19, Dubai',NULL::numeric,NULL::int,'WEB_RESEARCH AE Dubai MEDICAL Q',v_med),

    -- ========== DUBAI PRIVATE_AVIATION (3 → ~4); jetex.com domain already used elsewhere ==========
    ('Jetex Dubai DWC FBO','Jetex Dubai','AE','https://www.jetex.com/network/dubai-uae/',NULL::text,'fbo-dwc@jetex.com','+97142124900',NULL::text,'DWC','Dubai','Dubai','AE',24.90,55.16,'Jetex FBO Terminal, Al Maktoum International Airport',NULL::numeric,NULL::int,'WEB_RESEARCH AE Dubai PRIVATE_AVIATION Q',v_av),

    -- ========== AMSTERDAM GT (2 → ~5) ==========
    ('Chauffeur Services Holland Amsterdam','Chauffeur Services Holland','NL','https://chauffeurservicesholland.com/','chauffeurservicesholland.com','info@chauffeurservicesholland.com','+31850603222',NULL::text,'Hoofddorp','Amsterdam','North Holland','NL',52.30,4.69,'Saturnusstraat 4662, 2132 HB Hoofddorp',NULL::numeric,NULL::int,'WEB_RESEARCH NL Amsterdam GT Q',v_gt),
    ('Holland Exclusive Drivers Amsterdam','Holland Exclusive Drivers','NL','https://hollandexclusivedrivers.com/','hollandexclusivedrivers.com','info@hollandexclusivedrivers.com','+31251442735',NULL::text,'Schiphol','Amsterdam','North Holland','NL',52.31,4.76,'Evert van de Beekstraat 1, 1118 CL Schiphol',NULL::numeric,NULL::int,'WEB_RESEARCH NL Amsterdam GT Q',v_gt),
    ('Mikes Luxury Events Amsterdam','Mike''s Luxury Events BV','NL','https://mikesluxuryevents.com/','mikesluxuryevents.com','info@mikesluxuryevents.com','+31627868660',NULL::text,'Amsterdam','Amsterdam','North Holland','NL',52.37,4.89,'Postbus 8842, 1006 JA Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH NL Amsterdam GT Q',v_gt),

    -- ========== AMSTERDAM PRIVATE_AVIATION (2 → ~5) ==========
    ('JetSupport Amsterdam','JetSupport','NL','https://www.jetsupport.aero/','jetsupport.nl','info@jetsupport.nl','+31205022280',NULL::text,'Schiphol East','Amsterdam','North Holland','NL',52.31,4.76,'Thermiekstraat 156-158, 1117 BG Schiphol',NULL::numeric,NULL::int,'WEB_RESEARCH NL Amsterdam PRIVATE_AVIATION Q',v_av),
    ('Eurojets Amsterdam','Eurojets BV','NL','https://eurojets.nl/en/','eurojets.nl','info@eurojets.nl','+442045861008',NULL::text,'Keizersgracht','Amsterdam','North Holland','NL',52.365,4.890,'Keizersgracht 555, 1017 DR Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH NL Amsterdam PRIVATE_AVIATION Q',v_av),
    ('Private Jets NL Amsterdam','Europese Privéjets / Private-Jets.nl','NL','https://private-jets.nl/','private-jets.nl','flight@private-jets.nl','+4915733565927',NULL::text,'Schiphol','Amsterdam','North Holland','NL',52.31,4.76,'Evert van de Beekstraat 202, 1118 CP Schiphol',NULL::numeric,NULL::int,'WEB_RESEARCH NL Amsterdam PRIVATE_AVIATION Q',v_av),

    -- ========== AMSTERDAM EVENTS (3 → ~5+) ==========
    ('Creators of Live Amsterdam','Creators of Live B.V.','NL','https://www.creatorsoflive.com/','creatorsoflive.com','info@creatorsoflive.com','+31622641089',NULL::text,'Amsterdam desk','Amsterdam','North Holland','NL',52.37,4.89,'Amsterdam DMC / live events — Netherlands',NULL::numeric,NULL::int,'WEB_RESEARCH NL Amsterdam EVENTS Q',v_evt),
    ('Performance Travel DMC Amsterdam','Performance Travel DMC','NL','https://www.performancetravel-dmc.com/','performancetravel.nl','info@performancetravel.nl','+31207704720',NULL::text,'Damrak','Amsterdam','North Holland','NL',52.376,4.897,'Damrak 68 III-V, Amsterdam',NULL::numeric,NULL::int,'WEB_RESEARCH NL Amsterdam EVENTS Q',v_evt),
    ('SkyMar DMC Amsterdam','SkyMar DMC','NL','https://skymardmc.com/','skymardmc.com','info@skymardmc.com','+31684769357','+31684769357','Amsterdam','Amsterdam','North Holland','NL',52.37,4.89,'Amsterdam destination management & VIP MICE',NULL::numeric,NULL::int,'WEB_RESEARCH NL Amsterdam EVENTS Q',v_evt)
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
  RAISE NOTICE 'AE SA NL quality leads: inserted=% skipped=%', inserted, skipped;
END $$;
