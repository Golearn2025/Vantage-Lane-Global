-- Iberia quality LEADs: Barcelona multiservice fill + Madrid thin gaps
-- Email required; phone when public; WhatsApp optional (never skip for missing WA)
-- Domains set NULL when parent brand domain already in DB (dedupe-safe)

DO $$
DECLARE
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_med  uuid := '19353c68-bed1-4625-a811-da4e2a2a2f42';
  v_yacht uuid := '443ac19c-9b4b-4277-9531-e52d6163cb6a';
  v_sec uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_av  uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035'; -- PRIVATE_AVIATION
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- ========== BARCELONA CONCIERGE (0 → ~5) ==========
    ('Alberta La Grup Barcelona','Alberta La Grup','ES','https://albertalagrup.com/','albertalagrup.com','info@albertalagrup.com','+34936670403',NULL::text,'Passeig de Gracia','Barcelona','Catalonia','ES',41.398,2.159,'Passeig de Gracia 130, 08008 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona CONCIERGE est.2006 lifestyle management',v_conc),
    ('Time and Glam Barcelona','Time & Glam','ES','https://timeandglam.com/','timeandglam.com','info@timeandglam.com','+34630381677','+34630381677','Diagonal','Barcelona','Catalonia','ES',41.396,2.152,'Avda. Diagonal 468 8a, 08006 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona CONCIERGE est.2013 luxury PA',v_conc),
    ('Premium Traveler Barcelona','Premium Traveler Barcelona','ES','https://premiumtravelerbarcelona.com/','premiumtravelerbarcelona.com','oscar@premiumtravelerbarcelona.com','+34630928884','+34630928884','Barcelona','Barcelona','Catalonia','ES',41.39,2.17,'Barcelona luxury travel & concierge',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona CONCIERGE ~decade tailor-made',v_conc),
    ('Madrid Concierge Madrid desk','Madrid Concierge','ES','https://madridconcierge.com/','madridconcierge.com','info@madridconcierge.com','+34666380030','+34666380030','Goya','Madrid','Madrid','ES',40.425,-3.682,'C/ Goya 18 5o Izda, 28001 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH ES Madrid CONCIERGE luxury events travel',v_conc),

    -- ========== BARCELONA HOSPITALITY (0 → ~5) ==========
    ('Mandarin Oriental Barcelona','Mandarin Oriental Barcelona','ES','https://www.mandarinoriental.com/en/barcelona/passeig-de-gracia',NULL::text,'mobcn-info@mohg.com','+34931518888',NULL::text,'Passeig de Gracia','Barcelona','Catalonia','ES',41.391,2.165,'Passeig de Gracia 38-40, 08007 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona HOSPITALITY luxury hotel',v_hosp),
    ('Hotel Arts Barcelona','Hotel Arts Barcelona','ES','https://www.ritzcarlton.com/en/hotels/bcnrz-hotel-arts-barcelona/overview/',NULL::text,'artsreservations@ritzcarlton.com','+34932211000',NULL::text,'Port Olimpic','Barcelona','Catalonia','ES',41.387,2.196,'Marina 19-21, 08005 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona HOSPITALITY est.1992 Ritz-Carlton',v_hosp),
    ('W Barcelona','W Barcelona','ES','https://www.marriott.com/en-us/hotels/bcnwh-w-barcelona/overview/','whotels.com','wbarcelona.reservations@whotels.com','+34932952800',NULL::text,'Barceloneta','Barcelona','Catalonia','ES',41.368,2.190,'Placa de la Rosa dels Vents 1, 08039 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona HOSPITALITY landmark beach hotel',v_hosp),
    ('El Palace Barcelona','El Palace Barcelona','ES','https://www.hotelpalacebarcelona.com/','hotelpalacebarcelona.com','reservas@hotelpalacebarcelona.com','+34935101130','+34648273741','Gran Via','Barcelona','Catalonia','ES',41.392,2.171,'Gran Via de les Corts Catalanes 668, 08010 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona HOSPITALITY est.1919 5-star',v_hosp),
    ('Majestic Hotel Spa Barcelona','Majestic Hotel & Spa Barcelona','ES','https://majestichotelgroup.com/en/barcelona/hotel-majestic/','hotelmajestic.es','info@hotelmajestic.es','+34934881717',NULL::text,'Passeig de Gracia','Barcelona','Catalonia','ES',41.393,2.164,'Passeig de Gracia 68-70, 08007 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona HOSPITALITY iconic 5-star',v_hosp),

    -- ========== BARCELONA MEDICAL (0 → ~5) ==========
    ('Centro Medico Teknon Barcelona','Centro Medico Teknon','ES','https://teknon.quironsalud.com/',NULL::text,'web.tkn@quironsalud.es','+34932906200',NULL::text,'Sant Gervasi','Barcelona','Catalonia','ES',41.406,2.137,'Carrer de Vilana 12, 08022 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona MEDICAL Quironsalud JCI VIP',v_med),
    ('Hospital Quironsalud Barcelona','Hospital Quironsalud Barcelona','ES','https://www.quironsalud.com/hospital-barcelona',NULL::text,'atencionpaciente.bcn@quironsalud.es','+34932554000',NULL::text,'Alfonso Comin','Barcelona','Catalonia','ES',41.413,2.140,'Plaza Alfonso Comin 5, 08023 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona MEDICAL Quironsalud private hospital',v_med),
    ('Clinica Diagonal Barcelona','Clinica Diagonal','ES','https://www.clinicadiagonal.com/','clinicadiagonal.com','clinicadiagonal@clinicadiagonal.com','+34932053213',NULL::text,'Esplugues','Barcelona','Catalonia','ES',41.387,2.112,'Carrer de Sant Mateu 24-26, 08950 Esplugues de Llobregat',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona MEDICAL private clinic FIATC',v_med),
    ('Clinica Corachan Barcelona','Clinica Corachan','ES','https://www.corachan.com/','corachan.com','econtact@corachan.com','+34932545800',NULL::text,'Sarria','Barcelona','Catalonia','ES',41.397,2.134,'Placa Dr. Manuel Corachan 4, 08017 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona MEDICAL historic private clinic',v_med),
    ('Dexeus Mujer Barcelona','Dexeus Mujer / Consultorio Dexeus','ES','https://en.dexeus.com/','dexeus.com','international@dexeus.com','+34932274896',NULL::text,'Les Corts','Barcelona','Catalonia','ES',41.383,2.128,'Gran Via Carles III 71-75, 08028 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona MEDICAL international patient dept',v_med),

    -- ========== BARCELONA EVENTS (0 → ~4) ==========
    ('KT Events Barcelona','KT-EVENTS','ES','https://kt-events.com/','kt-events.com','info@kt-events.com','+34932405240',NULL::text,'Eixample','Barcelona','Catalonia','ES',41.396,2.168,'Roger de Lluria 115 4o 1a, 08037 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona EVENTS DMC est.2000 MICE',v_evt),
    ('Bacus Events Barcelona','Bacus Events','ES','https://bacusevents.com/','bacusevents.com','info@bacusevents.com','+34934120066',NULL::text,'Sardenya','Barcelona','Catalonia','ES',41.396,2.186,'Carrer de Sardenya 83, 08018 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona EVENTS 30+ years corporate',v_evt),
    ('Abile Corporate Events Barcelona','Abile Corporate Events','ES','https://en.abilevents.com/','abile-events.com','info@abile-events.com','+34934736815',NULL::text,'Barcelona','Barcelona','Catalonia','ES',41.40,2.15,'C/ Gabriel Ferrater 2, Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona EVENTS 20+ years corporate',v_evt),

    -- ========== BARCELONA SECURITY (0 → ~4) ==========
    ('Diplomat Protection Group Barcelona','Diplomat Protection Group','ES','https://www.diplomatprotectiongroup.com/','diplomatprotectiongroup.com','barcelona@diplomatprotectiongroup.com','+34626826042','+34626826042','Barcelona desk','Barcelona','Catalonia','ES',41.39,2.17,'Barcelona executive protection est.1997',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona SECURITY close protection 27y',v_sec),
    ('DoubleFalco Security Barcelona','DoubleFalco Security','ES','https://www.doublefalcosecurity.com/','doublefalcosecurity.com','info@doublefalcosecurity.com','+34611412362','+34611412362','Mataro','Barcelona','Catalonia','ES',41.540,2.445,'Ronda President Irla 26, 08302 Mataro',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona SECURITY VIP bodyguards',v_sec),
    ('Enerpro Seguridad Barcelona','Enerpro Seguridad','ES','https://enerproseguridad.com/','enerproseguridad.com','enerproseguridad@enerproseguridad.com','+34933511227',NULL::text,'Barcelona','Barcelona','Catalonia','ES',41.42,2.20,'Barcelona escolta privado est.1985 ISO9001',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona SECURITY 40+ years RNSP 3770',v_sec),

    -- ========== BARCELONA PRIVATE_AVIATION (0 → ~4) ==========
    ('ExecuJet Barcelona FBO','ExecuJet Barcelona','ES','https://www.execujet.com/locations/barcelona-fbo-lebl/',NULL::text,'fbo.lebl@execujet.com','+34932983373',NULL::text,'El Prat','Barcelona','Catalonia','ES',41.297,2.078,'Terminal Corporativa, 08820 El Prat de Llobregat',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona PRIVATE_AVIATION Luxaviation FBO',v_av),
    ('Jetex Barcelona FBO','Jetex Barcelona','ES','https://site.jetex.com/network/barcelona-spain/',NULL::text,'bcn-barcelona@jetex.com','+34933707300',NULL::text,'El Prat','Barcelona','Catalonia','ES',41.297,2.078,'Terminal Aviacion Corporativa, El Prat',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona PRIVATE_AVIATION Jetex FBO',v_av),
    ('AviaVIP Barcelona FBO','AviaVIP Barcelona','ES','https://aviavip.com/network/barcelona-fbo/',NULL::text,'lebl@aviavip.com','+34673847508',NULL::text,'El Prat','Barcelona','Catalonia','ES',41.297,2.078,'Barcelona Airport FBO LEBL',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona PRIVATE_AVIATION AviaVIP FBO',v_av),
    ('General Aviation Service Barcelona','General Aviation Service Barcelona','ES','https://generalaviation.es/barcelona/',NULL::text,'barcelona@generalaviation.es','+34932983893',NULL::text,'El Prat','Barcelona','Catalonia','ES',41.297,2.078,'Barcelona-El Prat executive handling',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona PRIVATE_AVIATION GAS FBO',v_av),

    -- ========== BARCELONA YACHT (2 → ~5+) ==========
    ('BeCharter Barcelona','BeCharter / Guasch Group','ES','https://becharter.com/','becharter.com','info@becharter.com','+34639631149','+34639631149','Port Olimpic','Barcelona','Catalonia','ES',41.386,2.200,'Moll de la Marina local 14, 08005 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona YACHT est.2012 Guasch 30y nautical',v_yacht),
    ('Charterdart Barcelona','charterdart','ES','https://charterdart.com/','charterdart.com','hello@charterdart.com','+34930098470',NULL::text,'OneOcean Port Vell','Barcelona','Catalonia','ES',41.377,2.185,'OneOcean Port Vell, Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona YACHT est.2015 luxury charter',v_yacht),
    ('Ventura Yachts Barcelona','Ventura Yachts Barcelona','ES','https://www.venturayachts.com/offices/barcelona',NULL::text,'barcelona@venturayachts.com','+34938339142',NULL::text,'Marina Port Vell','Barcelona','Catalonia','ES',41.376,2.183,'Passeig Joan de Borbo 86, 08039 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona YACHT Ferretti Group dealer',v_yacht),
    ('Princess Yachts Barcelona','Princess Yachts Barcelona / 88Yachts','ES','https://www.princessyachtsbarcelona.com/','princessyachtsbarcelona.com','info@princessyachtsbarcelona.com','+34936815854','+34663379637','Marina Vela','Barcelona','Catalonia','ES',41.375,2.182,'Passeig Joan de Borbo 103 Local R03, 08039 Barcelona',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona YACHT 30y Princess dealer',v_yacht),
    ('De Valk Barcelona','De Valk Yacht Brokers Barcelona','ES','https://www.devalk.nl/en/offices/barcelona.html','devalk.nl','barcelona@devalk.nl','+34932202825',NULL::text,'Barcelona coast','Barcelona','Catalonia','ES',41.55,2.45,'Barcelona region yacht brokerage',NULL::numeric,NULL::int,'WEB_RESEARCH ES Barcelona YACHT De Valk brokerage',v_yacht),

    -- ========== MADRID MEDICAL (3 → ~5) ==========
    ('Clinica Universidad Navarra Madrid','Clinica Universidad de Navarra Madrid','ES','https://www.cun.es/sedes/sede-madrid','cun.es','atpacientecun@unav.es','+34913531920',NULL::text,'San Blas','Madrid','Madrid','ES',40.448,-3.625,'Calle Marquesado de Santa Marta 1, 28027 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH ES Madrid MEDICAL CUN high-resolution clinic',v_med),
    ('Olympia Quironsalud Madrid','Olympia Centro Medico-Quirurgico','ES','https://olympia.quironsalud.com/',NULL::text,'atencionusuario.oly@quironsalud.es','+34914101200',NULL::text,'Castellana','Madrid','Madrid','ES',40.476,-3.688,'Paseo de la Castellana 259 E, 28046 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH ES Madrid MEDICAL Quironsalud Olympia CTBA',v_med),

    -- ========== MADRID PRIVATE_AVIATION (2 → ~5) ==========
    ('Jetex Madrid FBO','Jetex Madrid','ES','https://www.jetex.com/network/madrid-spain/',NULL::text,'mad-madrid@jetex.com','+34696389536',NULL::text,'Barajas','Madrid','Madrid','ES',40.472,-3.562,'Terminal Aviacion Ejecutiva, Madrid-Barajas',NULL::numeric,NULL::int,'WEB_RESEARCH ES Madrid PRIVATE_AVIATION Jetex FBO',v_av),
    ('United Aviation Madrid','United Aviation Madrid','ES','https://unitedaviation.es/stations/madrid-barajas','unitedaviation.es','ops.mad@unitedaviation.es','+34913936775',NULL::text,'Barajas','Madrid','Madrid','ES',40.472,-3.562,'Av de la Hispanidad s/n, 28042 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH ES Madrid PRIVATE_AVIATION United Aviation FBO',v_av),
    ('Sky Valet Madrid FBO','Sky Valet Madrid Barajas','ES','https://www.skyvalet.com/fbo-network/spain/madrid-barajas','skyvalet.com','occ@skyvalet.com','+34916782648',NULL::text,'Barajas','Madrid','Madrid','ES',40.472,-3.562,'Executive Aviation Terminal Madrid-Barajas',NULL::numeric,NULL::int,'WEB_RESEARCH ES Madrid PRIVATE_AVIATION Sky Valet FBO',v_av),

    -- ========== MADRID YACHT (0 → ~2) ==========
    ('Ventura Yachts Madrid','Ventura Yachts Madrid','ES','https://www.venturayachts.com/offices/madrid',NULL::text,'madrid@venturayachts.com','+34916684909',NULL::text,'Salamanca','Madrid','Madrid','ES',40.428,-3.685,'Calle Ayala 4, 28001 Madrid',NULL::numeric,NULL::int,'WEB_RESEARCH ES Madrid YACHT Ferretti Group brokerage charter',v_yacht)

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
  RAISE NOTICE 'Iberia quality LEADs: inserted=% skipped=%', inserted, skipped;
END $$;
