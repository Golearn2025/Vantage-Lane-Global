-- HIGH-QUALITY LEADs: Paris / Milan / Frankfurt non-GT gap fill
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
    -- ========== PARIS FR ==========
    -- HOSPITALITY (2 → ~5)
    ('Ritz Paris','The Ritz Hotel Limited','FR','https://www.ritzparis.com/','ritzparis.com','reservations@ritzparis.com','+33143163030',NULL::text,'Place Vendome','Paris','Ile-de-France','FR',48.868,2.329,'15 Place Vendome, 75001 Paris',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris HOSPITALITY Q',v_hosp),
    ('Shangri-La Paris','Shangri-La Hotels (Paris)','FR','https://www.shangri-la.com/paris/shangrila/',NULL::text,'paris@shangri-la.com','+33153671998',NULL::text,'Avenue d Iena','Paris','Ile-de-France','FR',48.864,2.293,'10 avenue d''Iena, 75116 Paris',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris HOSPITALITY Q',v_hosp),
    ('Mandarin Oriental Paris','Mandarin Oriental Paris','FR','https://www.mandarinoriental.com/en/paris/place-vendome',NULL::text,'mopar-reservations@mohg.com','+33170987888',NULL::text,'Place Vendome','Paris','Ile-de-France','FR',48.867,2.328,'251 rue Saint-Honore, 75001 Paris',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris HOSPITALITY Q',v_hosp),

    -- MEDICAL (1 → ~4)
    ('Clinique Internationale du Parc Monceau','Clinique Internationale du Parc Monceau','FR','https://www.clinique-monceau.com/','clinique-monceau.com','contact@clinique-monceau.com','+33148882525',NULL::text,'Chazelles','Paris','Ile-de-France','FR',48.881,2.308,'21 rue de Chazelles, 75017 Paris',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris MEDICAL Q',v_med),
    ('Clinique des Champs-Elysees Paris','Clinique des Champs-Elysees','FR','https://www.cliniquedeschampselysees.com/','cliniquedeschampselysees.com','bonjour@cliniquedeschampselysees.com','+33153772588',NULL::text,'FDR','Paris','Ile-de-France','FR',48.870,2.309,'61 avenue Franklin Delano Roosevelt, 75008 Paris',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris MEDICAL Q',v_med),
    ('Hopital Franco-Britannique Levallois','Hopital Franco-Britannique','FR','https://www.hopitalfrancobritannique.org/','hopitalfrancobritannique.org','contact@hopitalfrancobritannique.org','+33147595959',NULL::text,'Levallois','Paris','Ile-de-France','FR',48.893,2.288,'4 rue Kleber, 92300 Levallois-Perret',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris MEDICAL Q',v_med),

    -- PRIVATE_AVIATION (3 → ~5)
    ('Jet Aviation Le Bourget','Jet Aviation Paris Le Bourget','FR','https://www.jetaviation.com/location/paris/',NULL::text,'lbgfbo@jetaviation.com','+33184870300',NULL::text,'LBG FBO','Paris','Ile-de-France','FR',48.97,2.44,'Rue de Prague Zone Aviateurs, 95500 Bonneuil-en-France',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris PRIVATE_AVIATION Q',v_av),
    ('Universal Aviation Le Bourget','Universal Aviation France','FR','https://www.universalaviation.aero/locations/france/paris-le-bourget-lfpb/','universalaviation.aero','france@universalaviation.aero','+33148359638',NULL::text,'LBG','Paris','Ile-de-France','FR',48.97,2.44,'9 Avenue de l''Europe, 93350 Le Bourget',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris PRIVATE_AVIATION Q',v_av),

    -- YACHT (1 → ~5)
    ('Bateaux Parisiens','Bateaux Parisiens / Seino Vision','FR','https://www.bateauxparisiens.com/','bateauxparisiens.com','entreprises@bateauxparisiens.com','+33176641465',NULL::text,'Port de la Bourdonnais','Paris','Ile-de-France','FR',48.860,2.290,'Port de la Bourdonnais, 75007 Paris',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris YACHT Q',v_yacht),
    ('Vedettes de Paris','Vedettes de Paris SAS','FR','https://www.vedettesdeparis.fr/','vedettesdeparis.fr','info@vedettesdeparis.com','+33144181950',NULL::text,'Port de Suffren','Paris','Ile-de-France','FR',48.857,2.292,'Port de Suffren, 75007 Paris',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris YACHT Q',v_yacht),
    ('Paris Yacht Marina','Seine Alliance SAS','FR','https://www.parisyachtmarina.com/','parisyachtmarina.com','contact@parisyachtmarina.com','+33140580000',NULL::text,'Port de Grenelle','Paris','Ile-de-France','FR',48.850,2.286,'10 Port de Grenelle, 75015 Paris',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris YACHT Q',v_yacht),
    ('Green River Cruises Paris','Green River Paris','FR','https://www.greenriver-paris.fr/','greenriver-paris.fr','info@greenriver-paris.fr','+33650229065',NULL::text,'Seine private','Paris','Ile-de-France','FR',48.86,2.33,'Private Seine yacht cruises — Paris',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris YACHT Q',v_yacht),

    -- EVENTS (2 → ~5)
    ('JNJ Paris','JNJ','FR','https://www.mntd.fr/prestataire/jnj/','jnj.paris','contact@jnj.paris','+33762474592',NULL::text,'Madeleine','Paris','Ile-de-France','FR',48.870,2.326,'7 Boulevard de la Madeleine, 75001 Paris',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris EVENTS Q',v_evt),
    ('Paris Reception','Paris Reception','FR','https://parisreception.fr/','parisreception.fr','contact@parisreception.fr','+33177122362',NULL::text,'Ile Saint-Louis','Paris','Ile-de-France','FR',48.852,2.356,'9 Quai de Bourbon, 75004 Paris',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris EVENTS Q',v_evt),
    ('Takamaka Paris','Takamaka Paris','FR','https://paris.takamaka.fr/','takamaka.fr','paris@takamaka.fr','+33478792813',NULL::text,'Republique','Paris','Ile-de-France','FR',48.867,2.363,'Paris incentive & corporate events desk',NULL::numeric,NULL::int,'WEB_RESEARCH EU Paris EVENTS Q',v_evt),

    -- ========== MILAN IT ==========
    -- HOSPITALITY (2 → ~5)
    ('Park Hyatt Milan','Park Hyatt Milan','IT','https://www.hyatt.com/park-hyatt/en-US/milph-park-hyatt-milan',NULL::text,'milan.park@hyatt.com','+390288211234',NULL::text,'Via Tommaso Grossi','Milan','Lombardy','IT',45.465,9.189,'Via Tommaso Grossi 1, 20121 Milan',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan HOSPITALITY Q',v_hosp),
    ('Bulgari Hotel Milano','Bulgari Hotel Milano','IT','https://www.bulgarihotels.com/en_US/milan','bulgarihotels.com','milano@bulgarihotels.com','+39028058051',NULL::text,'Via Fratelli Gabba','Milan','Lombardy','IT',45.472,9.189,'Via Privata Fratelli Gabba 7b, 20121 Milano',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan HOSPITALITY Q',v_hosp),
    ('Excelsior Hotel Gallia Milan','Excelsior Hotel Gallia','IT','https://www.excelsiorgallia.com/',NULL::text,'ReservationExcelsiorGallia@theluxurycollection.com','+390267856767',NULL::text,'Piazza Duca d Aosta','Milan','Lombardy','IT',45.485,9.203,'Piazza Duca d''Aosta 9, 20124 Milan',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan HOSPITALITY Q',v_hosp),

    -- MEDICAL (0 → ~4)
    ('Humanitas Research Hospital','Humanitas Research Hospital','IT','https://www.humanitas.it/','humanitas.it','patients@humanitas.it','+390282247044',NULL::text,'Rozzano','Milan','Lombardy','IT',45.387,9.156,'Via Manzoni 56, 20089 Rozzano (Milano)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan MEDICAL Q',v_med),
    ('Clinica Columbus Milano','Columbus Clinic Center S.r.l.','IT','https://www.columbus3c.com/','columbus3c.com','info@columbus3c.com','+3902480801',NULL::text,'Buonarroti','Milan','Lombardy','IT',45.468,9.154,'Via Buonarroti 48, 20145 Milano',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan MEDICAL Q',v_med),
    ('IEO European Institute of Oncology','Istituto Europeo di Oncologia','IT','https://www.ieo.it/','ieo.it','international.office@ieo.it','+390257489330',NULL::text,'Ripamonti','Milan','Lombardy','IT',45.433,9.229,'Via Ripamonti 435, 20141 Milano',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan MEDICAL Q',v_med),
    ('Casa di Cura La Madonnina','Casa di Cura La Madonnina','IT','https://lamadonnina.grupposandonato.it/',NULL::text,'international@gsdh.it','+3902583951',NULL::text,'Quadronno','Milan','Lombardy','IT',45.455,9.192,'Via Quadronno 29, 20122 Milano',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan MEDICAL Q',v_med),

    -- PRIVATE_AVIATION (1 → ~4)
    ('Signature Aviation Linate','Signature Aviation LIN','IT','https://www.signatureaviation.com/locations/LIN',NULL::text,'LIN@signatureflight.it','+390274854804',NULL::text,'LIN FBO','Milan','Lombardy','IT',45.445,9.277,'Viale dell''Aviazione 65, Milano Linate',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan PRIVATE_AVIATION Q',v_av),
    ('Signature Aviation Malpensa','Signature Aviation MXP','IT','https://www.signatureaviation.com/locations/I03',NULL::text,'mxp@signatureaviation.com','+393938861929',NULL::text,'MXP FBO','Milan','Lombardy','IT',45.630,8.723,'Milano Prime GA Terminal, Malpensa',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan PRIVATE_AVIATION Q',v_av),
    ('Sky Services Linate','Sky Services S.p.A.','IT','https://www.skyservices.it/','skyservices.it','lin@skyservices.it','+390270208179',NULL::text,'LIN handling','Milan','Lombardy','IT',45.445,9.277,'Milan Linate FBO / handling',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan PRIVATE_AVIATION Q',v_av),

    -- SECURITY (1 → ~5)
    ('Sly Service Security Milano','S.S. Security & Bodyguard Srl','IT','https://www.slyservice.com/','slyservice.com','info@slyservice.com','+390237908885',NULL::text,'Jacopo Dal Verme','Milan','Lombardy','IT',45.492,9.185,'Via Jacopo Dal Verme 7, 20159 Milano',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan SECURITY Q',v_sec),
    ('Security Job Milano','Security Job Srl','IT','https://bodyguardmilano.it/','securityjob.eu','info@securityjob.eu','+390280898424',NULL::text,'Porta Vittoria','Milan','Lombardy','IT',45.462,9.212,'Corso di Porta Vittoria 18, 20122 Milano',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan SECURITY Q',v_sec),
    ('GSA Global Security Agency Milano','G.S.A. Global Security Agency Srl','IT','https://www.securityagency.it/','securityagency.it','info@securityagency.it','+393332051969',NULL::text,'Perin Del Vaga','Milan','Lombardy','IT',45.505,9.155,'Via Perin Del Vaga 9, 20156 Milano',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan SECURITY Q',v_sec),
    ('GF Services Milano','GF Services','IT','https://gefservices.it/','gefservices.it','info@gefservices.it','+393389371859',NULL::text,'Garbagnate','Milan','Lombardy','IT',45.574,9.076,'Via Roma 94, 20024 Garbagnate Milanese',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan SECURITY Q',v_sec),

    -- EVENTS (0 → ~4)
    ('PRY Special Events Milano','PRY Srl','IT','https://www.pry.it/','pry.it','info@pry.it','+390236525265',NULL::text,'Corso Colombo','Milan','Lombardy','IT',45.453,9.170,'Corso Colombo 10, 20144 Milano',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan EVENTS Q',v_evt),
    ('The Luxury Network Italia','Competence Srl / The Luxury Network Italia','IT','https://www.theluxurynetwork.it/','theluxurynetwork.it','info@theluxurynetwork.it','+390236747820',NULL::text,'Via Kramer','Milan','Lombardy','IT',45.468,9.210,'Via Antonio Kramer 31, 20129 Milan',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan EVENTS Q',v_evt),

    -- CONCIERGE (1 → ~3)
    ('Luxury Concierge Services Milan','Luxury Concierge Services Milan','IT','https://luxuryconciergeservicesmilan.com/','luxuryconciergeservicesmilan.com','info@luxuryconciergeservicesmilan.com','+393757485198',NULL::text,'Milan','Milan','Lombardy','IT',45.46,9.19,'Milan luxury lifestyle concierge',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan CONCIERGE Q',v_conc),

    -- YACHT (0 → ~4) — Lake Como / Maggiore desks serving Milan UHNW
    ('Oyster Como Charter','Oyster Como Charter','IT','https://oystercomocharter.com/','oystercomocharter.com','info@oystercomocharter.com','+393495796518',NULL::text,'Carate Urio','Milan','Lombardy','IT',45.837,9.163,'Via Regina Nuova 59, 22010 Carate Urio (CO)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan YACHT Q',v_yacht),
    ('Charter House Lago Maggiore','IN-ITALY S.r.l.','IT','http://charter-lagomaggiore.com/','charter-lagomaggiore.com','info@charter-lagomaggiore.com','+393936001568',NULL::text,'Sesto Calende','Milan','Lombardy','IT',45.726,8.634,'Via delle Ferriere 15, 21018 Sesto Calende (legal Milan)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan YACHT Q',v_yacht),
    ('Maggiore Boat Experience','Maggiore Boat Experience','IT','https://www.maggioreboat.it/','maggioreboat.it','boatexperience@bluerelais-maggiore.com','+390331920554',NULL::text,'Castelletto','Milan','Lombardy','IT',45.720,8.650,'Castelletto Sopra Ticino dock — Maggiore',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan YACHT Q',v_yacht),
    ('Charter Como','Charter Como','IT','https://www.chartercomo.it/','chartercomo.it','be.chartercomo@gmail.com','+39335281916',NULL::text,'Lake Como','Milan','Lombardy','IT',45.81,9.08,'Private Lake Como boat charter — Milan desk',NULL::numeric,NULL::int,'WEB_RESEARCH EU Milan YACHT Q',v_yacht),

    -- ========== FRANKFURT DE ==========
    -- HOSPITALITY (1 → ~5)
    ('Villa Kennedy Frankfurt','Villa Kennedy / Rocco Forte','DE','https://www.roccofortehotels.com/hotels-and-resorts/villa-kennedy/',NULL::text,'reservations.villakennedy@roccofortehotels.com','+4969717120',NULL::text,'Kennedyallee','Frankfurt','Hesse','DE',50.098,8.676,'Kennedyallee 70, 60596 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt HOSPITALITY Q',v_hosp),
    ('Steigenberger Icon Frankfurter Hof','Steigenberger Icon Frankfurter Hof','DE','https://www.steigenberger.com/en/hotels/all-hotels/germany/frankfurt/steigenberger-frankfurter-hof',NULL::text,'rezeption@frankfurter-hof.steigenberger.de','+496921502',NULL::text,'Kaiserplatz','Frankfurt','Hesse','DE',50.110,8.675,'Am Kaiserplatz / Bethmannstrasse 33, 60311 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt HOSPITALITY Q',v_hosp),
    ('Roomers Frankfurt Central','RUR Hotelbetriebs GmbH','DE','https://www.roomers-hotels.com/frankfurt-central/','roomers-hotels.com','central@roomers-hotels.com','+49692713420',NULL::text,'Gutleutstrasse','Frankfurt','Hesse','DE',50.103,8.664,'Gutleutstrasse 85, 60329 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt HOSPITALITY Q',v_hosp),
    ('JW Marriott Hotel Frankfurt','JW Marriott Hotel Frankfurt','DE','https://www.marriott.com/en-us/hotels/frajw-jw-marriott-hotel-frankfurt/overview/',NULL::text,'info@jwfrankfurt.com','+49692972370',NULL::text,'Thurn-und-Taxis-Platz','Frankfurt','Hesse','DE',50.115,8.680,'Thurn-und-Taxis-Platz 2, 60313 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt HOSPITALITY Q',v_hosp),

    -- MEDICAL (0 → ~3)
    ('Agaplesion Bethanien Krankenhaus Frankfurt','AGAPLESION BETHANIEN KRANKENHAUS','DE','https://www.bethanien-krankenhaus.de/',NULL::text,'bethanien.fdk@agaplesion.de','+496946080',NULL::text,'Pruefling','Frankfurt','Hesse','DE',50.133,8.707,'Im Pruefling 21-25, 60389 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt MEDICAL Q',v_med),
    ('Krankenhaus Nordwest Frankfurt','Krankenhaus Nordwest GmbH','DE','https://www.krankenhaus-nordwest.de/','krankenhaus-nordwest.de','info@sthhg.de','+496976011',NULL::text,'Steinbacher Hohl','Frankfurt','Hesse','DE',50.145,8.630,'Steinbacher Hohl 2-26, 60488 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt MEDICAL Q',v_med),
    ('Universitatsklinikum Frankfurt International','Universitatsmedizin Frankfurt','DE','https://www.unimedizin-ffm.de/aufenthalt/international-office',NULL::text,'international.office@unimedizin-ffm.de','+496963015720',NULL::text,'Theodor-Stern-Kai','Frankfurt','Hesse','DE',50.094,8.667,'Theodor-Stern-Kai 7, 60590 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt MEDICAL Q',v_med),

    -- PRIVATE_AVIATION (1 → ~3)
    ('Business Aviation Centre Frankfurt','BACF Business Aviation Centre Frankfurt GmbH','DE','https://www.bac-frankfurt.com/','bac-frankfurt.com','ops@bac-frankfurt.com','+496969029534',NULL::text,'GAT FRA','Frankfurt','Hesse','DE',50.05,8.57,'Building 514, General Aviation Terminal, 60547 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt PRIVATE_AVIATION Q',v_av),
    ('FAS Frankfurt Aviation Service','FAS Frankfurt Aviation Service','DE','https://www.germanaviation.com/',NULL::text,'ops@fas.aero','+496963809620',NULL::text,'FRA FBO','Frankfurt','Hesse','DE',50.05,8.57,'Building 511, Frankfurt Airport, 60549 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt PRIVATE_AVIATION Q',v_av),

    -- SECURITY (0 → ~4) — Custodia already in DB, skipped
    ('CIBORIUS Security Frankfurt','CIBORIUS Security & Service Solutions Frankfurt am Main GmbH','DE','https://security-sicherheitsdienst-frankfurt.de/',NULL::text,'frankfurt@security.de','+496995412500',NULL::text,'Stuetzelaeckerweg','Frankfurt','Hesse','DE',50.140,8.620,'Stuetzelaeckerweg 14, 60489 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt SECURITY Q',v_sec),
    ('Empire MDS Frankfurt','Empire MDS GmbH','DE','https://sicherheitsdienst-frankfurt.biz/','empire-mds.de','info@empire-mds.de','+496980532107',NULL::text,'Hanauer Landstrasse','Frankfurt','Hesse','DE',50.120,8.740,'Hanauer Landstrasse 291b, 60314 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt SECURITY Q',v_sec),
    ('Hesse Management Frankfurt','Hesse Management GmbH','DE','https://hesse-management.de/','hesse-management.de','info@hesse-management.de','+496986090650',NULL::text,'Muehlheim desk','Frankfurt','Hesse','DE',50.12,8.84,'Hauptstrasse 19, 63165 Muehlheim am Main',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt SECURITY Q',v_sec),
    ('SOW Sicherheitsdienst Frankfurt','SOW Sicherheitsdienst GmbH','DE','https://www.sow-sicherheit.de/','sow-sicherheit.de','info@sow-sicherheit.de','+49714395681000',NULL::text,'Frankfurt desk','Frankfurt','Hesse','DE',50.11,8.68,'VIP & event close protection — Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt SECURITY Q',v_sec),

    -- EVENTS (0 → ~2+)
    ('global desire EVENTMANUFAKTUR Frankfurt','global desire GmbH','DE','https://www.globaldesire.de/','globaldesire.de','hello@globaldesire.de','+4969660557730',NULL::text,'Salzschlirfer Strasse','Frankfurt','Hesse','DE',50.130,8.730,'Salzschlirfer Strasse 4, 60386 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt EVENTS Q',v_evt),

    -- YACHT (0 → ~2) — Main river charter (inland)
    ('PRIMUS-Linie Frankfurt','Frankfurter Personenschiffahrt Anton Nauheimer GmbH','DE','https://www.primus-linie.de/','primus-linie.de','mail@primus-linie.de','+496913383711',NULL::text,'Mainkai','Frankfurt','Hesse','DE',50.109,8.682,'Mainkai 36, 60311 Frankfurt',NULL::numeric,NULL::int,'WEB_RESEARCH EU Frankfurt YACHT Q',v_yacht)
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
  RAISE NOTICE 'FR IT DE quality leads: inserted=% skipped=%', inserted, skipped;
END $$;
