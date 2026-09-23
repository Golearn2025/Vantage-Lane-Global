-- UK regional hubs: fill non-GT service gaps (Manchester, Birmingham, Bristol, Edinburgh, Glasgow, Leeds, Liverpool)

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
  r record;
  v_org uuid;
  inserted int := 0;
  skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- Manchester
    ('Weston Aviation Manchester','Weston Aviation','GB','https://www.westonaviation.com/manchester-airport/','westonaviation.com','manchester@westonaviation.com','+441612499040',NULL,'Ringway','Manchester','England','GB',53.35,-2.27,'Manchester Airport, United Kingdom',NULL,NULL,'WEB_RESEARCH UK Manchester PRIVATE_AVIATION',v_av),
    ('Astute Aviation Manchester','Astute Aviation','GB','https://www.astuteaviation.co.uk/','astuteaviation.co.uk','fly@astuteaviation.co.uk','+441615297470',NULL,'Blackfriars','Manchester','England','GB',53.483,-2.246,'12-16 Blackfriars Street, Manchester M3 5BQ',NULL,NULL,'WEB_RESEARCH UK Manchester PRIVATE_AVIATION',v_av),
    ('Forte Events Manchester','Forte Events','GB','https://www.forteeventmgmt.co.uk/','forteeventmgmt.co.uk','hello@forteeventmgmt.co.uk','+442030847374',NULL,'Manchester','Manchester','England','GB',53.48,-2.24,'North West England, United Kingdom',NULL,NULL,'WEB_RESEARCH UK Manchester EVENTS',v_evt),
    ('MGMT Superyacht UK','MGMT Yacht','GB','https://mgmtyacht.com/','mgmtyacht.com','info@mgmtyacht.com','+442071933206',NULL,'North West hub','Manchester','England','GB',53.48,-2.24,'UK superyacht agency — North coverage',NULL,NULL,'WEB_RESEARCH UK Manchester YACHT',v_yacht),

    -- Birmingham
    ('XLR Executive Jet Centre Birmingham','XLR Executive Jet Centre','GB','https://www.xlrjetcentres.com/locations/birmingham','xlrbirmingham.com','jetcentre@xlrbirmingham.com','+441216631450',NULL,'BHX','Birmingham','England','GB',52.454,-1.748,'Business Aviation Centre, Birmingham Airport B26 3QN',NULL,NULL,'WEB_RESEARCH UK Birmingham PRIVATE_AVIATION',v_av),
    ('Signature Aviation Birmingham','Signature Aviation','GB','https://www.signatureaviation.com/locations/BHX',NULL,'bhx@signatureaviation.com','+443300271259',NULL,'BHX FBO','Birmingham','England','GB',52.454,-1.748,'Birmingham Airport, United Kingdom',NULL,NULL,'WEB_RESEARCH UK Birmingham PRIVATE_AVIATION',v_av),
    ('Malmaison Birmingham','Malmaison Hotels','GB','https://www.malmaison.com/locations/birmingham/','malmaison.com','birmingham@malmaison.com','+441212464000',NULL,'City centre','Birmingham','England','GB',52.479,-1.902,'1 Wharfside Street, Birmingham B1 1RD',NULL,NULL,'WEB_RESEARCH UK Birmingham HOSPITALITY',v_hosp),
    ('Concierge Medical Birmingham','Concierge Medical','GB','https://www.conciergemedical.co.uk/','conciergemedical.co.uk','info@conciergemedical.co.uk','+441451600900',NULL,'West Midlands','Birmingham','England','GB',52.48,-1.9,'Private GP home visits — Birmingham & Midlands',NULL,NULL,'WEB_RESEARCH UK Birmingham MEDICAL',v_med),

    -- Bristol
    ('Alastair Currie Events','Alastair Currie Events','GB','https://www.alastaircurrieevents.com/','alastaircurrieevents.com','info@alastaircurrieevents.com','+441275859720',NULL,'Backwell','Bristol','England','GB',51.415,-2.75,'Event House, Brockley Ln, Backwell BS48 4AH',NULL,NULL,'WEB_RESEARCH UK Bristol EVENTS',v_evt),
    -- Leeds
    ('The Private Doctors Leeds','The Private Doctors','GB','https://www.theprivatedoctors.co.uk/','theprivatedoctors.co.uk','admin@theprivatedoctors.co.uk','+441133886399',NULL,'Roundhay','Leeds','England','GB',53.82,-1.54,'1st Floor, 52 Street Lane, Leeds LS8 2ET',NULL,NULL,'WEB_RESEARCH UK Leeds MEDICAL',v_med),

    -- Edinburgh
    ('Fingal Edinburgh','Fingal Hotel','GB','https://www.fingal.co.uk/','fingal.co.uk','reservations@fingal.co.uk','+441313575000',NULL,'Leith','Edinburgh','Scotland','GB',55.98,-3.17,'Alexandra Dock, Leith, Edinburgh EH6 7DX',NULL,NULL,'WEB_RESEARCH UK Edinburgh HOSPITALITY',v_hosp),
    ('Prestonfield House','Prestonfield House','GB','https://www.prestonfield.com/','prestonfield.com','events@prestonfield.com','+441316625123',NULL,'Prestonfield','Edinburgh','Scotland','GB',55.935,-3.16,'Priestfield Road, Edinburgh EH16 5UT',NULL,NULL,'WEB_RESEARCH UK Edinburgh HOSPITALITY',v_hosp),
    ('Jetlogic Edinburgh','Jetlogic','GB','https://www.jetlogic.co.uk/','jetlogic.co.uk','charters@jetlogic.co.uk','+441314780802',NULL,'Edinburgh','Edinburgh','Scotland','GB',55.953,-3.188,'Edinburgh, Scotland',NULL,NULL,'WEB_RESEARCH UK Edinburgh PRIVATE_AVIATION',v_av),
    ('Execair Charter Edinburgh','Execair Charter','GB','https://www.execaircharter.com/','execaircharter.com','elena@execaircharter.com','+441312616800',NULL,'Edinburgh','Edinburgh','Scotland','GB',55.953,-3.188,'Edinburgh, Scotland',NULL,NULL,'WEB_RESEARCH UK Edinburgh PRIVATE_AVIATION',v_av),
    ('Gent Security Edinburgh','Gent Security Ltd','GB','https://gentsecurity.com/','gentsecurity.com','enquiries@gentsecurityltd.co.uk','+441312616820',NULL,'Edinburgh','Edinburgh','Scotland','GB',55.953,-3.188,'Edinburgh HQ — luxury event & VIP security',NULL,NULL,'WEB_RESEARCH UK Edinburgh SECURITY',v_sec),

    -- Glasgow
    ('Glasgow Grosvenor Hotel','Glasgow Grosvenor Hotel','GB','https://www.gghotel.co.uk/','gghotel.co.uk','events@gghotel.co.uk','+441413416555',NULL,'West End','Glasgow','Scotland','GB',55.875,-4.29,'1-9 Grosvenor Terrace, Glasgow G12 0TA',NULL,NULL,'WEB_RESEARCH UK Glasgow HOSPITALITY',v_hosp),
    ('Mercure Glasgow Events','Mercure Glasgow City Hotel','GB','https://www.mercureglasgow.co.uk/','mercureglasgow.co.uk','events@mercureglasgow.co.uk','+441441441022',NULL,'City centre','Glasgow','Scotland','GB',55.86,-4.25,'Glasgow, Scotland',NULL,NULL,'WEB_RESEARCH UK Glasgow EVENTS',v_evt),

    -- Liverpool
    ('Ghosh Medical Group Liverpool','Ghosh Medical Group','GB','https://www.ghoshmedicalgroup.com/','ghoshmedicalgroup.com','info@ghoshmedicalgroup.com','+443332003338',NULL,'Rodney Street','Liverpool','England','GB',53.4,-2.98,'Rodney Street, Liverpool L1 9ED',NULL,NULL,'WEB_RESEARCH UK Liverpool MEDICAL',v_med)
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
    ) THEN
      skipped := skipped + 1;
      CONTINUE;
    END IF;

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
  RAISE NOTICE 'UK hubs: inserted=% skipped=%', inserted, skipped;
END $$;
