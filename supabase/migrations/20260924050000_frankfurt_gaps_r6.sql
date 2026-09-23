-- Coverage R6: Frankfurt DE thin spots → ~5 LEADs.
-- Audit: GT=4, CONCIERGE=2, EVENTS=2, YACHT=2 (live); add NEW firms only.
-- EMAIL required; PHONE when public; WhatsApp optional (never invent from landline).
-- Established firms only; ratings only when verified.

DO $$
DECLARE
  v_gt   uuid := 'a44149dd-e4b3-4e32-8074-ad1248f27521';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_yacht uuid := '443ac19c-9b4b-4277-9531-e52d6163cb6a';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
  ins_gt int := 0; skip_gt int := 0;
  ins_conc int := 0; skip_conc int := 0;
  ins_evt int := 0; skip_evt int := 0;
  ins_yacht int := 0; skip_yacht int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- ========== FRANKFURT GROUND_TRANSPORTATION (4 → ~5) ==========
    ('FLS Frankfurt Limousine Services','FLS Frankfurt Limousine Services','DE','https://fls-limousines.de/','fls-limousines.de','info@fls-limousines.de','+491726969496',NULL::text,'Frankfurt am Main','Frankfurt am Main','Hessen','DE',50.1109,8.6821,'Frankfurt am Main · Eschborn',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt GT R6',v_gt),

    -- ========== FRANKFURT CONCIERGE (2 → ~5) ==========
    ('Alotea Concierge Frankfurt','Alotea','DE','https://alotea.com/frankfurt','alotea.com','info@alotea.com',NULL::text,NULL::text,'Westend','Frankfurt am Main','Hessen','DE',50.1205,8.6515,'Palmengartenstraße 11, 60325 Frankfurt am Main',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt CONCIERGE R6',v_conc),
    ('My Personal Shopper Frankfurt','The Personal Look / Silke Gerloff','DE','https://my-personalshopper.de/en','my-personalshopper.de','info@my-personalshopper.de','+491714217456',NULL::text,'Offenbach','Frankfurt am Main','Hessen','DE',50.0970,8.7660,'Ernst-Griesheimer-Platz 6, 63071 Offenbach',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt CONCIERGE R6',v_conc),
    ('Mary Poppins Frankfurt','Agentur Mary Poppins Frankfurt','DE','https://www.agenturmarypoppins.de/standort/frankfurt/','agenturmarypoppins.de','frankfurt@agenturmarypoppins.de','+4961019894961',NULL::text,'Bad Vilbel','Frankfurt am Main','Hessen','DE',50.1780,8.7370,'Am Stock 16-18, 61118 Bad Vilbel',4.9::numeric,63::int,'WEB_RESEARCH EU Frankfurt CONCIERGE R6',v_conc),

    -- ========== FRANKFURT EVENTS (2 → ~5) ==========
    ('IdeenReich Frankfurt','IdeenReich! – Agentur für Eventmanagement GmbH','DE','https://www.ideenreich-frankfurt.de/','ideenreich-frankfurt.de','info@ideenreich-frankfurt.de','+496915041000',NULL::text,'Fechenheim','Frankfurt am Main','Hessen','DE',50.1380,8.7380,'Orber Strasse 4a, 60386 Frankfurt am Main',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt EVENTS R6',v_evt),
    ('eventcom Frankfurt','Denis Pfannmüller Entertainment / eventcom-Gruppe','DE','https://eventcom.group/','eventcom.group','post@eventcom.group','+496967865800',NULL::text,'Schwanheim','Frankfurt am Main','Hessen','DE',50.0860,8.6450,'Neuwiesenstraße 21, 60528 Frankfurt am Main',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt EVENTS R6',v_evt),
    ('Nina Events Frankfurt','Nina Events / Nina Reininger','DE','https://nina-events.de/','nina-events.de','info@nina-events.de','+4915164930257',NULL::text,'Sachsenhausen','Frankfurt am Main','Hessen','DE',50.1020,8.6880,'Danneckerstraße 39a, 60594 Frankfurt am Main',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt EVENTS R6',v_evt),

    -- ========== FRANKFURT YACHT (2 → ~5) ==========
    ('MainFeeling Frankfurt','MainFeeling','DE','https://www.mainfeeling.de/','mainfeeling.de','info@mainfeeling.de','+496946998108',NULL::text,'Marina Westhafen','Frankfurt am Main','Hessen','DE',50.0990,8.6600,'Bachforellenweg 51, Marina Westhafen, Frankfurt am Main',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt YACHT R6',v_yacht),
    ('ItalianFlairBoating Frankfurt','ItalianFlairBoating UG (haftungsbeschränkt)','DE','https://www.italianflairboating.com/','italianflairboating.com','info@italianflairboating.com','+491635008222','+491635008222','Triebstraße','Frankfurt am Main','Hessen','DE',50.1410,8.7550,'Triebstr. 67, 60388 Frankfurt am Main',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt YACHT R6',v_yacht),
    ('Main Charter Frankfurt','Main Charter / Ufuk Vasi','DE','https://www.maincharter-frankfurt.de/','maincharter-frankfurt.de','info@maincharter-frankfurt.de','+4915110579289',NULL::text,'Offenbach','Frankfurt am Main','Hessen','DE',50.0950,8.7800,'Fritz-Remy-Str. 6, 63071 Offenbach am Main',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt YACHT R6',v_yacht)
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
    ) THEN
      skipped := skipped + 1;
      IF r.service_type_id = v_gt THEN skip_gt := skip_gt + 1;
      ELSIF r.service_type_id = v_conc THEN skip_conc := skip_conc + 1;
      ELSIF r.service_type_id = v_evt THEN skip_evt := skip_evt + 1;
      ELSIF r.service_type_id = v_yacht THEN skip_yacht := skip_yacht + 1;
      END IF;
      CONTINUE;
    END IF;

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
    IF r.service_type_id = v_gt THEN ins_gt := ins_gt + 1;
    ELSIF r.service_type_id = v_conc THEN ins_conc := ins_conc + 1;
    ELSIF r.service_type_id = v_evt THEN ins_evt := ins_evt + 1;
    ELSIF r.service_type_id = v_yacht THEN ins_yacht := ins_yacht + 1;
    END IF;
  END LOOP;
  RAISE NOTICE 'Frankfurt gaps R6: inserted=% skipped=% | GT i=%/s=% CONC i=%/s=% EVT i=%/s=% YACHT i=%/s=%',
    inserted, skipped, ins_gt, skip_gt, ins_conc, skip_conc, ins_evt, skip_evt, ins_yacht, skip_yacht;
END $$;
