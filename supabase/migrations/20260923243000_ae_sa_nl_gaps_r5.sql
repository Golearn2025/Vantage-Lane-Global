-- Coverage R5: Dubai CONCIERGE + Riyadh PRIVATE_AVIATION thin spots → ~5.
-- Audit: Amsterdam all services ≥4; Dubai/Riyadh only those two cells <4.
-- EMAIL required; PHONE when public; WhatsApp optional (never invent from landline).
-- Established firms only; ratings only when verified; PRIVATE_AVIATION not AVIATION.

DO $$
DECLARE
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_av   uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- ========== DUBAI CONCIERGE (3 → ~5) ==========
    ('Syrama Concierge Dubai','Syrama Concierge Services – FZCO','AE','https://syrama.ae/','syrama.ae','contact@syrama.ae','+971505548034',NULL::text,'The Greens','Dubai','Dubai','AE',25.09,55.17,'Al Samar 2, Al Thanyah Third, The Greens, Dubai',5.0::numeric,38::int,'WEB_RESEARCH AE Dubai CONCIERGE R5',v_conc),
    ('Billionaire Concierge Services Dubai','Billionaire Concierge Services','AE','https://bcs.ae/','bcs.ae','booking@bcs.ae','+971503302578',NULL::text,'Al Jaddaf','Dubai','Dubai','AE',25.21,55.33,'Ali Building, Lathifa Street, Al Jaddaf, Dubai',NULL::numeric,NULL::int,'WEB_RESEARCH AE Dubai CONCIERGE R5',v_conc),

    -- ========== RIYADH PRIVATE_AVIATION (3 → ~5) ==========
    ('NASJET Riyadh','NASJET','SA','https://www.nasjet.com.sa/','nasjet.com.sa','charter@nasjet.com.sa','+966112611199','+966555361716','Abi Bakr As Siddiq','Riyadh','Riyadh','SA',24.79,46.66,'8018 Abi Bakr As Siddiq Rd, Unit 6, Riyadh 13317',NULL::numeric,NULL::int,'WEB_RESEARCH SA Riyadh PRIVATE_AVIATION R5',v_av),
    ('Alpha Star Aviation Riyadh','Alpha Star Aviation Services','SA','https://www.alphastarav.com/en/Default.aspx','alphastarav.com','info@alphastarav.com','+966112100303',NULL::text,'Ar Rabie','Riyadh','Riyadh','SA',24.79,46.70,'Abi Bakr As Siddiq Street, Ar Rabie, Riyadh',NULL::numeric,NULL::int,'WEB_RESEARCH SA Riyadh PRIVATE_AVIATION R5',v_av)
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
  RAISE NOTICE 'AE SA NL gaps R5: inserted=% skipped=%', inserted, skipped;
END $$;
