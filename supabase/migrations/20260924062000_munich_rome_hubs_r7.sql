-- Coverage R7: Seed Munich (DE) + Rome (IT) as multi-service hubs (~3–4 LEADs / key service).
-- Pre-audit: München GT=2; Roma GT=3; SECURITY/HOSPITALITY/CONCIERGE/EVENTS/PRIVATE_AVIATION=0 both.
-- Skip if already ≥4. EMAIL required; PHONE when public; WhatsApp optional (never invent).
-- Established firms only; ratings NULL; PRIVATE_AVIATION not AVIATION.
-- notes: WEB_RESEARCH EU Munich {SVC} R7 / WEB_RESEARCH EU Rome {SVC} R7

DO $$
DECLARE
  v_gt   uuid := 'a44149dd-e4b3-4e32-8074-ad1248f27521';
  v_sec  uuid := '4acaf322-5dc3-47bf-b231-a91632e36b45';
  v_hosp uuid := '8724134a-2249-4d87-83aa-167db279aab8';
  v_conc uuid := 'e857fe35-436d-49c1-a520-38ac9a199ea6';
  v_evt  uuid := '7fe7c6a1-504f-4b3f-934e-5e5cdd9802d9';
  v_av   uuid := '0c8dec5e-ccff-4f0c-8c3d-45357085c035';
  v_admin uuid := 'b3105232-0857-4eed-b022-d8147683c059';
  r record; v_org uuid; inserted int := 0; skipped int := 0;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    -- ========== MUNICH DE — GROUND_TRANSPORTATION (2 → ~4) ==========
    ('Bavaria Limousines Munich','Bavaria Limousines GmbH & Co. KG','DE','https://www.bavaria-limousines.de/','bavaria-limousines.de','info@bavaria-limousines.com','+498955274891',NULL::text,'Ottobrunn HQ','München','Bavaria','DE',48.063,11.663,'Jägerweg 5, 85521 Ottobrunn bei München',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich GT R7',v_gt),
    ('Luxora VIP Munich','Luxora VIP Chauffeur & Travel','DE','https://luxoravip.de/en/','luxoravip.de','office@luxoravip.de',NULL::text,NULL::text,'Munich chauffeur desk','München','Bavaria','DE',48.137,11.575,'München — premium Mercedes chauffeur service',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich GT R7',v_gt),

    -- ========== MUNICH DE — SECURITY (0 → ~4) ==========
    ('Certified Close Protection Munich','Certified Close Protection by Sebastian Tyroller','DE','https://www.cc-protection.com/','cc-protection.com','kontakt@cc-protection.com','+4989217039410',NULL::text,'Munich close protection','München','Bavaria','DE',48.137,11.575,'München — TÜV-certified executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich SECURITY R7',v_sec),
    ('Proteus.one Munich','Proteus.one GmbH','DE','https://proteus.one/en/','proteus.one','info@proteus.one','+4989411471700',NULL::text,'Geiselgasteig','München','Bavaria','DE',48.078,11.555,'Geiselgasteigstrasse 122, 81545 München',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich SECURITY R7',v_sec),
    ('MH DEfensive PROtection Munich','MH DEfensive PROtection e.K.','DE','https://mh-depro.com/en/','mh-depro.com','info@mh-depro.com','+498938898183',NULL::text,'Munich executive protection','München','Bavaria','DE',48.137,11.575,'München — discreet executive & family protection',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich SECURITY R7',v_sec),
    ('Protect Team Munich','Protect Team','DE','http://www.protectteam.eu/','protectteam.eu','info@protectteam.eu','+498917104780',NULL::text,'Munich security desk','München','Bavaria','DE',48.137,11.575,'München — private security & protection',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich SECURITY R7',v_sec),

    -- ========== MUNICH DE — HOSPITALITY (0 → ~4) ==========
    ('A.O.G. Hauspersonal Munich','Agentur ohne Grenzen / A.O.G.','DE','https://www.aog-hauspersonal.de/','aog-hauspersonal.de','info@aog-online.de','+4989299900',NULL::text,'Stollbergstrasse','München','Bavaria','DE',48.139,11.580,'Stollbergstrasse 18, 80539 München',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich HOSPITALITY R7',v_hosp),
    ('Agentur OTeam Munich','Agentur OTeam GmbH','DE','https://www.agentur-oteam.de/en','agentur-oteam.de','ot@agentur-oteam.de','+498999744920',NULL::text,'Karl-Marx-Ring','München','Bavaria','DE',48.100,11.620,'Karl-Marx-Ring 90, 81735 München — VIP hospitality staffing',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich HOSPITALITY R7',v_hosp),
    ('PP Hospitality Services Munich','PP Hospitality Services GmbH','DE','https://party-people.net/','party-people.net','contact@party-people.net','+4989960573',NULL::text,'Ismaning / Munich','München','Bavaria','DE',48.229,11.676,'Ismaning bei München — top-gastronomy hospitality staffing',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich HOSPITALITY R7',v_hosp),
    ('HUMAN LUXURY Munich','HUMAN LUXURY Recruiting & HR Consulting','DE','https://human-luxury.com/','human-luxury.com','info@human-luxury.com','+4915254637573',NULL::text,'Viktualienmarkt','München','Bavaria','DE',48.135,11.576,'Viktualienmarkt 8, 80331 München — hospitality & VIP staffing',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich HOSPITALITY R7',v_hosp),

    -- ========== MUNICH DE — CONCIERGE (0 → ~4) ==========
    ('Xceed Concierge Munich','Xceed Concierge Services GmbH','DE','https://www.xceed-concierge.com/','xceed-concierge.com','reservations@xceed-concierge.com','+4915142234344','+4915142234344','Aschheim / Munich','München','Bavaria','DE',48.170,11.720,'Max-Planck-Str. 4, 85609 Aschheim / Munich',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich CONCIERGE R7',v_conc),
    ('Grand Europa Munich','Grand Europa','DE','https://www.grandeuropa.de/en/','grandeuropa.de','info@grandeuropa.de','+491773241248','+491773241248','Kronstadter Strasse','München','Bavaria','DE',48.150,11.620,'Kronstadter Straße 8, 81677 München',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich CONCIERGE R7',v_conc),
    ('Concierge Tours Munich','ConciergeTours','DE','https://www.conciergetours.de/','conciergetours.de','info@conciergetours.de','+4916096680639','+4916096680639','Munich concierge desk','München','Bavaria','DE',48.137,11.575,'München — chauffeur & lifestyle concierge',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich CONCIERGE R7',v_conc),
    ('MINGA VIP Munich','MINGA VIP','DE','https://www.minga-vip.com/en/','minga-vip.com','info@minga-vip.com','+4917682271437',NULL::text,'Munich lifestyle concierge','München','Bavaria','DE',48.137,11.575,'München — international lifestyle concierge',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich CONCIERGE R7',v_conc),

    -- ========== MUNICH DE — EVENTS (0 → ~4) ==========
    ('Meyer Events Munich','Meyer Events GmbH','DE','https://meyer-events.de/eventagentur-muenchen/','meyer-events.de','eventagentur-muenchen@meyer-events.de','+498920008280',NULL::text,'Landsberger Strasse','München','Bavaria','DE',48.140,11.520,'Landsberger Straße 155/Haus 1, 80687 München',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich EVENTS R7',v_evt),
    ('off.events Munich','øff.events Kreativagentur','DE','https://off-events.com/','off-events.com','hello@off-events.com',NULL::text,NULL::text,'Rumfordstrasse','München','Bavaria','DE',48.133,11.580,'Rumfordstr. 33, 80469 München',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich EVENTS R7',v_evt),
    ('DAPP EVENTS Munich','DAPP AG','DE','https://www.dapp-ag.com/en/','dapp-ag.com','info@dapp-ag.com','+4989890636030',NULL::text,'Kirchheim / Munich','München','Bavaria','DE',48.170,11.750,'Heimstettner Strasse 2, 85551 Kirchheim / München',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich EVENTS R7',v_evt),
    ('P1 Corporate Events Munich','P1 Corporate Events','DE','https://p1-corporate-events.de/','p1-corporate-events.de','n.juettner@p1-corporate-events.de','+49892111140',NULL::text,'Prinzregentenstrasse','München','Bavaria','DE',48.144,11.590,'Prinzregentenstrasse 1, 80538 München',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich EVENTS R7',v_evt),

    -- ========== MUNICH DE — PRIVATE_AVIATION (0 → ~4) ==========
    ('ExecuJet Munich FBO','ExecuJet / Luxaviation','DE','https://www.execujet.com/locations/munich-fbo-eddm/',NULL::text,'fbo.eddm@execujet.com','+498997595800',NULL::text,'MUC GAT FBO','München','Bavaria','DE',48.354,11.786,'General Aviation Terminal, 85356 Munich-Airport (EDDM)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich PRIVATE_AVIATION R7',v_av),
    ('Jet Aviation Munich FBO','Jet Aviation','DE','https://www.jetaviation.com/',NULL::text,'mucfbo@jetaviation.com','+498997597440',NULL::text,'MUC Jet Aviation FBO','München','Bavaria','DE',48.354,11.786,'Munich Airport EDDM FBO',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich PRIVATE_AVIATION R7',v_av),
    ('Signature Aviation Munich FBO','Signature Aviation / SFS Munich','DE','https://www.signatureaviation.com/locations/MUC',NULL::text,'muc@signatureaviation.com','+498997597730',NULL::text,'MUC Signature FBO','München','Bavaria','DE',48.354,11.786,'General Aviation Terminal, 85356 München Airport',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich PRIVATE_AVIATION R7',v_av),
    ('MAS Munich Aviation Service','MAS Munich Aviation Service / German Aviation Service','DE','https://germanaviation.com/munich/','munichaviation.com','ops@munichaviation.com','+4989973379220',NULL::text,'MUC GAT Room E17','München','Bavaria','DE',48.354,11.786,'Munich Airport GAT Room E 17, 85356 München',NULL::numeric,NULL::int,'WEB_RESEARCH EU Munich PRIVATE_AVIATION R7',v_av),

    -- ========== ROME IT — GROUND_TRANSPORTATION (3 → ~4) ==========
    ('NCC.Roma Chauffeur','NCC.Roma','IT','https://www.ncc.roma.it/en/','ncc.roma.it','info@ncc.roma.it','+39066630621',NULL::text,'Via Sprovieri','Roma','Lazio','IT',41.875,12.465,'Via Francesco Saverio Sprovieri 6, 00152 Roma',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome GT R7',v_gt),

    -- ========== ROME IT — SECURITY (0 → ~4) ==========
    ('ADK Security Rome','ADK Security & Investigations','IT','https://adkgroup.ai/en','adkgroup.ai','info@adkgroup.ai','+39068541757',NULL::text,'Magliana','Roma','Lazio','IT',41.830,12.430,'Via delle Idrovore della Magliana 43, 00148 Roma',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome SECURITY R7',v_sec),
    ('SEPTU GROUP Rome','SEPTU GROUP Security Management','IT','https://septugroup.com/','septugroup.com','info@septugroup.com','+39066832760',NULL::text,'Rome HQ','Roma','Lazio','IT',41.902,12.496,'Roma — close protection & risk management (ICoCA)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome SECURITY R7',v_sec),
    ('Security Roma Management','Security Roma Management S.r.l.','IT','https://securityromamanagement.it/','securityromamanagement.it','info@securityromamanagement.it','+390684384962',NULL::text,'Rome security ops','Roma','Lazio','IT',41.902,12.496,'Roma — Prefettizia A/B/C private security',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome SECURITY R7',v_sec),
    ('FP Vigilanza Italia Rome','F.P. Vigilanza Italia S.p.A.','IT','https://fpvigilanza.it/','fpvigilanza.it','info@fpvigilanza.it','+3906820827',NULL::text,'Rome vigilanza','Roma','Lazio','IT',41.902,12.496,'Roma — istituto di vigilanza privata Art. 134 TULPS',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome SECURITY R7',v_sec),

    -- ========== ROME IT — HOSPITALITY (0 → ~4) ==========
    ('Rome and Italy VIP Hospitality','Rome And Italy Group','IT','https://www.romeanditaly.com/','romeanditaly.com','info@romeanditaly.it','+390644258441','+393349389812','Via Veronese','Roma','Lazio','IT',41.870,12.480,'Via Giuseppe Veronese 50, 00146 Roma — VIP butler & airport hospitality',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome HOSPITALITY R7',v_hosp),
    ('Nanny & Butler Rome','Nanny & Butler','IT','https://www.nannybutler.com/contact-us/nanny-butler-rome/','nannybutler.com','aurora@nannybutler.com','+393664174248',NULL::text,'Via Properzio','Roma','Lazio','IT',41.908,12.460,'Via Properzio 5, 00193 Roma',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome HOSPITALITY R7',v_hosp),
    ('Hotel Hassler Roma','Hassler Roma S.p.A.','IT','https://www.hotelhasslerroma.com/','hotelhasslerroma.com','booking@hotelhassler.it','+3906699340',NULL::text,'Trinità dei Monti','Roma','Lazio','IT',41.906,12.483,'Piazza della Trinità dei Monti 6, 00187 Roma',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome HOSPITALITY R7',v_hosp),
    ('Hotel Eden Rome','Hotel Eden / Dorchester Collection','IT','https://www.dorchestercollection.com/rome/hotel-eden/',NULL::text,'info.HER@dorchestercollection.com','+3906478121',NULL::text,'Via Ludovisi','Roma','Lazio','IT',41.907,12.488,'Via Ludovisi 49, 00187 Roma',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome HOSPITALITY R7',v_hosp),

    -- ========== ROME IT — CONCIERGE (0 → ~4) ==========
    ('Paspartu Rome','Paspartù S.r.l.','IT','https://paspartu.it/','paspartu.it','info@paspartu.it','+390697993023',NULL::text,'Rome personal concierge','Roma','Lazio','IT',41.902,12.496,'Roma — first Italian personal concierge agency (est. 2007)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome CONCIERGE R7',v_conc),
    ('ItaliaConcierge Rome','ItaliaConcierge / Luxury Esmeralda Consulting','IT','https://italiaconcierge.com/','italiaconcierge.com','info@italiaconcierge.com','+393384192580',NULL::text,'Rome lifestyle concierge','Roma','Lazio','IT',41.902,12.496,'Roma — 24/7 personal assistant & lifestyle concierge',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome CONCIERGE R7',v_conc),
    ('My Luxury Concierge Rome','My Luxury Concierge','IT','https://myluxuryconcierge.net/','myluxuryconcierge.net','info@myluxuryconcierge.net','+393339672251',NULL::text,'Rome luxury desk','Roma','Lazio','IT',41.902,12.496,'Roma — luxury travel & lifestyle concierge',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome CONCIERGE R7',v_conc),
    ('Italian Lifestyle Concierge Rome','Italian Lifestyle Concierge','IT','https://www.italianlifestyleconcierge.com/en/','italianlifestyleconcierge.com','ItalianLifestyleConcierge@gmail.com','+393478904914',NULL::text,'Via Menzio','Roma','Lazio','IT',41.740,12.360,'Via Francesco Menzio 30, 00125 Roma',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome CONCIERGE R7',v_conc),

    -- ========== ROME IT — EVENTS (0 → ~4) ==========
    ('Love IT DMC Rome','Love IT DMC','IT','https://loveit-dmc.com/','loveit-dmc.com','info@loveit-dmc.com','+39064814948',NULL::text,'Viale Leonardo da Vinci','Roma','Lazio','IT',41.860,12.480,'Viale Leonardo da Vinci 196, 00145 Roma',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome EVENTS R7',v_evt),
    ('ICB DMC Rome','ICB — Italy DMC & MICE','IT','https://www.icb-dmc.com/','icb-dmc.com','info@icb.it','+39069107091',NULL::text,'Via Cornelia','Roma','Lazio','IT',41.900,12.400,'Via Cornelia 498, 00166 Roma',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome EVENTS R7',v_evt),
    ('CS Events Rome','CS Events S.r.l.','IT','https://csevents.it/','csevents.it','requests@csevents.it',NULL::text,NULL::text,'Rome MICE desk','Roma','Lazio','IT',41.902,12.496,'Roma — corporate events, incentives & MICE production',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome EVENTS R7',v_evt),
    ('NOTA BENE Events Rome','NOTA BENE travel & events','IT','https://notabene-events.com/','notabene-events.com','info@notabene-events.com','+390693563230',NULL::text,'Via Cocco Ortu','Roma','Lazio','IT',41.902,12.496,'Via Francesco Cocco Ortu 22, Roma — MICE & corporate DMC',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome EVENTS R7',v_evt),

    -- ========== ROME IT — PRIVATE_AVIATION (0 → ~4) ==========
    -- website_domain NULL: jetex.com / aviavip.com already used by other hub FBOs
    ('Jetex Rome Ciampino FBO','Jetex','IT','https://www.jetex.com/network/rome-italy/',NULL::text,'fbo-cia@jetex.com','+390687608223',NULL::text,'CIA Jetex FBO','Roma','Lazio','IT',41.799,12.595,'Via Appia Nuova 1651, 00040 Ciampino (CIA/LIRA)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome PRIVATE_AVIATION R7',v_av),
    ('Signature Aviation Rome Ciampino','Signature Aviation','IT','https://www.signatureaviation.com/locations/CIA',NULL::text,'cia@signatureaviation.com','+390665959458',NULL::text,'CIA Signature FBO','Roma','Lazio','IT',41.799,12.595,'General Aviation Terminal, Via Appia Nuova 1651, Ciampino',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome PRIVATE_AVIATION R7',v_av),
    ('AviaVIP Rome Ciampino FBO','AviaVIP','IT','https://aviavip.com/network/rome-ciampino-fbo/',NULL::text,'occ.ita@aviavip.com','+390679340563',NULL::text,'CIA AviaVIP FBO','Roma','Lazio','IT',41.799,12.595,'G.B. Pastine Airport, Via Appia Nuova 1651, Ciampino',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome PRIVATE_AVIATION R7',v_av),
    ('Italian Private Jets Rome','Italian Private Jets','IT','https://private-jets.it/','private-jets.it','flights@private-jets.it','+3907891825775','+393519058175','Fiumicino VIP desk','Roma','Lazio','IT',41.800,12.239,'Via dell''Aeroporto di Fiumicino 320, 00054 Fiumicino (RM)',NULL::numeric,NULL::int,'WEB_RESEARCH EU Rome PRIVATE_AVIATION R7',v_av)
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
  RAISE NOTICE 'Munich Rome hubs R7: inserted=% skipped=%', inserted, skipped;
END $$;
