-- Coverage R6: New York City multi-service LEADs (~4–5 per service).
-- Pre-audit: NYC had GT=8, SECURITY=4; HOSPITALITY/CONCIERGE/EVENTS/MEDICAL/PRIVATE_AVIATION=0.
-- EMAIL required; US phone E.164; WhatsApp optional (never invent).
-- notes_public: WEB_RESEARCH US New York <SERVICE> R6

DO $$
DECLARE
  v_gt   uuid := 'a44149dd-e4b3-4e32-8074-ad1248f27521';
  v_sec  uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_med  uuid := '19353c68-bed1-4625-a811-da4e2a2a2f42';
  v_av   uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- ========== GROUND_TRANSPORTATION ==========
    ('Manhattan VIP Limo','Manhattan VIP Limo','US','https://manhattanviplimo.com/','manhattanviplimo.com','info@manhattanviplimo.com','+12127773847',NULL::text,'Chelsea','New York','NY','US',40.743,-73.993,'116 W 23rd St, New York, NY 10011',NULL::numeric,NULL::int,'WEB_RESEARCH US New York GT R6',v_gt),
    ('NYC Drivers','NYC Drivers','US','https://nycdrivers.net/','nycdrivers.net','info@nycdrivers.net','+12125183678',NULL::text,'Midtown East','New York','NY','US',40.753,-73.973,'168 East 44th Street, New York, NY 10017',NULL::numeric,NULL::int,'WEB_RESEARCH US New York GT R6',v_gt),
    ('BlackCarService.NYC','BlackCarService.NYC','US','https://www.blackcarservice.nyc/','blackcarservice.nyc','info@blackcarservice.nyc','+16467986550',NULL::text,'Midtown','New York','NY','US',40.765,-73.977,'1420 6th Ave, New York, NY 10019',NULL::numeric,NULL::int,'WEB_RESEARCH US New York GT R6',v_gt),
    ('Ride SoHo','Ride SoHo','US','https://ridesoho.com/','ridesoho.com','booking@ridesoho.com','+12128755212',NULL::text,'Midtown','New York','NY','US',40.754,-73.976,'230 Park Avenue, 3rd Floor, New York, NY 10017',NULL::numeric,NULL::int,'WEB_RESEARCH US New York GT R6',v_gt),

    -- ========== SECURITY ==========
    ('Integras Intelligence','Integras Intelligence, Inc.','US','https://integrasintel.com/','integrasintel.com','info@integrasintel.com','+12128711274',NULL::text,'Midtown','New York','NY','US',40.756,-73.982,'1120 Avenue of the Americas, 4th Floor, New York, NY 10036',NULL::numeric,NULL::int,'WEB_RESEARCH US New York SECURITY R6',v_sec),
    ('Sentinel Management Group','Sentinel Management Group, Inc.','US','https://www.sentinelmgi.com/','sentinelmgi.com','info@sentinelmgi.com','+17187403600',NULL::text,'Queens Village','New York','NY','US',40.718,-73.739,'96-59 222nd Street, Suite 200, Queens Village, NY 11429',NULL::numeric,NULL::int,'WEB_RESEARCH US New York SECURITY R6',v_sec),
    ('Aegis Capital Security','Aegis Capital Security','US','https://aegis.nyc/','aegis.nyc','info@aegis.nyc','+18886823447',NULL::text,'New York','New York','NY','US',40.755,-73.984,'New York, NY',NULL::numeric,NULL::int,'WEB_RESEARCH US New York SECURITY R6',v_sec),
    ('BMC Executive Security','BMC Executive Security Corp','US','https://bmcexecutivesecurity.com/','bmcexecutivesecurity.com','info@bmcexecutivesecurity.com','+17183000054',NULL::text,'Bronx','New York','NY','US',40.867,-73.893,'281 E. Kingsbridge Rd, Bronx, NY 10458',NULL::numeric,NULL::int,'WEB_RESEARCH US New York SECURITY R6',v_sec),
    ('Stone Security Services','Stone Security Services','US','https://stonesecurity.nyc/','stonesecurity.nyc','info@stonesecurity.nyc','+12122607444',NULL::text,'Midtown','New York','NY','US',40.751,-73.997,'5 Penn Plaza, 19th Floor, New York, NY 10001',NULL::numeric,NULL::int,'WEB_RESEARCH US New York SECURITY R6',v_sec),

    -- ========== HOSPITALITY ==========
    ('Kooth Hospitality','Kooth Hospitality','US','https://www.koothhospitality.com/','koothhospitality.com','info@koothhospitality.com','+12129418000',NULL::text,'Chinatown','New York','NY','US',40.717,-74.000,'183 Centre Street, New York, NY 10013',NULL::numeric,NULL::int,'WEB_RESEARCH US New York HOSPITALITY R6',v_hosp),
    ('Sentry Hospitality','Sentry Hospitality','US','https://www.sentryhospitality.com/','sentryhospitality.com','admin@sentryhospitality.com','+12127535347',NULL::text,'Midtown East','New York','NY','US',40.761,-73.969,'136 East 57th Street, 10th Floor, New York, NY 10022',NULL::numeric,NULL::int,'WEB_RESEARCH US New York HOSPITALITY R6',v_hosp),
    ('Triumph Hotels','Triumph Hotels','US','https://www.triumphhotels.com/','triumphhotels.com','info@triumphhotels.com','+12124534000',NULL::text,'Times Square','New York','NY','US',40.761,-73.985,'1633 Broadway, 46th Fl, New York, NY 10019',NULL::numeric,NULL::int,'WEB_RESEARCH US New York HOSPITALITY R6',v_hosp),
    ('Dream Hotel Group','Dream Hotel Group','US','https://www.dreamhotelgroup.com/','dreamhotelgroup.com','info@dreamhotelgroup.com','+12124749800',NULL::text,'Midtown','New York','NY','US',40.764,-73.982,'200 West 55th Street, New York, NY 10019',NULL::numeric,NULL::int,'WEB_RESEARCH US New York HOSPITALITY R6',v_hosp),

    -- ========== CONCIERGE ==========
    ('Your Concierge NYC','Your Concierge NYC, Inc.','US','https://yourconciergenyc.com/','yourconciergenyc.com','info@yourconciergenyc.com','+18482182102',NULL::text,'New York','New York','NY','US',40.755,-73.984,'New York, NY',NULL::numeric,NULL::int,'WEB_RESEARCH US New York CONCIERGE R6',v_conc),
    ('Empire State Concierge','Empire State Concierge','US','https://www.empirestateconcierge.com/','empirestateconcierge.com','admin@empirestateconcierge.com','+18455451855',NULL::text,'Midtown','New York','NY','US',40.757,-73.977,'12 E 49th St, Fl 11, New York, NY 10017',NULL::numeric,NULL::int,'WEB_RESEARCH US New York CONCIERGE R6',v_conc),
    ('Knightsbridge Circle New York','Knightsbridge Circle','US','https://www.knightsbridgecircle.com/','knightsbridgecircle.com','enquiries@knightsbridgecircle.com','+19292792975',NULL::text,'New York','New York','NY','US',40.755,-73.984,'New York, NY',NULL::numeric,NULL::int,'WEB_RESEARCH US New York CONCIERGE R6',v_conc),
    ('The Imperial Concierge','The Imperial Concierge','US','https://theimperialconcierge.com/','theimperialconcierge.com','info@theimperialconcierge.com','+17472974857',NULL::text,'Midtown','New York','NY','US',40.747,-73.983,'167 Madison Ave, Suite 205, New York, NY 10016',NULL::numeric,NULL::int,'WEB_RESEARCH US New York CONCIERGE R6',v_conc),

    -- ========== EVENTS ==========
    ('EMRG Media','EMRG Media','US','https://www.emrgmedia.com/','emrgmedia.com','info@emrgmedia.com','+12122543700',NULL::text,'Sutton Place','New York','NY','US',40.757,-73.961,'60 Sutton Place South, New York, NY 10022',NULL::numeric,NULL::int,'WEB_RESEARCH US New York EVENTS R6',v_evt),
    ('RSVP Events NYC','RSVP Events','US','https://rsvp-nyc.com/','rsvp-nyc.com','events@rsvp-nyc.com','+12128147187',NULL::text,'Madison Avenue','New York','NY','US',40.746,-73.985,'135 Madison Ave, 5th Fl, New York, NY 10016',NULL::numeric,NULL::int,'WEB_RESEARCH US New York EVENTS R6',v_evt),
    ('Midtown Loft & Terrace','Midtown Loft & Terrace','US','https://midtownloft.net/','midtownloft.net','sales@midtownloft.net','+12125370117',NULL::text,'Fifth Avenue','New York','NY','US',40.745,-73.986,'267 Fifth Avenue, New York, NY 10016',NULL::numeric,NULL::int,'WEB_RESEARCH US New York EVENTS R6',v_evt),
    ('GEO Events New York','GEO Events','US','https://geoevents.com/','geoevents.com','info@geoevents.com','+18006700462',NULL::text,'Midtown','New York','NY','US',40.751,-73.987,'56 W 36th St, Suite 605, New York, NY 10018',NULL::numeric,NULL::int,'WEB_RESEARCH US New York EVENTS R6',v_evt),

    -- ========== MEDICAL ==========
    ('MD2 Fifth Avenue','Spatz Goldberg Medical, PLLC','US','https://www.md2.com/locations/fifth-avenue-ny','md2.com','fifthavenue-info@md2.com','+12125404210',NULL::text,'Fifth Avenue','New York','NY','US',40.761,-73.975,'693 Fifth Avenue, 15th Floor, New York, NY 10022',NULL::numeric,NULL::int,'WEB_RESEARCH US New York MEDICAL R6',v_med),
    ('Dr GolBerg Concierge Medicine','Dr. Alexander GolBerg MD, DO','US','https://www.drgolberg.nyc/','drgolberg.nyc','office@drgolberg.nyc','+12122010719',NULL::text,'Park Avenue','New York','NY','US',40.775,-73.961,'910 Park Avenue, New York, NY 10075',NULL::numeric,NULL::int,'WEB_RESEARCH US New York MEDICAL R6',v_med),
    ('Manhattan Integrative Cardiovascular','Manhattan Integrative Cardiovascular','US','https://www.micnyc.com/','micnyc.com','membership@micnyc.com','+16467933806',NULL::text,'Midtown East','New York','NY','US',40.761,-73.969,'133 East 58th Street, Suite 1402, New York, NY 10022',NULL::numeric,NULL::int,'WEB_RESEARCH US New York MEDICAL R6',v_med),
    ('Elitra Health','Executive Medical Services, P.C.','US','https://www.elitrahealth.com/','elitrahealth.com','info@elitrahealth.com','+18882020128',NULL::text,'Financial District','New York','NY','US',40.715,-74.011,'255 Greenwich Street, Suite 520, New York, NY 10007',NULL::numeric,NULL::int,'WEB_RESEARCH US New York MEDICAL R6',v_med),

    -- ========== PRIVATE_AVIATION ==========
    ('Jet Aviation Teterboro','Jet Aviation','US','https://www.jetaviation.com/location/teterboro/','jetaviation.com','tebfbo@jetaviation.com','+12014624000',NULL::text,'Teterboro','New York','NY','US',40.850,-74.061,'112 Charles A. Lindbergh Drive, Teterboro, NJ 07608',NULL::numeric,NULL::int,'WEB_RESEARCH US New York PRIVATE_AVIATION R6',v_av),
    ('Air Charter Service New York','Air Charter Service Inc.','US','https://www.aircharterservice.com/','aircharterservice.com','nycprivate@aircharterservice.com','+12126615568',NULL::text,'Midtown West','New York','NY','US',40.752,-73.998,'360 W 31st Street, New York, NY 10001',NULL::numeric,NULL::int,'WEB_RESEARCH US New York PRIVATE_AVIATION R6',v_av),
    ('PrivatePlane.com','PrivatePlane.com','US','https://privateplane.com/','privateplane.com','info@privateplane.com','+12126817900',NULL::text,'Midtown','New York','NY','US',40.750,-73.988,'45 West 34th Street, Suite 1103, New York, NY 10001',NULL::numeric,NULL::int,'WEB_RESEARCH US New York PRIVATE_AVIATION R6',v_av),
    ('Charter Jet One','Charter Jet One','US','https://www.charterjetone.com/','charterjetone.com','info@charterjetone.com','+12122791095',NULL::text,'Midtown','New York','NY','US',40.754,-73.975,'420 Lexington Avenue, New York, NY 10170',NULL::numeric,NULL::int,'WEB_RESEARCH US New York PRIVATE_AVIATION R6',v_av)
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
  RAISE NOTICE 'NYC multiservice LEADs R6: inserted=% skipped=%', inserted, skipped;
END $$;
