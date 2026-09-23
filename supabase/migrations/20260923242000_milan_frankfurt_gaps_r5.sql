-- HIGH-QUALITY LEADs: Milan + Frankfurt remaining gaps (Paris done)
-- Email required; phone when public; WhatsApp optional (NULL unless confirmed)
-- Ratings left NULL — never invent review data
-- Applied remotely via Supabase MCP project zbzfbloiodcfjxbrdynl

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
    -- ========== MILAN IT ==========
    -- CONCIERGE (2 → ~4)
    ('Made Luxury Concierge Milan','MA.DE. Luxury Concierge','IT','https://www.madeluxuryconcierge.com/home-milan','madeluxuryconcierge.com','info@madeluxuryconcierge.com','+393387677093',NULL::text,'Milan lifestyle','Milan','Lombardy','IT',45.465,9.190,'Milan luxury lifestyle concierge desk',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan CONCIERGE Q',v_conc),
    ('Tac Concierge Milano','Tac! S.r.l.','IT','https://tac-concierge.it/','tac-concierge.it','info@tac-concierge.it','+393756919500',NULL::text,'San Calocero','Milan','Lombardy','IT',45.458,9.175,'Via San Calocero 2, 20123 Milano',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan CONCIERGE Q',v_conc),

    -- EVENTS (2 → ~4)
    ('Dreamsteam Events Milano','Dreamsteam Events','IT','https://www.dreamsteamevents.it/en/','dreamsteamevents.it','events@dreamsteam.it','+393293106246',NULL::text,'Montenapoleone','Milan','Lombardy','IT',45.468,9.195,'Via Montenapoleone 17, 20121 Milano',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan EVENTS Q',v_evt),
    ('Smart Eventi Milano','Smart Eventi','IT','https://en.smarteventi.it/','smarteventi.it','info@smarteventi.it','+390297381544',NULL::text,'Viale Abruzzi','Milan','Lombardy','IT',45.478,9.215,'Viale Abruzzi 37, 20131 Milano',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan EVENTS Q',v_evt),

    -- ========== FRANKFURT DE ==========
    -- CONCIERGE (1 → ~2)
    ('SOA Luxury Frankfurt','SOA – The Secret of Attraction','DE','https://soa-luxury.com/','soa-luxury.com','info@soa-luxury.com','+491797976056',NULL::text,'Hauptbahnhof','Frankfurt','Hesse','DE',50.107,8.664,'Am Hauptbahnhof 16, 60329 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt CONCIERGE Q',v_conc),

    -- EVENTS (1 → ~2)
    ('OBSESSION Eventagentur Frankfurt','OBSESSION GmbH','DE','https://www.obsession.de/','obsession.de','info@obsession.de','+496915409740',NULL::text,'Ferdinand-Happ','Frankfurt','Hesse','DE',50.120,8.725,'Ferdinand-Happ-Strasse 53, 60314 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt EVENTS Q',v_evt),

    -- YACHT (1 → ~2) — inland Main / yacht charter broker HQ Frankfurt
    ('BlueSun Luxury Yachts Frankfurt','BlueSun Luxury Yachts','DE','https://www.bluesun-luxury-yachts.com/','bluesun-luxury-yachts.com','info@bluesun-luxury-yachts.com','+496960607500',NULL::text,'Bethmannhof','Frankfurt','Hesse','DE',50.110,8.682,'Bethmannstrasse 7-9, 60311 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt YACHT Q',v_yacht),

    -- MEDICAL (3 → ~5)
    ('LILIUM Klinik Frankfurt Airport','LILIUM Klinik Frankfurt GmbH','DE','https://www.lilium-klinik.de/frankfurt/','lilium-klinik.de','frankfurt@lilium-klinik.de','+496924743800',NULL::text,'Gateway Gardens','Frankfurt','Hesse','DE',50.052,8.570,'Amelia-Mary-Earhart-Strasse 17, 60549 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt MEDICAL Q',v_med),
    ('St Elisabethen Krankenhaus Frankfurt','St. Elisabethen-Krankenhaus Frankfurt / artemed','DE','https://www.elisabethen-krankenhaus-frankfurt.de/',NULL::text,'st-elisabethen@artemed.de','+496979390',NULL::text,'Ginnheim','Frankfurt','Hesse','DE',50.135,8.650,'Ginnheimer Strasse 3, 60487 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt MEDICAL Q',v_med),

    -- PRIVATE_AVIATION (3 → ~4)
    ('ExecuJet Frankfurt FBO','ExecuJet / Luxaviation','DE','https://www.execujet.com/',NULL::text,'fbo.eddf@execujet.eu','+496969026319',NULL::text,'FRA FBO','Frankfurt','Hesse','DE',50.050,8.570,'Frankfurt Airport EDDF FBO',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt PRIVATE_AVIATION Q',v_av)
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
  RAISE NOTICE 'Milan Frankfurt gaps r5: inserted=% skipped=%', inserted, skipped;
END $$;
