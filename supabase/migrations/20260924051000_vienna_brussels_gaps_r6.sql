-- Coverage R6: Vienna GT + Brussels PRIVATE_AVIATION + Brussels SECURITY thin spots → ~5.
-- EMAIL required; PHONE when public; WhatsApp optional (never invent from landline).
-- Established firms only; ratings only when verified; PRIVATE_AVIATION not AVIATION.

DO $$
DECLARE
  v_gt  uuid := 'a44149dd-e4b3-4e32-8074-ad1248f27521';
  v_av  uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035';
  v_sec uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- ========== VIENNA GROUND_TRANSPORTATION (3 → ~5) ==========
    ('AustroPlanner Vienna','AustroPlanner','AT','https://austroplanner.com/','austroplanner.com','info@austroplanner.com','+436764255124','+436764255124','Schleifmühlgasse','Vienna','Vienna','AT',48.196,16.368,'Schleifmühlgasse 2, 1040 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna GT R6',v_gt),
    ('Austrian Limousine Vienna','Austrian Limousine Service','AT','https://austrianlimousine.com/en/','austrianlimousine.com','office@austrianlimousine.com','+436643300760',NULL::text,'Simmering','Vienna','Vienna','AT',48.177,16.413,'Simmeringer Hauptstraße 27, 1110 Vienna',NULL::numeric,NULL::int,'WEB_RESEARCH EU Vienna GT R6',v_gt),

    -- ========== BRUSSELS PRIVATE_AVIATION (3 → ~5) ==========
    ('Luxaviation Belgium Brussels','Luxaviation Belgium','BE','https://www.luxaviation.com/luxaviation-belgium/','luxaviation.com','charter.belgium@luxaviation.com','+3227125345',NULL::text,'Brussels Airport Building 28','Brussels','Brussels','BE',50.901,4.484,'Building 28, B-1930 Zaventem — Brussels Airport (ex-Abelag)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels PRIVATE_AVIATION R6',v_av),
    ('FLYINGGROUP Brussels','FLYINGGROUP','BE','https://www.flyinggroup.aero/','flyinggroup.aero','charters@flyinggroup.aero','+3232951234',NULL::text,'Brussels Airport GA','Brussels','Brussels','BE',50.901,4.484,'Brussels Airport General Aviation, Zaventem — Belgian AOC operator (HQ Antwerp)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels PRIVATE_AVIATION R6',v_av),

    -- ========== BRUSSELS SECURITY (3 → ~5) ==========
    ('Beguard Security Brussels','Beguard SRL','BE','https://www.beguard-security.be/','beguard-security.be','info@beguard-security.be','+3224633440',NULL::text,'Grand Bigard','Brussels','Brussels','BE',50.866,4.305,'Rue Grand Bigard 14 bt4, 1082 Brussels — SPFI 0684.987.472',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels SECURITY R6',v_sec),
    ('1-Protection Brussels','1-Protection SRL','BE','https://1-protection.eu/en/','1-protection.eu','info@1-protection.eu','+3223157360',NULL::text,'Wemmel / Brussels desk','Brussels','Brussels','BE',50.908,4.306,'Kaasmarkt 24, 1780 Wemmel — close protection; FPS Home Affairs 0505.981.001',NULL::numeric,NULL::int,'WEB_RESEARCH EU Brussels SECURITY R6',v_sec)
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
  RAISE NOTICE 'Vienna Brussels gaps R6: inserted=% skipped=%', inserted, skipped;
END $$;
