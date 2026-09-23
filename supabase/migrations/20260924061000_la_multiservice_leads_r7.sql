-- Coverage R7: Los Angeles / Southern California multi-service LEADs (~3–4 per thin service).
-- Pre-audit: LA metro LEADs — GT=5 (Continental Ride LA, Black Tie Car, LA Private Car Service,
--   MGCLS LAX Car Service, LAXfleet); SECURITY/HOSPITALITY/CONCIERGE/EVENTS/MEDICAL/
--   PRIVATE_AVIATION/YACHT = 0. GT skipped (already ≥4).
-- EMAIL required; US phone E.164; WhatsApp NULL unless publicly listed.
-- notes_public: WEB_RESEARCH US Los Angeles <SERVICE> R7
-- Dedup vs existing Continental Ride LA / blacktiecar / laprivatecarservice / md2.com / jetaviation.com etc.

DO $$
DECLARE
  v_sec  uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_med  uuid := '19353c68-bed1-4625-a811-da4e2a2a2f42';
  v_av   uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035';
  v_yacht uuid := '443ac19c-9b4b-4277-9531-e52d6163cb6a';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- ========== SECURITY ==========
    ('Global Risk Solutions','Global Risk Solutions, Inc.','US','https://www.grsprotection.com/','grsprotection.com','info@grsprotection.com','+13108681750',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.069,-118.401,'Beverly Hills, CA',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles SECURITY R7',v_sec),
    ('Forward Security Group','Forward Security Group Inc.','US','https://www.forwardsecuritygroup.com/','forwardsecuritygroup.com','contact@forwardsecuritygroup.com','+14244926700',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.067,-118.404,'9701 Wilshire Boulevard, 10th Floor #578, Beverly Hills, CA 90212',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles SECURITY R7',v_sec),
    ('David Shield Security','David Shield Security','US','https://davidshieldsecurity.com/','davidshieldsecurity.com','info@davidshieldsecurity.com','+18185149653',NULL::text,'Calabasas','Calabasas','CA','US',34.158,-118.638,'23945 Calabasas Rd Suite #108, Calabasas, CA 91302',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles SECURITY R7',v_sec),
    ('World Protection Group','The World Protection Group, Inc.','US','https://www.worldprotectiongroup.com/','worldprotectiongroup.com','info@theworldprotectiongroup.com','+13103906646',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.067,-118.384,'311 North Robertson Boulevard Suite 776, Beverly Hills, CA 90211',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles SECURITY R7',v_sec),

    -- ========== HOSPITALITY ==========
    ('Proper Hospitality','Proper Hospitality','US','https://www.properhotel.com/','properhotel.com','info@properhotel.com','+13106209990',NULL::text,'Santa Monica','Santa Monica','CA','US',34.020,-118.496,'225 Arizona Avenue, Suite 350, Santa Monica, CA 90401',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles HOSPITALITY R7',v_hosp),
    ('sbe','sbe Entertainment Group','US','https://www.sbe.com/','sbe.com','hello@sbe.com','+13236558000',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.076,-118.388,'9247 Alden Drive, Beverly Hills, CA 90210',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles HOSPITALITY R7',v_hosp),
    ('Avalon Hotel Beverly Hills','Avalon Hotel Beverly Hills','US','https://www.avalon-hotel.com/beverly-hills/','avalon-hotel.com','guestservices@avalonbeverlyhills.com','+13102775221',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.059,-118.401,'9400 West Olympic Boulevard, Beverly Hills, CA 90212',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles HOSPITALITY R7',v_hosp),
    ('Luxe Sunset Boulevard Hotel','Luxe Hotels','US','https://www.luxehotels.com/','luxehotels.com','customerservice@luxehotels.com','+13104766571',NULL::text,'Bel Air','Los Angeles','CA','US',34.078,-118.469,'11461 Sunset Blvd, Los Angeles, CA 90049',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles HOSPITALITY R7',v_hosp),

    -- ========== CONCIERGE ==========
    ('Luxcess','Luxcess','US','https://www.luxcess.com/','luxcess.com','info@luxcess.com','+18005962030',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.065,-118.372,'8200 Wilshire Blvd. #200, Beverly Hills, CA 90211',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles CONCIERGE R7',v_conc),
    ('Infinite Concierge','Infinite Concierge','US','https://infiniteconcierge.com/','infiniteconcierge.com','info@infiniteconcierge.com','+13109273888',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.067,-118.412,'9800 Wilshire Blvd, Beverly Hills, CA 90212',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles CONCIERGE R7',v_conc),
    ('Beverly Hills Concierge Service','Beverly Hills Concierge Service','US','https://beverlyhillsconciergeservice.com/','beverlyhillsconciergeservice.com','info@beverlyhillsconciergeservice.com','+13106505595',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.074,-118.400,'Beverly Hills, CA',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles CONCIERGE R7',v_conc),
    ('Ophea','Ophea','US','https://www.ophea-luxury.com/','ophea-luxury.com','contact@ophea-luxury.com','+13233714586',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.067,-118.413,'9876 Wilshire Boulevard, Beverly Hills, CA 90210',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles CONCIERGE R7',v_conc),

    -- ========== EVENTS ==========
    ('Ultra Lux Events LA','Ultra Lux Events LA','US','https://ultraluxeventsla.com/','ultraluxeventsla.com','hello@ultraluxeventsla.com','+13234898450',NULL::text,'West Hills','Los Angeles','CA','US',34.198,-118.644,'8450 Moorcroft Ave, West Hills, CA 91304',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles EVENTS R7',v_evt),
    ('Kristin Banta Events','Kristin Banta Events','US','https://kristinbanta.com/','kristinbanta.com','events@kristinbanta.com','+18185058971',NULL::text,'Los Angeles','Los Angeles','CA','US',34.152,-118.449,'Los Angeles, CA',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles EVENTS R7',v_evt),
    ('Eddie Zaratsian Lifestyle & Design','Eddie Zaratsian Lifestyle & Design','US','https://www.eddiezaratsian.com/','eddiezaratsian.com','concierge@eddiezaratsian.com','+13105086126','+13105086126','Sun Valley','Los Angeles','CA','US',34.218,-118.370,'7430 San Fernando Rd, Sun Valley, CA 91352',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles EVENTS R7',v_evt),
    ('Dreams In Detail','Dreams In Detail','US','https://www.dreamsindetail.com/','dreamsindetail.com','info@dreamsindetail.com','+13104323290',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.069,-118.401,'9440 Santa Monica Blvd, Suite 301, Beverly Hills, CA 90210',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles EVENTS R7',v_evt),

    -- ========== MEDICAL ==========
    ('Concierge Health LA','Concierge Health LA','US','https://www.conciergehealthla.com/','conciergehealthla.com','contact@conciergehealthla.com','+14244784750',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.065,-118.376,'8484 Wilshire Blvd. Suite 570, Beverly Hills, CA 90211',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles MEDICAL R7',v_med),
    ('Atelier Health 90210','Atelier Health 90210','US','https://atelier90210.com/','atelier90210.com','info@atelier90210.com','+13108544995',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.067,-118.384,'150 N. Robertson Blvd., Suite 150, Beverly Hills, CA 90211',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles MEDICAL R7',v_med),
    ('Dr Amin Javid Concierge Medicine','Amin Javid, MD','US','https://90210doc.com/','90210doc.com','info@90210doc.com','+13104386345',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.065,-118.377,'8530 Wilshire Blvd. STE 530, Beverly Hills, CA 90211',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles MEDICAL R7',v_med),
    ('Beverly Hills Concierge Doctor','Beverly Hills Concierge Doctor','US','https://beverlyhillsconciergedoctor.com/','beverlyhillsconciergedoctor.com','help@beverlyhillsconciergedoctor.com','+13106830180',NULL::text,'Beverly Hills','Beverly Hills','CA','US',34.069,-118.401,'9400 Brighton Way, Suite 303, Beverly Hills, CA 90210',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles MEDICAL R7',v_med),

    -- ========== PRIVATE_AVIATION ==========
    ('Clay Lacy Aviation','Clay Lacy Aviation','US','https://www.claylacy.com/','claylacy.com','charter@claylacy.com','+18189892900',NULL::text,'Van Nuys','Los Angeles','CA','US',34.210,-118.490,'7435 Valjean Avenue, Van Nuys, CA 91406',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles PRIVATE_AVIATION R7',v_av),
    ('Jet Edge','Jet Edge','US','https://www.flyjetedge.com/','flyjetedge.com','info@flyjetedge.com','+18184420096',NULL::text,'Van Nuys','Los Angeles','CA','US',34.210,-118.490,'Van Nuys, CA',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles PRIVATE_AVIATION R7',v_av),
    ('Dreamline Aviation','Dreamline Aviation','US','https://www.dreamlineaviation.com/','dreamlineaviation.com','charter@dljets.com','+18189880029',NULL::text,'Van Nuys','Los Angeles','CA','US',34.210,-118.490,'7155 Valjean Ave 2nd Floor, Van Nuys, CA 91406',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles PRIVATE_AVIATION R7',v_av),
    ('The Early Air Way','The Early Air Way','US','https://theearlyairway.com/','theearlyairway.com','charter@theearlyairway.com','+18188262538',NULL::text,'Van Nuys','Los Angeles','CA','US',34.210,-118.490,'7155 Valjean Ave, Van Nuys, CA 91406',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles PRIVATE_AVIATION R7',v_av),

    -- ========== YACHT ==========
    ('FantaSea Yachts','FantaSea Yachts','US','https://www.fantaseayachts.com/','fantaseayachts.com','info@fantaseayachts.com','+13108272220',NULL::text,'Marina del Rey','Marina del Rey','CA','US',33.980,-118.448,'4215 Admiralty Way, Marina del Rey, CA 90292',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles YACHT R7',v_yacht),
    ('The Duchess Yacht','The Duchess Yacht Charter Service','US','https://www.theduchessyacht.com/','theduchessyacht.com','info@theduchessyacht.com','+13105708902',NULL::text,'Marina del Rey','Marina del Rey','CA','US',33.978,-118.447,'13645 Fiji Way, Marina Del Rey, CA 90292',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles YACHT R7',v_yacht),
    ('Naos Yachts','Naos Yachts','US','https://naosyachts.com/','naosyachts.com','info@naosyachts.com','+13108218446',NULL::text,'Marina del Rey','Marina del Rey','CA','US',33.978,-118.447,'13555 Fiji Way, Marina del Rey, CA 90292',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles YACHT R7',v_yacht),
    ('LEI Boat Charter','LEI Boat Charter','US','https://leiboatcharter.com/','leiboatcharter.com','info@leiboatcharter.com','+13109133320',NULL::text,'Marina del Rey','Marina del Rey','CA','US',33.980,-118.452,'Marina del Rey, CA 90292',NULL::numeric,NULL::int,'WEB_RESEARCH US Los Angeles YACHT R7',v_yacht)
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
  RAISE NOTICE 'LA multiservice LEADs R7: inserted=% skipped=%', inserted, skipped;
END $$;
