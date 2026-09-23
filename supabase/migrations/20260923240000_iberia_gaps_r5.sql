-- Iberia gaps R5: Barcelona CONCIERGE/EVENTS/SECURITY + Madrid YACHT real brokers
-- Email required; phone when public; WhatsApp optional (never skip for missing WA)
-- Domains set NULL when parent brand domain already used elsewhere (dedupe-safe)

DO $$
DECLARE
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_sec  uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_yacht uuid := '443ac19c-9b4b-4277-9531-e52d6163cb6a';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- ========== BARCELONA CONCIERGE (3 → ~5) ==========
    ('Red Carpet BCN Barcelona','Red Carpet BCN','ES','https://redcarpetbcn.com/','redcarpetbcn.com','info@redcarpetbcn.com','+34933040995',NULL::text,'Barcelona','Barcelona','Catalonia','ES',41.39,2.17,'Barcelona destination design & concierge',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona CONCIERGE est.2006 DMC lifestyle',v_conc),
    ('3e Luxury Services Barcelona','3e Luxury Services','ES','https://3els.com/','3els.com','info@3els.com','+34930046435',NULL::text,'Passeig de Gracia','Barcelona','Catalonia','ES',41.389,2.170,'Passeig de Gracia 12 1o, 08007 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona CONCIERGE since2013 Virtuoso luxury DMC',v_conc),

    -- ========== BARCELONA EVENTS (3 → ~5) ==========
    ('CREA Group Barcelona','CREA Group Event & Destination Management','ES','https://www.creagroupevents.com/','creagroupevents.com','info@creagroupevents.com','+34934344325',NULL::text,'Santalo','Barcelona','Catalonia','ES',41.398,2.145,'Carrer de Santalo 10 3-1, 08021 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona EVENTS DMC est.2007 SITE MPI ADMEI',v_evt),
    ('Tuset DMC Barcelona','Tuset DMC / TuSet Eventos','ES','https://tusetdmc.com/','tusetdmc.com','info@tusetdmc.com','+34930185625',NULL::text,'Diagonal','Barcelona','Catalonia','ES',41.389,2.119,'Avenida Diagonal 672, 08034 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona EVENTS since2008 Tuset group MICE',v_evt),

    -- ========== BARCELONA SECURITY (3 → ~5) ==========
    ('On Grup Barcelona','ON GRUP / On En Marcha Seguridad','ES','https://www.ongrup.com/','ongrup.com','info@ongrup.com','+34937314491',NULL::text,'Terrassa','Barcelona','Catalonia','ES',41.563,2.009,'Carretera de Castellar 550, 08227 Terrassa',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona SECURITY est.2006 escoltas 250+ staff',v_sec),
    ('PYCSECA Seguridad Barcelona','PYCSECA Seguridad','ES','https://www.pycseca.com/','pycseca.com','barcelona@pycseca.com','+34932310412',NULL::text,'Padilla','Barcelona','Catalonia','ES',41.403,2.181,'Calle de Padilla 228 3a, 08013 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona SECURITY since1985 RNSP914 VIP escort',v_sec),

    -- ========== MADRID YACHT (1 → ~4) real B2B brokers ==========
    ('Royal Spanish Madrid','Royal Spanish | The Yacht Firm','ES','https://www.royalspanish.es/','royalspanish.es','brokerage@royalspanish.es','+34914320630',NULL::text,'Serrano','Madrid','Madrid','ES',40.430,-3.687,'Calle Serrano 51 bajo, 28006 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH ES Madrid YACHT brokerage est.2004 sales charter',v_yacht),
    ('YourCharterYacht Madrid','YourCharterYacht / Omega Global Services','ES','https://yourcharteryacht.com/','yourcharteryacht.com','info@yourcharteryacht.com','+34626167455','+34626167455','Villanueva','Madrid','Madrid','ES',40.422,-3.685,'Villanueva 20 4th Floor, 28001 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH ES Madrid YACHT charter brokerage 15y+ CYBA',v_yacht),
    ('Marina Yacht Madrid','Marina Yacht','ES','http://marinayacht.com/','marinayacht.com','info@marinayacht.com','+34914175943',NULL::text,'General Varela','Madrid','Madrid','ES',40.458,-3.698,'General Varela 35, 28020 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH ES Madrid YACHT long-standing brokerage SL',v_yacht)

  ) AS t(
    display_name, legal_name, country, website_url, website_domain, email, phone, whatsapp,
    base_label, city, region, country_code, lat, lng, formatted_address, rating, reviews, note, service_type_id
  )
  LOOP
    IF r.email IS NULL OR btrim(r.email) = '' THEN
      skipped := skipped + 1; CONTINUE;
    END IF;

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
  RAISE NOTICE 'Iberia gaps R5 LEADs: inserted=% skipped=%', inserted, skipped;
END $$;
