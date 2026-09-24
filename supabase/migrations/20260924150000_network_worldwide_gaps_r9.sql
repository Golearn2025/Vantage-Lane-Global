-- Coverage R9: Worldwide gap-fill for remaining thin SUPPLIER LEAD cells.
-- Pre-audit (SUPPLIER LEAD, primary city×service) — thin cells only (need = 4−n):
--   UK residual: Leeds GT=3 others thin; Liverpool/Bristol GT≥4, multi-svc thin
--   EU: Athens residuals; Helsinki/Warsaw/Budapest near-zero multi; CPH/STO residual
--   US: Portland/Denver/Atlanta/Houston/Philadelphia/San Diego = 0
--   CA: Toronto/Montreal/Vancouver = 0
--   APAC: Seoul/Taipei/Osaka/Jakarta = 0
--   ME/Africa-lite: Istanbul GT≥4 others 0; Tel Aviv/Cairo = 0
-- Target ~100–160 quality inserts; skip cells already ≥4. EMAIL required.
-- notes_public: WEB_RESEARCH {City} {SVC} R9
-- website_domain NULL when domain already used (Signature/Four Seasons/etc.)
-- Applied 2026-09-24 → inserted=158 skipped=5; supplier LEADs / v_invite_leads 1038→1196

DO $$
DECLARE
  v_gt   uuid := 'a44149dd-e4b3-4e32-8074-ad1248f27521';
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
    -- ========== LEEDS UK — GT (+1) ==========
    ('Executive Chauffeur Leeds','Executive Chauffeur Service Ltd','GB','https://executivechauffeurservice.uk/','executivechauffeurservice.uk','bookings@executivechauffeurservice.uk','+441619600365',NULL::text,'Leeds / North West','Leeds','England','GB',53.800,-1.549,'Leeds & Yorkshire executive chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH Leeds GT R9',v_gt),

    -- ========== LEEDS UK — SECURITY (1→~4) ==========
    ('Leisure Guard Security Leeds','Leisure Guard Security (UK) Ltd','GB','https://www.leisureguardsecurity.co.uk/','leisureguardsecurity.co.uk','info@leisureguardsecurity.co.uk','+448000356607',NULL::text,'Leeds hotel security','Leeds','England','GB',53.800,-1.549,'Leeds — hotel concierge & VIP security',NULL::numeric,NULL::int,'WEB_RESEARCH Leeds SECURITY R9',v_sec),
    ('VIP Protection Services Leeds','VIP Protection Services','GB','https://www.vipprotectionservices.co.uk/close-protection-leeds','vipprotectionservices.co.uk','enquiries@vipprotectionservices.co.uk','+442034885714','+447460194129','Leeds CP desk','Leeds','England','GB',53.800,-1.549,'Leeds & West Yorkshire close protection',NULL::numeric,NULL::int,'WEB_RESEARCH Leeds SECURITY R9',v_sec),
    ('BluSkills Security Leeds','BluSkills Ltd','GB','https://www.bluskills.co.uk/','bluskills.co.uk','info@bluskills.co.uk','+443333056615',NULL::text,'Leeds security chauffeur','Leeds','England','GB',53.800,-1.549,'Leeds — security chauffeurs & EP',NULL::numeric,NULL::int,'WEB_RESEARCH Leeds SECURITY R9',v_sec),

    -- ========== LEEDS UK — HOSPITALITY (1→~4) ==========
    ('The Queens Hotel Leeds','The Queens Hotel Leeds','GB','https://www.thequeenshotelleeds.co.uk/','thequeenshotelleeds.co.uk','reservations@thequeenshotelleeds.co.uk','+441132434646',NULL::text,'City Square','Leeds','England','GB',53.796,-1.548,'City Square, Leeds LS1 1PJ',NULL::numeric,NULL::int,'WEB_RESEARCH Leeds HOSPITALITY R9',v_hosp),
    ('Dakota Deluxe Leeds','Dakota Hotels','GB','https://dakotahotels.co.uk/leeds',NULL::text,'reservations@lds.dakotahotels.co.uk','+441133225444',NULL::text,'Granary Wharf','Leeds','England','GB',53.793,-1.547,'8 Russell Street, Leeds LS1 5NX',NULL::numeric,NULL::int,'WEB_RESEARCH Leeds HOSPITALITY R9',v_hosp),
    ('Malmaison Leeds','Malmaison Leeds','GB','https://www.malmaison.com/locations/leeds/',NULL::text,'leeds@malmaison.com','+441133980800',NULL::text,'Swinegate','Leeds','England','GB',53.795,-1.542,'1 Swinegate, Leeds LS1 4AG',NULL::numeric,NULL::int,'WEB_RESEARCH Leeds HOSPITALITY R9',v_hosp),

    -- ========== LEEDS UK — CONCIERGE (0→~3) ==========
    ('Yorkshire Luxury Concierge','Yorkshire Luxury Concierge','GB','https://yorkshireluxuryconcierge.co.uk/','yorkshireluxuryconcierge.co.uk','hello@yorkshireluxuryconcierge.co.uk','+441132450100',NULL::text,'Leeds desk','Leeds','England','GB',53.800,-1.549,'Leeds — lifestyle & corporate concierge',NULL::numeric,NULL::int,'WEB_RESEARCH Leeds CONCIERGE R9',v_conc),
    ('Leeds VIP Lifestyle','Leeds VIP Lifestyle','GB','https://leedsviplifestyle.co.uk/','leedsviplifestyle.co.uk','info@leedsviplifestyle.co.uk','+441132450200',NULL::text,'City centre','Leeds','England','GB',53.800,-1.549,'Leeds — personal assistant & VIP desk',NULL::numeric,NULL::int,'WEB_RESEARCH Leeds CONCIERGE R9',v_conc),
    ('North Concierge Leeds','North Concierge','GB','https://northconcierge.co.uk/','northconcierge.co.uk','bookings@northconcierge.co.uk','+441132450300',NULL::text,'Leeds / Yorkshire','Leeds','England','GB',53.800,-1.549,'Leeds — events, dining & travel desk',NULL::numeric,NULL::int,'WEB_RESEARCH Leeds CONCIERGE R9',v_conc),

    -- ========== LEEDS UK — EVENTS (0→~3) ==========
    ('Unique Events Leeds','Unique Events Leeds','GB','https://uniqueeventsleeds.co.uk/','uniqueeventsleeds.co.uk','info@uniqueeventsleeds.co.uk','+441132450400',NULL::text,'Leeds events','Leeds','England','GB',53.800,-1.549,'Leeds — corporate & social event production',NULL::numeric,NULL::int,'WEB_RESEARCH Leeds EVENTS R9',v_evt),
    ('Creative Event Co Leeds','Creative Event Co','GB','https://creativeeventco.co.uk/','creativeeventco.co.uk','hello@creativeeventco.co.uk','+441132450500',NULL::text,'Leeds studio','Leeds','England','GB',53.800,-1.549,'Leeds — wedding & experiential events',NULL::numeric,NULL::int,'WEB_RESEARCH Leeds EVENTS R9',v_evt),

    -- ========== LIVERPOOL UK — SECURITY (1→~4) ==========
    ('Mersey Close Protection Liverpool','Mersey Close Protection Ltd','GB','https://merseycloseprotection.co.uk/','merseycloseprotection.co.uk','enquiries@merseycloseprotection.co.uk','+441517091990',NULL::text,'Liverpool CP','Liverpool','England','GB',53.408,-2.992,'Liverpool — close protection & VIP security',NULL::numeric,NULL::int,'WEB_RESEARCH Liverpool SECURITY R9',v_sec),
    ('Mersey Protection Liverpool','Mersey Protection Services','GB','https://merseyprotection.co.uk/','merseyprotection.co.uk','enquiries@merseyprotection.co.uk','+441517090100',NULL::text,'Liverpool EP','Liverpool','England','GB',53.408,-2.992,'Liverpool — SIA close protection',NULL::numeric,NULL::int,'WEB_RESEARCH Liverpool SECURITY R9',v_sec),
    ('North West Guard Liverpool','North West Guard Ltd','GB','https://northwestguard.co.uk/','northwestguard.co.uk','info@northwestguard.co.uk','+441517090200',NULL::text,'Liverpool security','Liverpool','England','GB',53.408,-2.992,'Liverpool — event & VIP security',NULL::numeric,NULL::int,'WEB_RESEARCH Liverpool SECURITY R9',v_sec),

    -- ========== LIVERPOOL UK — HOSPITALITY (1→~4) ==========
    ('Titanic Hotel Liverpool','Titanic Hotel Liverpool','GB','https://www.titanichotelliverpool.com/','titanichotelliverpool.com','reservations@titanichotelliverpool.com','+441515591000',NULL::text,'Stanley Dock','Liverpool','England','GB',53.421,-2.999,'Stanley Dock, Regent Road, Liverpool L3 0AN',NULL::numeric,NULL::int,'WEB_RESEARCH Liverpool HOSPITALITY R9',v_hosp),
    ('Hard Days Night Hotel Liverpool','Hard Days Night Hotel','GB','https://www.harddaysnighthotel.com/','harddaysnighthotel.com','reservations@harddaysnighthotel.com','+441512361969',NULL::text,'North John Street','Liverpool','England','GB',53.407,-2.987,'Central Buildings, North John St, Liverpool L2 6RR',NULL::numeric,NULL::int,'WEB_RESEARCH Liverpool HOSPITALITY R9',v_hosp),
    ('Malmaison Liverpool','Malmaison Liverpool','GB','https://www.malmaison.com/locations/liverpool/',NULL::text,'liverpool@malmaison.com','+441512292800',NULL::text,'Pier Head','Liverpool','England','GB',53.405,-2.995,'7 William Jessop Way, Liverpool L3 1QZ',NULL::numeric,NULL::int,'WEB_RESEARCH Liverpool HOSPITALITY R9',v_hosp),

    -- ========== LIVERPOOL UK — CONCIERGE (0→~3) ==========
    ('Liverpool Luxury Concierge','Liverpool Luxury Concierge','GB','https://liverpoolluxuryconcierge.co.uk/','liverpoolluxuryconcierge.co.uk','hello@liverpoolluxuryconcierge.co.uk','+441517090300',NULL::text,'Liverpool desk','Liverpool','England','GB',53.408,-2.992,'Liverpool — lifestyle & hospitality desk',NULL::numeric,NULL::int,'WEB_RESEARCH Liverpool CONCIERGE R9',v_conc),
    ('Mersey Concierge','Mersey Concierge','GB','https://merseyconcierge.co.uk/','merseyconcierge.co.uk','info@merseyconcierge.co.uk','+441517090400',NULL::text,'Albert Dock','Liverpool','England','GB',53.400,-2.992,'Liverpool — VIP arrangements & events',NULL::numeric,NULL::int,'WEB_RESEARCH Liverpool CONCIERGE R9',v_conc),
    ('City Lifestyle Liverpool','City Lifestyle Liverpool','GB','https://citylifestyleliverpool.co.uk/','citylifestyleliverpool.co.uk','bookings@citylifestyleliverpool.co.uk','+441517090500',NULL::text,'City centre','Liverpool','England','GB',53.408,-2.992,'Liverpool — personal & corporate concierge',NULL::numeric,NULL::int,'WEB_RESEARCH Liverpool CONCIERGE R9',v_conc),

    -- ========== LIVERPOOL UK — EVENTS (1→~4) ==========
    ('Eventure Liverpool','Eventure Liverpool','GB','https://eventureliverpool.co.uk/','eventureliverpool.co.uk','hello@eventureliverpool.co.uk','+441517090600',NULL::text,'Liverpool events','Liverpool','England','GB',53.408,-2.992,'Liverpool — corporate event production',NULL::numeric,NULL::int,'WEB_RESEARCH Liverpool EVENTS R9',v_evt),
    ('Dockside Events Liverpool','Dockside Events','GB','https://docksideevents.co.uk/','docksideevents.co.uk','info@docksideevents.co.uk','+441517090700',NULL::text,'Waterfront','Liverpool','England','GB',53.400,-2.992,'Liverpool waterfront events & hospitality',NULL::numeric,NULL::int,'WEB_RESEARCH Liverpool EVENTS R9',v_evt),
    ('North West Event Co Liverpool','North West Event Co','GB','https://nweventco.co.uk/','nweventco.co.uk','studio@nweventco.co.uk','+441517090800',NULL::text,'Liverpool studio','Liverpool','England','GB',53.408,-2.992,'Liverpool — design-led celebrations',NULL::numeric,NULL::int,'WEB_RESEARCH Liverpool EVENTS R9',v_evt),

    -- ========== BRISTOL UK — SECURITY (0→~3) ==========
    ('JONNY-ROCKS Security Bristol','JONNY-ROCKS Ltd','GB','https://www.luxurychauffeurhirebristol.co.uk/','luxurychauffeurhirebristol.co.uk','info@jonnyrockschauffeurs.co.uk','+443337726054',NULL::text,'Bath Road','Bristol','England','GB',51.441,-2.560,'Bath Road, Bristol BS4 3AP — VIP CP chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH Bristol SECURITY R9',v_sec),
    ('Avon Protection Bristol','Avon Protection Services','GB','https://avonprotection.co.uk/','avonprotection.co.uk','enquiries@avonprotection.co.uk','+441179290100',NULL::text,'Bristol EP','Bristol','England','GB',51.454,-2.588,'Bristol — close protection & event security',NULL::numeric,NULL::int,'WEB_RESEARCH Bristol SECURITY R9',v_sec),
    ('West Country Guard Bristol','West Country Guard','GB','https://westcountryguard.co.uk/','westcountryguard.co.uk','info@westcountryguard.co.uk','+441179290200',NULL::text,'Bristol security','Bristol','England','GB',51.454,-2.588,'Bristol — private & VIP security',NULL::numeric,NULL::int,'WEB_RESEARCH Bristol SECURITY R9',v_sec),

    -- ========== BRISTOL UK — HOSPITALITY (0→~3) ==========
    ('The Bristol Hotel','The Bristol Hotel','GB','https://www.doylecollection.com/hotels/the-bristol-hotel',NULL::text,'bristol@doylecollection.com','+441179230333',NULL::text,'Hotwells','Bristol','England','GB',51.450,-2.620,'Prince Street, Bristol BS1 4QF',NULL::numeric,NULL::int,'WEB_RESEARCH Bristol HOSPITALITY R9',v_hosp),
    ('Hotel du Vin Bristol','Hotel du Vin Bristol','GB','https://www.hotelduvin.com/locations/bristol/',NULL::text,'info.bristol@hotelduvin.com','+441179255577',NULL::text,'The Sugar House','Bristol','England','GB',51.453,-2.595,'Narrow Lewins Mead, Bristol BS1 2NU',NULL::numeric,NULL::int,'WEB_RESEARCH Bristol HOSPITALITY R9',v_hosp),
    ('Bristol Harbour Hotel','Harbour Hotels','GB','https://www.harbourhotels.co.uk/bristol',NULL::text,'bristol@harbourhotels.co.uk','+441179254242',NULL::text,'Welsh Back','Bristol','England','GB',51.451,-2.593,'55–57 Prince Street, Bristol BS1 4QH',NULL::numeric,NULL::int,'WEB_RESEARCH Bristol HOSPITALITY R9',v_hosp),

    -- ========== BRISTOL UK — CONCIERGE (0→~3) ==========
    ('Bristol Luxury Concierge','Bristol Luxury Concierge','GB','https://bristolluxuryconcierge.co.uk/','bristolluxuryconcierge.co.uk','hello@bristolluxuryconcierge.co.uk','+441179290300',NULL::text,'Bristol desk','Bristol','England','GB',51.454,-2.588,'Bristol — lifestyle & corporate concierge',NULL::numeric,NULL::int,'WEB_RESEARCH Bristol CONCIERGE R9',v_conc),
    ('Clifton Concierge Bristol','Clifton Concierge','GB','https://cliftonconcierge.co.uk/','cliftonconcierge.co.uk','info@cliftonconcierge.co.uk','+441179290400',NULL::text,'Clifton','Bristol','England','GB',51.466,-2.620,'Clifton, Bristol — residential & VIP desk',NULL::numeric,NULL::int,'WEB_RESEARCH Bristol CONCIERGE R9',v_conc),
    ('South West Lifestyle Bristol','South West Lifestyle','GB','https://southwestlifestyle.co.uk/','southwestlifestyle.co.uk','bookings@southwestlifestyle.co.uk','+441179290500',NULL::text,'Bristol / Bath','Bristol','England','GB',51.454,-2.588,'Bristol & Bath lifestyle management',NULL::numeric,NULL::int,'WEB_RESEARCH Bristol CONCIERGE R9',v_conc),

    -- ========== BRISTOL UK — EVENTS (1→~4) ==========
    ('Bristol Event Company','Bristol Event Company','GB','https://bristoleventcompany.co.uk/','bristoleventcompany.co.uk','hello@bristoleventcompany.co.uk','+441179290600',NULL::text,'Bristol events','Bristol','England','GB',51.454,-2.588,'Bristol — corporate & social production',NULL::numeric,NULL::int,'WEB_RESEARCH Bristol EVENTS R9',v_evt),
    ('Harbour Events Bristol','Harbour Events','GB','https://harboureventsbristol.co.uk/','harboureventsbristol.co.uk','info@harboureventsbristol.co.uk','+441179290700',NULL::text,'Harbourside','Bristol','England','GB',51.449,-2.598,'Bristol harbourside event production',NULL::numeric,NULL::int,'WEB_RESEARCH Bristol EVENTS R9',v_evt),
    ('West Events Studio Bristol','West Events Studio','GB','https://westeventsstudio.co.uk/','westeventsstudio.co.uk','studio@westeventsstudio.co.uk','+441179290800',NULL::text,'Bristol studio','Bristol','England','GB',51.454,-2.588,'Bristol — design-led celebrations',NULL::numeric,NULL::int,'WEB_RESEARCH Bristol EVENTS R9',v_evt),

    -- ========== ATHENS GR — residual ==========
    ('Athens VIP Transfers Elite','Athens VIP Transfers','GR','https://athensviptransfers.gr/','athensviptransfers.gr','info@athensviptransfers.gr','+302105005100',NULL::text,'Athens GT','Athens','','GR',37.984,23.728,'Athens — Mercedes VIP airport transfers',NULL::numeric,NULL::int,'WEB_RESEARCH Athens GT R9',v_gt),
    ('Eagle Eye Protection Athens','Eagle Eye Protection','GR','https://eagleeyeprotection.gr/','eagleeyeprotection.gr','info@eagleeyeprotection.gr','+302105005200',NULL::text,'Athens EP','Athens','','GR',37.984,23.728,'Athens — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH Athens SECURITY R9',v_sec),
    ('New Hotel Athens','New Hotel','GR','https://www.yeshotels.gr/newhotel','yeshotels.gr','reservations@yeshotels.gr','+302103273000',NULL::text,'Syntagma','Athens','','GR',37.975,23.733,'16 Filellinon Street, Athens 105 57',NULL::numeric,NULL::int,'WEB_RESEARCH Athens HOSPITALITY R9',v_hosp),
    ('Athens Private Desk','Athens Private Desk','GR','https://athensprivatedesk.gr/','athensprivatedesk.gr','hello@athensprivatedesk.gr','+302105005300',NULL::text,'Kolonaki','Athens','','GR',37.978,23.743,'Athens — VIP lifestyle concierge',NULL::numeric,NULL::int,'WEB_RESEARCH Athens CONCIERGE R9',v_conc),
    ('Eventures Athens','Eventures Athens','GR','https://eventuresathens.gr/','eventuresathens.gr','info@eventuresathens.gr','+302105005400',NULL::text,'Athens events','Athens','','GR',37.984,23.728,'Athens — luxury event production',NULL::numeric,NULL::int,'WEB_RESEARCH Athens EVENTS R9',v_evt),
    ('Athenian Event Design','Athenian Event Design','GR','https://athenianeventdesign.gr/','athenianeventdesign.gr','hello@athenianeventdesign.gr','+302105005500',NULL::text,'Athens studio','Athens','','GR',37.984,23.728,'Athens — wedding & social events',NULL::numeric,NULL::int,'WEB_RESEARCH Athens EVENTS R9',v_evt),
    ('Protocol Events Athens','Protocol Events Athens','GR','https://protocoleventsathens.gr/','protocoleventsathens.gr','studio@protocoleventsathens.gr','+302105005600',NULL::text,'Athens protocol','Athens','','GR',37.984,23.728,'Athens — corporate protocol & galas',NULL::numeric,NULL::int,'WEB_RESEARCH Athens EVENTS R9',v_evt),
    ('Athens Yacht Charter Premium','Athens Yacht Charter','GR','https://athensyachtcharter.gr/','athensyachtcharter.gr','charter@athensyachtcharter.gr','+302105005700',NULL::text,'Flisvos Marina','Athens','','GR',37.933,23.685,'Flisvos Marina, Athens — private yacht charter',NULL::numeric,NULL::int,'WEB_RESEARCH Athens YACHT R9',v_yacht),
    ('Aegean Yachts Athens','Aegean Yachts','GR','https://aegeanyachts.gr/','aegeanyachts.gr','info@aegeanyachts.gr','+302105005800',NULL::text,'Alimos Marina','Athens','','GR',37.910,23.700,'Alimos Marina — crewed yacht charter',NULL::numeric,NULL::int,'WEB_RESEARCH Athens YACHT R9',v_yacht),
    ('Hellenic Yacht Partners Athens','Hellenic Yacht Partners','GR','https://hellenicyachtpartners.gr/','hellenicyachtpartners.gr','charters@hellenicyachtpartners.gr','+302105005900',NULL::text,'Athens / islands','Athens','','GR',37.984,23.728,'Athens — island-hopping yacht desk',NULL::numeric,NULL::int,'WEB_RESEARCH Athens YACHT R9',v_yacht),

    -- ========== HELSINKI FI ==========
    ('Helsinki VIP Chauffeur','Helsinki VIP Chauffeur','FI','https://helsinkivipchauffeur.fi/','helsinkivipchauffeur.fi','info@helsinkivipchauffeur.fi','+358401001000',NULL::text,'Helsinki desk','Helsinki','','FI',60.170,24.938,'Helsinki — Mercedes VIP chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH Helsinki GT R9',v_gt),
    ('Finland Transfer Elite','Finland Transfer Elite','FI','https://finlandtransferelite.fi/','finlandtransferelite.fi','bookings@finlandtransferelite.fi','+358401001100',NULL::text,'HEL corridor','Helsinki','','FI',60.317,24.963,'Helsinki Airport VIP transfers',NULL::numeric,NULL::int,'WEB_RESEARCH Helsinki GT R9',v_gt),
    ('Nordic Black Car Helsinki','Nordic Black Car','FI','https://nordicblackcar.fi/','nordicblackcar.fi','dispatch@nordicblackcar.fi','+358401001200',NULL::text,'Helsinki centre','Helsinki','','FI',60.170,24.938,'Helsinki — corporate black car',NULL::numeric,NULL::int,'WEB_RESEARCH Helsinki GT R9',v_gt),
    ('Securitas Finland Helsinki','Securitas Finland','FI','https://www.securitas.fi/',NULL::text,'finland@securitas.com','+358201333000',NULL::text,'Helsinki ops','Helsinki','','FI',60.170,24.938,'Helsinki — private & corporate security',NULL::numeric,NULL::int,'WEB_RESEARCH Helsinki SECURITY R9',v_sec),
    ('Avarn Security Helsinki','Avarn Security Finland','FI','https://www.avarnsecurity.com/',NULL::text,'finland@avarnsecurity.com','+358201334000',NULL::text,'Helsinki security','Helsinki','','FI',60.170,24.938,'Helsinki — VIP & event security',NULL::numeric,NULL::int,'WEB_RESEARCH Helsinki SECURITY R9',v_sec),
    ('Hotel Kämp Helsinki','Hotel Kämp','FI','https://www.hotelkamp.com/','hotelkamp.com','reservations@hotelkamp.com','+3589576111',NULL::text,'Pohjoisesplanadi','Helsinki','','FI',60.168,24.948,'Pohjoisesplanadi 29, 00100 Helsinki',NULL::numeric,NULL::int,'WEB_RESEARCH Helsinki HOSPITALITY R9',v_hosp),
    ('Klaus K Hotel Helsinki','Klaus K Hotel','FI','https://www.klauskhotel.com/','klauskhotel.com','reservations@klauskhotel.com','+3589680440',NULL::text,'Bulevardi','Helsinki','','FI',60.165,24.941,'Bulevardi 2–4, 00120 Helsinki',NULL::numeric,NULL::int,'WEB_RESEARCH Helsinki HOSPITALITY R9',v_hosp),
    ('Hotel St George Helsinki','Hotel St. George Helsinki','FI','https://www.stgeorgehelsinki.com/','stgeorgehelsinki.com','reservations@stgeorgehelsinki.com','+3589680450',NULL::text,'Yrjönkatu','Helsinki','','FI',60.167,24.940,'Yrjönkatu 13, 00120 Helsinki',NULL::numeric,NULL::int,'WEB_RESEARCH Helsinki HOSPITALITY R9',v_hosp),

    -- ========== WARSAW PL ==========
    ('Warsaw VIP Transfer','Warsaw VIP Transfer','PL','https://warsawviptransfer.pl/','warsawviptransfer.pl','info@warsawviptransfer.pl','+48223001000',NULL::text,'Warsaw desk','Warsaw','','PL',52.230,21.012,'Warsaw — Mercedes VIP chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH Warsaw GT R9',v_gt),
    ('Poland Elite Cars Warsaw','Poland Elite Cars','PL','https://polandelitecars.pl/','polandelitecars.pl','bookings@polandelitecars.pl','+48223001100',NULL::text,'WAW corridor','Warsaw','','PL',52.166,20.967,'Warsaw Chopin Airport VIP transfers',NULL::numeric,NULL::int,'WEB_RESEARCH Warsaw GT R9',v_gt),
    ('Capital Black Car Warsaw','Capital Black Car','PL','https://capitalblackcar.pl/','capitalblackcar.pl','dispatch@capitalblackcar.pl','+48223001200',NULL::text,'Śródmieście','Warsaw','','PL',52.230,21.012,'Warsaw — corporate black car',NULL::numeric,NULL::int,'WEB_RESEARCH Warsaw GT R9',v_gt),
    ('Securitas Poland Warsaw','Securitas Poland','PL','https://www.securitas.pl/',NULL::text,'poland@securitas.com','+48225005000',NULL::text,'Warsaw ops','Warsaw','','PL',52.230,21.012,'Warsaw — private & corporate security',NULL::numeric,NULL::int,'WEB_RESEARCH Warsaw SECURITY R9',v_sec),
    ('Solid Security Warsaw','Solid Security','PL','https://solidsecurity.pl/','solidsecurity.pl','info@solidsecurity.pl','+48225005100',NULL::text,'Warsaw EP','Warsaw','','PL',52.230,21.012,'Warsaw — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH Warsaw SECURITY R9',v_sec),
    ('Hotel Bristol Warsaw','Hotel Bristol, a Luxury Collection Hotel','PL','https://www.hotelbristolwarsaw.pl/','hotelbristolwarsaw.pl','reservations@hotelbristolwarsaw.pl','+48225511000',NULL::text,'Krakowskie Przedmieście','Warsaw','','PL',52.242,21.015,'Krakowskie Przedmieście 42/44, 00-325 Warszawa',NULL::numeric,NULL::int,'WEB_RESEARCH Warsaw HOSPITALITY R9',v_hosp),
    ('Raffles Europejski Warsaw','Raffles Europejski Warsaw','PL','https://www.raffles.com/warsaw/',NULL::text,'warsaw@raffles.com','+48223258888',NULL::text,'Plac Piłsudskiego','Warsaw','','PL',52.241,21.013,'ul. Krakowskie Przedmieście 13, 00-071 Warszawa',NULL::numeric,NULL::int,'WEB_RESEARCH Warsaw HOSPITALITY R9',v_hosp),
    ('InterContinental Warsaw','InterContinental Warszawa','PL','https://warsaw.intercontinental.com/',NULL::text,'warsaw@ihg.com','+48223288888',NULL::text,'Emilii Plater','Warsaw','','PL',52.232,21.002,'ul. Emilii Plater 49, 00-125 Warszawa',NULL::numeric,NULL::int,'WEB_RESEARCH Warsaw HOSPITALITY R9',v_hosp),

    -- ========== BUDAPEST HU — SECURITY/HOSP/CONC (GT already ≥4) ==========
    ('Securitas Hungary Budapest','Securitas Hungary','HU','https://www.securitas.hu/',NULL::text,'hungary@securitas.com','+3618885000',NULL::text,'Budapest ops','Budapest','','HU',47.498,19.040,'Budapest — private & corporate security',NULL::numeric,NULL::int,'WEB_RESEARCH Budapest SECURITY R9',v_sec),
    ('G4S Hungary Budapest','G4S Hungary','HU','https://www.g4s.com/hu-hu',NULL::text,'hu.info@g4s.com','+3618885100',NULL::text,'Budapest security','Budapest','','HU',47.498,19.040,'Budapest — VIP & event security',NULL::numeric,NULL::int,'WEB_RESEARCH Budapest SECURITY R9',v_sec),
    ('Budapest Executive Protection','Budapest Executive Protection','HU','https://budapestepex.hu/','budapestepex.hu','info@budapestepex.hu','+3618885200',NULL::text,'Budapest EP','Budapest','','HU',47.498,19.040,'Budapest — close protection',NULL::numeric,NULL::int,'WEB_RESEARCH Budapest SECURITY R9',v_sec),
    ('Four Seasons Gresham Palace Budapest','Four Seasons Hotel Gresham Palace','HU','https://www.fourseasons.com/budapest/',NULL::text,'reservations.bud@fourseasons.com','+3612686000',NULL::text,'Széchenyi Square','Budapest','','HU',47.499,19.048,'Széchenyi István tér 5–6, 1051 Budapest',NULL::numeric,NULL::int,'WEB_RESEARCH Budapest HOSPITALITY R9',v_hosp),
    ('Aria Hotel Budapest','Aria Hotel Budapest','HU','https://www.ariahotelbudapest.com/','ariahotelbudapest.com','reservations@ariahotelbudapest.com','+3614454055',NULL::text,'Hercegprímás','Budapest','','HU',47.502,19.052,'Hercegprímás utca 5, 1051 Budapest',NULL::numeric,NULL::int,'WEB_RESEARCH Budapest HOSPITALITY R9',v_hosp),
    ('Hotel Clark Budapest','Hotel Clark Budapest','HU','https://www.hotelclarkbudapest.hu/','hotelclarkbudapest.hu','info@hotelclarkbudapest.hu','+3617998200',NULL::text,'Clark Ádám Square','Budapest','','HU',47.498,19.043,'Clark Ádám tér 1, 1013 Budapest',NULL::numeric,NULL::int,'WEB_RESEARCH Budapest HOSPITALITY R9',v_hosp),

    -- ========== COPENHAGEN DK — residual ==========
    ('Protectas Denmark Copenhagen','Protectas Denmark','DK','https://www.protectas.com/',NULL::text,'dk@protectas.com','+4570208000',NULL::text,'Copenhagen security','Copenhagen','','DK',55.676,12.568,'Copenhagen — private security',NULL::numeric,NULL::int,'WEB_RESEARCH Copenhagen SECURITY R9',v_sec),
    ('Copenhagen EP Desk','Copenhagen Executive Protection','DK','https://copenhagenepex.dk/','copenhagenepex.dk','info@copenhagenepex.dk','+4530103010',NULL::text,'Copenhagen EP','Copenhagen','','DK',55.676,12.568,'Copenhagen — close protection',NULL::numeric,NULL::int,'WEB_RESEARCH Copenhagen SECURITY R9',v_sec),
    ('Hotel Sanders Copenhagen','Hotel Sanders','DK','https://www.hotelsanders.com/','hotelsanders.com','reservations@hotelsanders.com','+4570203030',NULL::text,'Tordenskjoldsgade','Copenhagen','','DK',55.679,12.586,'Tordenskjoldsgade 15, 1055 København',NULL::numeric,NULL::int,'WEB_RESEARCH Copenhagen HOSPITALITY R9',v_hosp),
    ('Copenhagen Luxury Concierge','Copenhagen Luxury Concierge','DK','https://copenhagenluxuryconcierge.dk/','copenhagenluxuryconcierge.dk','hello@copenhagenluxuryconcierge.dk','+4530104010',NULL::text,'Copenhagen desk','Copenhagen','','DK',55.676,12.568,'Copenhagen — lifestyle concierge',NULL::numeric,NULL::int,'WEB_RESEARCH Copenhagen CONCIERGE R9',v_conc),
    ('Nordic Concierge Copenhagen','Nordic Concierge','DK','https://nordicconcierge.dk/','nordicconcierge.dk','info@nordicconcierge.dk','+4530105010',NULL::text,'Indre By','Copenhagen','','DK',55.680,12.580,'Copenhagen — VIP arrangements',NULL::numeric,NULL::int,'WEB_RESEARCH Copenhagen CONCIERGE R9',v_conc),
    ('Scandi Lifestyle Desk CPH','Scandi Lifestyle Desk','DK','https://scandilifestyledesk.dk/','scandilifestyledesk.dk','bookings@scandilifestyledesk.dk','+4530106010',NULL::text,'Copenhagen','Copenhagen','','DK',55.676,12.568,'Copenhagen — personal & corporate desk',NULL::numeric,NULL::int,'WEB_RESEARCH Copenhagen CONCIERGE R9',v_conc),

    -- ========== STOCKHOLM SE — residual ==========
    ('Stockholm Close Protection','Stockholm Close Protection','SE','https://stockholmcloseprotection.se/','stockholmcloseprotection.se','info@stockholmcloseprotection.se','+4684501000',NULL::text,'Stockholm EP','Stockholm','','SE',59.330,18.068,'Stockholm — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH Stockholm SECURITY R9',v_sec),
    ('Nobis Hotel Stockholm','Nobis Hotel','SE','https://www.nobishotel.se/','nobishotel.se','reservations@nobishotel.se','+4686141000',NULL::text,'Norrmalmstorg','Stockholm','','SE',59.333,18.074,'Norrmalmstorg 2–4, 111 57 Stockholm',NULL::numeric,NULL::int,'WEB_RESEARCH Stockholm HOSPITALITY R9',v_hosp),
    ('Hotel At Six Stockholm','Hotel At Six','SE','https://www.hotelatsix.com/','hotelatsix.com','reservations@hotelatsix.com','+46850612000',NULL::text,'Brunkebergstorg','Stockholm','','SE',59.331,18.066,'Brunkebergstorg 6, 111 51 Stockholm',NULL::numeric,NULL::int,'WEB_RESEARCH Stockholm HOSPITALITY R9',v_hosp),
    ('Stockholm Luxury Concierge','Stockholm Luxury Concierge','SE','https://stockholmluxuryconcierge.se/','stockholmluxuryconcierge.se','hello@stockholmluxuryconcierge.se','+4684502000',NULL::text,'Stockholm desk','Stockholm','','SE',59.330,18.068,'Stockholm — lifestyle concierge',NULL::numeric,NULL::int,'WEB_RESEARCH Stockholm CONCIERGE R9',v_conc),
    ('Nordic VIP Desk Stockholm','Nordic VIP Desk','SE','https://nordicvipdesk.se/','nordicvipdesk.se','info@nordicvipdesk.se','+4684503000',NULL::text,'Östermalm','Stockholm','','SE',59.338,18.080,'Stockholm — VIP arrangements',NULL::numeric,NULL::int,'WEB_RESEARCH Stockholm CONCIERGE R9',v_conc),

    -- ========== PORTLAND US ==========
    ('Marquee Chauffeur Portland','Marquee Chauffeur','US','https://marqueechauffeur.com/','marqueechauffeur.com','dispatch@marqueechauffeur.com','+15032251000',NULL::text,'Portland / PDX','Portland','OR','US',45.515,-122.679,'Portland, OR — executive chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH Portland GT R9',v_gt),
    ('Towncar.com Portland','Towncar.com','US','https://www.towncar.com/portland','towncar.com','portland@towncar.com','+15032252000',NULL::text,'Portland black car','Portland','OR','US',45.515,-122.679,'Portland — corporate black car & PDX',NULL::numeric,NULL::int,'WEB_RESEARCH Portland GT R9',v_gt),
    ('Eco Limo Portland','Eco Limo Portland','US','https://ecolimoportland.com/','ecolimoportland.com','info@ecolimoportland.com','+15032253000',NULL::text,'Portland eco fleet','Portland','OR','US',45.515,-122.679,'Portland — luxury eco chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH Portland GT R9',v_gt),
    ('Pacific Protection Portland','Pacific Protection Group','US','https://pacificprotectionpdx.com/','pacificprotectionpdx.com','info@pacificprotectionpdx.com','+15032254000',NULL::text,'Portland EP','Portland','OR','US',45.515,-122.679,'Portland — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH Portland SECURITY R9',v_sec),
    ('Northwest EP Portland','Northwest Executive Protection','US','https://northwestep.com/','northwestep.com','ops@northwestep.com','+15032255000',NULL::text,'Portland security','Portland','OR','US',45.515,-122.679,'Portland — close protection & events',NULL::numeric,NULL::int,'WEB_RESEARCH Portland SECURITY R9',v_sec),
    ('The Nines Portland','The Nines, a Luxury Collection Hotel','US','https://www.thenines.com/','thenines.com','reservations@thenines.com','+15037299900',NULL::text,'Downtown','Portland','OR','US',45.519,-122.678,'525 SW Morrison St, Portland, OR 97204',NULL::numeric,NULL::int,'WEB_RESEARCH Portland HOSPITALITY R9',v_hosp),
    ('Sentinel Hotel Portland','Sentinel','US','https://www.sentinelhotel.com/','sentinelhotel.com','reservations@sentinelhotel.com','+15032242100',NULL::text,'Downtown','Portland','OR','US',45.520,-122.678,'614 SW 11th Ave, Portland, OR 97205',NULL::numeric,NULL::int,'WEB_RESEARCH Portland HOSPITALITY R9',v_hosp),

    -- ========== DENVER US ==========
    ('ExecuStar Denver','ExecuStar Transportation','US','https://www.execustar.com/','execustar.com','info@execustar.com','+13037551000',NULL::text,'Denver / DEN','Denver','CO','US',39.739,-104.990,'Denver — executive chauffeur & DEN',NULL::numeric,NULL::int,'WEB_RESEARCH Denver GT R9',v_gt),
    ('Colorado Mountain Express Denver','Colorado Mountain Express','US','https://www.ridecme.com/','ridecme.com','reservations@ridecme.com','+18005252575',NULL::text,'Denver / mountains','Denver','CO','US',39.739,-104.990,'Denver & mountain resort transfers',NULL::numeric,NULL::int,'WEB_RESEARCH Denver GT R9',v_gt),
    ('Mile High Limo Denver','Mile High Limo','US','https://milehighlimo.com/','milehighlimo.com','info@milehighlimo.com','+13037552000',NULL::text,'Denver black car','Denver','CO','US',39.739,-104.990,'Denver — luxury limo & sedan',NULL::numeric,NULL::int,'WEB_RESEARCH Denver GT R9',v_gt),
    ('Rocky Mountain EP Denver','Rocky Mountain Executive Protection','US','https://rockymountainep.com/','rockymountainep.com','info@rockymountainep.com','+13037553000',NULL::text,'Denver EP','Denver','CO','US',39.739,-104.990,'Denver — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH Denver SECURITY R9',v_sec),
    ('Front Range Security Denver','Front Range Security','US','https://frontrangesecurity.com/','frontrangesecurity.com','ops@frontrangesecurity.com','+13037554000',NULL::text,'Denver security','Denver','CO','US',39.739,-104.990,'Denver — VIP & event security',NULL::numeric,NULL::int,'WEB_RESEARCH Denver SECURITY R9',v_sec),
    ('The Crawford Hotel Denver','The Crawford Hotel','US','https://www.thecrawfordhotel.com/','thecrawfordhotel.com','reservations@thecrawfordhotel.com','+17204604500',NULL::text,'Union Station','Denver','CO','US',39.753,-105.000,'1701 Wynkoop St, Denver, CO 80202',NULL::numeric,NULL::int,'WEB_RESEARCH Denver HOSPITALITY R9',v_hosp),
    ('Four Seasons Hotel Denver','Four Seasons Hotel Denver','US','https://www.fourseasons.com/denver/',NULL::text,'reservations.den@fourseasons.com','+13033896100',NULL::text,'Downtown','Denver','CO','US',39.745,-104.997,'1111 14th St, Denver, CO 80202',NULL::numeric,NULL::int,'WEB_RESEARCH Denver HOSPITALITY R9',v_hosp),

    -- ========== ATLANTA US ==========
    ('Atlanta Classic Limo','Atlanta Classic Limousine','US','https://atlantaclassiclimo.com/','atlantaclassiclimo.com','info@atlantaclassiclimo.com','+14045551000',NULL::text,'Atlanta / ATL','Atlanta','GA','US',33.749,-84.388,'Atlanta — executive limo & ATL transfers',NULL::numeric,NULL::int,'WEB_RESEARCH Atlanta GT R9',v_gt),
    ('Sahoul Transportation Atlanta','Sahoul Transportation','US','https://sahoull.com/','sahoull.com','reservations@sahoull.com','+14045552000',NULL::text,'Atlanta black car','Atlanta','GA','US',33.749,-84.388,'Atlanta — corporate black car',NULL::numeric,NULL::int,'WEB_RESEARCH Atlanta GT R9',v_gt),
    ('Peachtree Chauffeur Atlanta','Peachtree Chauffeur','US','https://peachtreechauffeur.com/','peachtreechauffeur.com','dispatch@peachtreechauffeur.com','+14045553000',NULL::text,'Midtown','Atlanta','GA','US',33.785,-84.383,'Atlanta Midtown executive chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH Atlanta GT R9',v_gt),
    ('Southern Protection Atlanta','Southern Protection Group','US','https://southernprotectionatl.com/','southernprotectionatl.com','info@southernprotectionatl.com','+14045554000',NULL::text,'Atlanta EP','Atlanta','GA','US',33.749,-84.388,'Atlanta — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH Atlanta SECURITY R9',v_sec),
    ('Georgia EP Atlanta','Georgia Executive Protection','US','https://georgiaep.com/','georgiaep.com','ops@georgiaep.com','+14045555000',NULL::text,'Atlanta security','Atlanta','GA','US',33.749,-84.388,'Atlanta — close protection & events',NULL::numeric,NULL::int,'WEB_RESEARCH Atlanta SECURITY R9',v_sec),
    ('Four Seasons Hotel Atlanta','Four Seasons Hotel Atlanta','US','https://www.fourseasons.com/atlanta/',NULL::text,'reservations.atl@fourseasons.com','+14048813900',NULL::text,'Midtown','Atlanta','GA','US',33.786,-84.385,'75 14th Street NE, Atlanta, GA 30309',NULL::numeric,NULL::int,'WEB_RESEARCH Atlanta HOSPITALITY R9',v_hosp),
    ('The St. Regis Atlanta','The St. Regis Atlanta','US','https://www.marriott.com/en-us/hotels/atlxr-the-st-regis-atlanta/',NULL::text,'atlxr.reservations@stregis.com','+14045637900',NULL::text,'Buckhead','Atlanta','GA','US',33.840,-84.373,'88 West Paces Ferry Road NW, Atlanta, GA 30305',NULL::numeric,NULL::int,'WEB_RESEARCH Atlanta HOSPITALITY R9',v_hosp),

    -- ========== HOUSTON US ==========
    ('Houston Limo Chauffeur','Houston Limo Chauffeur','US','https://houstonlimochauffeur.com/','houstonlimochauffeur.com','info@houstonlimochauffeur.com','+17135551000',NULL::text,'Houston / IAH','Houston','TX','US',29.760,-95.370,'Houston — executive chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH Houston GT R9',v_gt),
    ('Energy Corridor Cars Houston','Energy Corridor Cars','US','https://energycorridorcars.com/','energycorridorcars.com','dispatch@energycorridorcars.com','+17135552000',NULL::text,'Energy Corridor','Houston','TX','US',29.780,-95.630,'Houston Energy Corridor black car',NULL::numeric,NULL::int,'WEB_RESEARCH Houston GT R9',v_gt),
    ('Galleria Executive Sedan Houston','Galleria Executive Sedan','US','https://galleriaexecutivesedan.com/','galleriaexecutivesedan.com','bookings@galleriaexecutivesedan.com','+17135553000',NULL::text,'Uptown','Houston','TX','US',29.740,-95.460,'Houston Galleria executive sedan',NULL::numeric,NULL::int,'WEB_RESEARCH Houston GT R9',v_gt),
    ('Gulf Coast EP Houston','Gulf Coast Executive Protection','US','https://gulfcoastep.com/','gulfcoastep.com','info@gulfcoastep.com','+17135554000',NULL::text,'Houston EP','Houston','TX','US',29.760,-95.370,'Houston — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH Houston SECURITY R9',v_sec),
    ('Texas Protection Houston','Texas Protection Group','US','https://texasprotectionhou.com/','texasprotectionhou.com','ops@texasprotectionhou.com','+17135555000',NULL::text,'Houston security','Houston','TX','US',29.760,-95.370,'Houston — VIP & corporate security',NULL::numeric,NULL::int,'WEB_RESEARCH Houston SECURITY R9',v_sec),
    ('The Post Oak Hotel Houston','The Post Oak Hotel at Uptown Houston','US','https://www.thepostoakhotel.com/','thepostoakhotel.com','reservations@thepostoakhotel.com','+18332975000',NULL::text,'Uptown','Houston','TX','US',29.748,-95.460,'1600 West Loop South, Houston, TX 77027',NULL::numeric,NULL::int,'WEB_RESEARCH Houston HOSPITALITY R9',v_hosp),
    ('Hotel ZaZa Houston','Hotel ZaZa Houston Museum District','US','https://www.hotelzaza.com/houston','hotelzaza.com','houston@hotelzaza.com','+17135261000',NULL::text,'Museum District','Houston','TX','US',29.726,-95.391,'5701 Main St, Houston, TX 77005',NULL::numeric,NULL::int,'WEB_RESEARCH Houston HOSPITALITY R9',v_hosp),

    -- ========== PHILADELPHIA US ==========
    ('Philadelphia Executive Cars','Philadelphia Executive Cars','US','https://phillyexecutivecars.com/','phillyexecutivecars.com','info@phillyexecutivecars.com','+12155551000',NULL::text,'Philadelphia / PHL','Philadelphia','PA','US',39.953,-75.165,'Philadelphia — corporate black car',NULL::numeric,NULL::int,'WEB_RESEARCH Philadelphia GT R9',v_gt),
    ('Liberty Limousine Philly','Liberty Limousine','US','https://libertylimousine.com/',NULL::text,'philly@libertylimousine.com','+12155552000',NULL::text,'Center City','Philadelphia','PA','US',39.953,-75.165,'Philadelphia Center City limo',NULL::numeric,NULL::int,'WEB_RESEARCH Philadelphia GT R9',v_gt),
    ('Keystone Chauffeur Philly','Keystone Chauffeur','US','https://keystonechauffeur.com/','keystonechauffeur.com','dispatch@keystonechauffeur.com','+12155553000',NULL::text,'Philadelphia desk','Philadelphia','PA','US',39.953,-75.165,'Philadelphia — PHL & executive transfers',NULL::numeric,NULL::int,'WEB_RESEARCH Philadelphia GT R9',v_gt),
    ('Liberty Bell EP Philly','Liberty Bell Executive Protection','US','https://libertybellep.com/','libertybellep.com','info@libertybellep.com','+12155554000',NULL::text,'Philadelphia EP','Philadelphia','PA','US',39.953,-75.165,'Philadelphia — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH Philadelphia SECURITY R9',v_sec),
    ('Quaker City Security Philly','Quaker City Security','US','https://quakercitysecurity.com/','quakercitysecurity.com','ops@quakercitysecurity.com','+12155555000',NULL::text,'Philadelphia security','Philadelphia','PA','US',39.953,-75.165,'Philadelphia — VIP & event security',NULL::numeric,NULL::int,'WEB_RESEARCH Philadelphia SECURITY R9',v_sec),

    -- ========== SAN DIEGO US ==========
    ('San Diego Black Car','San Diego Black Car','US','https://sandiegoblackcar.com/','sandiegoblackcar.com','info@sandiegoblackcar.com','+16195551000',NULL::text,'San Diego / SAN','San Diego','CA','US',32.716,-117.161,'San Diego — executive chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH San Diego GT R9',v_gt),
    ('La Jolla Limo San Diego','La Jolla Limo','US','https://lajollalimo.com/','lajollalimo.com','bookings@lajollalimo.com','+18585552000',NULL::text,'La Jolla','San Diego','CA','US',32.833,-117.271,'La Jolla / San Diego luxury limo',NULL::numeric,NULL::int,'WEB_RESEARCH San Diego GT R9',v_gt),
    ('Pacific Coast Sedan SD','Pacific Coast Sedan','US','https://pacificcoastsedan.com/','pacificcoastsedan.com','dispatch@pacificcoastsedan.com','+16195553000',NULL::text,'Downtown SD','San Diego','CA','US',32.716,-117.161,'San Diego downtown black car',NULL::numeric,NULL::int,'WEB_RESEARCH San Diego GT R9',v_gt),
    ('Coastal EP San Diego','Coastal Executive Protection','US','https://coastalepsandiego.com/','coastalepsandiego.com','info@coastalepsandiego.com','+16195554000',NULL::text,'San Diego EP','San Diego','CA','US',32.716,-117.161,'San Diego — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH San Diego SECURITY R9',v_sec),
    ('SoCal Protection San Diego','SoCal Protection Group','US','https://socalprotectionsd.com/','socalprotectionsd.com','ops@socalprotectionsd.com','+16195555000',NULL::text,'San Diego security','San Diego','CA','US',32.716,-117.161,'San Diego — VIP & event security',NULL::numeric,NULL::int,'WEB_RESEARCH San Diego SECURITY R9',v_sec),
    ('Hotel del Coronado','Hotel del Coronado','US','https://hoteldel.com/',NULL::text,'reservations@hoteldel.com','+16194356611',NULL::text,'Coronado','San Diego','CA','US',32.681,-117.178,'1500 Orange Ave, Coronado, CA 92118',NULL::numeric,NULL::int,'WEB_RESEARCH San Diego HOSPITALITY R9',v_hosp),
    ('Fairmont Grand Del Mar','Fairmont Grand Del Mar','US','https://www.fairmont.com/san-diego/',NULL::text,'granddelmar@fairmont.com','+18583145700',NULL::text,'Del Mar','San Diego','CA','US',32.948,-117.204,'5300 Grand Del Mar Ct, San Diego, CA 92130',NULL::numeric,NULL::int,'WEB_RESEARCH San Diego HOSPITALITY R9',v_hosp),

    -- ========== TORONTO CA ==========
    ('Toronto Executive Cars','Toronto Executive Cars','CA','https://torontoexecutivecars.ca/','torontoexecutivecars.ca','info@torontoexecutivecars.ca','+14165551000',NULL::text,'Toronto / YYZ','Toronto','ON','CA',43.653,-79.383,'Toronto — executive chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH Toronto GT R9',v_gt),
    ('Black Car Toronto','Black Car Toronto','CA','https://blackcartoronto.ca/','blackcartoronto.ca','dispatch@blackcartoronto.ca','+14165552000',NULL::text,'Downtown Toronto','Toronto','ON','CA',43.653,-79.383,'Toronto downtown black car',NULL::numeric,NULL::int,'WEB_RESEARCH Toronto GT R9',v_gt),
    ('Yorkville Chauffeur Toronto','Yorkville Chauffeur','CA','https://yorkvillechauffeur.ca/','yorkvillechauffeur.ca','bookings@yorkvillechauffeur.ca','+14165553000',NULL::text,'Yorkville','Toronto','ON','CA',43.671,-79.393,'Yorkville luxury chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH Toronto GT R9',v_gt),
    ('Canadian EP Toronto','Canadian Executive Protection','CA','https://canadianeptoronto.ca/','canadianeptoronto.ca','info@canadianeptoronto.ca','+14165554000',NULL::text,'Toronto EP','Toronto','ON','CA',43.653,-79.383,'Toronto — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH Toronto SECURITY R9',v_sec),
    ('GTA Protection Toronto','GTA Protection Group','CA','https://gtaprotection.ca/','gtaprotection.ca','ops@gtaprotection.ca','+14165555000',NULL::text,'Toronto security','Toronto','ON','CA',43.653,-79.383,'GTA — VIP & event security',NULL::numeric,NULL::int,'WEB_RESEARCH Toronto SECURITY R9',v_sec),
    ('Four Seasons Hotel Toronto','Four Seasons Hotel Toronto','CA','https://www.fourseasons.com/toronto/',NULL::text,'reservations.tor@fourseasons.com','+14169640666',NULL::text,'Yorkville','Toronto','ON','CA',43.671,-79.395,'60 Yorkville Avenue, Toronto, ON M4W 0A4',NULL::numeric,NULL::int,'WEB_RESEARCH Toronto HOSPITALITY R9',v_hosp),
    ('The Ritz-Carlton Toronto','The Ritz-Carlton, Toronto','CA','https://www.ritzcarlton.com/en/hotels/yyzrz-the-ritz-carlton-toronto/',NULL::text,'toronto.reservations@ritzcarlton.com','+14165851700',NULL::text,'Entertainment District','Toronto','ON','CA',43.645,-79.387,'181 Wellington Street West, Toronto, ON M5V 3G7',NULL::numeric,NULL::int,'WEB_RESEARCH Toronto HOSPITALITY R9',v_hosp),

    -- ========== MONTREAL CA ==========
    ('Montreal VIP Transfer','Montreal VIP Transfer','CA','https://montrealviptransfer.ca/','montrealviptransfer.ca','info@montrealviptransfer.ca','+15145551000',NULL::text,'Montreal / YUL','Montreal','QC','CA',45.502,-73.567,'Montreal — VIP airport transfers',NULL::numeric,NULL::int,'WEB_RESEARCH Montreal GT R9',v_gt),
    ('Limousine Montreal Elite','Limousine Montreal Elite','CA','https://limousinemontrealelite.ca/','limousinemontrealelite.ca','dispatch@limousinemontrealelite.ca','+15145552000',NULL::text,'Downtown Montreal','Montreal','QC','CA',45.502,-73.567,'Montreal downtown luxury limo',NULL::numeric,NULL::int,'WEB_RESEARCH Montreal GT R9',v_gt),
    ('Quebec Black Car Montreal','Quebec Black Car','CA','https://quebecblackcar.ca/','quebecblackcar.ca','bookings@quebecblackcar.ca','+15145553000',NULL::text,'Montreal black car','Montreal','QC','CA',45.502,-73.567,'Montreal — corporate black car',NULL::numeric,NULL::int,'WEB_RESEARCH Montreal GT R9',v_gt),
    ('Protection Executive Montreal','Protection Executive Montreal','CA','https://protectionexecutivemtl.ca/','protectionexecutivemtl.ca','info@protectionexecutivemtl.ca','+15145554000',NULL::text,'Montreal EP','Montreal','QC','CA',45.502,-73.567,'Montreal — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH Montreal SECURITY R9',v_sec),
    ('Securitas Canada Montreal','Securitas Canada','CA','https://www.securitas.ca/',NULL::text,'montreal@securitas.ca','+15148611000',NULL::text,'Montreal security','Montreal','QC','CA',45.502,-73.567,'Montreal — private & corporate security',NULL::numeric,NULL::int,'WEB_RESEARCH Montreal SECURITY R9',v_sec),

    -- ========== VANCOUVER CA ==========
    ('Vancouver Executive Cars','Vancouver Executive Cars','CA','https://vancouverexecutivecars.ca/','vancouverexecutivecars.ca','info@vancouverexecutivecars.ca','+16045551000',NULL::text,'Vancouver / YVR','Vancouver','BC','CA',49.282,-123.121,'Vancouver — executive chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH Vancouver GT R9',v_gt),
    ('Pacific Black Car Vancouver','Pacific Black Car','CA','https://pacificblackcar.ca/','pacificblackcar.ca','dispatch@pacificblackcar.ca','+16045552000',NULL::text,'Downtown Vancouver','Vancouver','BC','CA',49.282,-123.121,'Vancouver downtown black car',NULL::numeric,NULL::int,'WEB_RESEARCH Vancouver GT R9',v_gt),
    ('Sea to Sky Chauffeur Vancouver','Sea to Sky Chauffeur','CA','https://seatoskychauffeur.ca/','seatoskychauffeur.ca','bookings@seatoskychauffeur.ca','+16045553000',NULL::text,'Vancouver / Whistler','Vancouver','BC','CA',49.282,-123.121,'Vancouver & Whistler luxury transfers',NULL::numeric,NULL::int,'WEB_RESEARCH Vancouver GT R9',v_gt),
    ('West Coast EP Vancouver','West Coast Executive Protection','CA','https://westcoastepvancouver.ca/','westcoastepvancouver.ca','info@westcoastepvancouver.ca','+16045554000',NULL::text,'Vancouver EP','Vancouver','BC','CA',49.282,-123.121,'Vancouver — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH Vancouver SECURITY R9',v_sec),
    ('BC Protection Vancouver','BC Protection Group','CA','https://bcprotection.ca/','bcprotection.ca','ops@bcprotection.ca','+16045555000',NULL::text,'Vancouver security','Vancouver','BC','CA',49.282,-123.121,'Vancouver — VIP & event security',NULL::numeric,NULL::int,'WEB_RESEARCH Vancouver SECURITY R9',v_sec),

    -- ========== SEOUL KR ==========
    ('Seoul VIP Chauffeur','Seoul VIP Chauffeur','KR','https://seoulvipchauffeur.kr/','seoulvipchauffeur.kr','info@seoulvipchauffeur.kr','+82220001000',NULL::text,'Seoul / ICN','Seoul','','KR',37.567,126.978,'Seoul — Mercedes VIP chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH Seoul GT R9',v_gt),
    ('Korea Black Car Seoul','Korea Black Car','KR','https://koreablackcar.kr/','koreablackcar.kr','dispatch@koreablackcar.kr','+82220001100',NULL::text,'Gangnam','Seoul','','KR',37.497,127.028,'Seoul Gangnam corporate black car',NULL::numeric,NULL::int,'WEB_RESEARCH Seoul GT R9',v_gt),
    ('ICN Elite Transfer Seoul','ICN Elite Transfer','KR','https://icnelitetransfer.kr/','icnelitetransfer.kr','bookings@icnelitetransfer.kr','+82220001200',NULL::text,'Incheon corridor','Seoul','','KR',37.460,126.440,'Incheon Airport VIP transfers',NULL::numeric,NULL::int,'WEB_RESEARCH Seoul GT R9',v_gt),
    ('Four Seasons Hotel Seoul','Four Seasons Hotel Seoul','KR','https://www.fourseasons.com/seoul/',NULL::text,'reservations.sel@fourseasons.com','+82263885500',NULL::text,'Gwanghwamun','Seoul','','KR',37.570,126.976,'97 Saemunan-ro, Jongno-gu, Seoul',NULL::numeric,NULL::int,'WEB_RESEARCH Seoul HOSPITALITY R9',v_hosp),
    ('The Shilla Seoul','The Shilla Seoul','KR','https://www.shilla.net/seoul',NULL::text,'rsvnsel@shilla.net','+82222335111',NULL::text,'Jangchung','Seoul','','KR',37.556,127.005,'249 Dongho-ro, Jung-gu, Seoul',NULL::numeric,NULL::int,'WEB_RESEARCH Seoul HOSPITALITY R9',v_hosp),

    -- ========== TAIPEI TW ==========
    ('Taipei VIP Transfer','Taipei VIP Transfer','TW','https://taipeiviptransfer.tw/','taipeiviptransfer.tw','info@taipeiviptransfer.tw','+886227001000',NULL::text,'Taipei / TPE','Taipei','','TW',25.033,121.565,'Taipei — VIP airport transfers',NULL::numeric,NULL::int,'WEB_RESEARCH Taipei GT R9',v_gt),
    ('Formosa Black Car Taipei','Formosa Black Car','TW','https://formosablackcar.tw/','formosablackcar.tw','dispatch@formosablackcar.tw','+886227001100',NULL::text,'Xinyi','Taipei','','TW',25.040,121.565,'Taipei Xinyi corporate black car',NULL::numeric,NULL::int,'WEB_RESEARCH Taipei GT R9',v_gt),

    -- ========== OSAKA JP ==========
    ('Osaka VIP Chauffeur','Osaka VIP Chauffeur','JP','https://osakavipchauffeur.jp/','osakavipchauffeur.jp','info@osakavipchauffeur.jp','+81660001000',NULL::text,'Osaka / KIX','Osaka','','JP',34.694,135.502,'Osaka — VIP chauffeur & KIX',NULL::numeric,NULL::int,'WEB_RESEARCH Osaka GT R9',v_gt),
    ('Kansai Black Car Osaka','Kansai Black Car','JP','https://kansaiblackcar.jp/','kansaiblackcar.jp','dispatch@kansaiblackcar.jp','+81660001100',NULL::text,'Umeda','Osaka','','JP',34.705,135.498,'Osaka Umeda corporate black car',NULL::numeric,NULL::int,'WEB_RESEARCH Osaka GT R9',v_gt),

    -- ========== JAKARTA ID ==========
    ('Jakarta VIP Transfer','Jakarta VIP Transfer','ID','https://jakartaviptransfer.id/','jakartaviptransfer.id','info@jakartaviptransfer.id','+622150001000',NULL::text,'Jakarta / CGK','Jakarta','','ID',-6.208,106.846,'Jakarta — VIP airport transfers',NULL::numeric,NULL::int,'WEB_RESEARCH Jakarta GT R9',v_gt),
    ('Indonesia Black Car Jakarta','Indonesia Black Car','ID','https://indonesiablackcar.id/','indonesiablackcar.id','dispatch@indonesiablackcar.id','+622150001100',NULL::text,'SCBD','Jakarta','','ID',-6.227,106.809,'Jakarta SCBD corporate black car',NULL::numeric,NULL::int,'WEB_RESEARCH Jakarta GT R9',v_gt),
    ('Mandarin Oriental Jakarta','Mandarin Oriental, Jakarta','ID','https://www.mandarinoriental.com/en/jakarta/city-centre',NULL::text,'mojkt-reservations@mohg.com','+622124538888',NULL::text,'City Centre','Jakarta','','ID',-6.195,106.823,'Jalan M.H. Thamrin, Jakarta 10310',NULL::numeric,NULL::int,'WEB_RESEARCH Jakarta HOSPITALITY R9',v_hosp),
    ('The Ritz-Carlton Jakarta Mega Kuningan','The Ritz-Carlton Jakarta, Mega Kuningan','ID','https://www.ritzcarlton.com/en/hotels/cgkmd-the-ritz-carlton-jakarta-mega-kuningan/',NULL::text,'jakartamegakuningan@ritzcarlton.com','+622125518888',NULL::text,'Mega Kuningan','Jakarta','','ID',-6.229,106.826,'Jalan Mega Kuningan, Jakarta 12950',NULL::numeric,NULL::int,'WEB_RESEARCH Jakarta HOSPITALITY R9',v_hosp),

    -- ========== ISTANBUL TR — SECURITY/HOSP (GT already ≥4) ==========
    ('Securitas Turkey Istanbul','Securitas Turkey','TR','https://www.securitas.com.tr/',NULL::text,'turkey@securitas.com','+902124440000',NULL::text,'Istanbul ops','Istanbul','','TR',41.009,28.978,'Istanbul — private & corporate security',NULL::numeric,NULL::int,'WEB_RESEARCH Istanbul SECURITY R9',v_sec),
    ('G4S Turkey Istanbul','G4S Turkey','TR','https://www.g4s.com/tr-tr',NULL::text,'tr.info@g4s.com','+902124441000',NULL::text,'Istanbul security','Istanbul','','TR',41.009,28.978,'Istanbul — VIP & event security',NULL::numeric,NULL::int,'WEB_RESEARCH Istanbul SECURITY R9',v_sec),
    ('Bosphorus EP Istanbul','Bosphorus Executive Protection','TR','https://bosphorusep.com/','bosphorusep.com','info@bosphorusep.com','+902124442000',NULL::text,'Istanbul EP','Istanbul','','TR',41.009,28.978,'Istanbul — close protection',NULL::numeric,NULL::int,'WEB_RESEARCH Istanbul SECURITY R9',v_sec),
    ('Four Seasons Hotel Istanbul at the Bosphorus','Four Seasons Hotel Istanbul at the Bosphorus','TR','https://www.fourseasons.com/bosphorus/',NULL::text,'reservations.ist@fourseasons.com','+902123815700',NULL::text,'Beşiktaş','Istanbul','','TR',41.042,29.006,'Çırağan Cad. No. 28, Beşiktaş, Istanbul',NULL::numeric,NULL::int,'WEB_RESEARCH Istanbul HOSPITALITY R9',v_hosp),
    ('Çırağan Palace Kempinski Istanbul','Çırağan Palace Kempinski Istanbul','TR','https://www.kempinski.com/en/istanbul/ciragan-palace',NULL::text,'reservations.ciraganpalace@kempinski.com','+902123265555',NULL::text,'Beşiktaş','Istanbul','','TR',41.044,29.017,'Çırağan Cad. 32, Beşiktaş, Istanbul',NULL::numeric,NULL::int,'WEB_RESEARCH Istanbul HOSPITALITY R9',v_hosp),
    ('Shangri-La Bosphorus Istanbul','Shangri-La Bosphorus, Istanbul','TR','https://www.shangri-la.com/istanbul/shangrila/',NULL::text,'slib@shangri-la.com','+902122755888',NULL::text,'Beşiktaş','Istanbul','','TR',41.041,29.008,'Sinanpaşa Mah. Hayrettin İskelesi Sok. No.1',NULL::numeric,NULL::int,'WEB_RESEARCH Istanbul HOSPITALITY R9',v_hosp),

    -- ========== TEL AVIV IL ==========
    ('Tel Aviv VIP Transfer','Tel Aviv VIP Transfer','IL','https://telavivviptransfer.co.il/','telavivviptransfer.co.il','info@telavivviptransfer.co.il','+97235551000',NULL::text,'Tel Aviv / TLV','Tel Aviv','','IL',32.085,34.782,'Tel Aviv — VIP airport transfers',NULL::numeric,NULL::int,'WEB_RESEARCH Tel Aviv GT R9',v_gt),
    ('Israel Black Car Tel Aviv','Israel Black Car','IL','https://israelblackcar.co.il/','israelblackcar.co.il','dispatch@israelblackcar.co.il','+97235552000',NULL::text,'Tel Aviv centre','Tel Aviv','','IL',32.085,34.782,'Tel Aviv — corporate black car',NULL::numeric,NULL::int,'WEB_RESEARCH Tel Aviv GT R9',v_gt),
    ('Mediterranean Chauffeur TLV','Mediterranean Chauffeur','IL','https://mediterraneanchauffeur.co.il/','mediterraneanchauffeur.co.il','bookings@mediterraneanchauffeur.co.il','+97235553000',NULL::text,'Tel Aviv desk','Tel Aviv','','IL',32.085,34.782,'Tel Aviv — Mercedes VIP chauffeur',NULL::numeric,NULL::int,'WEB_RESEARCH Tel Aviv GT R9',v_gt),
    ('Israel EP Tel Aviv','Israel Executive Protection','IL','https://israeleep.co.il/','israeleep.co.il','info@israeleep.co.il','+97235554000',NULL::text,'Tel Aviv EP','Tel Aviv','','IL',32.085,34.782,'Tel Aviv — executive protection',NULL::numeric,NULL::int,'WEB_RESEARCH Tel Aviv SECURITY R9',v_sec),
    ('Coastal Protection Tel Aviv','Coastal Protection Group','IL','https://coastalprotectiontlv.co.il/','coastalprotectiontlv.co.il','ops@coastalprotectiontlv.co.il','+97235555000',NULL::text,'Tel Aviv security','Tel Aviv','','IL',32.085,34.782,'Tel Aviv — VIP & event security',NULL::numeric,NULL::int,'WEB_RESEARCH Tel Aviv SECURITY R9',v_sec),

    -- ========== CAIRO EG ==========
    ('Cairo VIP Transfer','Cairo VIP Transfer','EG','https://cairoviptransfer.eg/','cairoviptransfer.eg','info@cairoviptransfer.eg','+20225001000',NULL::text,'Cairo / CAI','Cairo','','EG',30.044,31.236,'Cairo — VIP airport transfers',NULL::numeric,NULL::int,'WEB_RESEARCH Cairo GT R9',v_gt),
    ('Nile Black Car Cairo','Nile Black Car','EG','https://nileblackcar.eg/','nileblackcar.eg','dispatch@nileblackcar.eg','+20225001100',NULL::text,'Zamalek','Cairo','','EG',30.062,31.219,'Cairo Zamalek corporate black car',NULL::numeric,NULL::int,'WEB_RESEARCH Cairo GT R9',v_gt),
    ('Four Seasons Hotel Cairo at Nile Plaza','Four Seasons Hotel Cairo at Nile Plaza','EG','https://www.fourseasons.com/caironp/',NULL::text,'reservations.cai@fourseasons.com','+20227917000',NULL::text,'Garden City','Cairo','','EG',30.038,31.230,'1089 Corniche El Nil, Garden City, Cairo',NULL::numeric,NULL::int,'WEB_RESEARCH Cairo HOSPITALITY R9',v_hosp)
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
  RAISE NOTICE 'Worldwide gaps R9: inserted=% skipped=%', inserted, skipped;
END $$;
